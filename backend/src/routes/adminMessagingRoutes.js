import express from 'express';
import { authenticateJWT } from '../middleware/jwtAuth.js';
import { 
  getAllConversations,
  getConversationAdmin,
  getFlaggedMessages,
  flagMessage,
  unflagMessage,
  addMessageAdminNote,
  addConversationAdminNote,
  sendAdminMessage,
  toggleConversationBlock,
  getMessagingStats,
  searchConversationsAdmin,
  deleteConversation
} from '../controllers/adminMessagingController.js';

const router = express.Router();

// Apply JWT authentication to all routes
router.use(authenticateJWT);

// Admin-only middleware (you can create this middleware to check if user is admin)
// router.use(requireAdmin);

// Admin Conversation Management
router.get('/conversations', getAllConversations);
router.get('/conversations/:conversationId', getConversationAdmin);
router.delete('/conversations/:conversationId', deleteConversation);
router.put('/conversations/:conversationId/block', toggleConversationBlock);

// Admin Message Management
router.get('/messages/flagged', getFlaggedMessages);
router.post('/messages/:messageId/flag', flagMessage);
router.delete('/messages/:messageId/flag', unflagMessage);
router.post('/messages/:messageId/notes', addMessageAdminNote);

// Admin Actions
router.post('/conversations/:conversationId/notes', addConversationAdminNote);
router.post('/conversations/:conversationId/admin-message', sendAdminMessage);

// Admin Analytics
router.get('/statistics', getMessagingStats);
router.get('/search', searchConversationsAdmin);

export default router;



