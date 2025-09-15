import express from 'express';
import { authenticateJWT } from '../middleware/jwtAuth.js';
import {
  getAllAwards,
  getAward,
  createAward,
  updateAward,
  deleteAward,
  verifyCredential
} from '../controllers/awardController.js';

const router = express.Router();

// Apply JWT authentication to all routes
router.use(authenticateJWT);

// Get all awards for the current user
router.get('/', getAllAwards);

// Get a specific award
router.get('/:id', getAward);

// Create a new award
router.post('/', createAward);

// Update an award
router.patch('/:id', updateAward);

// Delete an award
router.delete('/:id', deleteAward);

// Verify a credential
router.post('/:awardId/verify', verifyCredential);

export default router;



