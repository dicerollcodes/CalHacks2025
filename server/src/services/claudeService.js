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

  const prompt = `You are a GENEROUS semantic matching expert helping college students find compatible roommates. Compare these interest lists and celebrate all connections!

User 1 interests:
${user1Indexed.join('\n')}

User 2 interests:
${user2Indexed.join('\n')}

TASK: Find ALL meaningful connections between interests. Be GENEROUS - college students often connect over related interests!

SCORING PHILOSOPHY: Be optimistic! Students bond over shared enthusiasm, not just identical interests.

SCORING GUIDE:

95-100: IDENTICAL or DIRECT SYNONYMS
- "programming" and "coding" = 100
- "soccer" and "football" = 100
- "gym" and "working out" = 98

85-94: VERY STRONGLY RELATED
- "rock climbing" and "bouldering" = 92
- "gaming" and "video games" = 90
- "League of Legends" and "MOBAs" = 90
- "guitar" and "bass" = 88
- "coffee" and "espresso" = 88

70-84: CLEARLY RELATED (same domain, complementary)
- "guitar" and "music production" = 80
- "basketball" and "sports" = 78
- "reading" and "writing" = 75
- "anime" and "manga" = 78
- "hiking" and "camping" = 75

55-69: RELATED INTERESTS (broad connection, conversation potential)
- "League of Legends" and "Valorant" = 68
- "basketball" and "soccer" = 65
- "indie music" and "alternative rock" = 70
- "gym" and "nutrition" = 65
- "travel" and "photography" = 62

40-54: LOOSE CONNECTION (some overlap)
- "cooking" and "baking" = 50
- "reading" and "Netflix" = 45

Below 40: Only for truly unrelated interests
- "basketball" and "poetry" = 15
- "chemistry" and "dance" = 10

IMPORTANT MATCHING RULES:
1. Be GENEROUS with scores - students connect over enthusiasm!
2. Find creative connections - "stock market" and "economics" are highly related
3. Broad categories like "sports", "music", "art" still create strong bonds
4. Related hobbies in the same lifestyle (outdoor activities, creative pursuits, etc.) should score 65+
5. If there's ANY reasonable connection, score it 50+

Return index numbers ONLY, NOT the interest text.

Return ONLY valid JSON:
{
  "matches": [
    {"user1Index": 0, "user2Index": 2, "score": 95, "reason": "brief explanation"},
    {"user1Index": 1, "user2Index": 0, "score": 75, "reason": "brief explanation"}
  ],
  "overallCompatibility": 78
}

Calculate overallCompatibility (0-100) GENEROUSLY:
1. If 50%+ of interests match at ANY score → minimum 70
2. If 3+ strong matches (70+) → should be 80+
3. If 2+ perfect matches (90+) → should be 85+
4. Many medium matches (50-70) are GREAT for roommate compatibility!

BE GENEROUS - these are college students looking for friends and roommates!

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

  // Use Claude's overall compatibility score directly - NO PENALTIES
  const matchScore = Math.round(result.overallCompatibility || 0);

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
