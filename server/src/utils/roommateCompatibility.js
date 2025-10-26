/**
 * Roommate compatibility utilities
 * Used by both /api/connect and /api/match routes
 */

/**
 * Check if two users pass hard filters (gender preference & pet allergies)
 * These are NON-NEGOTIABLE filters - if they fail, users cannot be roommates
 */
export function passesHardFilters(user1Prefs, user2Prefs) {
  if (!user1Prefs || !user2Prefs) return false;

  // Hard filter 1: Gender preferences (bidirectional)
  // Check user1's preference against user2's gender
  if (user1Prefs.genderPreference && user1Prefs.genderPreference !== 'no-preference') {
    if (!user2Prefs.gender) return false; // No gender set = filtered out
    if (user2Prefs.gender !== user1Prefs.genderPreference) return false;
  }

  // Check user2's preference against user1's gender
  if (user2Prefs.genderPreference && user2Prefs.genderPreference !== 'no-preference') {
    if (!user1Prefs.gender) return false; // No gender set = filtered out
    if (user1Prefs.gender !== user2Prefs.genderPreference) return false;
  }

  // Hard filter 2: Pet allergies (bidirectional)
  // If user1 is allergic, user2 can't have pets
  if (user1Prefs.pets === 'allergic' && user2Prefs.pets === 'has-pets') {
    return false;
  }

  // If user2 is allergic, user1 can't have pets
  if (user2Prefs.pets === 'allergic' && user1Prefs.pets === 'has-pets') {
    return false;
  }

  return true;
}

/**
 * Calculate roommate preference compatibility (lifestyle factors only, no interests)
 * Returns a score from 0-100 based on roommate preferences alignment
 */
export function calculateRoommateCompatibility(prefs1, prefs2) {
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

/**
 * Calculate combined roommate score (interests + lifestyle preferences)
 * @param {number} interestScore - Pure interest compatibility (0-100)
 * @param {object} prefs1 - User 1's roommate preferences
 * @param {object} prefs2 - User 2's roommate preferences
 * @returns {number} Combined score (0-100, with 1 decimal precision)
 */
export function calculateCombinedRoommateScore(interestScore, prefs1, prefs2) {
  const lifestyleScore = calculateRoommateCompatibility(prefs1, prefs2);
  // Weighted average: interests 60%, lifestyle 40%
  // Preserves decimal precision for more granular scoring
  const combined = (interestScore * 0.6) + (lifestyleScore * 0.4);
  return Math.round(combined * 10) / 10;
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
