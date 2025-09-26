import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema({
    // Basic dispute information
    disputeId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['payment', 'service', 'communication', 'contract', 'other']
    },
    priority: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    
    // Parties involved
    complainant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    respondent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Dispute workflow stages
    currentStage: {
        type: String,
        enum: ['peer-to-peer', 'mediation', 'legal'],
        default: 'peer-to-peer'
    },
    status: {
        type: String,
        enum: ['active', 'resolved', 'escalated', 'closed'],
        default: 'active'
    },
    
    // Stage-specific data
    peerToPeerData: {
        startedAt: { type: Date },
        deadline: { type: Date },
        attempts: { type: Number, default: 0 },
        maxAttempts: { type: Number, default: 3 },
        lastContactAt: { type: Date },
        resolution: { type: String },
        agreedTerms: { type: String },
        isResolved: { type: Boolean, default: false }
    },
    
    mediationData: {
        mediator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        startedAt: { type: Date },
        deadline: { type: Date },
        mediationFee: { type: Number },
        feeStatus: {
            type: String,
            enum: ['pending', 'paid', 'disputed'],
            default: 'pending'
        },
        sessions: [{
            date: { type: Date },
            duration: { type: Number }, // minutes
            notes: { type: String },
            attendees: [{
                user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                attended: { type: Boolean }
            }]
        }],
        resolution: { type: String },
        agreement: { type: String },
        isResolved: { type: Boolean, default: false }
    },
    
    legalData: {
        legalRepresentative: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        caseNumber: { type: String },
        courtName: { type: String },
        filingDate: { type: Date },
        hearingDates: [{ type: Date }],
        legalDocuments: [{
            name: { type: String },
            url: { type: String },
            uploadedAt: { type: Date }
        }],
        verdict: { type: String },
        isResolved: { type: Boolean, default: false }
    },
    
    // Communication and evidence
    messages: [{
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        messageType: {
            type: String,
            enum: ['message', 'evidence', 'proposal', 'agreement'],
            default: 'message'
        },
        attachments: [{
            name: { type: String },
            url: { type: String },
            type: { type: String } // image, document, audio, etc.
        }],
        isInternal: { type: Boolean, default: false }, // for mediator/legal notes
        readBy: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            readAt: { type: Date }
        }]
    }],
    
    evidence: [{
        submittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        title: { type: String, required: true },
        description: { type: String },
        files: [{
            name: { type: String },
            url: { type: String },
            type: { type: String },
            size: { type: Number }
        }],
        submittedAt: {
            type: Date,
            default: Date.now
        },
        verified: { type: Boolean, default: false }
    }],
    
    // Timeline and audit
    timeline: [{
        action: { type: String, required: true },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        details: { type: String },
        stage: { type: String }
    }],
    
    // Resolution
    resolution: {
        type: { type: String }, // 'agreement', 'mediated', 'legal'
        description: { type: String },
        terms: { type: String },
        compensation: {
            amount: { type: Number },
            currency: { type: String, default: 'INR' },
            paymentStatus: {
                type: String,
                enum: ['pending', 'paid', 'failed'],
                default: 'pending'
            }
        },
        resolvedAt: { type: Date },
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        satisfactionRating: {
            complainant: { type: Number, min: 1, max: 5 },
            respondent: { type: Number, min: 1, max: 5 }
        }
    },
    
    // Metadata
    escalationHistory: [{
        from: { type: String },
        to: { type: String },
        reason: { type: String },
        escalatedAt: { type: Date },
        escalatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    
    tags: [{ type: String }],
    relatedDisputes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dispute'
    }],
    
    // System fields
    isActive: {
        type: Boolean,
        default: true
    },
    closedAt: { type: Date },
    lastActivityAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
disputeSchema.index({ complainant: 1, status: 1 });
disputeSchema.index({ respondent: 1, status: 1 });
disputeSchema.index({ currentStage: 1, status: 1 });
disputeSchema.index({ 'mediationData.mediator': 1 });
disputeSchema.index({ createdAt: -1 });
disputeSchema.index({ lastActivityAt: -1 });

// Virtual for days since creation
disputeSchema.virtual('daysSinceCreation').get(function() {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for current stage duration
disputeSchema.virtual('currentStageDuration').get(function() {
    let stageStartDate;
    switch(this.currentStage) {
        case 'peer-to-peer':
            stageStartDate = this.peerToPeerData?.startedAt || this.createdAt;
            break;
        case 'mediation':
            stageStartDate = this.mediationData?.startedAt;
            break;
        case 'legal':
            stageStartDate = this.legalData?.filingDate;
            break;
        default:
            stageStartDate = this.createdAt;
    }
    return stageStartDate ? Math.floor((Date.now() - stageStartDate) / (1000 * 60 * 60 * 24)) : 0;
});

// Pre-save middleware to update lastActivityAt
disputeSchema.pre('save', function(next) {
    this.lastActivityAt = new Date();
    next();
});

// Generate unique dispute ID
disputeSchema.pre('save', function(next) {
    if (this.isNew && !this.disputeId) {
        this.disputeId = `DSP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        console.log('Generated disputeId:', this.disputeId);
    }
    next();
});


// Static method to find disputes by user (as complainant or respondent)
disputeSchema.statics.findByUser = function(userId) {
    return this.find({
        $or: [
            { complainant: userId },
            { respondent: userId }
        ]
    }).populate('complainant respondent', 'firstName lastName email')
      .populate('mediationData.mediator', 'firstName lastName email')
      .sort({ lastActivityAt: -1 });
};

// Instance method to add timeline entry
disputeSchema.methods.addTimelineEntry = function(action, performedBy, details = '') {
    this.timeline.push({
        action,
        performedBy,
        details,
        stage: this.currentStage,
        timestamp: new Date()
    });
    return this
};

// Instance method to add message
disputeSchema.methods.addMessage = function(sender, content, messageType = 'message', attachments = []) {
    this.messages.push({
        sender,
        content,
        messageType,
        attachments,
        timestamp: new Date()
    });
    return this
};



// Instance method to escalate dispute
disputeSchema.methods.escalate = function(reason, escalatedBy) {
    const stageOrder = ['peer-to-peer', 'mediation', 'legal'];
    const currentIndex = stageOrder.indexOf(this.currentStage);
    
    if (currentIndex < stageOrder.length - 1) {
        const nextStage = stageOrder[currentIndex + 1];
        
        this.escalationHistory.push({
            from: this.currentStage,
            to: nextStage,
            reason,
            escalatedAt: new Date(),
            escalatedBy
        });
        
        this.currentStage = nextStage;
        this.status = 'escalated';
        
        // Initialize stage-specific data
        switch(nextStage) {
            case 'mediation':
                this.mediationData = {
                    startedAt: new Date(),
                    deadline: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 days
                    sessions: []
                };
                break;
            case 'legal':
                this.legalData = {
                    filingDate: new Date(),
                    legalDocuments: [],
                    hearingDates: []
                };
                break;
        }
        
        this.addTimelineEntry(`Escalated to ${nextStage}`, escalatedBy, reason);
        return true;
    }
    return false;
};

const Dispute = mongoose.model('Dispute', disputeSchema);

export default Dispute;
