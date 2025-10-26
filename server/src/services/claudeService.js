import Anthropic from '@anthropic-ai/sdk';

// Lazy-load the Anthropic client to ensure API key is loaded
let anthropic = null;

export function getAnthropicClient() {
  if (!anthropic) {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropic;
}

// Cache for semantic similarity results to reduce API calls
const similarityCache = new Map();

/**
 * Strip markdown code blocks from Claude's response
 */
function stripMarkdown(text) {
  // Remove ```json and ``` markers
  return text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
}

/**
 * Calculate semantic similarity by comparing interest lists
 * Uses INDEX-BASED matching to preserve original interest names
 */
export async function calculateMatch(userInterests, targetInterests, userName, targetName) {
  // Handle empty interests immediately
  if (!userInterests || userInterests.length === 0 || !targetInterests || targetInterests.length === 0) {
    console.log(`⚠️  Empty interests detected - returning 0% match`);
    return {
      matchScore: 0,
      sharedInterests: [],
      relatedInterests: [],
      conversationStarters: []
    };
  }

  const cacheKey = JSON.stringify([userInterests.sort(), targetInterests.sort(), userName, targetName]);

  if (similarityCache.has(cacheKey)) {
    console.log(`💾 Cache hit for ${userName} ↔ ${targetName}`);
    return similarityCache.get(cacheKey);
  }

  console.log(`\n🔍 Comparing interests for ${userName} ↔ ${targetName}`);
  console.log(`${userName}: ${JSON.stringify(userInterests)}`);
  console.log(`${targetName}: ${JSON.stringify(targetInterests)}\n`);

  // Create indexed lists for Claude
  const user1Indexed = userInterests.map((interest, idx) => `[${idx}] ${interest}`);
  const user2Indexed = targetInterests.map((interest, idx) => `[${idx}] ${interest}`);

  const prompt = `You are a semantic matching expert. Compare these two interest lists and find all meaningful matches.

User 1 interests:
${user1Indexed.join('\n')}

User 2 interests:
${user2Indexed.join('\n')}

TASK: Find all interest pairs that are semantically similar or related. Consider synonyms, related concepts, and subcategories. ONLY match interests that have clear semantic overlap.

SCORING GUIDE & EXAMPLES:

95-100: IDENTICAL or SYNONYMS
- "programming" and "coding" = 100
- "soccer" and "football" = 100
- "gym" and "working out" = 98

85-94: EXTREMELY RELATED (specific types, very similar activities)
- "rock climbing" and "bouldering" = 92
- "gaming" and "video games" = 90
- "gaming" and "board games" = 88 (both gaming activities)
- "League of Legends" and "MOBAs" = 90
- "guitar" and "bass" = 88

70-84: SAME DOMAIN/FIELD (clearly related, overlapping skills/interests)
- "guitar" and "music production" = 78
- "basketball" and "sports" = 75
- "reading" and "writing" = 72
- "coffee" and "espresso" = 80 (espresso is type of coffee)
- "anime" and "manga" = 75

50-69: SAME BROAD CATEGORY (related but distinct)
- "League of Legends" and "Valorant" = 65 (both competitive games, different genres)
- "hiking" and "camping" = 62
- "basketball" and "soccer" = 60 (both team sports, different)
- "indie music" and "alternative rock" = 65 (related music genres)

30-49: LOOSELY CONNECTED (weak relationship)
- "gym" and "nutrition" = 45
- "travel" and "photography" = 40
- "cooking" and "baking" = 45
- "reading" and "Netflix" = 38 (both entertainment, very different)

0-29: UNRELATED or NO MEANINGFUL CONNECTION
- "basketball" and "cooking" = 5
- "museum hopping" and "computer science" = 8 (no meaningful overlap)
- "gaming" and "poetry" = 3
- "hiking" and "chemistry" = 5
- "guitar" and "sports" = 12

CRITICAL RULES:
1. Academic subjects (computer science, chemistry, math) rarely match with leisure activities (museum hopping, concerts) - score 0-20
2. Physical activities (sports, gym, hiking) don't match with creative/intellectual pursuits (poetry, coding) - score 0-20
3. "Gaming" typically means video games - it's HIGHLY related to board games (85+), not 60
4. Be strict: only match if there's genuine semantic overlap
5. Don't overweight tenuous connections

Return index numbers ONLY, NOT the interest text. This preserves original names.

Return ONLY valid JSON in this exact format:
{
  "matches": [
    {"user1Index": 0, "user2Index": 2, "score": 95, "reason": "brief explanation"},
    {"user1Index": 1, "user2Index": 0, "score": 75, "reason": "brief explanation"}
  ],
  "overallCompatibility": 78
}

Calculate overallCompatibility (0-100) based on:
1. Number of matches relative to total interests
2. Quality of matches (higher scores = better)
3. Distribution (many medium matches can be as good as few perfect matches)

Return ONLY the JSON, no other text.`;

  const message = await getAnthropicClient().messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 3000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const responseText = message.content[0].text.trim();
  const cleanedText = stripMarkdown(responseText);

  console.log('\n🤖 RAW CLAUDE RESPONSE:');
  console.log(cleanedText.substring(0, 1000));
  console.log('\n');

  let result;
  try {
    result = JSON.parse(cleanedText);
    console.log('✓ Successfully parsed JSON');
  } catch (err) {
    console.error('❌ JSON PARSE ERROR:', err.message);
    console.error('Response text:', cleanedText);
    result = { matches: [], overallCompatibility: 0 };
  }

  const matches = result.matches || [];
  console.log(`\n📊 Found ${matches.length} matches:`);

  // Map indices back to ORIGINAL interest names
  const sharedInterests = [];
  const relatedInterests = [];

  for (const match of matches) {
    const user1Interest = userInterests[match.user1Index];
    const user2Interest = targetInterests[match.user2Index];

    if (!user1Interest || !user2Interest) {
      console.warn(`⚠️  Invalid indices: [${match.user1Index}] or [${match.user2Index}]`);
      continue;
    }

    console.log(`   ${match.score}: "${user1Interest}" ↔ "${user2Interest}"`);
    console.log(`      → ${match.reason}`);

    if (match.score >= 85) {
      // Perfect/near-perfect match - show as shared interest
      // Use user1's original name (the viewer's perspective)
      sharedInterests.push(user1Interest);
    } else if (match.score >= 40) {
      // Related interests - show both original names
      relatedInterests.push({
        userInterest: user1Interest,
        targetInterest: user2Interest,
        relationship: match.reason,
        score: match.score
      });
    }
  }

  // Use Claude's overall compatibility score
  const matchScore = Math.round(result.overallCompatibility || 0);

  // Generate conversation starters if score is high enough
  let conversationStarters = [];
  if (matchScore >= 40 && (sharedInterests.length > 0 || relatedInterests.length > 0)) {
    const topInterest = sharedInterests[0] || relatedInterests[0]?.userInterest;
    conversationStarters = [
      `Hey! I saw we both enjoy ${topInterest} - what got you into it?`,
      `I noticed we have some similar interests! Have you been into ${topInterest} for long?`,
      `We should definitely chat about ${topInterest} sometime!`
    ];
  }

  const finalResult = {
    matchScore,
    sharedInterests,
    relatedInterests,
    conversationStarters
  };

  console.log(`\n✅ FINAL RESULTS:`);
  console.log(`Overall Score: ${matchScore}%`);
  console.log(`Shared Interests (score ≥85): ${JSON.stringify(sharedInterests)}`);
  console.log(`Related Interests (score 40-84): ${relatedInterests.length} pairs\n`);

  // Cache the result
  similarityCache.set(cacheKey, finalResult);

  return finalResult;
}

/**
 * Generate conversation starters based on shared/related interests
 */
export async function generateConversationStarters(matchData, userName, targetName) {
  const { sharedInterests, relatedInterests } = matchData;

  const prompt = `Generate 3 natural conversation starters for ${userName} to use when chatting with ${targetName}.

Shared interests: ${JSON.stringify(sharedInterests)}
Related interests: ${JSON.stringify(relatedInterests)}

Create starters that:
- Reference specific interests naturally
- Are casual and friendly (college student tone)
- Encourage discussion, not just yes/no answers
- Feel authentic, not forced

Return as JSON array of strings: ["starter1", "starter2", "starter3"]`;

  const message = await getAnthropicClient().messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const responseText = message.content[0].text;
  const cleanedText = stripMarkdown(responseText);
  return JSON.parse(cleanedText);
}

/**
 * Rank users by compatibility for recommendations
 */
export async function rankUsersByCompatibility(sourceUser, candidateUsers) {
  const matches = await Promise.all(
    candidateUsers.map(async (candidate) => {
      const matchData = await calculateMatch(
        sourceUser.privateInterests,
        candidate.privateInterests
      );

      return {
        user: candidate,
        matchScore: matchData.matchScore,
        sharedCount: matchData.sharedInterests.length,
        relatedCount: matchData.relatedInterests.length
      };
    })
  );

  // Sort by match score (highest first)
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

export function clearCache() {
  similarityCache.clear();
}

/**
 * Calculate roommate compatibility using Claude AI
 * Returns both a numerical score (0-100) and natural language explanations
 */
export async function calculateRoommateCompatibility(prefs1, prefs2, name1, name2) {
  // Handle cases where preferences are missing
  if (!prefs1 || !prefs2) {
    return {
      score: 50,
      explanation: "One or both users haven't filled out roommate preferences yet.",
      strengths: [],
      concerns: [],
      tips: []
    };
  }

  // Check if both preference sets are essentially empty
  const hasPrefs1 = Object.values(prefs1).some(val => val !== null && val !== undefined);
  const hasPrefs2 = Object.values(prefs2).some(val => val !== null && val !== undefined);

  if (!hasPrefs1 || !hasPrefs2) {
    return {
      score: 50,
      explanation: "One or both users haven't filled out enough roommate preferences yet.",
      strengths: [],
      concerns: [],
      tips: []
    };
  }

  console.log(`\n🏠 Analyzing roommate compatibility for ${name1} ↔ ${name2}`);

  // Create a readable summary of preferences for Claude
  const formatPrefs = (prefs, name) => {
    const parts = [];
    
    if (prefs.sleepSchedule) parts.push(`Sleep schedule: ${prefs.sleepSchedule}`);
    if (prefs.bedtime) parts.push(`Bedtime: ${prefs.bedtime}`);
    if (prefs.wakeTime) parts.push(`Wake time: ${prefs.wakeTime}`);
    if (prefs.cleanliness) parts.push(`Cleanliness: ${prefs.cleanliness}`);
    if (prefs.socialLevel) parts.push(`Social level: ${prefs.socialLevel}`);
    if (prefs.guests) parts.push(`Guests: ${prefs.guests}`);
    if (prefs.smoking) parts.push(`Smoking: ${prefs.smoking}`);
    if (prefs.pets) parts.push(`Pets: ${prefs.pets}`);
    
    return `${name}:\n${parts.join('\n')}`;
  };

  const prompt = `You are a roommate compatibility expert. Analyze these two users' roommate preferences and determine how compatible they would be as roommates.

${formatPrefs(prefs1, name1)}

${formatPrefs(prefs2, name2)}

CRITICAL COMPATIBILITY FACTORS:
1. **Deal Breakers** (can make roommates incompatible):
   - Smoker vs non-smoker
   - Has pets vs allergic to pets
   - Completely opposite sleep schedules (early-riser vs night-owl)

2. **Important Factors** (significant impact):
   - Sleep time alignment (bedtime/wake time within 1-2 hours is good)
   - Cleanliness levels (very-clean vs relaxed can cause friction)
   - Social energy (very-social vs quiet preferences)

3. **Moderate Factors** (some impact):
   - Guest frequency preferences
   - One person being "flexible" in any category is a positive

SCORING GUIDE:
- 90-100: Excellent match - very similar preferences, no conflicts
- 75-89: Good match - mostly compatible with minor differences
- 60-74: Moderate match - some differences but workable
- 40-59: Challenging match - significant differences requiring compromise
- 0-39: Poor match - major incompatibilities or deal breakers

Return ONLY valid JSON in this exact format:
{
  "score": 78,
  "explanation": "Brief 1-2 sentence overall assessment",
  "strengths": ["Specific compatible aspect 1", "Specific compatible aspect 2"],
  "concerns": ["Specific potential issue 1", "Specific potential issue 2"],
  "tips": ["Practical advice for living together 1", "Practical advice 2"]
}

Rules:
- Be honest about incompatibilities but constructive
- List 2-4 items for strengths, concerns, and tips (can be 0 if not applicable)
- Keep each item concise (under 15 words)
- Focus on actionable, specific observations
- If there are deal breakers (smoking/pets conflicts), score should be below 40

Return ONLY the JSON, no other text.`;

  const message = await getAnthropicClient().messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const responseText = message.content[0].text.trim();
  const cleanedText = stripMarkdown(responseText);

  console.log('\n🤖 RAW CLAUDE ROOMMATE RESPONSE:');
  console.log(cleanedText.substring(0, 500));
  console.log('\n');

  let result;
  try {
    result = JSON.parse(cleanedText);
    console.log('✓ Successfully parsed roommate compatibility JSON');
    console.log(`📊 Roommate Score: ${result.score}%`);
    console.log(`💡 ${result.explanation}`);
  } catch (err) {
    console.error('❌ JSON PARSE ERROR:', err.message);
    console.error('Response text:', cleanedText);
    // Fallback to neutral score
    result = {
      score: 50,
      explanation: "Unable to analyze compatibility at this time.",
      strengths: [],
      concerns: [],
      tips: []
    };
  }

  return {
    score: Math.max(0, Math.min(100, result.score || 50)),
    explanation: result.explanation || "Compatibility analysis unavailable.",
    strengths: result.strengths || [],
    concerns: result.concerns || [],
    tips: result.tips || []
  };
}