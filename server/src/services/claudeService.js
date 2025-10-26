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
 * Calculate interest quality confidence multiplier
 * Returns a value between 0.85 and 1.0 based on interest quality
 * Lower quality = lower multiplier = slightly reduced match confidence
 */
function calculateInterestQualityMultiplier(interests) {
  if (!interests || interests.length === 0) {
    return 0.85; // Minimum penalty for no interests
  }

  // Filter out invalid interests (too short, likely junk data)
  const validInterests = interests.filter(i => i && i.trim().length >= 3);

  if (validInterests.length === 0) {
    return 0.85; // All interests are junk
  }

  let qualityScore = 1.0;

  // Only penalty: Low interest count (< 3 interests) - VERY LIGHT penalties
  if (validInterests.length === 1) {
    qualityScore *= 0.90; // 10% penalty for single interest
  } else if (validInterests.length === 2) {
    qualityScore *= 0.95; // 5% penalty for two interests
  }

  // Ensure minimum multiplier is 0.85 (max 15% penalty)
  return Math.max(0.85, qualityScore);
}

/**
 * Calculate semantic similarity by comparing interest lists
 * Uses INDEX-BASED matching to preserve original interest names
 */
export async function calculateMatch(userInterests, targetInterests, userName, targetName) {
  // Filter out junk interests (too short, whitespace only, etc)
  const cleanUserInterests = (userInterests || [])
    .filter(i => i && typeof i === 'string' && i.trim().length >= 3)
    .map(i => i.trim());

  const cleanTargetInterests = (targetInterests || [])
    .filter(i => i && typeof i === 'string' && i.trim().length >= 3)
    .map(i => i.trim());

  // Handle empty interests immediately
  if (cleanUserInterests.length === 0 || cleanTargetInterests.length === 0) {
    console.log(`⚠️  Empty/invalid interests detected - returning 0% match`);
    return {
      matchScore: 0,
      sharedInterests: [],
      relatedInterests: [],
      conversationStarters: []
    };
  }

  const cacheKey = JSON.stringify([cleanUserInterests.sort(), cleanTargetInterests.sort(), userName, targetName]);

  if (similarityCache.has(cacheKey)) {
    console.log(`💾 Cache hit for ${userName} ↔ ${targetName}`);
    return similarityCache.get(cacheKey);
  }

  console.log(`\n🔍 Comparing interests for ${userName} ↔ ${targetName}`);
  console.log(`${userName}: ${JSON.stringify(cleanUserInterests)}`);
  console.log(`${targetName}: ${JSON.stringify(cleanTargetInterests)}\n`);

  // Create indexed lists for Claude
  const user1Indexed = cleanUserInterests.map((interest, idx) => `[${idx}] ${interest}`);
  const user2Indexed = cleanTargetInterests.map((interest, idx) => `[${idx}] ${interest}`);

  const prompt = `You are a BALANCED compatibility expert helping college students find roommate connections. Find meaningful connections between interests with fair, differentiated scoring.

User 1 interests:
${user1Indexed.join('\n')}

User 2 interests:
${user2Indexed.join('\n')}

SCORING PHILOSOPHY: Be FAIR and REALISTIC. Reward strong matches well, but differentiate clearly between strong and weak connections. Use decimal precision for variety.

BALANCED SCORING GUIDE (with decimal precision):

90-100: IDENTICAL or DIRECT SYNONYMS
- "programming" and "coding" = 96.3
- "soccer" and "football" = 98.1
- "gym" and "working out" = 94.7
- "gaming" and "video games" = 97.2

80-89: VERY STRONGLY RELATED (same specific domain)
- "rock climbing" and "bouldering" = 86.4
- "League of Legends" and "MOBAs" = 84.8
- "guitar" and "bass" = 82.3
- "coffee" and "espresso" = 85.1
- "hiking" and "backpacking" = 87.6

70-79: CLEARLY RELATED (same general category)
- "basketball" and "sports" = 75.2
- "reading" and "books" = 77.4
- "anime" and "manga" = 76.8
- "cooking" and "baking" = 73.5
- "guitar" and "music" = 78.9

60-69: RELATED INTERESTS (conversation potential)
- "basketball" and "soccer" = 66.3
- "gaming" and "anime" = 64.7
- "gym" and "sports" = 68.1
- "music" and "concerts" = 67.5
- "reading" and "writing" = 65.9

50-59: ADJACENT INTERESTS (some common ground)
- "gym" and "nutrition" = 56.4
- "travel" and "photography" = 54.8
- "coding" and "tech" = 57.2
- "coffee" and "studying" = 52.6
- "art" and "design" = 55.3

40-49: LOOSE CONNECTION (minimal overlap)
- "cooking" and "restaurants" = 46.7
- "Netflix" and "movies" = 48.2
- "outdoors" and "hiking" = 44.5

30-39: WEAK CONNECTION
- "music" and "art" = 36.8
- "gym" and "hiking" = 34.2

Below 30: Very different interests
- Different domains with little commonality
- Minimum 15 for completely unrelated pairs

IMPORTANT RULES:
1. BE REALISTIC - strong matches should be obvious, weak ones should score lower
2. USE DECIMALS for variety (no rounding to 5s or 10s)
3. Find legitimate connections, not forced ones
4. Identical interests should score 90-100 with slight variation
5. Only score 65+ if interests are truly in the same category

Calculate overallCompatibility (0.00-100.00) with BALANCE:
1. Average all match scores, weighted by strength
2. For EACH match that scores 90+: add +3 bonus per match (rewards perfect matches!)
3. If 3+ matches score 70+: add +3 bonus (good compatibility)
4. If 5+ matches found: add +2 bonus (many connections)
5. TYPICAL scores should be 50-70 for college students with moderate overlap
6. GREAT matches should be 75-90
7. PERFECT matches (many identical interests): 85-95

Return ONLY valid JSON with DECIMAL scores:
{
  "matches": [
    {"user1Index": 0, "user2Index": 2, "score": 82.4, "reason": "brief explanation"},
    {"user1Index": 1, "user2Index": 0, "score": 67.8, "reason": "brief explanation"}
  ],
  "overallCompatibility": 71.3
}

Return ONLY the JSON, no other text.`;

  const message = await getAnthropicClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
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
    const user1Interest = cleanUserInterests[match.user1Index];
    const user2Interest = cleanTargetInterests[match.user2Index];

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

  // Use Claude's overall compatibility score with decimal precision - NO PENALTIES
  // Round to 1 decimal place for precision without excessive digits
  const matchScore = Math.round((result.overallCompatibility || 0) * 10) / 10;

  console.log(`\n✅ Match Score: ${matchScore}% (no penalties applied)`);

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

  // Deduplicate shared interests (case-insensitive)
  const uniqueSharedInterests = [...new Set(sharedInterests.map(i => i.toLowerCase()))]
    .map(lower => sharedInterests.find(i => i.toLowerCase() === lower));

  const finalResult = {
    matchScore,
    sharedInterests: uniqueSharedInterests,
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
    model: 'claude-haiku-4-5-20251001',
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
