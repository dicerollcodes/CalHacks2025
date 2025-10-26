import express from 'express';
import School from '../models/School.js';

const router = express.Router();

/**
 * GET /api/schools
 * Get all schools sorted alphabetically
 */
router.get('/', async (req, res) => {
  try {
    const schools = await School.find({}).sort({ name: 1 });
    res.json({ schools });
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
