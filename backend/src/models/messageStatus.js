import mongoose from "mongoose";

const messageStatusSchema = new mongoose.Schema({
  // User reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedUser',
    required: true
  },

  // Conversation reference
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },

  // Last read message
  lastReadMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },

  // Last read timestamp
  lastReadAt: {
    type: Date,
    default: Date.now
  },

  // Unread message count
  unreadCount: {
    type: Number,
    default: 0
  },

  // User's status in this conversation
  status: {
    type: String,
    enum: ['active', 'muted', 'archived', 'blocked'],
    default: 'active'
  },

  // Notification settings for this conversation
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    sound: {
      type: Boolean,
      default: true
    },
    vibrate: {
      type: Boolean,
      default: true
    },
    desktop: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: false
    }
  },

  // User's typing status
  isTyping: {
    type: Boolean,
    default: false
  },

  // Last typing timestamp
  lastTypingAt: {
    type: Date
  },

  // User's online status
  isOnline: {
    type: Boolean,
    default: false
  },

  // Last seen timestamp
  lastSeenAt: {
    type: Date,
    default: Date.now
  },

  // Message delivery preferences
  deliveryPreferences: {
    readReceipts: {
      type: Boolean,
      default: true
    },
    typingIndicators: {
      type: Boolean,
      default: true
    },
    onlineStatus: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
messageStatusSchema.index({ user: 1, conversation: 1 }, { unique: true });
messageStatusSchema.index({ user: 1, status: 1 });
messageStatusSchema.index({ conversation: 1, status: 1 });
messageStatusSchema.index({ lastReadAt: -1 });
messageStatusSchema.index({ unreadCount: -1 });
messageStatusSchema.index({ isOnline: 1, lastSeenAt: -1 });

// Method to update last read
messageStatusSchema.methods.updateLastRead = function(messageId) {
  this.lastReadMessage = messageId;
  this.lastReadAt = new Date();
  this.unreadCount = 0;
  return this.save();
};

// Method to increment unread count
messageStatusSchema.methods.incrementUnread = function() {
  this.unreadCount += 1;
  return this.save();
};

// Method to reset unread count
messageStatusSchema.methods.resetUnread = function() {
  this.unreadCount = 0;
  return this.save();
};

// Method to update typing status
messageStatusSchema.methods.setTyping = function(isTyping) {
  this.isTyping = isTyping;
  this.lastTypingAt = isTyping ? new Date() : undefined;
  return this.save();
};

// Method to update online status
messageStatusSchema.methods.setOnline = function(isOnline) {
  this.isOnline = isOnline;
  this.lastSeenAt = new Date();
  return this.save();
};

// Method to mute conversation
messageStatusSchema.methods.mute = function() {
  this.status = 'muted';
  this.notifications.enabled = false;
  return this.save();
};

// Method to unmute conversation
messageStatusSchema.methods.unmute = function() {
  this.status = 'active';
  this.notifications.enabled = true;
  return this.save();
};

// Method to archive conversation
messageStatusSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

// Method to unarchive conversation
messageStatusSchema.methods.unarchive = function() {
  this.status = 'active';
  return this.save();
};

// Method to block conversation
messageStatusSchema.methods.block = function() {
  this.status = 'blocked';
  this.notifications.enabled = false;
  return this.save();
};

// Method to unblock conversation
messageStatusSchema.methods.unblock = function() {
  this.status = 'active';
  this.notifications.enabled = true;
  return this.save();
};

// Static method to find user's conversation statuses
messageStatusSchema.statics.findUserStatuses = function(userId, status = 'active') {
  return this.find({
    user: userId,
    status: status
  })
  .populate('conversation', 'participants lastMessage')
  .populate('lastReadMessage', 'content createdAt')
  .sort({ lastReadAt: -1 });
};

// Static method to find conversation participants status
messageStatusSchema.statics.findConversationStatuses = function(conversationId) {
  return this.find({
    conversation: conversationId
  })
  .populate('user', 'firstName lastName profileImageUrl role isOnline lastSeenAt')
  .sort({ lastSeenAt: -1 });
};

// Static method to get online users in conversation
messageStatusSchema.statics.getOnlineUsers = function(conversationId) {
  return this.find({
    conversation: conversationId,
    isOnline: true
  })
  .populate('user', 'firstName lastName profileImageUrl role')
  .sort({ lastSeenAt: -1 });
};

// Static method to get typing users in conversation
messageStatusSchema.statics.getTypingUsers = function(conversationId) {
  const fiveSecondsAgo = new Date(Date.now() - 5000);
  
  return this.find({
    conversation: conversationId,
    isTyping: true,
    lastTypingAt: { $gte: fiveSecondsAgo }
  })
  .populate('user', 'firstName lastName profileImageUrl role')
  .sort({ lastTypingAt: -1 });
};

// Static method to update user's online status across all conversations
messageStatusSchema.statics.updateUserOnlineStatus = function(userId, isOnline) {
  return this.updateMany(
    { user: userId },
    { 
      isOnline: isOnline,
      lastSeenAt: new Date()
    }
  );
};

// Static method to get unread counts for user
messageStatusSchema.statics.getUnreadCounts = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalUnread: { $sum: '$unreadCount' },
        conversationsWithUnread: {
          $sum: {
            $cond: [{ $gt: ['$unreadCount', 0] }, 1, 0]
          }
        }
      }
    }
  ]);
};

// Static method to clean up old typing indicators
messageStatusSchema.statics.cleanupTypingIndicators = function() {
  const oneMinuteAgo = new Date(Date.now() - 60000);
  
  return this.updateMany(
    {
      isTyping: true,
      lastTypingAt: { $lt: oneMinuteAgo }
    },
    {
      isTyping: false,
      lastTypingAt: undefined
    }
  );
};

const MessageStatus = mongoose.models.MessageStatus || mongoose.model("MessageStatus", messageStatusSchema);
export default MessageStatus;


