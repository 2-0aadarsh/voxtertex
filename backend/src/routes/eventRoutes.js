// Import required modules
import express from 'express';
import {
  createEvent, getAllEvents, getEventById,
  updateEvent, deleteEvent, getUserEvents
} from '../controllers/eventController.js';
import upload from '../middleware/upload.js';
import { ensureAuthenticated } from '../middleware/ensureAuth.js';

const router = express.Router();

// Create a new event
// router.post('/new-event',ensureAuthenticated, upload.single('eventBanner'), createEvent);
router.post('/new-event',createEvent);

// Get all events
// router.get('/', ensureAuthenticated, getAllEvents);
router.get('/', getAllEvents);

// Get an event by ID
router.get('/:id',ensureAuthenticated, getEventById);

// Update an event by ID
router.put('/:id', ensureAuthenticated, updateEvent);

// Delete an event by ID
router.delete('/:id',ensureAuthenticated, deleteEvent);

// get events for a speaker or an organizer
router.get('/user/me', ensureAuthenticated, getUserEvents);

// Export the router
export default router;