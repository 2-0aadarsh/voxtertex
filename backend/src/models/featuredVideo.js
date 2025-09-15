import mongoose from "mongoose";

/**
 * FeaturedVideo Schema
 * This schema defines the structure for featured videos uploaded by users
 */
const featuredVideoSchema = new mongoose.Schema({
  // User reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EnhancedUser",
    required: true,
    index: true
  },
  
  // Video metadata
  title: {
    type: String,
    required: [true, 'Video title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters'],
    trim: true,
    index: true
  },
  
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    trim: true
  },
  
  // Video source
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required']
  },
  
  // Cloudinary specific fields
  publicId: {
    type: String,
    required: [true, 'Cloudinary public ID is required']
  },
  
  format: {
    type: String,
    enum: ['mp4', 'mov', 'avi', 'webm', 'mkv', 'other'],
    default: 'mp4'
  },
  
  // Thumbnail
  thumbnailUrl: {
    type: String,
    required: [true, 'Thumbnail URL is required']
  },
  
  thumbnailPublicId: {
    type: String,
    default: null
  },
  
  hasCustomThumbnail: {
    type: Boolean,
    default: false
  },
  
  // Video details
  duration: {
    type: Number, // Duration in seconds
    default: 0
  },
  
  durationFormatted: {
    type: String, // Format: "mm:ss"
    default: "0:00"
  },
  
  // Video stats
  views: {
    type: Number,
    default: 0
  },
  
  likes: {
    type: Number,
    default: 0
  },
  
  // Video categorization
  tags: [{
    type: String,
    trim: true
  }],
  
  category: {
    type: String,
    enum: ['Presentation', 'Interview', 'Lecture', 'Workshop', 'Conference', 'Other'],
    default: 'Other'
  },
  
  // Video platform
  platform: {
    type: String,
    enum: ['Cloudinary', 'YouTube', 'Vimeo', 'LinkedIn', 'TikTok', 'Instagram', 'Other'],
    default: 'Cloudinary'
  },
  
  // Video visibility
  isPublic: {
    type: Boolean,
    default: true
  },
  
  // Video quality
  quality: {
    type: String,
    enum: ['SD', 'HD', 'Full HD', '4K', 'Other'],
    default: 'HD'
  },
  
  // Video size (in bytes)
  size: {
    type: Number
  },
  
  // Technical metadata
  metadata: {
    width: Number,
    height: Number,
    aspectRatio: String,
    bitRate: Number,
    frameRate: Number,
    codec: String,
    audio: {
      codec: String,
      channels: Number,
      sampleRate: Number
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['processing', 'ready', 'failed', 'deleted'],
    default: 'ready'
  },
  
  // Featured flag (for highlighting on profile)
  isFeatured: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true, // Adds createdAt and updatedAt fields
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted duration
featuredVideoSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return '0:00';
  
  const minutes = Math.floor(this.duration / 60);
  const seconds = Math.floor(this.duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Virtual for formatted size
featuredVideoSchema.virtual('formattedSize').get(function() {
  if (!this.size) return '0 MB';
  
  const sizeInMB = this.size / (1024 * 1024);
  return `${sizeInMB.toFixed(2)} MB`;
});

// Index for faster queries
featuredVideoSchema.index({ user: 1, createdAt: -1 });
featuredVideoSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Methods
featuredVideoSchema.methods.incrementViews = async function() {
  this.views += 1;
  return this.save();
};

featuredVideoSchema.methods.like = async function() {
  this.likes += 1;
  return this.save();
};

featuredVideoSchema.methods.unlike = async function() {
  if (this.likes > 0) {
    this.likes -= 1;
  }
  return this.save();
};

// Static methods
featuredVideoSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

featuredVideoSchema.statics.findFeatured = function() {
  return this.find({ isFeatured: true }).sort({ views: -1 });
};

featuredVideoSchema.statics.findByTag = function(tag) {
  return this.find({ tags: tag }).sort({ createdAt: -1 });
};

featuredVideoSchema.statics.search = function(query) {
  return this.find(
    { $text: { $search: query } },
    { score: { $meta: "textScore" } }
  ).sort({ score: { $meta: "textScore" } });
};

// Create the model
const FeaturedVideo = mongoose.models.FeaturedVideo || mongoose.model("FeaturedVideo", featuredVideoSchema);

export default FeaturedVideo;
