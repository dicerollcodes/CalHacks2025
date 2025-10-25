import Anthropic from '@anthropic-ai/sdk';

// Lazy-load the Anthropic client to ensure API key is loaded
let anthropic = null;

function getAnthropicClient() {
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
 * Calculate semantic similarity and generate conversation starters in ONE call
 * Returns a detailed analysis including:
 * - Shared interests (exact matches)
 * - Related interests (semantic similarity)
 * - Match score (0-100)
 * - Conversation starters
 */
export async function calculateMatch(userInterests, targetInterests, userName, targetName) {
  const cacheKey = JSON.stringify([userInterests.sort(), targetInterests.sort(), userName, targetName]);

  if (similarityCache.has(cacheKey)) {
    return similarityCache.get(cacheKey);
  }

  const prompt = `You are analyzing interest compatibility between two college students: ${userName} and ${targetName}.

${userName}'s interests: ${JSON.stringify(userInterests)}
${targetName}'s interests: ${JSON.stringify(targetInterests)}

Analyze their compatibility and return a JSON object with:
1. "sharedInterests": array of exact or very close matches
2. "relatedInterests": array of objects with {userInterest, targetInterest, relationship} for semantically related interests
3. "matchScore": number 0-100 based on:
   - Exact matches (high weight)
   - Semantic similarity (moderate weight)
   - Niche/specific interests bonus (rare interests = stronger connection)
   - Total overlap percentage
4. "conversationStarters": array of 3 natural, casual conversation starters that:
   - Reference specific shared/related interests
   - Are college-student friendly and authentic
   - Encourage discussion, not yes/no answers
   - Example: "I saw you're into anime too! Have you watched any of this season's shows?"

Return ONLY valid JSON, no other text.`;

  const message = await getAnthropicClient().messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const responseText = message.content[0].text;
  const cleanedText = stripMarkdown(responseText);
  const result = JSON.parse(cleanedText);

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

  const message = await getAnthropicClient().messages.create({
    model: 'claude-sonnet-4-20250514',
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
