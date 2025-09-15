import { Router } from 'express';
import { authenticateJWT } from '../middleware/jwtAuth.js';
import { 
  sendMobileOTP, 
  verifyMobileOTP, 
  sendSMSMessage, 
  validatePhoneNumber,
  debugOTP
} from '../controllers/smsController.js';

const router = Router();

/**
 * @route POST /api/sms/send-otp
 * @desc Send OTP for mobile verification
 * @access Private
 */
router.post('/send-otp', authenticateJWT, sendMobileOTP);

/**
 * @route POST /api/sms/verify-otp
 * @desc Verify OTP for mobile verification
 * @access Private
 */
router.post('/verify-otp', authenticateJWT, verifyMobileOTP);

/**
 * @route POST /api/sms/send-message
 * @desc Send custom SMS message
 * @access Private
 */
router.post('/send-message', authenticateJWT, sendSMSMessage);

/**
 * @route POST /api/sms/validate-phone
 * @desc Validate phone number format
 * @access Private
 */
router.post('/validate-phone', authenticateJWT, validatePhoneNumber);

/**
 * @route GET /api/sms/debug-otp/:phoneNumber
 * @desc Debug OTP in Redis
 * @access Private
 */
router.get('/debug-otp/:phoneNumber', authenticateJWT, debugOTP);

export default router;
