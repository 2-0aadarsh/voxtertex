import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedUser',
    required: true
  },
  degree: {
    type: String,
    required: [true, 'Degree is required'],
    trim: true
  },
  institution: {
    type: String,
    required: [true, 'Institution name is required'],
    trim: true
  },
  fieldOfStudy: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date
  },
  isCurrentlyStudying: {
    type: Boolean,
    default: false
  },
  grade: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create index for faster queries
educationSchema.index({ user: 1 });
educationSchema.index({ user: 1, order: 1 });

const Education = mongoose.model('Education', educationSchema);

export default Education;



