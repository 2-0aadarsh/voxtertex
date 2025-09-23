import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  // Participants in the conversation
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EnhancedUser',
      required: true
    },
    role: {
      type: String,
      enum: ['speaker', 'organizer', 'participant'],
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastReadAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  // Conversation metadata
  type: {
    type: String,
    enum: ['direct', 'group', 'event_related', 'booking_related'],
    default: 'direct'
  },
  
  // Event or booking context (if applicable)
  context: {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    topic: {
      type: String,
      trim: true
    }
  },

  // Conversation status
  status: {
    type: String,
    enum: ['active', 'archived', 'blocked', 'deleted'],
    default: 'active'
  },

  // Last message info for quick access
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EnhancedUser'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'system', 'event_invite', 'booking_request', 'negotiation_proposal', 'negotiation_accepted', 'negotiation_declined', 'negotiation_cancelled'],
      default: 'text'
    }
  },

  // Admin oversight
  adminAccess: {
    canView: {
      type: Boolean,
      default: true
    },
    lastViewedByAdmin: {
      type: Date
    },
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

  // Conversation settings
  settings: {
    allowFileSharing: {
      type: Boolean,
      default: true
    },
    allowImageSharing: {
      type: Boolean,
      default: true
    },
    maxFileSize: {
      type: Number,
      default: 10485760 // 10MB in bytes
    },
    autoArchiveAfter: {
      type: Number,
      default: 30 // days
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
conversationSchema.index({ 'participants.user': 1 });
conversationSchema.index({ 'participants.role': 1 });
conversationSchema.index({ 'participants.user': 1, 'participants.isActive': 1 });
conversationSchema.index({ status: 1 });
conversationSchema.index({ 'lastMessage.timestamp': -1 });
conversationSchema.index({ 'context.eventId': 1 });
conversationSchema.index({ 'context.bookingId': 1 });
conversationSchema.index({ createdAt: -1 });

// Compound index for finding conversations between specific users
conversationSchema.index({ 
  'participants.user': 1, 
  status: 1, 
  'lastMessage.timestamp': -1 
});

// Virtual for conversation title
conversationSchema.virtual('title').get(function() {
  if (this.type === 'group') {
    return this.context?.topic || 'Group Conversation';
  }
  return 'Direct Message';
});

// Method to add participant
conversationSchema.methods.addParticipant = function(userId, role) {
  const existingParticipant = this.participants.find(p => p.user.toString() === userId.toString());
  if (!existingParticipant) {
    this.participants.push({
      user: userId,
      role: role,
      joinedAt: new Date(),
      lastReadAt: new Date(),
      isActive: true
    });
  }
  return this.save();
};

// Method to remove participant
conversationSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(p => p.user.toString() !== userId.toString());
  return this.save();
};

// Method to update last read time
conversationSchema.methods.updateLastRead = function(userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (participant) {
    participant.lastReadAt = new Date();
    return this.save();
  }
  return this;
};

// Method to get unread count for a user
conversationSchema.methods.getUnreadCount = function(userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (!participant || !this.lastMessage) return 0;
  
  return participant.lastReadAt < this.lastMessage.timestamp ? 1 : 0;
};

// Method to check if user is participant
conversationSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.user.toString() === userId.toString() && p.isActive);
};

// Method to get other participants (excluding the requesting user)
conversationSchema.methods.getOtherParticipants = function(userId) {
  return this.participants.filter(p => p.user.toString() !== userId.toString() && p.isActive);
};

// Static method to find conversation between users
conversationSchema.statics.findBetweenUsers = function(userId1, userId2, type = 'direct') {
  return this.findOne({
    type: type,
    status: 'active',
    $and: [
      { participants: { $elemMatch: { user: userId1 } } },
      { participants: { $elemMatch: { user: userId2 } } }
    ]
  });
};
conversationSchema.virtual('hasUnread').get(function () {
  return (userId) => this.getUnreadCount(userId) > 0;
});

// Static method to find user's conversations
conversationSchema.statics.findUserConversations = function(userId, limit = 20, skip = 0) {
  return this.find({
    'participants.user': userId,
    'participants.isActive': true,
    status: 'active'
  })
  .populate('participants.user', 'firstName lastName profileImageUrl role')
  .populate('lastMessage.sender', 'firstName lastName profileImageUrl')
  .sort({ 'lastMessage.timestamp': -1 })
  .limit(limit)
  .skip(skip);
};

// Static method to archive old conversations
conversationSchema.statics.archiveOldConversations = function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.updateMany(
    {
      status: 'active',
      'lastMessage.timestamp': { $lt: cutoffDate }
    },
    {
      status: 'archived'
    }
  );
};

const Conversation = mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);
export default Conversation;


