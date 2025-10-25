import express from 'express';
import User from '../models/User.js';
import School from '../models/School.js';
import MatchCache from '../models/MatchCache.js';
import { generateShareableId } from '../utils/helpers.js';
import { getAnthropicClient, clearCache as clearClaudeCache } from '../services/claudeService.js';

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
 * GET /api/users/schools
 * Get all available schools
 */
router.get('/schools', async (req, res) => {
  try {
    const schools = await School.find().sort({ name: 1 });
    res.json(schools);
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
});

/**
 * POST /api/users/generate-interest-suggestions
 * Generate interest suggestions using Claude API
 */
router.post('/generate-interest-suggestions', async (req, res) => {
  try {
    const message = await getAnthropicClient().messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Generate 6 unique, specific, and relatable interests/hobbies that college students might have when looking for roommates.

Requirements:
- Be very specific (e.g., "Late-night gaming sessions" not just "gaming")
- Make them relatable to college students
- Include a mix of different categories (entertainment, hobbies, lifestyle, study habits)
- Each should suggest a compatible roommate trait
- Pick an appropriate single emoji for each

Return ONLY a JSON array in this exact format, nothing else:
[
  {"text": "interest description", "emoji": "emoji"},
  ...
]`
      }]
    });

    const content = message.content[0].text;
    const suggestions = JSON.parse(content);

    res.json({ suggestions });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

/**
 * GET /api/users/check-username/:username
 * Check if username is available
 */
router.get('/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Validate username format
    const usernameRegex = /^[a-z0-9_]+$/;
    if (!usernameRegex.test(username.toLowerCase()) || username.length < 3 || username.length > 20) {
      return res.json({
        available: false,
        error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores'
      });
    }

    const existingUser = await User.findOne({ username: username.toLowerCase() });

    res.json({
      available: !existingUser,
      username: username.toLowerCase()
    });
  } catch (error) {
    console.error('Error checking username:', error);
    res.status(500).json({ error: 'Failed to check username' });
  }
});

/**
 * GET /api/users/:username
 * Get user by username (NOT MongoDB _id)
 * Returns public info only (no private interests)
 */
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username: username.toLowerCase() })
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

/**
 * GET /api/users/:username/private-interests
 * Get user's private interests (for editing own profile)
 */
router.get('/:username/private-interests', async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      privateInterests: user.privateInterests || []
    });
  } catch (error) {
    console.error('Error fetching private interests:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/users/:username
 * Update user profile
 */
router.put('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { name, username: newUsername, socials, privateInterests } = req.body;

    // Find the existing user
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If username is being changed, check if new username is available
    if (newUsername && newUsername.toLowerCase() !== username.toLowerCase()) {
      const existingUser = await User.findOne({ username: newUsername.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      // Validate username format
      const usernameRegex = /^[a-z0-9_]+$/;
      if (!usernameRegex.test(newUsername.toLowerCase()) || newUsername.length < 3 || newUsername.length > 20) {
        return res.status(400).json({
          error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores'
        });
      }

      user.username = newUsername.toLowerCase();
    }

    // Update other fields
    if (name) user.name = name;
    if (socials !== undefined) user.socials = socials;

    // If interests are being updated, ALWAYS clear ALL caches for this user
    if (privateInterests !== undefined) {
      // Clear database cache: Delete ALL cached matches involving this user (both as viewer and target)
      const result = await MatchCache.deleteMany({
        userIds: username.toLowerCase()
      });

      // Clear in-memory cache in claudeService
      clearClaudeCache();

      console.log(`🗑️  Cleared ${result.deletedCount} database matches + in-memory cache for ${username} due to interest update`);

      user.privateInterests = privateInterests;
    }

    await user.save();
    await user.populate('schoolId');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
