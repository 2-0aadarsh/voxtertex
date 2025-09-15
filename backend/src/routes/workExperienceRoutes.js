import express from 'express';
import { authenticateJWT } from '../middleware/jwtAuth.js';
import {
  getAllWorkExperiences,
  getWorkExperience,
  createWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
  reorderWorkExperiences
} from '../controllers/workExperienceController.js';

const router = express.Router();

// Apply JWT authentication to all routes
router.use(authenticateJWT);

// Get all work experiences for the current user
router.get('/', getAllWorkExperiences);

// Get a specific work experience
router.get('/:id', getWorkExperience);

// Create a new work experience
router.post('/', createWorkExperience);

// Update a work experience
router.patch('/:id', updateWorkExperience);

// Delete a work experience
router.delete('/:id', deleteWorkExperience);

// Reorder work experiences
router.patch('/reorder', reorderWorkExperiences);

export default router;



