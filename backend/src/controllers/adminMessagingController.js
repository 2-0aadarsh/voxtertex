import Conversation from '../models/conversation.js';
import Message from '../models/message.js';
import MessageStatus from '../models/messageStatus.js';
import EnhancedUser from '../models/enhancedUser.js';
import socketService from '../services/socketService.js';

// Get all conversations (admin view)
export const getAllConversations = async (req, res) => {
  try {
    const { limit = 50, skip = 0, status = 'active', type, startDate, endDate } = req.query;

    let filter = { status: status };
    
    if (type) {
      filter.type = type;
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const conversations = await Conversation.find(filter)
      .populate('participants.user', 'firstName lastName email role profileImageUrl')
      .populate('lastMessage.sender', 'firstName lastName profileImageUrl')
      .sort({ 'lastMessage.timestamp': -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    // Get message counts for each conversation
    const conversationsWithStats = await Promise.all(
      conversations.map(async (conversation) => {
        const messageCount = await Message.countDocuments({
          conversation: conversation._id,
          status: { $ne: 'deleted' }
        });

        const flaggedMessageCount = await Message.countDocuments({
          conversation: conversation._id,
          'adminAccess.isFlagged': true
        });

        return {
          ...conversation.toObject(),
          messageCount,
          flaggedMessageCount
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'All conversations retrieved successfully',
      conversations: conversationsWithStats,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        total: conversationsWithStats.length
      }
    });

  } catch (error) {
    console.error('Error getting all conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get specific conversation (admin view)
export const getConversationAdmin = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId)
      .populate('participants.user', 'firstName lastName email role profileImageUrl')
      .populate('lastMessage.sender', 'firstName lastName profileImageUrl')
      .populate('adminAccess.adminNotes.adminId', 'firstName lastName email');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Get all messages in this conversation
    const messages = await Message.find({
      conversation: conversationId,
      status: { $ne: 'deleted' }
    })
    .populate('sender', 'firstName lastName email role profileImageUrl')
    .populate('metadata.reactions.user', 'firstName lastName profileImageUrl')
    .populate('adminAccess.flaggedBy', 'firstName lastName email')
    .populate('adminAccess.adminNotes.adminId', 'firstName lastName email')
    .sort({ createdAt: 1 });

    // Get conversation statistics
    const stats = await Message.getMessageStats(conversationId);

    res.status(200).json({
      success: true,
      message: 'Conversation retrieved successfully',
      conversation: conversation,
      messages: messages,
      statistics: stats
    });

  } catch (error) {
    console.error('Error getting conversation (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get flagged messages
export const getFlaggedMessages = async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;

    const flaggedMessages = await Message.findFlaggedMessages(
      parseInt(limit),
      parseInt(skip)
    );

    res.status(200).json({
      success: true,
      message: 'Flagged messages retrieved successfully',
      messages: flaggedMessages,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        total: flaggedMessages.length
      }
    });

  } catch (error) {
    console.error('Error getting flagged messages:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Flag a message
export const flagMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reason } = req.body;
    const adminId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.flagMessage(adminId, reason);

    res.status(200).json({
      success: true,
      message: 'Message flagged successfully'
    });

  } catch (error) {
    console.error('Error flagging message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Unflag a message
export const unflagMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.unflagMessage();

    res.status(200).json({
      success: true,
      message: 'Message unflagged successfully'
    });

  } catch (error) {
    console.error('Error unflagging message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Add admin note to message
export const addMessageAdminNote = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { note } = req.body;
    const adminId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.addAdminNote(adminId, note);

    res.status(200).json({
      success: true,
      message: 'Admin note added successfully'
    });

  } catch (error) {
    console.error('Error adding admin note:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Add admin note to conversation
export const addConversationAdminNote = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { note } = req.body;
    const adminId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    conversation.adminAccess.adminNotes.push({
      adminId: adminId,
      note: note,
      createdAt: new Date()
    });

    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Admin note added to conversation successfully'
    });

  } catch (error) {
    console.error('Error adding conversation admin note:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Send admin message to conversation
export const sendAdminMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, messageType = 'system' } = req.body;
    const adminId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Create admin message
    const message = new Message({
      content: content,
      messageType: messageType,
      sender: adminId,
      conversation: conversationId,
      'metadata.systemAction': 'admin_notification'
    });

    await message.save();

    // Update conversation's last message
    conversation.lastMessage = {
      content: content,
      sender: adminId,
      timestamp: message.createdAt,
      messageType: messageType
    };
    await conversation.save();

    // Populate message data
    await message.populate('sender', 'firstName lastName profileImageUrl role');

    // Broadcast admin message
    socketService.broadcastAdminMessage(conversationId, message);

    res.status(201).json({
      success: true,
      message: 'Admin message sent successfully',
      message: message
    });

  } catch (error) {
    console.error('Error sending admin message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Block/Unblock conversation
export const toggleConversationBlock = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { blocked, reason } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    conversation.status = blocked ? 'blocked' : 'active';
    await conversation.save();

    // Update all participants' message status
    await MessageStatus.updateMany(
      { conversation: conversationId },
      { status: blocked ? 'blocked' : 'active' }
    );

    // Broadcast system message
    const systemMessage = blocked 
      ? `This conversation has been blocked by admin. Reason: ${reason || 'Policy violation'}`
      : 'This conversation has been unblocked by admin';

    socketService.broadcastSystemMessage(conversationId, systemMessage);

    res.status(200).json({
      success: true,
      message: `Conversation ${blocked ? 'blocked' : 'unblocked'} successfully`
    });

  } catch (error) {
    console.error('Error toggling conversation block:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get messaging statistics
export const getMessagingStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get conversation statistics
    const conversationStats = await Conversation.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          blockedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'blocked'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get message statistics
    const messageStats = await Message.aggregate([
      { $match: { ...dateFilter, status: { $ne: 'deleted' } } },
      {
        $group: {
          _id: '$messageType',
          count: { $sum: 1 },
          flaggedCount: {
            $sum: { $cond: ['$adminAccess.isFlagged', 1, 0] }
          }
        }
      }
    ]);

    // Get user engagement statistics
    const userStats = await Message.aggregate([
      { $match: { ...dateFilter, status: { $ne: 'deleted' } } },
      {
        $group: {
          _id: '$sender',
          messageCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'enhancedusers',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $group: {
          _id: { $arrayElemAt: ['$user.role', 0] },
          userCount: { $sum: 1 },
          totalMessages: { $sum: '$messageCount' },
          avgMessagesPerUser: { $avg: '$messageCount' }
        }
      }
    ]);

    // Get online users count
    const onlineUsersCount = await MessageStatus.countDocuments({
      isOnline: true
    });

    res.status(200).json({
      success: true,
      message: 'Messaging statistics retrieved successfully',
      statistics: {
        conversations: conversationStats,
        messages: messageStats,
        users: userStats,
        onlineUsers: onlineUsersCount,
        period: {
          startDate: startDate || null,
          endDate: endDate || null
        }
      }
    });

  } catch (error) {
    console.error('Error getting messaging statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Search conversations (admin)
export const searchConversationsAdmin = async (req, res) => {
  try {
    const { query, limit = 50, skip = 0 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Search in conversation participants
    const conversations = await Conversation.find({
      $or: [
        { 'participants.user': { $in: await EnhancedUser.find({ 
          $or: [
            { firstName: { $regex: query, $options: 'i' } },
            { lastName: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        }).distinct('_id') }},
        { 'context.topic': { $regex: query, $options: 'i' } }
      ]
    })
    .populate('participants.user', 'firstName lastName email role profileImageUrl')
    .populate('lastMessage.sender', 'firstName lastName profileImageUrl')
    .sort({ 'lastMessage.timestamp': -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip));

    res.status(200).json({
      success: true,
      message: 'Search results retrieved successfully',
      conversations: conversations,
      query: query,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        total: conversations.length
      }
    });

  } catch (error) {
    console.error('Error searching conversations (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete conversation (admin)
export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { reason } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Soft delete conversation
    conversation.status = 'deleted';
    await conversation.save();

    // Mark all messages as deleted
    await Message.updateMany(
      { conversation: conversationId },
      { status: 'deleted' }
    );

    // Update all participants' message status
    await MessageStatus.updateMany(
      { conversation: conversationId },
      { status: 'deleted' }
    );

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};



