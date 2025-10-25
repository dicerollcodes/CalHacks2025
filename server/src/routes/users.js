import express from 'express';
import User from '../models/User.js';
import School from '../models/School.js';
import { generateShareableId } from '../utils/helpers.js';

const router = express.Router();

/**
 * POST /api/users
 * Create a new user
 */
router.post('/', async (req, res) => {
  try {
    const { name, avatar, socials, schoolId, privateInterests } = req.body;

    // Validate school exists
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Generate unique shareable ID
    const shareableId = await generateShareableId();

    const user = new User({
      name,
      avatar,
      socials,
      schoolId,
      privateInterests: privateInterests || [],
      shareableId
    });

    await user.save();

    // Populate school info in response
    await user.populate('schoolId');

    res.status(201).json({
      success: true,
      user,
      shareableLink: `/user/${shareableId}`
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/users/:id
 * Get user by shareable ID (NOT MongoDB _id)
 * Returns public info only (no private interests)
 */
router.get('/:shareableId', async (req, res) => {
  try {
    const { shareableId } = req.params;

    const user = await User.findOne({ shareableId })
      .populate('schoolId')
      .select('-privateInterests'); // Exclude private interests

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
