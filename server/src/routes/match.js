import express from 'express';
import User from '../models/User.js';
import MatchCache from '../models/MatchCache.js';
import { calculateMatch } from '../services/claudeService.js';
import { normalizeInterests, createMatchCacheKey } from '../utils/helpers.js';

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
      User.findOne({ shareableId: viewerId }).populate('schoolId'),
      User.findOne({ shareableId: targetUserId }).populate('schoolId')
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

    res.json({
      success: true,
      match: {
        score: matchData.matchScore,
        revealDetails: shouldRevealDetails,
        sharedInterests: shouldRevealDetails ? matchData.sharedInterests : [],
        relatedInterests: shouldRevealDetails ? matchData.relatedInterests : [],
        conversationStarters: shouldRevealDetails ? matchData.conversationStarters : [],
        privacyMessage: !shouldRevealDetails
          ? `You have a ${matchData.matchScore}% match - not enough overlap to reveal details. Keep exploring!`
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
        thresholdMet: shouldRevealDetails
      }
    });
  } catch (error) {
    console.error('Error calculating match:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
