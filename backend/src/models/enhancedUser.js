import mongoose from "mongoose";

// Enhanced User Schema with role-based functionality
const enhancedUserSchema = new mongoose.Schema({
  // Basic Information (unchangeable after registration)
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  mobileNo: {
    type: String,
    required: false,
    unique: false,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  
  // Profile Information (editable)
  profileImage: {
    data: Buffer,
    contentType: String
  },
  profileImageUrl: {
    type: String,
    trim: true
  },
  cloudinaryPublicId: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    trim: true
  },
  professionalTitle: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  areaOfExpertise: [{
    type: String,
    trim: true
  }],
  yearsOfExperience: {
    type: Number,
    default: 0,
    min: 0,
    max: 50
  },
  
  // Role Information
  role: {
    type: String,
    enum: ["participant", "speaker", "organizer"],
    required: true
  },
  
  // Role-specific data
  roleSpecificData: {
    // For speakers
    workEmail: {
      type: String,
      validate: {
        validator: function(value) {
          if (this.role === "speaker") {
            return value && value.trim() !== "";
          }
          return true;
        },
        message: "Work email is required for speakers"
      }
    },
    
    // Industry and specialization
    industry: {
      type: String,
      enum: [
        "technology", "healthcare", "finance", "education", "business",
        "engineering", "art", "law", "marketing", "environmental",
        "manufacturing", "social", "retail", "energy", "realestate"
      ]
    },
    
    activities: [{
      type: String,
      trim: true
    }],
    
    // Social links and URLs
    socialLinks: {
      linkedin: String,
      twitter: String,
      website: String,
      portfolio: String
    }
  },
  
  // Account Status
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isMobileVerified: {
    type: Boolean,
    default: false
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  signupComplete: {
    type: Boolean,
    default: false
  },
  
  // Account Activity
  lastLogin: Date,
  accountStatus: {
    type: String,
    enum: ["active", "suspended", "deactivated"],
    default: "active"
  },
  
  // User Engagement Tracking
  likedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedPost'
  }],
  commentedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedPost'
  }]
}, {
  timestamps: true
});

// Indexes for better performance (email and mobileNo already indexed via unique: true)
enhancedUserSchema.index({ role: 1 });
enhancedUserSchema.index({ 
  firstName: 'text', 
  lastName: 'text', 
  professionalTitle: 'text',
  bio: 'text'
});

// Virtual for full name
enhancedUserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Method to check if profile is complete
enhancedUserSchema.methods.checkProfileCompleteness = function() {
  const requiredFields = ['bio', 'professionalTitle', 'location'];
  const isComplete = requiredFields.every(field => this[field] && this[field].trim() !== '');
  
  this.isProfileComplete = isComplete;
  return isComplete;
};

// Method to update last login
enhancedUserSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Method to add liked post
enhancedUserSchema.methods.addLikedPost = function(postId) {
  if (!this.likedPosts) {
    this.likedPosts = [];
  }
  if (!this.likedPosts.includes(postId)) {
    this.likedPosts.push(postId);
    return this.save();
  }
  return this;
};

// Method to remove liked post
enhancedUserSchema.methods.removeLikedPost = function(postId) {
  if (!this.likedPosts) {
    this.likedPosts = [];
  }
  this.likedPosts = this.likedPosts.filter(id => id.toString() !== postId.toString());
  return this.save();
};

// Method to add commented post
enhancedUserSchema.methods.addCommentedPost = function(postId) {
  if (!this.commentedPosts) {
    this.commentedPosts = [];
  }
  if (!this.commentedPosts.includes(postId)) {
    this.commentedPosts.push(postId);
    return this.save();
  }
  return this;
};

const EnhancedUser = mongoose.models.EnhancedUser || mongoose.model("EnhancedUser", enhancedUserSchema);
export default EnhancedUser;

