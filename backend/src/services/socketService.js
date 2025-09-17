import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import EnhancedUser from '../models/enhancedUser.js';
import Conversation from '../models/conversation.js';
import Message from '../models/message.js';
import MessageStatus from '../models/messageStatus.js';

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userId
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    console.log('🚀 Socket.IO service initialized');
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await EnhancedUser.findById(decoded.userId).select('-password');
        
        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }

        if (user.accountStatus !== 'active') {
          return next(new Error('Authentication error: Account not active'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        console.error('Socket authentication error:', error.message);
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`👤 User ${socket.userId} connected with socket ${socket.id}`);
      
      this.handleConnection(socket);
      this.setupMessageHandlers(socket);
      this.setupTypingHandlers(socket);
      this.setupStatusHandlers(socket);
      this.setupDisconnection(socket);
    });
  }

  handleConnection(socket) {
    const userId = socket.userId;
    
    // Store user connection
    this.connectedUsers.set(userId, socket.id);
    this.userSockets.set(socket.id, userId);
    
    // Update user's online status
    this.updateUserOnlineStatus(userId, true);
    
    // Join user to their conversation rooms
    this.joinUserConversations(socket, userId);
    
    // Notify other users that this user is online
    this.broadcastUserStatus(userId, 'online');
    
    // Send connection confirmation
    socket.emit('connected', {
      message: 'Successfully connected to messaging service',
      userId: userId,
      timestamp: new Date()
    });
  }

  async joinUserConversations(socket, userId) {
    try {
      const conversations = await Conversation.find({
        'participants.user': userId,
        'participants.isActive': true,
        status: 'active'
      });

      conversations.forEach(conversation => {
        socket.join(`conversation_${conversation._id}`);
      });

      console.log(`📱 User ${userId} joined ${conversations.length} conversations`);
    } catch (error) {
      console.error('Error joining user conversations:', error);
    }
  }

  setupMessageHandlers(socket) {
    // Send message
    socket.on('send_message', async (data) => {
      try {
        await this.handleSendMessage(socket, data);
      } catch (error) {
        socket.emit('message_error', {
          error: error.message,
          timestamp: new Date()
        });
      }
    });

    // Mark message as read
    socket.on('mark_read', async (data) => {
      try {
        await this.handleMarkAsRead(socket, data);
      } catch (error) {
        socket.emit('read_error', {
          error: error.message,
          timestamp: new Date()
        });
      }
    });

    // React to message
    socket.on('react_to_message', async (data) => {
      try {
        await this.handleMessageReaction(socket, data);
      } catch (error) {
        socket.emit('reaction_error', {
          error: error.message,
          timestamp: new Date()
        });
      }
    });

    // Edit message
    socket.on('edit_message', async (data) => {
      try {
        await this.handleEditMessage(socket, data);
      } catch (error) {
        socket.emit('edit_error', {
          error: error.message,
          timestamp: new Date()
        });
      }
    });

    // Delete message
    socket.on('delete_message', async (data) => {
      try {
        await this.handleDeleteMessage(socket, data);
      } catch (error) {
        socket.emit('delete_error', {
          error: error.message,
          timestamp: new Date()
        });
      }
    });
  }

  setupTypingHandlers(socket) {
    socket.on('typing_start', async (data) => {
      try {
        await this.handleTypingStart(socket, data);
      } catch (error) {
        console.error('Typing start error:', error);
      }
    });

    socket.on('typing_stop', async (data) => {
      try {
        await this.handleTypingStop(socket, data);
      } catch (error) {
        console.error('Typing stop error:', error);
      }
    });
  }

  setupStatusHandlers(socket) {
    socket.on('update_status', async (data) => {
      try {
        await this.handleStatusUpdate(socket, data);
      } catch (error) {
        socket.emit('status_error', {
          error: error.message,
          timestamp: new Date()
        });
      }
    });
  }

  setupDisconnection(socket) {
    socket.on('disconnect', async () => {
      try {
        const userId = socket.userId;
        console.log(`👋 User ${userId} disconnected`);
        
        // Remove user connection
        this.connectedUsers.delete(userId);
        this.userSockets.delete(socket.id);
        
        // Update user's online status
        await this.updateUserOnlineStatus(userId, false);
        
        // Notify other users that this user is offline
        this.broadcastUserStatus(userId, 'offline');
        
        // Stop typing indicators
        await this.stopAllTypingIndicators(userId);
        
      } catch (error) {
        console.error('Disconnection error:', error);
      }
    });
  }

  async handleSendMessage(socket, data) {
    const { conversationId, content, messageType = 'text', replyTo, attachments } = data;
    const senderId = socket.userId;

    // Validate conversation access
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isParticipant(senderId)) {
      throw new Error('Conversation not found or access denied');
    }

    // Create message
    const message = new Message({
      content,
      messageType,
      sender: senderId,
      conversation: conversationId,
      'metadata.replyTo': replyTo,
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
    await this.updateUnreadCounts(conversationId, senderId);

    // Populate message data
    await message.populate([
      { path: 'sender', select: 'firstName lastName profileImageUrl role' },
      { path: 'metadata.replyTo', select: 'content sender' }
    ]);

    // Broadcast message to conversation
    this.io.to(`conversation_${conversationId}`).emit('new_message', {
      message: message,
      conversationId: conversationId,
      timestamp: new Date()
    });

    // Send delivery confirmation to sender
    socket.emit('message_sent', {
      messageId: message._id,
      timestamp: new Date()
    });

    console.log(`💬 Message sent in conversation ${conversationId} by user ${senderId}`);
  }

  async handleMarkAsRead(socket, data) {
    const { conversationId, messageId } = data;
    const userId = socket.userId;

    // Update message read status
    if (messageId) {
      const message = await Message.findById(messageId);
      if (message) {
        await message.markAsRead(userId);
      }
    }

    // Update conversation last read
    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
      await conversation.updateLastRead(userId);
    }

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

    // Broadcast read status to other participants
    this.io.to(`conversation_${conversationId}`).emit('message_read', {
      conversationId: conversationId,
      messageId: messageId,
      readBy: userId,
      timestamp: new Date()
    });
  }

  async handleMessageReaction(socket, data) {
    const { messageId, emoji } = data;
    const userId = socket.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    // Check if user has access to this message
    const conversation = await Conversation.findById(message.conversation);
    if (!conversation || !conversation.isParticipant(userId)) {
      throw new Error('Access denied');
    }

    await message.addReaction(userId, emoji);

    // Broadcast reaction to conversation
    this.io.to(`conversation_${message.conversation}`).emit('message_reaction', {
      messageId: messageId,
      emoji: emoji,
      userId: userId,
      timestamp: new Date()
    });
  }

  async handleEditMessage(socket, data) {
    const { messageId, newContent } = data;
    const userId = socket.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    // Check if user is the sender
    if (message.sender.toString() !== userId) {
      throw new Error('Only message sender can edit');
    }

    await message.editMessage(newContent);

    // Broadcast edit to conversation
    this.io.to(`conversation_${message.conversation}`).emit('message_edited', {
      messageId: messageId,
      newContent: newContent,
      editedAt: message.metadata.editedAt,
      timestamp: new Date()
    });
  }

  async handleDeleteMessage(socket, data) {
    const { messageId } = data;
    const userId = socket.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    // Check if user is the sender
    if (message.sender.toString() !== userId) {
      throw new Error('Only message sender can delete');
    }

    message.status = 'deleted';
    await message.save();

    // Broadcast deletion to conversation
    this.io.to(`conversation_${message.conversation}`).emit('message_deleted', {
      messageId: messageId,
      deletedBy: userId,
      timestamp: new Date()
    });
  }

  async handleTypingStart(socket, data) {
    const { conversationId } = data;
    const userId = socket.userId;

    // Update typing status
    await MessageStatus.findOneAndUpdate(
      { user: userId, conversation: conversationId },
      { 
        isTyping: true,
        lastTypingAt: new Date()
      },
      { upsert: true }
    );

    // Broadcast typing indicator to other participants
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      conversationId: conversationId,
      userId: userId,
      isTyping: true,
      timestamp: new Date()
    });
  }

  async handleTypingStop(socket, data) {
    const { conversationId } = data;
    const userId = socket.userId;

    // Update typing status
    await MessageStatus.findOneAndUpdate(
      { user: userId, conversation: conversationId },
      { 
        isTyping: false,
        lastTypingAt: undefined
      }
    );

    // Broadcast typing stop to other participants
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      conversationId: conversationId,
      userId: userId,
      isTyping: false,
      timestamp: new Date()
    });
  }

  async handleStatusUpdate(socket, data) {
    const { conversationId, status } = data;
    const userId = socket.userId;

    const messageStatus = await MessageStatus.findOneAndUpdate(
      { user: userId, conversation: conversationId },
      { status: status },
      { upsert: true }
    );

    // Broadcast status update to conversation
    this.io.to(`conversation_${conversationId}`).emit('user_status_updated', {
      conversationId: conversationId,
      userId: userId,
      status: status,
      timestamp: new Date()
    });
  }

  async updateUserOnlineStatus(userId, isOnline) {
    try {
      await MessageStatus.updateUserOnlineStatus(userId, isOnline);
    } catch (error) {
      console.error('Error updating user online status:', error);
    }
  }

  async updateUnreadCounts(conversationId, senderId) {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      const otherParticipants = conversation.getOtherParticipants(senderId);
      
      for (const participant of otherParticipants) {
        await MessageStatus.findOneAndUpdate(
          { user: participant.user, conversation: conversationId },
          { $inc: { unreadCount: 1 } },
          { upsert: true }
        );
      }
    } catch (error) {
      console.error('Error updating unread counts:', error);
    }
  }

  async stopAllTypingIndicators(userId) {
    try {
      await MessageStatus.updateMany(
        { user: userId, isTyping: true },
        { 
          isTyping: false,
          lastTypingAt: undefined
        }
      );
    } catch (error) {
      console.error('Error stopping typing indicators:', error);
    }
  }

  broadcastUserStatus(userId, status) {
    // Get user's conversations and broadcast status
    this.io.emit('user_status_changed', {
      userId: userId,
      status: status,
      timestamp: new Date()
    });
  }

  // Admin methods
  async broadcastAdminMessage(conversationId, message) {
    this.io.to(`conversation_${conversationId}`).emit('admin_message', {
      message: message,
      timestamp: new Date()
    });
  }

  async broadcastSystemMessage(conversationId, systemMessage) {
    this.io.to(`conversation_${conversationId}`).emit('system_message', {
      message: systemMessage,
      timestamp: new Date()
    });
  }

  // Utility methods
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  getUserSocket(userId) {
    const socketId = this.connectedUsers.get(userId);
    return socketId ? this.io.sockets.sockets.get(socketId) : null;
  }

  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }
}

export default new SocketService();


