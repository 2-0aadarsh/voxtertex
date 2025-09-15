import mongoose from 'mongoose';

const workExperienceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedUser',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  employmentType: {
    type: String,
    enum: ['Full-Time', 'Part-Time', 'Contract', 'Freelance', 'Internship', 'Temporary'],
    default: 'Full-Time'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date
  },
  isCurrentlyWorking: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create index for faster queries
workExperienceSchema.index({ user: 1 });
workExperienceSchema.index({ user: 1, order: 1 });

const WorkExperience = mongoose.model('WorkExperience', workExperienceSchema);

export default WorkExperience;



