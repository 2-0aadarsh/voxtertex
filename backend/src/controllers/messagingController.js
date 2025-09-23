import Conversation from '../models/conversation.js';
import Message from '../models/message.js';
import MessageStatus from '../models/messageStatus.js';
import EnhancedUser from '../models/enhancedUser.js';
import socketService from '../services/socketService.js';
import Event from '../models/event.js';


// Create or get conversation between users
export const createOrGetConversation = async (req, res) => {
  try {
    const { participantId, type = 'direct', context } = req.body;
    const currentUserId = req.user._id;

    // Validate participant
    const participant = await EnhancedUser.findById(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

      // If eventId is provided, fetch event topic
    let conversationContext = context || {};
    if (context?.eventId) {
      const event = await Event.findById(context.eventId);
      if (event) {
        conversationContext.topic = event.name; // Use the event name as topic
      }
    }
    // Check if conversation already exists
    let conversation = await Conversation.findBetweenUsers(currentUserId, participantId, type);

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [
          {
            user: currentUserId,
            role: req.user.role,
            joinedAt: new Date(),
            lastReadAt: new Date(),
            isActive: true
          },
          {
            user: participantId,
            role: participant.role,
            joinedAt: new Date(),
            lastReadAt: new Date(),
            isActive: true
          }
        ],
        type: type,
        context: conversationContext,
        status: 'active'
      });

      await conversation.save();
      

      // Create message statuses for both participants
      await MessageStatus.create([
        {
          user: currentUserId,
          conversation: conversation._id,
          lastReadAt: new Date(),
          unreadCount: 0
        },
        {
          user: participantId,
          conversation: conversation._id,
          lastReadAt: new Date(),
          unreadCount: 0
        }
      ]);

      // Broadcast conversation creation
      socketService.io.emit('conversation_created', {
        conversation: conversation,
        participants: [currentUserId, participantId],
        eventId: context?.eventId || null
      });
    }

    // Populate conversation data
    await conversation.populate([
      { path: 'participants.user', select: 'firstName lastName profileImageUrl role' },
      { path: 'lastMessage.sender', select: 'firstName lastName profileImageUrl' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Conversation retrieved successfully',
      conversation: {
    _id: conversation._id,
    type: conversation.type,
    status: conversation.status,
    participants: conversation.participants.map(p => ({
      _id: p.user._id,
      name: `${p.user.firstName} ${p.user.lastName}`,
      role: p.role,
      profileImageUrl: p.user.profileImageUrl
    })),
    context: conversation.context,   
    lastMessage: conversation.lastMessage
  }
    });

  } catch (error) {
    console.error('Error creating/getting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's conversations
export const getUserConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { limit = 20, skip = 0 } = req.query;

    const conversations = await Conversation.findUserConversations(
      currentUserId,
      parseInt(limit),
      parseInt(skip)
    );

    // Get unread counts for each conversation
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
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        total: conversationsWithUnread.length
      }
    });

  } catch (error) {
    console.error('Error getting user conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get particular conversation messages
export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user._id;
    const { limit = 50, skip = 0 } = req.query;

    // Check if user has access to this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isParticipant(currentUserId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }
    await Message.populate(messages, { path: 'sender', select: 'firstName lastName profileImageUrl role' });

    await conversation.populate('participants.user', 'firstName lastName profileImageUrl role');

    const messages = await Message.findInConversation(
      conversationId,
      parseInt(limit),
      parseInt(skip)
    );

    res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      messages: messages,
      conversationId: conversationId,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        total: messages.length
      }
    });

  } catch (error) {
    console.error('Error getting conversation messages:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      participants: conversation.participants.map(p => ({
         _id: p.user._id,
         name: `${p.user.firstName} ${p.user.lastName}`,
         role: p.role
        })),
        eventId: conversation.context?.eventId || null,
      error: error.message
    });
  }
};

// Send message to a user(speaker/orgainzer)
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, messageType = 'text', replyTo, attachments } = req.body;
    const senderId = req.user._id;

    // Validate conversation access
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
      messageType,
      sender: senderId,
      conversation: conversationId,
      metadata: {
      eventId: conversation.context?.eventId, // ✅ take from conversation
    replyTo: replyTo
  },
      attachments: attachments || []
    });

    await message.save();

    // Update conversation's last message
    conversation.lastMessage = {
      content: content,
      sender: senderId,
      timestamp: message.createdAt,
      messageType: messageType
    };
    await conversation.save();

    // Update unread counts for other participants
    const otherParticipants = conversation.getOtherParticipants(senderId);
    for (const participant of otherParticipants) {
      await MessageStatus.findOneAndUpdate(
        { user: participant.user, conversation: conversationId },
        { $inc: { unreadCount: 1 } },
        { upsert: true }
      );
    }

    // Populate message data
    await message.populate([
      { path: 'sender', select: 'firstName lastName profileImageUrl role' },
      { path: 'metadata.replyTo', select: 'content sender' }])

    await conversation.populate('participants.user', 'firstName lastName profileImageUrl role');
    
