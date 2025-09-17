import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  // Message content
  content: {
    type: String,
    required: function() {
      return this.messageType === 'text' || this.messageType === 'system';
    },
    trim: true,
    maxlength: [2000, 'Message content cannot exceed 2000 characters']
  },

  // Message type
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system', 'event_invite', 'booking_request'],
    default: 'text'
  },

  // Sender information
  sender: {
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

  // Message status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed', 'deleted'],
    default: 'sent'
  },

  // File attachments (for image/file messages)
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    cloudinaryPublicId: String,
    thumbnailUrl: String // For images
  }],

  // Message metadata
  metadata: {
    // For system messages
    systemAction: {
      type: String,
      enum: ['user_joined', 'user_left', 'conversation_created', 'conversation_archived', 'admin_notification']
    },
    
    // For event/booking related messages
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    
    // Reply to another message
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    
    // Message reactions
    reactions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EnhancedUser'
      },
      emoji: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    
    // Message edits
    editedAt: Date,
    editHistory: [{
      content: String,
      editedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },

  // Read receipts
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EnhancedUser'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Admin oversight
  adminAccess: {
    isFlagged: {
      type: Boolean,
      default: false
    },
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EnhancedUser'
    },
    flaggedAt: Date,
    flagReason: String,
    adminNotes: [{
      adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EnhancedUser'
      },
      note: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },

  // Message encryption (for sensitive conversations)
  isEncrypted: {
    type: Boolean,
    default: false
  },

  // Message expiration (for temporary messages)
  expiresAt: {
    type: Date
  },

  // Message priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  }
}, {
  timestamps: true
});

// Indexes for better performance
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ status: 1 });
messageSchema.index({ messageType: 1 });
messageSchema.index({ 'metadata.eventId': 1 });
messageSchema.index({ 'metadata.bookingId': 1 });
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for expired messages
messageSchema.index({ 'adminAccess.isFlagged': 1 });

// Compound index for conversation messages
messageSchema.index({ 
  conversation: 1, 
  createdAt: -1, 
  status: 1 
});

// Method to mark as read by user
messageSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(r => r.user.toString() === userId.toString());
  if (!existingRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
    this.status = 'read';
    return this.save();
  }
  return this;
};

// Method to add reaction
messageSchema.methods.addReaction = function(userId, emoji) {
  // Remove existing reaction from this user
  this.metadata.reactions = this.metadata.reactions.filter(
    r => r.user.toString() !== userId.toString()
  );
  
  // Add new reaction
  this.metadata.reactions.push({
    user: userId,
    emoji: emoji,
    createdAt: new Date()
  });
  
  return this.save();
};

// Method to remove reaction
messageSchema.methods.removeReaction = function(userId) {
  this.metadata.reactions = this.metadata.reactions.filter(
    r => r.user.toString() !== userId.toString()
  );
  return this.save();
};

// Method to edit message
messageSchema.methods.editMessage = function(newContent) {
  // Save current content to edit history
  if (!this.metadata.editHistory) {
    this.metadata.editHistory = [];
  }
  
  this.metadata.editHistory.push({
    content: this.content,
    editedAt: new Date()
  });
  
  // Update content
  this.content = newContent;
  this.metadata.editedAt = new Date();
  
  return this.save();
};

// Method to flag message
messageSchema.methods.flagMessage = function(adminId, reason) {
  this.adminAccess.isFlagged = true;
  this.adminAccess.flaggedBy = adminId;
  this.adminAccess.flaggedAt = new Date();
  this.adminAccess.flagReason = reason;
  
  return this.save();
};

// Method to unflag message
messageSchema.methods.unflagMessage = function() {
  this.adminAccess.isFlagged = false;
  this.adminAccess.flaggedBy = undefined;
  this.adminAccess.flaggedAt = undefined;
  this.adminAccess.flagReason = undefined;
  
  return this.save();
};

// Method to add admin note
messageSchema.methods.addAdminNote = function(adminId, note) {
  if (!this.adminAccess.adminNotes) {
    this.adminAccess.adminNotes = [];
  }
  
  this.adminAccess.adminNotes.push({
    adminId: adminId,
    note: note,
    createdAt: new Date()
  });
  
  return this.save();
};

// Method to check if message is expired
messageSchema.methods.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

// Method to get reaction count by emoji
messageSchema.methods.getReactionCount = function(emoji) {
  return this.metadata.reactions.filter(r => r.emoji === emoji).length;
};

// Method to check if user has reacted
messageSchema.methods.hasUserReacted = function(userId, emoji = null) {
  if (emoji) {
    return this.metadata.reactions.some(r => 
      r.user.toString() === userId.toString() && r.emoji === emoji
    );
  }
  return this.metadata.reactions.some(r => r.user.toString() === userId.toString());
};

// Static method to find messages in conversation
messageSchema.statics.findInConversation = function(conversationId, limit = 50, skip = 0) {
  return this.find({
    conversation: conversationId,
    status: { $ne: 'deleted' }
  })
  .populate('sender', 'firstName lastName profileImageUrl role')
  .populate('metadata.replyTo', 'content sender')
  .populate('metadata.reactions.user', 'firstName lastName profileImageUrl')
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(skip);
};

// Static method to find flagged messages
messageSchema.statics.findFlaggedMessages = function(limit = 50, skip = 0) {
  return this.find({
    'adminAccess.isFlagged': true
  })
  .populate('sender', 'firstName lastName email role')
  .populate('conversation', 'participants')
  .sort({ 'adminAccess.flaggedAt': -1 })
  .limit(limit)
  .skip(skip);
};

// Static method to delete expired messages
messageSchema.statics.deleteExpiredMessages = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

// Static method to get message statistics
messageSchema.statics.getMessageStats = function(conversationId, startDate, endDate) {
  const matchStage = {
    conversation: mongoose.Types.ObjectId(conversationId),
    status: { $ne: 'deleted' }
  };
  
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$messageType',
        count: { $sum: 1 },
        uniqueSenders: { $addToSet: '$sender' }
      }
    },
    {
      $project: {
        messageType: '$_id',
        count: 1,
        uniqueSenderCount: { $size: '$uniqueSenders' }
      }
    }
  ]);
};

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);
export default Message;