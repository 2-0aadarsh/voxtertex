import express from 'express';
import {
  getSpeakers,
  getSpeakerById,
  getSpeakerStats
} from '../../controllers/speakersController.js';
import EnhancedUser from '../../models/enhancedUser.js';
import EnhancedProfile from '../../models/enhancedProfile.js';

const router = express.Router();

// Debug endpoint to check data
router.get('/debug', async (req, res) => {
  try {
    const totalUsers = await EnhancedUser.countDocuments();
    const totalSpeakers = await EnhancedUser.countDocuments({ role: 'speaker' });
    const totalProfiles = await EnhancedProfile.countDocuments();
    
    res.json({
      success: true,
      data: {
        totalUsers,
        totalSpeakers,
        totalProfiles,
        message: 'Debug data retrieved successfully'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Debug error',
      error: error.message
    });
  }
});

// GET /api/speakers - Get all speakers with pagination, search, filtering, and sorting
// Supports query parameters:
// - page: Page number (default: 1)
// - limit: Number of speakers per page (default: 10)
// - search: Search in name, expertise, or activities
// - expertise: Filter by area of expertise
// - industry: Filter by industry
// - availabilityDate: Filter by availability on specific date (YYYY-MM-DD format)
// - sortBy: Sort field (default: createdAt, options: createdAt, rating, firstName, lastName)
// - sortOrder: Sort order (default: desc, options: asc, desc)
router.get('/', getSpeakers);

// GET /api/speakers/stats - Get speaker statistics
router.get('/stats', getSpeakerStats);

// GET /api/speakers/:id - Get a specific speaker by ID
router.get('/:id', getSpeakerById);

export default router;
