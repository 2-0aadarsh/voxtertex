import SMSService from '../services/sms.service.js';
import User from '../models/enhancedUser.js';
import redisClient from '../configs/redis.config.js';

/**
 * Send OTP for mobile verification
 * @route POST /api/sms/send-otp
 */
export const sendMobileOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const userId = req.user._id;
    
    // Validate input
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }
    
    console.log(`📱 User ${userId} requesting OTP for ${phoneNumber}`);
    
    // Validate phone number format using Twilio
    const validation = await SMSService.validatePhoneNumber(phoneNumber);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }
    
    // Check if user already has a verified mobile number
    const user = await User.findById(userId);
    if (user && user.isMobileVerified && user.mobileNo === phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'This mobile number is already verified'
      });
    }
    
    // Send OTP
    const result = await SMSService.sendOTP(validation.formattedNumber, 'mobile_verification');
    
    console.log(`✅ OTP sent successfully to ${validation.formattedNumber}`);
    
    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      phoneNumber: validation.formattedNumber,
      expiresIn: result.expiresIn
    });
    
  } catch (error) {
    console.error('❌ Send OTP error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send OTP'
    });
  }
};

/**
 * Verify OTP for mobile verification
 * @route POST /api/sms/verify-otp
 */
export const verifyMobileOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    const userId = req.user._id;
    
    // Validate input
    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }
    
    console.log(`🔍 User ${userId} verifying OTP for ${phoneNumber}`);
    
    // Verify OTP
    const verification = await SMSService.verifyOTP(phoneNumber, otp, 'mobile_verification');
    
    if (!verification.success) {
      return res.status(400).json({
        success: false,
        message: verification.message
      });
    }
    
    // Update user's mobile verification status
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        mobileNo: phoneNumber,
        isMobileVerified: true
      },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log(`✅ Mobile number ${phoneNumber} verified for user ${userId}`);
    
    return res.status(200).json({
      success: true,
      message: 'Mobile number verified successfully',
      user: {
        _id: updatedUser._id,
        mobileNo: updatedUser.mobileNo,
        isMobileVerified: updatedUser.isMobileVerified
      }
    });
    
  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify OTP'
    });
  }
};

/**
 * Send custom SMS message
 * @route POST /api/sms/send-message
 */
export const sendSMSMessage = async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    // Validate input
    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and message are required'
      });
    }
    
    // Validate phone number
    const validation = await SMSService.validatePhoneNumber(phoneNumber);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }
    
    // Send SMS
    const result = await SMSService.sendSMS(validation.formattedNumber, message);
    
    return res.status(200).json({
      success: true,
      message: 'SMS sent successfully',
      messageId: result.messageId
    });
    
  } catch (error) {
    console.error('❌ Send SMS error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send SMS'
    });
  }
};

/**
 * Validate phone number
 * @route POST /api/sms/validate-phone
 */
export const validatePhoneNumber = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }
    
    const validation = await SMSService.validatePhoneNumber(phoneNumber);
    
    return res.status(200).json({
      success: true,
      isValid: validation.isValid,
      phoneNumber: validation.formattedNumber || phoneNumber,
      countryCode: validation.countryCode,
      nationalFormat: validation.nationalFormat,
      error: validation.error
    });
    
  } catch (error) {
    console.error('❌ Phone validation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to validate phone number'
    });
  }
};

/**
 * Debug OTP in Redis
 * @route GET /api/sms/debug-otp/:phoneNumber
 */
export const debugOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    
    const redisKey = `otp:mobile_verification:${formattedNumber}`;
    const storedOTP = await redisClient.get(redisKey);
    
    console.log(`🔍 Debug OTP for: ${phoneNumber}`);
    console.log(`🔍 Formatted: ${formattedNumber}`);
    console.log(`🔍 Redis key: ${redisKey}`);
    console.log(`🔍 Stored OTP: ${storedOTP}`);
    
    return res.status(200).json({
      success: true,
      phoneNumber: phoneNumber,
      formattedNumber: formattedNumber,
      redisKey: redisKey,
      storedOTP: storedOTP,
      exists: !!storedOTP
    });
    
  } catch (error) {
    console.error('❌ Debug OTP error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to debug OTP'
    });
  }
};
