import mongoose from 'mongoose';

const featuredVideoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedUser',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Video title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required'],
    trim: true
  },
  thumbnailUrl: {
    type: String,
    trim: true
  },
  publicId: {
    type: String,
    trim: true
  },
  thumbnailPublicId: {
    type: String,
    trim: true
  },
  duration: {
    type: Number,
    default: 0 // Duration in seconds
  },
  durationFormatted: {
    type: String,
    default: '0:00'
  },
  format: {
    type: String,
    default: 'mp4',
    enum: ['mp4', 'webm', 'ogg', 'avi', 'mov', 'mkv']
  },
  platform: {
    type: String,
    default: 'Cloudinary',
    enum: ['Cloudinary', 'YouTube', 'Vimeo', 'Local']
  },
  category: {
    type: String,
    default: 'Other',
    enum: ['Presentation', 'Interview', 'Lecture', 'Workshop', 'Conference', 'Other']
  },
  tags: [{
    type: String,
    trim: true
  }],
  size: {
    type: Number, // File size in bytes
    default: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  hasCustomThumbnail: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: 'ready',
    enum: ['uploading', 'processing', 'ready', 'failed']
  },
  isFeatured: {
    type: Boolean,
    default: true
  },
  visibility: {
    type: String,
    default: 'public',
    enum: ['public', 'private', 'unlisted']
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
featuredVideoSchema.index({ user: 1 });
featuredVideoSchema.index({ user: 1, category: 1 });
featuredVideoSchema.index({ user: 1, isFeatured: 1 });
featuredVideoSchema.index({ visibility: 1 });
featuredVideoSchema.index({ createdAt: -1 });

// Virtual for formatted duration
featuredVideoSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return '0:00';
  
  const minutes = Math.floor(this.duration / 60);
  const seconds = Math.floor(this.duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Method to increment view count
featuredVideoSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to like video
featuredVideoSchema.methods.like = function() {
  this.likes += 1;
  return this.save();
};

// Method to unlike video
featuredVideoSchema.methods.unlike = function() {
  if (this.likes > 0) {
    this.likes -= 1;
  }
  return this.save();
};

// Static method to search videos
featuredVideoSchema.statics.search = function(query) {
  return this.find({
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ],
    visibility: 'public'
  }).sort({ createdAt: -1 }).limit(20);
};

// Ensure virtual fields are serialized
featuredVideoSchema.set('toJSON', { virtuals: true });
featuredVideoSchema.set('toObject', { virtuals: true });

const FeaturedVideo = mongoose.model('FeaturedVideo', featuredVideoSchema);

export default FeaturedVideo;