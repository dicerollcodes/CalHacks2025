import { calculateMatch, calculateRoommateCompatibility } from './claudeService.js';

/**
 * Calculate secret compatibility score for recommendations
 * This combines interest matching with roommate preference compatibility
 * The score is NEVER shown to users - only used for ranking
 */
export async function calculateSecretCompatibility(user1, user2) {
  // Part 1: Interest-based compatibility (60% weight)
  const interestMatch = await calculateMatch(
    user1.privateInterests,
    user2.privateInterests,
    user1.name,
    user2.name
  );
  const interestScore = interestMatch.matchScore;

  // Part 2: Roommate preference compatibility using Claude AI (40% weight)
  const roommateAnalysis = await calculateRoommateCompatibility(
    user1.roommatePreferences,
    user2.roommatePreferences,
    user1.name,
    user2.name
  );
  const roommateScore = roommateAnalysis.score;

  // Combine scores with weights
  const finalScore = Math.round(interestScore * 0.6 + roommateScore * 0.4);

  return {
    secretScore: finalScore,
    interestScore,
    roommateScore,
    roommateAnalysis, // Include full analysis with explanations
    breakdown: {
      interestWeight: 0.6,
      roommateWeight: 0.4
    }
  };
}

// Note: Old algorithmic roommate compatibility function has been replaced
// with Claude AI-based analysis in claudeService.js
// The new function provides natural language explanations along with scoring
