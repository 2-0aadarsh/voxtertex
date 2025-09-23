import express from 'express';
import { sendOffer, respondToOffer, getSpeakersByStatus } from '../controllers/speakerOfferController.js';


const router = express.Router();

router.post('/send-offer',  sendOffer);
router.post('/respond-offer',  respondToOffer);
router.get('/event/:eventId/speakers',  getSpeakersByStatus);

export default router;
