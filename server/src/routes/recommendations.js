import express from 'express';
import User from '../models/User.js';
import { rankUsersByCompatibility } from '../services/claudeService.js';

const router = express.Router();

/**
 * GET /api/recommendations/:userId
 * Get recommended matches for a user
 * Query params:
 *   - limit: number of recommendations (default: 10)
 *   - sameSchool: true/false (default: true)
 */
router.get('/:shareableId', async (req, res) => {
  try {
    const { shareableId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const sameSchool = req.query.sameSchool !== 'false'; // Default true

    // Fetch the source user
    const sourceUser = await User.findOne({ shareableId }).populate('schoolId');

    if (!sourceUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Build query for candidate users
    const query = {
      shareableId: { $ne: shareableId } // Exclude self
    };

    if (sameSchool) {
      query.schoolId = sourceUser.schoolId._id;
    }

    // Fetch candidate users
    const candidates = await User.find(query)
      .populate('schoolId')
      .limit(100); // Limit initial fetch for performance

    if (candidates.length === 0) {
      return res.json({
        success: true,
        recommendations: []
      });
    }

    // Rank by compatibility using Claude API
    const rankedMatches = await rankUsersByCompatibility(sourceUser, candidates);

    // Format and limit results
    const recommendations = rankedMatches.slice(0, limit).map(match => ({
      user: {
        shareableId: match.user.shareableId,
        name: match.user.name,
        avatar: match.user.avatar,
        school: match.user.schoolId.name
      },
      matchScore: match.matchScore,
      sharedInterestsCount: match.sharedCount,
      relatedInterestsCount: match.relatedCount
    }));

    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
