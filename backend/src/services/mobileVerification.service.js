import MobileVerification from '../models/mobileVerification.js';
import EnhancedUser from '../models/enhancedUser.js';
import crypto from 'crypto';

/**
 * Mobile Verification Service
 * Handles OTP generation, verification, and mobile number updates
 */
class MobileVerificationService {
  
  /**
   * Generate and send OTP for mobile verification
   */
  async sendOTP(userId, mobileNo) {
    try {
      // Check if user exists
      const user = await EnhancedUser.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if mobile number is already verified for another user
      const existingVerifiedUser = await EnhancedUser.findOne({
        mobileNo: mobileNo,
        isMobileVerified: true,
        _id: { $ne: userId }
      });

      if (existingVerifiedUser) {
        throw new Error('Mobile number is already verified by another user');
      }

      // Generate 6-digit OTP
      const otp = crypto.randomInt(100000, 999999).toString();

      // Clean up any existing verification records for this user
      await MobileVerification.deleteMany({ userId });

      // Create new verification record
      const verification = new MobileVerification({
        mobileNo,
        otp,
        userId,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      });

      await verification.save();

      // In production, you would send SMS here using services like Twilio, AWS SNS, etc.
      // For development, we'll just log the OTP
      console.log(`📱 OTP for ${mobileNo}: ${otp}`);

      return {
        success: true,
        message: 'OTP sent successfully',
        expiresIn: 10 * 60 * 1000, // 10 minutes in milliseconds
        // In production, don't return the OTP
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      };

    } catch (error) {
      console.error('Send OTP error:', error);
      throw new Error(`Failed to send OTP: ${error.message}`);
    }
  }

  /**
   * Verify OTP and update mobile number
   */
  async verifyOTP(userId, mobileNo, otp) {
    try {
      // Find the verification record
      const verification = await MobileVerification.findOne({
        userId,
        mobileNo,
        otp
      });

      if (!verification) {
        throw new Error('Invalid OTP');
      }

      // Check if verification is still valid
      if (!verification.isValid()) {
        if (verification.attempts >= 3) {
          throw new Error('Maximum attempts exceeded. Please request a new OTP.');
        }
        if (verification.expiresAt <= new Date()) {
          throw new Error('OTP has expired. Please request a new OTP.');
        }
        throw new Error('Invalid OTP');
      }

      // Mark as verified
      await verification.markAsVerified();

      // Update user's mobile number and verification status
      const user = await EnhancedUser.findByIdAndUpdate(
        userId,
        {
          mobileNo: mobileNo,
          isMobileVerified: true
        },
        { new: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      // Clean up verification record
      await MobileVerification.deleteOne({ _id: verification._id });

      return {
        success: true,
        message: 'Mobile number verified successfully',
        user: {
          _id: user._id,
          mobileNo: user.mobileNo,
          isMobileVerified: user.isMobileVerified
        }
      };

    } catch (error) {
      console.error('Verify OTP error:', error);
      
      // Increment attempts if verification record exists
      const verification = await MobileVerification.findOne({
        userId,
        mobileNo
      });
      
      if (verification && !verification.isVerified) {
        await verification.incrementAttempts();
      }

      throw new Error(`Verification failed: ${error.message}`);
    }
  }

  /**
   * Resend OTP
   */
  async resendOTP(userId, mobileNo) {
    try {
      // Check if there's an existing verification record
      const existingVerification = await MobileVerification.findOne({
        userId,
        mobileNo
      });

      if (existingVerification && existingVerification.isVerified) {
        throw new Error('Mobile number is already verified');
      }

      // Clean up existing verification
      if (existingVerification) {
        await MobileVerification.deleteOne({ _id: existingVerification._id });
      }

      // Send new OTP
      return await this.sendOTP(userId, mobileNo);

    } catch (error) {
      console.error('Resend OTP error:', error);
      throw new Error(`Failed to resend OTP: ${error.message}`);
    }
  }

  /**
   * Check mobile verification status
   */
  async getVerificationStatus(userId) {
    try {
      const user = await EnhancedUser.findById(userId).select('mobileNo isMobileVerified');
      
      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        mobileNo: user.mobileNo,
        isMobileVerified: user.isMobileVerified
      };

    } catch (error) {
      console.error('Get verification status error:', error);
      throw new Error(`Failed to get verification status: ${error.message}`);
    }
  }
}

export default new MobileVerificationService();




