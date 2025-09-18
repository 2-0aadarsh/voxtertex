import mongoose from 'mongoose';

const negotiationSchema = new mongoose.Schema({
  // Basic negotiation info
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  
  // Participants
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedUser',
    required: true
  },
  speaker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedUser',
    required: true
  },
  
  // Event context (optional)
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    default: null
  },
  
  // Negotiation details
  topic: {
    type: String,
    required: true,
    trim: true
  },
  
  // Current proposal
  currentProposal: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR']
    },
    proposedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EnhancedUser',
      required: true
    },
    proposedAt: {
      type: Date,
      default: Date.now
    },
    message: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'countered'],
      default: 'pending'
    }
  },
  
  // Negotiation history
  proposals: [{
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    proposedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EnhancedUser',
      required: true
    },
    proposedAt: {
      type: Date,
      default: Date.now
    },
    message: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'countered'],
      default: 'pending'
    },
    respondedAt: {
      type: Date
    },
    responseMessage: {
      type: String,
      trim: true
    }
  }],
  
  // Negotiation status
  status: {
    type: String,
    enum: ['active', 'accepted', 'declined', 'expired', 'cancelled'],
    default: 'active'
  },
  
  // Final agreement (if accepted)
  finalAgreement: {
    amount: {
      type: Number
    },
    currency: {
      type: String,
      default: 'USD'
    },
    acceptedAt: {
      type: Date
    },
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EnhancedUser'
    },
    terms: {
      type: String,
      trim: true
    }
  },
  
  // Negotiation settings
  settings: {
    autoExpire: {
      type: Boolean,
      default: true
    },
    expireAfter: {
      type: Number,
      default: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    },
    allowCounterProposals: {
      type: Boolean,
      default: true
    },
    maxProposals: {
      type: Number,
      default: 10
    }
  },
  
  // Metadata
  metadata: {
    tags: [{
      type: String,
      trim: true
    }],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    notes: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
negotiationSchema.index({ conversation: 1 });
negotiationSchema.index({ organizer: 1, speaker: 1 });
negotiationSchema.index({ status: 1 });
negotiationSchema.index({ 'currentProposal.proposedAt': -1 });

// Instance methods
negotiationSchema.methods.addProposal = function(amount, currency, proposedBy, message = '') {
  const proposal = {
    amount,
    currency,
    proposedBy,
    proposedAt: new Date(),
    message,
    status: 'pending'
  };
  
  // Update previous proposal status to 'countered' if it exists
  if (this.proposals.length > 0) {
    const lastProposal = this.proposals[this.proposals.length - 1];
    if (lastProposal.status === 'pending') {
      lastProposal.status = 'countered';
      lastProposal.respondedAt = new Date();
    }
  }
  
  this.proposals.push(proposal);
  this.currentProposal = proposal;
  
  return this.save();
};

negotiationSchema.methods.respondToProposal = function(proposalIndex, response, responseMessage = '') {
  if (proposalIndex >= this.proposals.length) {
    throw new Error('Invalid proposal index');
  }
  
  const proposal = this.proposals[proposalIndex];
  if (proposal.status !== 'pending') {
    throw new Error('Proposal has already been responded to');
  }
  
  proposal.status = response;
  proposal.respondedAt = new Date();
  proposal.responseMessage = responseMessage;
  
  // Update currentProposal status to match the response
  this.currentProposal.status = response;
  
  if (response === 'accepted') {
    this.status = 'accepted';
    this.finalAgreement = {
      amount: proposal.amount,
      currency: proposal.currency,
      acceptedAt: new Date(),
      acceptedBy: proposal.proposedBy
    };
  } else if (response === 'declined' && this.proposals.length >= this.settings.maxProposals) {
    this.status = 'declined';
  }
  
  return this.save();
};

negotiationSchema.methods.cancelNegotiation = function(cancelledBy, reason = '') {
  this.status = 'cancelled';
  this.metadata.notes = reason;
  return this.save();
};

negotiationSchema.methods.isExpired = function() {
  if (!this.settings.autoExpire) return false;
  
  const now = new Date();
  const lastProposalTime = this.currentProposal.proposedAt;
  const expirationTime = new Date(lastProposalTime.getTime() + this.settings.expireAfter);
  
  return now > expirationTime;
};

negotiationSchema.methods.getNegotiationSummary = function() {
  return {
    id: this._id,
    topic: this.topic,
    status: this.status,
    currentAmount: this.currentProposal.amount,
    currency: this.currentProposal.currency,
    proposedBy: this.currentProposal.proposedBy,
    proposedAt: this.currentProposal.proposedAt,
    totalProposals: this.proposals.length,
    organizer: this.organizer,
    speaker: this.speaker,
    event: this.event
  };
};

// Static methods
negotiationSchema.statics.findActiveNegotiations = function(userId) {
  return this.find({
    $or: [
      { organizer: userId },
      { speaker: userId }
    ],
    status: 'active'
  }).populate('organizer speaker event', 'firstName lastName email role');
};

negotiationSchema.statics.findByConversation = function(conversationId) {
  return this.findOne({ conversation: conversationId })
    .populate('organizer speaker event', 'firstName lastName email role');
};

negotiationSchema.statics.getNegotiationStats = function(userId) {
  return this.aggregate([
    {
      $match: {
        $or: [
          { organizer: mongoose.Types.ObjectId(userId) },
          { speaker: mongoose.Types.ObjectId(userId) }
        ]
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$currentProposal.amount' }
      }
    }
  ]);
};

// Pre-save middleware
negotiationSchema.pre('save', function(next) {
  // Check if negotiation should be expired
  if (this.isExpired() && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

const Negotiation = mongoose.model('Negotiation', negotiationSchema);

export default Negotiation;
