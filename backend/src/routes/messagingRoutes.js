import express from 'express';
import { authenticateJWT } from '../middleware/jwtAuth.js';
import { 
  createOrGetConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  reactToMessage,
  editMessage,
  deleteMessage,
  getConversationParticipants,
  updateConversationSettings,
  archiveConversation,
  getUnreadCount,
  searchMessages
} from '../controllers/messagingController.js';

const router = express.Router();

// Apply JWT authentication to all routes
router.use(authenticateJWT);

// Conversation Management
router.post('/conversations', createOrGetConversation);
router.get('/conversations', getUserConversations);
router.get('/conversations/:conversationId/participants', getConversationParticipants);
router.put('/conversations/:conversationId/settings', updateConversationSettings);
router.put('/conversations/:conversationId/archive', archiveConversation);

// Message Management
router.get('/conversations/:conversationId/messages', getConversationMessages);
router.post('/conversations/:conversationId/messages', sendMessage);
router.put('/conversations/:conversationId/read', markMessagesAsRead);

// Message Actions
router.post('/messages/:messageId/react', reactToMessage);
router.put('/messages/:messageId/edit', editMessage);
router.delete('/messages/:messageId', deleteMessage);

// User Status & Search
router.get('/unread-count', getUnreadCount);
router.get('/search', searchMessages);

export default router;