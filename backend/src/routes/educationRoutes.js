import express from 'express';
import { authenticateJWT } from '../middleware/jwtAuth.js';
import {
  getAllEducation,
  getEducation,
  createEducation,
  updateEducation,
  deleteEducation
} from '../controllers/educationController.js';

const router = express.Router();

// Apply JWT authentication to all routes
router.use(authenticateJWT);

// Get all education entries for the current user
router.get('/', getAllEducation);

// Get a specific education entry
router.get('/:id', getEducation);

// Create a new education entry
router.post('/', createEducation);

// Update an education entry
router.patch('/:id', updateEducation);

// Delete an education entry
router.delete('/:id', deleteEducation);

export default router;



