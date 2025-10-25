import express from 'express';
import User from '../models/User.js';
import { calculateMatch, generateConversationStarters } from '../services/claudeService.js';

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

    // Calculate match using Claude API
    const matchData = await calculateMatch(
      viewer.privateInterests,
      target.privateInterests
    );

    // Generate conversation starters
    const conversationStarters = await generateConversationStarters(
      matchData,
      viewer.name,
      target.name
    );

    res.json({
      success: true,
      match: {
        score: matchData.matchScore,
        sharedInterests: matchData.sharedInterests,
        relatedInterests: matchData.relatedInterests,
        conversationStarters
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
      }
    });
  } catch (error) {
    console.error('Error calculating match:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
