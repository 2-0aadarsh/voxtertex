import express from 'express';
import { authenticateJWT } from '../middleware/jwtAuth.js';
import Conversation from '../models/conversation.js';
import Message from '../models/message.js';
import MessageStatus from '../models/messageStatus.js';
import EnhancedUser from '../models/enhancedUser.js';
import socketService from '../services/socketService.js';

const router = express.Router();

// Apply JWT authentication to all routes
router.use(authenticateJWT);

// Test endpoint to create sample conversation
router.post('/create-sample-conversation', async (req, res) => {
  try {
    const currentUserId = req.user._id;
    
    // Find another user to create conversation with
    const otherUser = await EnhancedUser.findOne({
      _id: { $ne: currentUserId },
      role: { $in: ['speaker', 'organizer'] }
    });

    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'No other users found to create conversation with'
      });
    }

    // Create conversation
    const conversation = new Conversation({
      participants: [
        {
          user: currentUserId,
          role: req.user.role,
          joinedAt: new Date(),
          lastReadAt: new Date(),
          isActive: true
        },
        {
          user: otherUser._id,
          role: otherUser.role,
          joinedAt: new Date(),
          lastReadAt: new Date(),
          isActive: true
        }
      ],
      type: 'direct',
      status: 'active'
    });

    await conversation.save();

    // Create message statuses
    await MessageStatus.create([
      {
        user: currentUserId,
        conversation: conversation._id,
        lastReadAt: new Date(),
        unreadCount: 0
      },
      {
        user: otherUser._id,
        conversation: conversation._id,
        lastReadAt: new Date(),
        unreadCount: 0
      }
    ]);

    await conversation.populate('participants.user', 'firstName lastName email role profileImageUrl');

    res.status(201).json({
      success: true,
      message: 'Sample conversation created successfully',
      conversation: conversation
    });

  } catch (error) {
    console.error('Error creating sample conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Test endpoint to send sample message
router.post('/send-sample-message/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content = 'This is a test message from Postman!' } = req.body;
    const senderId = req.user._id;

    // Check conversation access
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isParticipant(senderId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }

    // Create message
    const message = new Message({
      content,
      messageType: 'text',
      sender: senderId,
      conversation: conversationId
    });

    await message.save();

    // Update conversation's last message
    conversation.lastMessage = {
      content: content,
      sender: senderId,
      timestamp: message.createdAt,
      messageType: 'text'
    };
    await conversation.save();

    // Update unread counts
    const otherParticipants = conversation.getOtherParticipants(senderId);
    for (const participant of otherParticipants) {
      await MessageStatus.findOneAndUpdate(
        { user: participant.user, conversation: conversationId },
        { $inc: { unreadCount: 1 } },
        { upsert: true }
      );
    }

    await message.populate('sender', 'firstName lastName profileImageUrl role');

    res.status(201).json({
      success: true,
      message: 'Sample message sent successfully',
      message: message
    });

  } catch (error) {
    console.error('Error sending sample message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Test endpoint to get all conversations for current user
router.get('/my-conversations', async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const conversations = await Conversation.find({
      'participants.user': currentUserId,
      'participants.isActive': true,
      status: 'active'
    })
    .populate('participants.user', 'firstName lastName email role profileImageUrl')
    .populate('lastMessage.sender', 'firstName lastName profileImageUrl')
    .sort({ 'lastMessage.timestamp': -1 });

    // Get unread counts
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const messageStatus = await MessageStatus.findOne({
          user: currentUserId,
          conversation: conversation._id
        });

        return {
          ...conversation.toObject(),
          unreadCount: messageStatus?.unreadCount || 0,
          lastReadAt: messageStatus?.lastReadAt
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Conversations retrieved successfully',
      conversations: conversationsWithUnread,
      total: conversationsWithUnread.length
    });

  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Test endpoint to get messages from a conversation
router.get('/conversation/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user._id;
    const { limit = 50 } = req.query;

    // Check conversation access
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isParticipant(currentUserId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }

    const messages = await Message.find({
      conversation: conversationId,
      status: { $ne: 'deleted' }
    })
    .populate('sender', 'firstName lastName email role profileImageUrl')
    .populate('metadata.reactions.user', 'firstName lastName profileImageUrl')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      messages: messages.reverse(), // Reverse to show oldest first
      conversationId: conversationId,
      total: messages.length
    });

  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Test endpoint to get online users
router.get('/online-users', async (req, res) => {
  try {
    const onlineUsers = socketService.getConnectedUsers();
    
    const users = await EnhancedUser.find({
      _id: { $in: onlineUsers }
    }).select('firstName lastName email role profileImageUrl');

    res.status(200).json({
      success: true,
      message: 'Online users retrieved successfully',
      onlineUsers: users,
      count: users.length
    });

  } catch (error) {
    console.error('Error getting online users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Test endpoint to get socket connection status
router.get('/socket-status', async (req, res) => {
  try {
    const currentUserId = req.user._id.toString();
    const isOnline = socketService.isUserOnline(currentUserId);
    const connectedUsersCount = socketService.getConnectedUsersCount();

    res.status(200).json({
      success: true,
      message: 'Socket status retrieved successfully',
      status: {
        isOnline: isOnline,
        userId: currentUserId,
        connectedUsersCount: connectedUsersCount,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Error getting socket status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Test endpoint to get all users (for testing)
router.get('/all-users', async (req, res) => {
  try {
    const users = await EnhancedUser.find({
      role: { $in: ['speaker', 'organizer'] }
    }).select('firstName lastName email role profileImageUrl');

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      users: users,
      total: users.length
    });

  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Test endpoint to simulate typing
router.post('/simulate-typing/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { isTyping = true } = req.body;
    const userId = req.user._id;

    // Update typing status
    await MessageStatus.findOneAndUpdate(
      { user: userId, conversation: conversationId },
      { 
        isTyping: isTyping,
        lastTypingAt: isTyping ? new Date() : undefined
      },
      { upsert: true }
    );

    res.status(200).json({
      success: true,
      message: `Typing status updated to ${isTyping}`,
      conversationId: conversationId,
      userId: userId,
      isTyping: isTyping
    });

  } catch (error) {
    console.error('Error simulating typing:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Test endpoint to get conversation statistics
router.get('/conversation/:conversationId/stats', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user._id;

    // Check conversation access
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isParticipant(currentUserId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }

    // Get message statistics
    const stats = await Message.getMessageStats(conversationId);

    // Get participant statuses
    const participants = await MessageStatus.findConversationStatuses(conversationId);

    res.status(200).json({
      success: true,
      message: 'Conversation statistics retrieved successfully',
      conversationId: conversationId,
      statistics: stats,
      participants: participants
    });

  } catch (error) {
    console.error('Error getting conversation statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Test endpoint to clean up test data
router.delete('/cleanup-test-data', async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Delete user's conversations
    await Conversation.deleteMany({
      'participants.user': currentUserId
    });

    // Delete user's message statuses
    await MessageStatus.deleteMany({
      user: currentUserId
    });

    res.status(200).json({
      success: true,
      message: 'Test data cleaned up successfully',
      userId: currentUserId
    });

  } catch (error) {
    console.error('Error cleaning up test data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

export default router;



