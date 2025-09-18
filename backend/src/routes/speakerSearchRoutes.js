import express from 'express';
import { 
  searchSpeakers, 
  getSpeakerSuggestions, 
  searchSpeakersWithFilters,
  getAvailableEventTypes 
} from '../controllers/speakerSearchController.js';
import { authenticateJWT } from '../middleware/jwtAuth.js';

const router = express.Router();

// Search speakers by keywords
router.get('/search', authenticateJWT, searchSpeakers);

// Get speaker suggestions for autocomplete
router.get('/suggestions', authenticateJWT, getSpeakerSuggestions);

// Search and filter speakers based on availability and other criteria
router.get('/filter', authenticateJWT, searchSpeakersWithFilters);

// Get available event types and sub types for filtering
router.get('/event-types', authenticateJWT, getAvailableEventTypes);

export default router;
