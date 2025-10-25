import { calculateMatch } from './claudeService.js';

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

  // Part 2: Roommate preference compatibility (40% weight)
  const roommateScore = calculateRoommateCompatibility(
    user1.roommatePreferences,
    user2.roommatePreferences
  );

  // Combine scores with weights
  const finalScore = Math.round(interestScore * 0.6 + roommateScore * 0.4);

  return {
    secretScore: finalScore,
    interestScore,
    roommateScore,
    breakdown: {
      interestWeight: 0.6,
      roommateWeight: 0.4
    }
  };
}

/**
 * Calculate compatibility based on roommate preferences
 * Returns a score from 0-100
 */
function calculateRoommateCompatibility(prefs1, prefs2) {
  if (!prefs1 || !prefs2) return 50; // Neutral if no preferences set

  let totalPoints = 0;
  let maxPoints = 0;

  // Gender preference compatibility (CRITICAL - 25 points)
  maxPoints += 25;
  if (prefs1.genderPreference && prefs2.gender) {
    if (prefs1.genderPreference === 'no-preference') {
      totalPoints += 25;
    } else if (prefs1.genderPreference === prefs2.gender) {
      totalPoints += 25;
    } else {
      totalPoints += 0; // Incompatible
    }
  } else {
    totalPoints += 12; // No preference set, neutral
  }

  // Reverse check
  if (prefs2.genderPreference && prefs1.gender) {
    if (prefs2.genderPreference === 'no-preference') {
      // Already counted above
    } else if (prefs2.genderPreference === prefs1.gender) {
      // Already counted above
    } else {
      totalPoints = 0; // Hard fail if gender preferences don't match
      return 0;
    }
  }

  // Sleep schedule compatibility (20 points)
  maxPoints += 20;
  if (prefs1.sleepSchedule && prefs2.sleepSchedule) {
    if (prefs1.sleepSchedule === prefs2.sleepSchedule) {
      totalPoints += 20; // Perfect match
    } else if (prefs1.sleepSchedule === 'flexible' || prefs2.sleepSchedule === 'flexible') {
      totalPoints += 15; // One is flexible
    } else {
      totalPoints += 5; // Opposite schedules
    }
  } else {
    totalPoints += 10; // No preference set
  }

  // Bedtime/wake time compatibility (15 points)
  maxPoints += 15;
  if (prefs1.bedtime && prefs2.bedtime && prefs1.wakeTime && prefs2.wakeTime) {
    const bedtimeDiff = getTimeDifference(prefs1.bedtime, prefs2.bedtime);
    const waketimeDiff = getTimeDifference(prefs1.wakeTime, prefs2.wakeTime);
    const avgDiff = (bedtimeDiff + waketimeDiff) / 2;

    if (avgDiff < 1) {
      totalPoints += 15; // Within 1 hour
    } else if (avgDiff < 2) {
      totalPoints += 10; // Within 2 hours
    } else if (avgDiff < 3) {
      totalPoints += 5; // Within 3 hours
    }
  } else {
    totalPoints += 7; // No times set
  }

  // Cleanliness compatibility (15 points)
  maxPoints += 15;
  if (prefs1.cleanliness && prefs2.cleanliness) {
    const cleanlinessMatch = getPreferenceMatch(prefs1.cleanliness, prefs2.cleanliness, [
      'very-clean', 'moderately-clean', 'relaxed'
    ]);
    totalPoints += cleanlinessMatch * 15;
  } else {
    totalPoints += 7;
  }

  // Social level compatibility (10 points)
  maxPoints += 10;
  if (prefs1.socialLevel && prefs2.socialLevel) {
    const socialMatch = getPreferenceMatch(prefs1.socialLevel, prefs2.socialLevel, [
      'quiet', 'moderately-social', 'very-social'
    ]);
    totalPoints += socialMatch * 10;
  } else {
    totalPoints += 5;
  }

  // Guest frequency compatibility (10 points)
  maxPoints += 10;
  if (prefs1.guests && prefs2.guests) {
    const guestMatch = getPreferenceMatch(prefs1.guests, prefs2.guests, [
      'rarely', 'sometimes', 'often'
    ]);
    totalPoints += guestMatch * 10;
  } else {
    totalPoints += 5;
  }

  // Smoking compatibility (CRITICAL if mismatched - 15 points)
  maxPoints += 15;
  if (prefs1.smoking && prefs2.smoking) {
    if (prefs1.smoking === prefs2.smoking) {
      totalPoints += 15;
    } else if (prefs1.smoking === 'outside-only' || prefs2.smoking === 'outside-only') {
      totalPoints += 8; // Compromise possible
    } else if (
      (prefs1.smoking === 'smoker' && prefs2.smoking === 'non-smoker') ||
      (prefs1.smoking === 'non-smoker' && prefs2.smoking === 'smoker')
    ) {
      totalPoints += 0; // Major incompatibility
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
        totalPoints += 0; // Deal breaker
      } else {
        totalPoints += 5;
      }
    } else {
      totalPoints += 5; // Some compatibility
    }
  } else {
    totalPoints += 5;
  }

  // Convert to 0-100 scale
  const score = Math.round((totalPoints / maxPoints) * 100);
  return Math.max(0, Math.min(100, score));
}

/**
 * Get time difference in hours between two time strings
 */
function getTimeDifference(time1, time2) {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);

  const minutes1 = h1 * 60 + m1;
  const minutes2 = h2 * 60 + m2;

  return Math.abs(minutes1 - minutes2) / 60;
}

/**
 * Calculate how well two preferences match on an ordinal scale
 * Returns 0-1, where 1 is perfect match and 0 is opposite
 */
function getPreferenceMatch(pref1, pref2, orderedValues) {
  const index1 = orderedValues.indexOf(pref1);
  const index2 = orderedValues.indexOf(pref2);

  if (index1 === -1 || index2 === -1) return 0.5;

  const maxDiff = orderedValues.length - 1;
  const diff = Math.abs(index1 - index2);

  return 1 - (diff / maxDiff);
}
