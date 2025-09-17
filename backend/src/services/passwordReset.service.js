import PasswordReset from '../models/passwordReset.js';
import { setCache, getCache, deleteCache } from '../utils/redis/redis.utils.js';
import { generateOtp } from './otp.service.js';
import crypto from 'crypto';

/**
 * Password Reset Service
 * Handles all password reset related operations with Redis caching
 */
class PasswordResetService {
  
  /**
   * Create a new password reset request
   */
  async createResetRequest(user, ipAddress = null, userAgent = null) {
    try {
      // Clean up any existing pending requests for this user
      await this.cleanupExistingRequests(user.email);
      
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      
      // Create password reset record
      const resetRequest = new PasswordReset({
        user: user._id,
        email: user.email.toLowerCase(),
        resetToken,
        resetTokenExpiry,
        status: 'pending',
        ipAddress,
        userAgent
      });
      
      await resetRequest.save();
      
      // Store in Redis for faster access
      const resetTokenKey = `reset_token:${user.email.toLowerCase()}`;
      const tokenData = {
        token: resetToken,
        email: user.email.toLowerCase(),
        userId: user._id.toString(),
        resetRequestId: resetRequest._id.toString(),
        createdAt: new Date().toISOString(),
        expiresAt: resetTokenExpiry.toISOString()
      };
      
      await setCache(resetTokenKey, tokenData, 15 * 60); // 15 minutes
      
      return {
        resetRequest,
        resetToken,
        resetLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`
      };
    } catch (error) {
      throw new Error(`Failed to create reset request: ${error.message}`);
    }
  }
  
  /**
   * Create an OTP-based reset request
   */
  async createOTPRequest(user, ipAddress = null, userAgent = null) {
    try {
      // Check rate limiting
      const existingRequest = await PasswordReset.findActiveByEmail(user.email);
      if (existingRequest && !existingRequest.canRequestOTP()) {
        throw new Error('Too many OTP requests. Please try again later.');
      }
      
      // Clean up any existing pending requests for this user
      await this.cleanupExistingRequests(user.email);
      
      // Generate OTP
      const otp = generateOtp();
      const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      
      // Create or update password reset record
      let resetRequest;
      if (existingRequest) {
        resetRequest = existingRequest;
        resetRequest.otp = otp;
        resetRequest.otpExpiry = otpExpiry;
        resetRequest.status = 'pending';
        resetRequest.ipAddress = ipAddress;
        resetRequest.userAgent = userAgent;
        await resetRequest.incrementOTPRequest();
      } else {
        resetRequest = new PasswordReset({
          user: user._id,
          email: user.email.toLowerCase(),
          otp,
          otpExpiry,
          status: 'pending',
          ipAddress,
          userAgent
        });
        await resetRequest.save();
      }
      
      // Store in Redis for faster access
      const otpKey = `reset_otp:${user.email.toLowerCase()}`;
      const otpData = {
        otp: otp,
        email: user.email.toLowerCase(),
        userId: user._id.toString(),
        resetRequestId: resetRequest._id.toString(),
        createdAt: new Date().toISOString(),
        expiresAt: otpExpiry.toISOString()
      };
      
      await setCache(otpKey, otpData, 15 * 60); // 15 minutes
      
      return {
        resetRequest,
        otp
      };
    } catch (error) {
      throw new Error(`Failed to create OTP request: ${error.message}`);
    }
  }
  
  /**
   * Verify OTP and generate reset token
   */
  async verifyOTP(email, otp) {
    try {
      // Check Redis first
      const otpKey = `reset_otp:${email.toLowerCase()}`;
      const redisOtpData = await getCache(otpKey);
      
      let resetRequest;
      let isValidOtp = false;
      
      if (redisOtpData) {
        // Verify Redis OTP
        if (redisOtpData.otp === otp) {
          const now = new Date();
          const otpExpiry = new Date(redisOtpData.expiresAt);
          if (now <= otpExpiry) {
            isValidOtp = true;
            resetRequest = await PasswordReset.findById(redisOtpData.resetRequestId);
          } else {
            // Clean up expired OTP
            await deleteCache(otpKey);
            throw new Error('OTP has expired');
          }
        }
      } else {
        // Fallback to database
        resetRequest = await PasswordReset.findActiveByEmail(email);
        if (resetRequest && resetRequest.isOTPValid(otp)) {
          isValidOtp = true;
        }
      }
      
      if (!isValidOtp || !resetRequest) {
        throw new Error('Invalid OTP');
      }
      
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      // Update reset request
      resetRequest.resetToken = resetToken;
      resetRequest.resetTokenExpiry = resetTokenExpiry;
      resetRequest.status = 'verified';
      await resetRequest.save();
      
      // Store in Redis
      const resetTokenKey = `reset_token:${email.toLowerCase()}`;
      const tokenData = {
        token: resetToken,
        email: email.toLowerCase(),
        userId: resetRequest.user._id.toString(),
        resetRequestId: resetRequest._id.toString(),
        createdAt: new Date().toISOString(),
        expiresAt: resetTokenExpiry.toISOString()
      };
      
      await setCache(resetTokenKey, tokenData, 10 * 60); // 10 minutes
      
      // Clean up OTP from Redis
      await deleteCache(otpKey);
      
      return {
        resetRequest,
        resetToken
      };
    } catch (error) {
      throw new Error(`Failed to verify OTP: ${error.message}`);
    }
  }
  
  /**
   * Verify reset token
   */
  async verifyResetToken(email, token) {
    try {
      // Check Redis first
      const resetTokenKey = `reset_token:${email.toLowerCase()}`;
      const redisTokenData = await getCache(resetTokenKey);
      
      let resetRequest;
      let isValidToken = false;
      
      if (redisTokenData) {
        // Verify Redis token
        if (redisTokenData.token === token) {
          const now = new Date();
          const tokenExpiry = new Date(redisTokenData.expiresAt);
          if (now <= tokenExpiry) {
            isValidToken = true;
            resetRequest = await PasswordReset.findById(redisTokenData.resetRequestId).populate('user');
          } else {
            // Clean up expired token
            await deleteCache(resetTokenKey);
            throw new Error('Reset token has expired');
          }
        }
      } else {
        // Fallback to database
        resetRequest = await PasswordReset.findByResetToken(token);
        if (resetRequest && resetRequest.isResetTokenValid(token)) {
          isValidToken = true;
        }
      }
      
      if (!isValidToken || !resetRequest) {
        throw new Error('Invalid reset token');
      }
      
      return resetRequest;
    } catch (error) {
      throw new Error(`Failed to verify reset token: ${error.message}`);
    }
  }
  
  /**
   * Mark reset request as used
   */
  async markAsUsed(email, token) {
    try {
      const resetRequest = await this.verifyResetToken(email, token);
      
      // Mark as used
      await resetRequest.markAsUsed();
      
      // Clean up from Redis
      const resetTokenKey = `reset_token:${email.toLowerCase()}`;
      await deleteCache(resetTokenKey);
      
      return resetRequest;
    } catch (error) {
      throw new Error(`Failed to mark as used: ${error.message}`);
    }
  }
  
  /**
   * Clean up existing requests for an email
   */
  async cleanupExistingRequests(email) {
    try {
      // Mark existing requests as expired
      await PasswordReset.updateMany(
        {
          email: email.toLowerCase(),
          status: { $in: ['pending', 'verified'] }
        },
        { status: 'expired' }
      );
      
      // Clean up from Redis
      const resetTokenKey = `reset_token:${email.toLowerCase()}`;
      const otpKey = `reset_otp:${email.toLowerCase()}`;
      await Promise.all([
        deleteCache(resetTokenKey),
        deleteCache(otpKey)
      ]);
    } catch (error) {
      console.error('Failed to cleanup existing requests:', error);
    }
  }
  
  /**
   * Get reset request by email
   */
  async getResetRequestByEmail(email) {
    try {
      return await PasswordReset.findActiveByEmail(email);
    } catch (error) {
      throw new Error(`Failed to get reset request: ${error.message}`);
    }
  }
  
  /**
   * Cleanup expired records (can be called by a cron job)
   */
  async cleanupExpiredRecords() {
    try {
      const result = await PasswordReset.cleanupExpired();
      console.log(`Cleaned up ${result.modifiedCount} expired password reset records`);
      return result;
    } catch (error) {
      console.error('Failed to cleanup expired records:', error);
      throw error;
    }
  }
}

export default new PasswordResetService();




