import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Cache for semantic similarity results to reduce API calls
const similarityCache = new Map();

/**
 * Calculate semantic similarity between two lists of interests
 * Returns a detailed analysis including:
 * - Shared interests (exact matches)
 * - Related interests (semantic similarity)
 * - Match score (0-100)
 */
export async function calculateMatch(userInterests, targetInterests) {
  const cacheKey = JSON.stringify([userInterests.sort(), targetInterests.sort()]);

  if (similarityCache.has(cacheKey)) {
    return similarityCache.get(cacheKey);
  }

  const prompt = `You are analyzing interest compatibility between two users.

User A interests: ${JSON.stringify(userInterests)}
User B interests: ${JSON.stringify(targetInterests)}

Analyze their compatibility and return a JSON object with:
1. "sharedInterests": array of exact or very close matches
2. "relatedInterests": array of objects with {userInterest, targetInterest, relationship} for semantically related interests
3. "matchScore": number 0-100 based on:
   - Exact matches (high weight)
   - Semantic similarity (moderate weight)
   - Niche/specific interests bonus (rare interests = stronger connection)
   - Total overlap percentage

Return ONLY valid JSON, no other text.`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const responseText = message.content[0].text;
  const result = JSON.parse(responseText);

  // Cache the result
  similarityCache.set(cacheKey, result);

  return result;
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

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const responseText = message.content[0].text;
  return JSON.parse(responseText);
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
