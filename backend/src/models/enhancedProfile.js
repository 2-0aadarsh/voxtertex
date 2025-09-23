import mongoose from "mongoose";

// Experience Schema
const experienceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  organization: {
    type: String,
    required: [true, 'Organization is required'],
    trim: true
  },
  start: {
    type: String,
    required: [true, 'Start date is required'],
    match: [/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/, 'Please use dd/mm/yyyy format']
  },
  end: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/.test(v);
      },
      message: 'Please use dd/mm/yyyy format or leave empty for current position'
    }
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Other'],
    default: 'Full-time'
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  achievements: [{
    type: String,
    trim: true
  }],
  isVerified: {
    type: Boolean,
    default: false
  }
}, { 
  _id: true,
  timestamps: true 
});

// Education Schema
const educationSchema = new mongoose.Schema({
  institution: {
    type: String,
    required: [true, 'Institution name is required'],
    trim: true
  },
  degree: {
    type: String,
    required: [true, 'Degree is required'],
    trim: true
  },
  field: {
    type: String,
    required: [true, 'Field of study is required'],
    trim: true
  },
  start: {
    type: String,
    required: [true, 'Start date is required'],
    match: [/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/, 'Please use dd/mm/yyyy format']
  },
  end: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/.test(v);
      },
      message: 'Please use dd/mm/yyyy format or leave empty for current education'
    }
  },
  grade: {
    type: String,
    trim: true
  },
  activities: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, { 
  _id: true,
  timestamps: true 
});

// Award Schema
const awardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Award title is required'],
    trim: true
  },
  issuer: {
    type: String,
    required: [true, 'Award issuer is required'],
    trim: true
  },
  date: {
    type: String,
    required: [true, 'Award date is required'],
    match: [/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/, 'Please use dd/mm/yyyy format']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true
  },
  category: {
    type: String,
    enum: ['Academic', 'Professional', 'Industry', 'Community', 'Other'],
    default: 'Other'
  },
  url: {
    type: String,
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, { 
  _id: true,
  timestamps: true 
});

// Video Schema
const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Video title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters'],
    trim: true
  },
  platform: {
    type: String,
    required: [true, 'Platform is required'],
    enum: ['YouTube', 'Vimeo', 'LinkedIn', 'TikTok', 'Instagram', 'Other'],
    default: 'Other'
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required']
  },
  thumbnail: {
    data: Buffer,
    contentType: String,
    filename: String
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true
  },
  duration: {
    type: String, // Format: "mm:ss"
    validate: {
      validator: function(v) {
        return !v || /^([0-5]?[0-9]):([0-5][0-9])$/.test(v);
      },
      message: 'Duration should be in mm:ss format'
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, { 
  _id: true,
  timestamps: true 
});

// Review Schema
const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedUser',
    required: true
  },
  reviewerName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  remarks: {
    type: String,
    maxlength: [500, 'Remarks cannot exceed 500 characters'],
    trim: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  reviewType: {
    type: String,
    enum: ['event', 'collaboration', 'general'],
    default: 'event'
  }
}, { 
  _id: true,
  timestamps: true 
});

// Main Enhanced Profile Schema
const enhancedProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EnhancedUser",
    required: true
  },
  
  // For development/testing purposes
  testUser: {
    type: Boolean,
    default: false
  },
  
  // Profile sections
  experience: [experienceSchema],
  education: [educationSchema],
  awards: [awardSchema],
  featuredVideos: [videoSchema], // Featured videos uploaded by the user
  
  // Skills and expertise
  skills: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate'
    },
    yearsOfExperience: {
      type: Number,
      min: 0
    }
  }],
  
  // Reviews and ratings
  reviews: [reviewSchema],
  
  // Calculated ratings
  ratings: {
    overall: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    },
    communication: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    },
    expertise: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    },
    professionalism: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    }
  },
  
  // User Experience (for organizer and participant roles)
  yearsOfExperience: {
    type: Number,
    default: 0,
    min: 0,
    max: 50
  },
  tags: [{
  type: String,
  trim: true
}],
  
  // Stats
  stats: {
    profileViews: {
      type: Number,
      default: 0
    },
    totalBookings: {
      type: Number,
      default: 0
    },
    completedBookings: {
      type: Number,
      default: 0
    },
    cancelledBookings: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    }
  }
}, { 
  _id: true,
  timestamps: true 
});

// Methods
enhancedProfileSchema.methods.addExperience = function(experienceData) {
  this.experience.push(experienceData);
  return this.save();
};

enhancedProfileSchema.methods.updateExperience = function(experienceId, updateData) {
  const experience = this.experience.id(experienceId);
  if (experience) {
    Object.assign(experience, updateData);
    return this.save();
  }
  throw new Error('Experience not found');
};

enhancedProfileSchema.methods.removeExperience = function(experienceId) {
  this.experience.pull({ _id: experienceId });
  return this.save();
};

enhancedProfileSchema.methods.addEducation = function(educationData) {
  this.education.push(educationData);
  return this.save();
};

enhancedProfileSchema.methods.updateEducation = function(educationId, updateData) {
  const education = this.education.id(educationId);
  if (education) {
    Object.assign(education, updateData);
    return this.save();
  }
  throw new Error('Education not found');
};

enhancedProfileSchema.methods.removeEducation = function(educationId) {
  this.education.pull({ _id: educationId });
  return this.save();
};

enhancedProfileSchema.methods.addAward = function(awardData) {
  this.awards.push(awardData);
  return this.save();
};

enhancedProfileSchema.methods.updateAward = function(awardId, updateData) {
  const award = this.awards.id(awardId);
  if (award) {
    Object.assign(award, updateData);
    return this.save();
  }
  throw new Error('Award not found');
};

enhancedProfileSchema.methods.removeAward = function(awardId) {
  this.awards.pull({ _id: awardId });
  return this.save();
};

enhancedProfileSchema.methods.addVideo = function(videoData) {
  this.featuredVideos.push(videoData);
  return this.save();
};

enhancedProfileSchema.methods.updateVideo = function(videoId, updateData) {
  const video = this.featuredVideos.id(videoId);
  if (video) {
    Object.assign(video, updateData);
    return this.save();
  }
  throw new Error('Video not found');
};

enhancedProfileSchema.methods.removeVideo = function(videoId) {
  this.featuredVideos.pull({ _id: videoId });
  return this.save();
};

enhancedProfileSchema.methods.incrementProfileViews = function() {
  this.stats.profileViews += 1;
  return this.save();
};

const EnhancedProfile = mongoose.models.EnhancedProfile || mongoose.model("EnhancedProfile", enhancedProfileSchema);
export default EnhancedProfile;