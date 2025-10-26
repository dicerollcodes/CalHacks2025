import express from 'express';
import User from '../models/User.js';
import Match from '../models/Match.js';
import MatchCache from '../models/MatchCache.js';

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
        // If user has specific preference, candidate MUST have matching gender set
        if (!candidate.roommatePreferences?.gender) return false; // No gender set = filtered out
        return candidate.roommatePreferences.gender === user.roommatePreferences.genderPreference;
      });
      console.log(`  → Filtered to ${potentialMatches.length} by gender preference (strict)`);
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
      // Get cached interest score (or default to 50)
      const interestScore = cacheMap.get(candidate.username) || 50;

      // Calculate roommate compatibility (fast, no API calls)
      const roommateScore = calculateRoommateCompatibility(
        user.roommatePreferences,
        candidate.roommatePreferences
      );

      // Combine with weights (60% interests, 40% roommate)
      const secretScore = Math.round(interestScore * 0.6 + roommateScore * 0.4);

      // Check if can message (interest score >= 70)
      const canMessage = interestScore >= 70;

      return {
        username: candidate.username,
        name: candidate.name,
        avatar: candidate.avatar,
        school: candidate.schoolId.name,
        secretScore, // NEVER shown to user
        interestScore, // This is the visible match percentage
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

    console.log(`✅ Returning ${topRecommendations.length} recommendations (interest avg: ${Math.round(recommendations.reduce((sum, r) => sum + r.interestScore, 0) / recommendations.length)}%, roommate avg: ${Math.round(recommendations.reduce((sum, r) => sum + r.roommateScore, 0) / recommendations.length)}%)`);

    res.json({
      success: true,
      recommendations: topRecommendations
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Calculate roommate compatibility (full algorithm, no API calls)
 */
function calculateRoommateCompatibility(prefs1, prefs2) {
  if (!prefs1 || !prefs2) return 50;

  let totalPoints = 0;
  let maxPoints = 0;

  // Gender already filtered out incompatible matches, so this is for scoring compatible ones
  maxPoints += 25;
  if (prefs1.genderPreference && prefs2.gender) {
    if (prefs1.genderPreference === 'no-preference' || prefs1.genderPreference === prefs2.gender) {
      totalPoints += 25;
    }
  } else {
    totalPoints += 12;
  }

  // Sleep schedule compatibility (20 points)
  maxPoints += 20;
  if (prefs1.sleepSchedule && prefs2.sleepSchedule) {
    if (prefs1.sleepSchedule === prefs2.sleepSchedule) {
      totalPoints += 20;
    } else if (prefs1.sleepSchedule === 'flexible' || prefs2.sleepSchedule === 'flexible') {
      totalPoints += 15;
    } else {
      totalPoints += 5;
    }
  } else {
    totalPoints += 10;
  }

  // Bedtime/wake time compatibility (15 points)
  maxPoints += 15;
  if (prefs1.bedtime && prefs2.bedtime && prefs1.wakeTime && prefs2.wakeTime) {
    const bedtimeDiff = getTimeDifference(prefs1.bedtime, prefs2.bedtime);
    const waketimeDiff = getTimeDifference(prefs1.wakeTime, prefs2.wakeTime);
    const avgDiff = (bedtimeDiff + waketimeDiff) / 2;

    if (avgDiff < 1) totalPoints += 15;
    else if (avgDiff < 2) totalPoints += 10;
    else if (avgDiff < 3) totalPoints += 5;
  } else {
    totalPoints += 7;
  }

  // Cleanliness compatibility (15 points)
  maxPoints += 15;
  if (prefs1.cleanliness && prefs2.cleanliness) {
    const match = getPreferenceMatch(prefs1.cleanliness, prefs2.cleanliness, ['very-clean', 'moderately-clean', 'relaxed']);
    totalPoints += match * 15;
  } else {
    totalPoints += 7;
  }

  // Social level compatibility (10 points)
  maxPoints += 10;
  if (prefs1.socialLevel && prefs2.socialLevel) {
    const match = getPreferenceMatch(prefs1.socialLevel, prefs2.socialLevel, ['quiet', 'moderately-social', 'very-social']);
    totalPoints += match * 10;
  } else {
    totalPoints += 5;
  }

  // Guest frequency compatibility (10 points)
  maxPoints += 10;
  if (prefs1.guests && prefs2.guests) {
    const match = getPreferenceMatch(prefs1.guests, prefs2.guests, ['rarely', 'sometimes', 'often']);
    totalPoints += match * 10;
  } else {
    totalPoints += 5;
  }

  // Smoking compatibility (15 points)
  maxPoints += 15;
  if (prefs1.smoking && prefs2.smoking) {
    if (prefs1.smoking === prefs2.smoking) {
      totalPoints += 15;
    } else if (prefs1.smoking === 'outside-only' || prefs2.smoking === 'outside-only') {
      totalPoints += 8;
    } else if ((prefs1.smoking === 'smoker' && prefs2.smoking === 'non-smoker') || (prefs1.smoking === 'non-smoker' && prefs2.smoking === 'smoker')) {
      totalPoints += 0;
    }
  } else {
    totalPoints += 7;
  }

  // Pet compatibility (10 points)
  maxPoints += 10;
  if (prefs1.pets && prefs2.pets) {
    if (prefs1.pets === prefs2.pets) {
      totalPoints += 10;
    } else if (prefs1.pets === 'allergic' || prefs2.pets === 'allergic') {
      if (prefs1.pets === 'has-pets' || prefs2.pets === 'has-pets') {
        totalPoints += 0;
      } else {
        totalPoints += 5;
      }
    } else {
      totalPoints += 5;
    }
  } else {
    totalPoints += 5;
  }

  const score = Math.round((totalPoints / maxPoints) * 100);
  return Math.max(0, Math.min(100, score));
}

function getTimeDifference(time1, time2) {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  const minutes1 = h1 * 60 + m1;
  const minutes2 = h2 * 60 + m2;
  return Math.abs(minutes1 - minutes2) / 60;
}

function getPreferenceMatch(pref1, pref2, orderedValues) {
  const index1 = orderedValues.indexOf(pref1);
  const index2 = orderedValues.indexOf(pref2);
  if (index1 === -1 || index2 === -1) return 0.5;
  const maxDiff = orderedValues.length - 1;
  const diff = Math.abs(index1 - index2);
  return 1 - (diff / maxDiff);
}

export default router;