// After saving message
await message.populate([
  { path: 'sender', select: 'firstName lastName profileImageUrl role' },
  { path: 'metadata.replyTo', select: 'content sender' }
]);

res.status(201).json({
  success: true,
  message: {
    _id: message._id,
    content: message.content,
    messageType: message.messageType,
    sender: message.sender,                   // ✅ Populated sender
    conversation: message.conversation,
    status: message.status,
    attachments: message.attachments,
    metadata: {
      ...message.metadata,
      eventId: message.metadata?.eventId     // ✅ Include eventId
    },
    adminAccess: message.adminAccess,
    isEncrypted: message.isEncrypted,
    priority: message.priority,
    readBy: message.readBy,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt
  }
});

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      participants: conversation.participants.map(p => ({
         _id: p.user._id,
         name: `${p.user.firstName} ${p.user.lastName}`,
         role: p.role
        })),
        eventId: conversation.context?.eventId || null,
        error: error.message
      });
  }
};



// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { messageId } = req.body;
    const userId = req.user._id;

    // Check conversation access
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }

    // Update message read status
    if (messageId) {
      const message = await Message.findById(messageId);
      if (message) {
        await message.markAsRead(userId);
      }
    }

    // Update conversation last read
    await conversation.updateLastRead(userId);

    // Update message status
    await MessageStatus.findOneAndUpdate(
      { user: userId, conversation: conversationId },
      { 
        lastReadMessage: messageId,
        lastReadAt: new Date(),
        unreadCount: 0
      },
      { upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read successfully'
    });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// React to message
export const reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user has access to this message
    const conversation = await Conversation.findById(message.conversation);
    if (!conversation || !conversation.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this message'
      });
    }

    await message.addReaction(userId, emoji);

    res.status(200).json({
      success: true,
      message: 'Reaction added successfully',
      reactions: message.metadata.reactions
    });

  } catch (error) {
    console.error('Error reacting to message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Edit message
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { newContent } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only message sender can edit'
      });
    }

    await message.editMessage(newContent);

    res.status(200).json({
      success: true,
      message: 'Message edited successfully',
      message: message
    });

  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only message sender can delete'
      });
    }

    message.status = 'deleted';
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get conversation participants
export const getConversationParticipants = async (req, res) => {
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

    // Get participants with their online status
    const participants = await MessageStatus.findConversationStatuses(conversationId);

    res.status(200).json({
      success: true,
      message: 'Participants retrieved successfully',
      participants: participants
    });

  } catch (error) {
    console.error('Error getting conversation participants:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update conversation settings
export const updateConversationSettings = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { settings } = req.body;
    const currentUserId = req.user._id;

    // Check conversation access
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isParticipant(currentUserId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }

    // Update settings
    conversation.settings = { ...conversation.settings, ...settings };
    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Conversation settings updated successfully',
      settings: conversation.settings
    });

  } catch (error) {
    console.error('Error updating conversation settings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Archive conversation
export const archiveConversation = async (req, res) => {
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

    // Update user's message status
    await MessageStatus.findOneAndUpdate(
      { user: currentUserId, conversation: conversationId },
      { status: 'archived' }
    );

    res.status(200).json({
      success: true,
      message: 'Conversation archived successfully'
    });

  } catch (error) {
    console.error('Error archiving conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const unreadData = await MessageStatus.getUnreadCounts(currentUserId);

    res.status(200).json({
      success: true,
      message: 'Unread count retrieved successfully',
      unreadData: unreadData[0] || { totalUnread: 0, conversationsWithUnread: 0 }
    });

  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Search messages
export const searchMessages = async (req, res) => {
  try {
    const { query, conversationId, limit = 20, skip = 0 } = req.query;
    const currentUserId = req.user._id;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    let searchFilter = {
      content: { $regex: query, $options: 'i' },
      status: { $ne: 'deleted' }
    };

    if (conversationId) {
      // Check conversation access
      const conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.isParticipant(currentUserId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this conversation'
        });
      }
      searchFilter.conversation = conversationId;
    } else {
      // Search across all user's conversations
      const userConversations = await Conversation.find({
        'participants.user': currentUserId,
        'participants.isActive': true,
        status: 'active'
      });
      
      searchFilter.conversation = { $in: userConversations.map(c => c._id) };
    }

    const messages = await Message.find(searchFilter)
      .populate('sender', 'firstName lastName profileImageUrl role')
      .populate('conversation', 'participants')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.status(200).json({
      success: true,
      message: 'Search results retrieved successfully',
      messages: messages,
      query: query,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        total: messages.length
      }
    });

  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
