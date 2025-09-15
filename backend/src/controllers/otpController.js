import { generateOtp } from '../services/otp.service.js';
import { sendEmailVerification } from '../services/email.service.js';
import { setCache, getCache, deleteCache } from '../utils/redis/redis.utils.js';

// Constants
const OTP_EXPIRY = 300; // 5 minutes in seconds
const OTP_PREFIX = 'email_otp:';
const APP_NAME = 'VoxVertex';

/**
 * Generate and send OTP to user's email
 * @route POST /api/auth/send-otp
 */
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: "Email is required" 
      });
    }

    // Generate a 6-digit OTP
    const otp = generateOtp();
    
    // Store OTP in Redis with 5-minute expiration
    const cacheKey = `${OTP_PREFIX}${email}`;
    await setCache(cacheKey, { otp, createdAt: Date.now() }, OTP_EXPIRY);

    // Extract username from email (for personalization)
    const username = email.split('@')[0];
    
    // Prepare email content
    const htmlContent = {
      otp,
      username,
      appName: APP_NAME
    };

    // Send OTP via email
    await sendEmailVerification(
      email,
      "Email Verification - VoxVertex",
      htmlContent
    );

    // Log for development purposes only
    console.log(`[DEV] OTP for ${email}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: "Verification code sent to your email"
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send verification code. Please try again later."
    });
  }
};

/**
 * Verify OTP submitted by user
 * @route POST /api/auth/verify-otp
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required"
      });
    }

    // Get stored OTP from Redis
    const cacheKey = `${OTP_PREFIX}${email}`;
    const storedData = await getCache(cacheKey);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired or doesn't exist. Please request a new one."
      });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code. Please try again."
      });
    }

    // OTP is valid, clean up from Redis
    await deleteCache(cacheKey);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully"
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify email. Please try again later."
    });
  }
};

/**
 * Resend OTP to user's email
 * @route POST /api/auth/resend-otp
 */
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // Delete any existing OTP for this email
    const cacheKey = `${OTP_PREFIX}${email}`;
    await deleteCache(cacheKey);

    // Generate a new OTP
    const otp = generateOtp();
    
    // Store new OTP in Redis with 5-minute expiration
    await setCache(cacheKey, { otp, createdAt: Date.now() }, OTP_EXPIRY);

    // Extract username from email (for personalization)
    const username = email.split('@')[0];
    
    // Prepare email content
    const htmlContent = {
      otp,
      username,
      appName: APP_NAME
    };

    // Send new OTP via email
    await sendEmailVerification(
      email,
      "New Verification Code - VoxVertex",
      htmlContent
    );

    // Log for development purposes only
    console.log(`[DEV] New OTP for ${email}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: "New verification code sent to your email"
    });
  } catch (error) {
    console.error("Error resending OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send new verification code. Please try again later."
    });
  }
};