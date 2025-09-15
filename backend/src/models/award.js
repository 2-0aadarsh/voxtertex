import mongoose from 'mongoose';

const awardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedUser',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Award title is required'],
    trim: true
  },
  issuer: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  dateIssued: {
    type: Date,
    required: [true, 'Issue date is required']
  },
  credentialId: {
    type: String,
    trim: true
  },
  credentialUrl: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['award', 'certification'],
    default: 'award'
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create index for faster queries
awardSchema.index({ user: 1 });
awardSchema.index({ user: 1, type: 1 });

const Award = mongoose.model('Award', awardSchema);

export default Award;



