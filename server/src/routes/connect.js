import express from 'express';
import User from '../models/User.js';
import Match from '../models/Match.js';
import MatchCache from '../models/MatchCache.js';
import { calculateRoommateCompatibility } from '../utils/roommateCompatibility.js';

const router = express.Router();

/**
 * GET /api/connect/:username
 * Get personalized roommate recommendations based on secret compatibility algorithm
 * OPTIMIZED: Uses cached interest scores, only calculates roommate compatibility
 */
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Fetch the requesting user
    const user = await User.findOne({ username: username.toLowerCase() }).populate('schoolId');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has a school selected
    if (!user.schoolId) {
      return res.json({
        recommendations: [],
        message: 'Complete your profile to see recommendations'
      });
    }

    // PERFORMANCE: Fetch ALL cached match scores in one query
    const allCachedMatches = await MatchCache.find({
      userIds: username.toLowerCase()
    });

    const cacheMap = new Map();
    allCachedMatches.forEach(cache => {
      const otherUser = cache.userIds.find(id => id !== username.toLowerCase());
      cacheMap.set(otherUser, cache.matchScore);
    });

    // Find potential matches from the same school
    let potentialMatches = await User.find({
      schoolId: user.schoolId._id,
      username: { $ne: username.toLowerCase() } // Exclude self
    }).populate('schoolId').lean(); // Use .lean() for performance

    console.log(`🔍 Finding recommendations for ${username} from ${potentialMatches.length} candidates`);

    // HARD FILTER: Gender preferences (non-negotiable)
    if (user.roommatePreferences?.genderPreference && user.roommatePreferences.genderPreference !== 'no-preference') {
      potentialMatches = potentialMatches.filter(candidate => {
        // If candidate hasn't set gender yet, allow them through (preferences are optional)
        if (!candidate.roommatePreferences?.gender) return true;
        // If candidate has set gender, check if it matches user's preference
        return candidate.roommatePreferences.gender === user.roommatePreferences.genderPreference;
      });
      console.log(`  → Filtered to ${potentialMatches.length} by gender preference`);
    }

    // REVERSE FILTER: Check if candidates' gender preferences match user's gender
    if (user.roommatePreferences?.gender) {
      potentialMatches = potentialMatches.filter(candidate => {
        if (!candidate.roommatePreferences?.genderPreference) return true; // No preference = allow
        if (candidate.roommatePreferences.genderPreference === 'no-preference') return true;
        return candidate.roommatePreferences.genderPreference === user.roommatePreferences.gender;
      });
      console.log(`  → Filtered to ${potentialMatches.length} by reverse gender check`);
    }

    // HARD FILTER: Pet allergies (non-negotiable)
    if (user.roommatePreferences?.pets === 'allergic') {
      potentialMatches = potentialMatches.filter(candidate => {
        if (!candidate.roommatePreferences?.pets) return true; // No info = allow
        return candidate.roommatePreferences.pets !== 'has-pets'; // Filter out has-pets
      });
      console.log(`  → Filtered to ${potentialMatches.length} by pet allergy (user is allergic)`);
    }

    // REVERSE FILTER: If candidate is allergic, user can't have pets
    potentialMatches = potentialMatches.filter(candidate => {
      if (candidate.roommatePreferences?.pets === 'allergic') {
        if (!user.roommatePreferences?.pets) return true;
        return user.roommatePreferences.pets !== 'has-pets';
      }
      return true;
    });
    console.log(`  → Filtered to ${potentialMatches.length} by reverse pet allergy check`);

    // Calculate compatibility for remaining candidates
    const recommendations = potentialMatches.map(candidate => {
      // Get cached interest score (null if not yet calculated)
      const cachedScore = cacheMap.get(candidate.username);
      const interestScore = cachedScore !== undefined ? cachedScore : null;
      const hasInterestScore = interestScore !== null;

      // Calculate roommate compatibility (fast, no API calls)
      const roommateScore = calculateRoommateCompatibility(
        user.roommatePreferences,
        candidate.roommatePreferences
      );

      // For secret ranking: use interestScore if available, otherwise estimate 50
      const estimatedInterestScore = interestScore !== null ? interestScore : 50;
      const secretScore = Math.round(estimatedInterestScore * 0.6 + roommateScore * 0.4);

      // Check if can message (interest score >= 70 AND score is calculated)
      const canMessage = hasInterestScore && interestScore >= 70;

      return {
        username: candidate.username,
        name: candidate.name,
        avatar: candidate.avatar,
        school: candidate.schoolId.name,
        secretScore, // NEVER shown to user - used for ranking only
        interestScore, // null if not calculated yet, actual score otherwise
        hasInterestScore, // Flag to indicate if score is real or needs calculation
        roommateScore, // For debugging
        canMessage,
        preview: {
          hasPreferences: !!(candidate.roommatePreferences &&
            Object.values(candidate.roommatePreferences).some(v => v !== null)),
          sleepSchedule: candidate.roommatePreferences?.sleepSchedule || null
        }
      };
    });

    // Sort by SECRET score (descending)
    recommendations.sort((a, b) => b.secretScore - a.secretScore);

    // Take top 20 recommendations
    const topRecommendations = recommendations.slice(0, 20);

    const calculatedCount = recommendations.filter(r => r.hasInterestScore).length;
    const uncalculatedCount = recommendations.length - calculatedCount;
    console.log(`✅ Returning ${topRecommendations.length} recommendations (${calculatedCount} with calculated scores, ${uncalculatedCount} need ice-breaking)`);

    res.json({
      success: true,
      recommendations: topRecommendations
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
