import mongoose from "mongoose";

// Password Reset Schema - handles all password reset related operations
const passwordResetSchema = new mongoose.Schema({
  // User reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedUser',
    required: true
  },
  
  // Email for the reset request
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  
  // OTP fields
  otp: {
    type: String,
    default: undefined
  },
  otpExpiry: {
    type: Date,
    default: undefined
  },
  
  // Reset token fields
  resetToken: {
    type: String,
    default: undefined
  },
  resetTokenExpiry: {
    type: Date,
    default: undefined
  },
  
  // Rate limiting fields
  lastOTPRequest: {
    type: Date,
    default: undefined
  },
  otpRequestCount: {
    type: Number,
    default: 0
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'verified', 'used', 'expired'],
    default: 'pending'
  },
  
  // Additional metadata
  ipAddress: {
    type: String,
    default: undefined
  },
  userAgent: {
    type: String,
    default: undefined
  }
}, {
  timestamps: true
});

// Indexes for better performance
passwordResetSchema.index({ email: 1 });
passwordResetSchema.index({ user: 1 });
passwordResetSchema.index({ resetToken: 1 });
passwordResetSchema.index({ otp: 1 });
passwordResetSchema.index({ status: 1 });
passwordResetSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 }); // Auto-delete after 1 hour

// Method to check if OTP is valid and not expired
passwordResetSchema.methods.isOTPValid = function(providedOTP) {
  if (!this.otp || !this.otpExpiry) {
    return false;
  }
  
  if (this.otp !== providedOTP) {
    return false;
  }
  
  if (new Date() > this.otpExpiry) {
    this.status = 'expired';
    return false;
  }
  
  return true;
};

// Method to check if reset token is valid and not expired
passwordResetSchema.methods.isResetTokenValid = function(providedToken) {
  if (!this.resetToken || !this.resetTokenExpiry) {
    return false;
  }
  
  if (this.resetToken !== providedToken) {
    return false;
  }
  
  if (new Date() > this.resetTokenExpiry) {
    this.status = 'expired';
    return false;
  }
  
  return true;
};

// Method to check rate limiting
passwordResetSchema.methods.canRequestOTP = function() {
  if (!this.lastOTPRequest) {
    return true;
  }
  
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  if (this.lastOTPRequest > oneHourAgo) {
    return this.otpRequestCount < 3;
  }
  
  // Reset counter if more than an hour has passed
  this.otpRequestCount = 0;
  return true;
};

// Method to increment OTP request count
passwordResetSchema.methods.incrementOTPRequest = function() {
  this.lastOTPRequest = new Date();
  this.otpRequestCount = (this.otpRequestCount || 0) + 1;
  return this.save();
};

// Method to mark as verified
passwordResetSchema.methods.markAsVerified = function() {
  this.status = 'verified';
  return this.save();
};

// Method to mark as used
passwordResetSchema.methods.markAsUsed = function() {
  this.status = 'used';
  return this.save();
};

// Static method to find active reset request by email
passwordResetSchema.statics.findActiveByEmail = function(email) {
  return this.findOne({
    email: email.toLowerCase(),
    status: { $in: ['pending', 'verified'] }
  }).populate('user', 'firstName lastName email');
};

// Static method to find by reset token
passwordResetSchema.statics.findByResetToken = function(token) {
  return this.findOne({
    resetToken: token,
    status: { $in: ['pending', 'verified'] }
  }).populate('user', 'firstName lastName email');
};

// Static method to cleanup expired records
passwordResetSchema.statics.cleanupExpired = function() {
  return this.updateMany(
    {
      $or: [
        { otpExpiry: { $lt: new Date() } },
        { resetTokenExpiry: { $lt: new Date() } }
      ],
      status: { $ne: 'used' }
    },
    { status: 'expired' }
  );
};

const PasswordReset = mongoose.models.PasswordReset || mongoose.model("PasswordReset", passwordResetSchema);
export default PasswordReset;





