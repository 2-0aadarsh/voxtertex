// routes/speakerManagementRoutes.js
import express from 'express';
import { authenticateJWT } from '../middleware/jwtAuth.js';
import { getSpeakersGrouped, getSpeakersByStatus } from '../controllers/speakerManagementController.js';

const router = express.Router();

router.use(authenticateJWT);

// Get all speakers grouped by status
router.get('/', getSpeakersGrouped);

// Get speakers by specific status (confirmed/declined/inprogress)
router.get('/:status', getSpeakersByStatus);

export default router;
