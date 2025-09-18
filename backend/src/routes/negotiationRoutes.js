import express from 'express';
import { authenticateJWT } from '../middleware/jwtAuth.js';
import { 
  createNegotiation,
  getNegotiation,
  proposeAmount,
  acceptProposal,
  declineProposal,
  cancelNegotiation,
  getUserNegotiations,
  getNegotiationStats,
  getAllNegotiationsAdmin,
  getNegotiationAdmin,
  getNegotiationStatsAdmin
} from '../controllers/negotiationController.js';

const router = express.Router();

// Apply JWT authentication to all routes
router.use(authenticateJWT);

// Negotiation Management
router.post('/conversations/:conversationId/negotiations', createNegotiation);
router.get('/conversations/:conversationId/negotiations', getNegotiation);

// Proposal Management
router.post('/:negotiationId/propose', proposeAmount);
router.post('/:negotiationId/accept', acceptProposal);
router.post('/:negotiationId/decline', declineProposal);
router.post('/:negotiationId/cancel', cancelNegotiation);

// User Negotiations
router.get('/', getUserNegotiations);
router.get('/stats', getNegotiationStats);

// Admin Routes
router.get('/admin/all', getAllNegotiationsAdmin);
router.get('/admin/stats', getNegotiationStatsAdmin);
router.get('/admin/:negotiationId', getNegotiationAdmin);

export default router;
