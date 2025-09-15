import mongoose from "mongoose";

// Comment Schema for posts
const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedUser',
    required: true
  },  
  userName: {
    type: String,
    required: true
  },
  userProfileImage: {
    data: Buffer,
    contentType: String
  },
  userProfileImageUrl: {
    type: String
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    maxlength: [500, 'Comment cannot exceed 500 characters'],
    trim: true
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EnhancedUser'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  replies: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EnhancedUser',
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [300, 'Reply cannot exceed 300 characters'],
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Enhanced Post Schema
const enhancedPostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EnhancedUser",
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userProfileImage: {
    data: Buffer,
    contentType: String
  },
  userProfessionalTitle: {
    type: String
  },
  
  // Post content
  title: {
    type: String,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    trim: true
  },
  caption: {
    type: String,
    required: [true, 'Caption is required'],
    maxlength: [2000, 'Caption cannot exceed 2000 characters'],
    trim: true
  },
  
  // Media content
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'document'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    filename: {
      type: String
    },
    size: {
      type: Number // in bytes
    },
    duration: {
      type: String // for videos, format: "mm:ss"
    },
    thumbnail: {
      type: String // thumbnail URL for videos
    }
  }],
  
  // Post categorization
  category: {
    type: String,
    enum: [
      'general', 'professional', 'achievement', 'event', 'knowledge-sharing',
      'industry-news', 'career-advice', 'networking', 'announcement'
    ],
    default: 'general'
  },
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Engagement
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EnhancedUser'
    },
    userName: {
      type: String
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  comments: [commentSchema],
  
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EnhancedUser'
    },
    userName: {
      type: String
    },
    sharedAt: {
      type: Date,
      default: Date.now
    },
    shareNote: {
      type: String,
      maxlength: [500, 'Share note cannot exceed 500 characters']
    }
  }],
  
  // Counts for performance
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  sharesCount: {
    type: Number,
    default: 0
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  
  // Post settings
  visibility: {
    type: String,
    enum: ['public', 'connections', 'private'],
    default: 'public'
  },
  
  allowComments: {
    type: Boolean,
    default: true
  },
  
  allowShares: {
    type: Boolean,
    default: true
  },
  
  // Content moderation
  isReported: {
    type: Boolean,
    default: false
  },
  
  reportCount: {
    type: Number,
    default: 0
  },
  
  reports: [{
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EnhancedUser'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'harassment', 'false-information', 'copyright', 'other']
    },
    description: {
      type: String,
      maxlength: [500, 'Report description cannot exceed 500 characters']
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  status: {
    type: String,
    enum: ['active', 'hidden', 'removed', 'under-review'],
    default: 'active'
  },
  
  // Analytics
  analytics: {
    impressions: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    engagement: {
      type: Number,
      default: 0
    },
    reach: {
      type: Number,
      default: 0
    }
  },
  
  // Edit history
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  editHistory: [{
    editedAt: {
      type: Date,
      default: Date.now
    },
    previousContent: {
      title: String,
      caption: String
    },
    reason: {
      type: String,
      maxlength: [200, 'Edit reason cannot exceed 200 characters']
    }
  }],
  
  // Scheduling
  scheduledFor: {
    type: Date
  },
  isScheduled: {
    type: Boolean,
    default: false
  },
  
  // Pinned post
  isPinned: {
    type: Boolean,
    default: false
  },
  pinnedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better performance
enhancedPostSchema.index({ user: 1, createdAt: -1 });
enhancedPostSchema.index({ category: 1, createdAt: -1 });
enhancedPostSchema.index({ tags: 1 });
enhancedPostSchema.index({ likesCount: -1 });
enhancedPostSchema.index({ createdAt: -1 });
enhancedPostSchema.index({ caption: 'text', title: 'text' });
enhancedPostSchema.index({ status: 1, visibility: 1 });

// Pre-save middleware to update counts
enhancedPostSchema.pre('save', function(next) {
  this.likesCount = this.likes.length;
  this.commentsCount = this.comments.length;
  this.sharesCount = this.shares.length;
  
  // Calculate engagement
  this.analytics.engagement = this.likesCount + this.commentsCount + this.sharesCount;
  
  next();
});

// Methods
enhancedPostSchema.methods.addLike = function(userId, userName) {
  const existingLike = this.likes.find(like => like.user.toString() === userId.toString());
  if (!existingLike) {
    this.likes.push({ user: userId, userName });
    return this.save();
  }
  return this;
};

enhancedPostSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
  return this.save();
};

enhancedPostSchema.methods.addComment = function(commentData) {
  this.comments.push(commentData);
  return this.save();
};

enhancedPostSchema.methods.removeComment = function(commentId) {
  this.comments.pull({ _id: commentId });
  return this.save();
};

enhancedPostSchema.methods.addShare = function(userId, userName, shareNote = '') {
  this.shares.push({ 
    user: userId, 
    userName, 
    shareNote 
  });
  return this.save();
};

enhancedPostSchema.methods.incrementViews = function() {
  this.viewsCount += 1;
  this.analytics.impressions += 1;
  return this.save();
};

enhancedPostSchema.methods.addReport = function(reportData) {
  this.reports.push(reportData);
  this.reportCount = this.reports.length;
  
  // Auto-hide if too many reports
  if (this.reportCount >= 5) {
    this.status = 'under-review';
  }
  
  return this.save();
};

enhancedPostSchema.methods.togglePin = function() {
  this.isPinned = !this.isPinned;
  this.pinnedAt = this.isPinned ? new Date() : null;
  return this.save();
};

// Static methods
enhancedPostSchema.statics.getPublicPosts = function(page = 1, limit = 10) {
  return this.find({ 
    status: 'active', 
    visibility: 'public' 
  })
  .populate('user', 'firstName lastName professionalTitle')
  .sort({ createdAt: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);
};

enhancedPostSchema.statics.getUserPosts = function(userId, page = 1, limit = 10) {
  return this.find({ 
    user: userId,
    status: 'active'
  })
  .sort({ isPinned: -1, createdAt: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);
};

enhancedPostSchema.statics.searchPosts = function(query, page = 1, limit = 10) {
  return this.find({
    $and: [
      { status: 'active', visibility: 'public' },
      {
        $or: [
          { caption: { $regex: query, $options: 'i' } },
          { title: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    ]
  })
  .populate('user', 'firstName lastName professionalTitle')
  .sort({ createdAt: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);
};

const EnhancedPost = mongoose.models.EnhancedPost || mongoose.model('EnhancedPost', enhancedPostSchema);
export default EnhancedPost;

