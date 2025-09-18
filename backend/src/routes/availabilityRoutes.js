// // routes/availabilityRoutes.js
// import { Router } from "express";
// import { ensureAuthenticated } from "../middleware/ensureAuth.js";
// import { 
//   addAvailability,
//   getExpertAvailabilities,
//   updateAvailability,
//   deleteAvailability,
//   getAvailabilityById
// } from "../controllers/availabilityController.js";

// const router = Router();

// // Protect all routes
// router.use(ensureAuthenticated);

// // Add availability
// router.post("/", addAvailability);

// // Get expert's availabilities
// router.get("/", getExpertAvailabilities);

// // Get availability by ID
// router.get("/:availabilityId", getAvailabilityById);

// // Update availability
// router.put("/:availabilityId", updateAvailability);

// // Delete availability
// router.delete("/:availabilityId", deleteAvailability);

// export default router;



import { Router } from 'express';
import {
  getAvailability,
  setAvailability,
  getAvailabilityByDateRange,
  deleteAvailability,
  getAvailabilityById,
  getSpeakerAvailability,
} from '../controllers/availabilityController.js';

import { authenticateJWT } from '../middleware/jwtAuth.js';
import { validateAvailabilityId, validateGetAvailability, validateAvailability } from '../middleware/availabilityMiddleware.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticateJWT);

// Get availability for a specific month: GET /api/availability/:year/:month
router.get('/:year/:month', validateGetAvailability, getAvailability);

// Get availability for a date range: GET /api/availability/range?startDate=...&endDate=...
router.get('/range', getAvailabilityByDateRange);

// Get availability by ID
router.get("/:availabilityId", validateAvailabilityId, getAvailabilityById);

// Set availability for single or multiple dates
router.post('/', authenticateJWT, setAvailability);

// Delete availability for specific dates
router.delete('/', deleteAvailability);

// New public route for organizers
router.get("/speaker/:speakerId", getSpeakerAvailability);

export default router;
