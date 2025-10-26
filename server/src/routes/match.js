import express from 'express';
import User from '../models/User.js';
import MatchCache from '../models/MatchCache.js';
import Match from '../models/Match.js';
import { calculateMatch } from '../services/claudeService.js';
import { normalizeInterests, createMatchCacheKey } from '../utils/helpers.js';
import { passesHardFilters, calculateRoommateCompatibility, calculateCombinedRoommateScore } from '../utils/roommateCompatibility.js';

const router = express.Router();

/**
 * POST /api/match
 * Calculate compatibility between viewer and target user
 * Body: { viewerId: string, targetUserId: string }
 */
router.post('/', async (req, res) => {
  try {
    const { viewerId, targetUserId } = req.body;

    if (!viewerId || !targetUserId) {
      return res.status(400).json({
        error: 'Both viewerId and targetUserId are required'
      });
    }

    // Fetch both users with their private interests
    const [viewer, target] = await Promise.all([
      User.findOne({ username: viewerId.toLowerCase() }).populate('schoolId'),
      User.findOne({ username: targetUserId.toLowerCase() }).populate('schoolId')
    ]);

    if (!viewer || !target) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Normalize interests to handle typos/variations
    const normalizedViewerInterests = normalizeInterests(viewer.privateInterests);
    const normalizedTargetInterests = normalizeInterests(target.privateInterests);

    // Create cache key (order-independent)
    const cacheKey = createMatchCacheKey(viewerId, targetUserId);
    const sortedUserIds = [viewerId, targetUserId].sort();

    // Check database cache first
    let cachedMatch = await MatchCache.findOne({ userIds: sortedUserIds });

    let matchData;
    let fromCache = false;

    if (cachedMatch) {
      // Cache hit! Use existing data
      console.log(`Cache HIT for ${cacheKey}`);
      matchData = {
        matchScore: cachedMatch.matchScore,
        sharedInterests: cachedMatch.sharedInterests,
        relatedInterests: cachedMatch.relatedInterests,
        conversationStarters: cachedMatch.conversationStarters
      };
      fromCache = true;

      // Update hit count asynchronously
      cachedMatch.recordHit().catch(err => console.error('Cache update error:', err));
    } else {
      // Cache miss - call Claude API
      console.log(`Cache MISS for ${cacheKey} - calling Claude API`);
      matchData = await calculateMatch(
        viewer.privateInterests,
        target.privateInterests,
        viewer.name,
        target.name
      );

      // Save to database cache for future use
      const newCache = new MatchCache({
        userIds: sortedUserIds,
        normalizedInterests: {
          user1: normalizedViewerInterests,
          user2: normalizedTargetInterests
        },
        matchScore: matchData.matchScore,
        sharedInterests: matchData.sharedInterests,
        relatedInterests: matchData.relatedInterests,
        conversationStarters: matchData.conversationStarters
      });

      await newCache.save();
    }

    // Privacy protection: Hide detailed interests if match score < 40%
    const MINIMUM_MATCH_THRESHOLD = 40;
    const shouldRevealDetails = matchData.matchScore >= MINIMUM_MATCH_THRESHOLD;

    // Store/update match based on score threshold
    const MESSAGE_THRESHOLD = 70;
    const existingMatch = await Match.findOne({ userIds: sortedUserIds });

    if (matchData.matchScore >= MESSAGE_THRESHOLD) {
      // Score is high enough - allow messaging
      if (!existingMatch) {
        const newMatch = new Match({
          userIds: sortedUserIds,
          user1Id: sortedUserIds[0],
          user2Id: sortedUserIds[1],
          matchScore: matchData.matchScore,
          canMessage: true,
          user1Name: sortedUserIds[0] === viewerId ? viewer.name : target.name,
          user2Name: sortedUserIds[0] === viewerId ? target.name : viewer.name,
          user1Avatar: `https://i.pravatar.cc/150?u=${sortedUserIds[0]}`,
          user2Avatar: `https://i.pravatar.cc/150?u=${sortedUserIds[1]}`
        });
        await newMatch.save();
      } else if (existingMatch.matchScore !== matchData.matchScore || !existingMatch.canMessage) {
        // Update score and ensure canMessage is true
        existingMatch.matchScore = matchData.matchScore;
        existingMatch.canMessage = true;
        await existingMatch.save();
      }
    } else if (existingMatch) {
      // Score dropped below threshold - disable messaging
      if (existingMatch.canMessage || existingMatch.matchScore !== matchData.matchScore) {
        existingMatch.matchScore = matchData.matchScore;
        existingMatch.canMessage = false;
        await existingMatch.save();
        console.log(`🚫 Match score dropped below ${MESSAGE_THRESHOLD}% - messaging disabled`);
      }
    }

    // Calculate roommate compatibility scores
    const isEligibleRoommate = passesHardFilters(viewer.roommatePreferences, target.roommatePreferences);
    const lifestyleScore = calculateRoommateCompatibility(viewer.roommatePreferences, target.roommatePreferences);
    const combinedRoommateScore = calculateCombinedRoommateScore(matchData.matchScore, viewer.roommatePreferences, target.roommatePreferences);

    res.json({
      success: true,
      match: {
        // Friend compatibility (pure interests, no roommate factors)
        friendScore: matchData.matchScore,

        // Roommate compatibility (lifestyle preferences only)
        lifestyleScore: lifestyleScore,

        // Combined roommate score (average of interests + lifestyle)
        roommateScore: combinedRoommateScore,

        // Roommate eligibility
        isEligibleRoommate: isEligibleRoommate,
        roommateIneligibilityReason: !isEligibleRoommate
          ? 'Does not pass gender preference or pet allergy filters'
          : null,

        // Legacy field for backwards compatibility
        score: matchData.matchScore,

        revealDetails: shouldRevealDetails,
        sharedInterests: shouldRevealDetails ? matchData.sharedInterests : [],
        relatedInterests: shouldRevealDetails ? matchData.relatedInterests : [],
        conversationStarters: shouldRevealDetails ? matchData.conversationStarters : [],
        privacyMessage: !shouldRevealDetails
          ? `You have a ${matchData.matchScore}% match - not enough overlap to reveal details. Try adding more interests to your profile to build a richer personality for better matches!`
          : null
      },
      viewer: {
        name: viewer.name,
        avatar: viewer.avatar
      },
      target: {
        name: target.name,
        avatar: target.avatar,
        socials: target.socials,
        school: target.schoolId.name
      },
      _debug: {
        fromCache,
        cacheKey,
        thresholdMet: shouldRevealDetails,
        hasRoommatePreferences: !!(viewer.roommatePreferences && target.roommatePreferences)
      }
    });
  } catch (error) {
    console.error('Error calculating match:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
