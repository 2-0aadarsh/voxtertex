import EnhancedUser from '../models/enhancedUser.js';

// Middleware to check if user is speaker or organizer
export const requireSpeakerOrOrganizer = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await EnhancedUser.findById(userId).select('role accountStatus');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.accountStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active'
      });
    }

    if (!['speaker', 'organizer'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only speakers and organizers can access messaging'
      });
    }

    next();
  } catch (error) {
    console.error('Error in requireSpeakerOrOrganizer middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Middleware to check if user is admin
export const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await EnhancedUser.findById(userId).select('role accountStatus');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.accountStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // For now, we'll consider organizers as admins for messaging oversight
    // You can modify this logic based on your admin system
    if (!['organizer'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required'
      });
    }

    next();
  } catch (error) {
    console.error('Error in requireAdmin middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Middleware to check if user can access specific conversation
export const requireConversationAccess = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const Conversation = (await import('../models/conversation.js')).default;
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (!conversation.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }

    req.conversation = conversation;
    next();
  } catch (error) {
    console.error('Error in requireConversationAccess middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Middleware to validate message content
export const validateMessageContent = (req, res, next) => {
  try {
    const { content, messageType = 'text' } = req.body;

    if (messageType === 'text' && (!content || content.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required for text messages'
      });
    }

    if (content && content.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Message content cannot exceed 2000 characters'
      });
    }

    const allowedMessageTypes = ['text', 'image', 'file', 'system', 'event_invite', 'booking_request'];
    if (!allowedMessageTypes.includes(messageType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message type'
      });
    }

    next();
  } catch (error) {
    console.error('Error in validateMessageContent middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Middleware to check rate limiting for messaging
export const messageRateLimit = (() => {
  const userMessageCounts = new Map();
  const RATE_LIMIT_WINDOW = 60000; // 1 minute
  const MAX_MESSAGES_PER_WINDOW = 30; // 30 messages per minute

  return async (req, res, next) => {
    try {
      const userId = req.user._id.toString();
      const now = Date.now();

      // Clean up old entries
      for (const [key, data] of userMessageCounts.entries()) {
        if (now - data.firstMessage > RATE_LIMIT_WINDOW) {
          userMessageCounts.delete(key);
        }
      }

      // Check current user's message count
      const userData = userMessageCounts.get(userId);
      
      if (!userData) {
        userMessageCounts.set(userId, {
          count: 1,
          firstMessage: now
        });
        return next();
      }

      if (now - userData.firstMessage > RATE_LIMIT_WINDOW) {
        // Reset window
        userMessageCounts.set(userId, {
          count: 1,
          firstMessage: now
        });
        return next();
      }

      if (userData.count >= MAX_MESSAGES_PER_WINDOW) {
        return res.status(429).json({
          success: false,
          message: 'Rate limit exceeded. Please slow down your messaging.',
          retryAfter: Math.ceil((RATE_LIMIT_WINDOW - (now - userData.firstMessage)) / 1000)
        });
      }

      userData.count++;
      next();
    } catch (error) {
      console.error('Error in messageRateLimit middleware:', error);
      next(); // Continue on error to avoid blocking legitimate requests
    }
  };
})();



