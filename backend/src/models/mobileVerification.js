import mongoose from "mongoose";

// Mobile Verification Schema for OTP management
const mobileVerificationSchema = new mongoose.Schema({
  mobileNo: {
    type: String,
    required: true,
    trim: true
  },
  otp: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedUser',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for cleanup and performance
mobileVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
mobileVerificationSchema.index({ mobileNo: 1, userId: 1 });

// Method to check if OTP is valid and not expired
mobileVerificationSchema.methods.isValid = function() {
  return !this.isVerified && this.expiresAt > new Date() && this.attempts < 3;
};

// Method to increment attempts
mobileVerificationSchema.methods.incrementAttempts = function() {
  this.attempts += 1;
  return this.save();
};

// Method to mark as verified
mobileVerificationSchema.methods.markAsVerified = function() {
  this.isVerified = true;
  this.verifiedAt = new Date();
  return this.save();
};

const MobileVerification = mongoose.models.MobileVerification || mongoose.model("MobileVerification", mobileVerificationSchema);
export default MobileVerification;




