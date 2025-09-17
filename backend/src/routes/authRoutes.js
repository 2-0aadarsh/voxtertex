import express from 'express';
import auth from '../middleware/auth.js';
import { authenticateJWT } from '../middleware/jwtAuth.js';
import { registerUser, loginUser, getCurrentUser, validateToken, refreshToken, logoutUser, updateBasicInfo, updateProfileImage, getEnhancedProfile, forgotPassword, verifyResetOTP, resendResetOTP, resetPassword, testEmail } from '../controllers/enhancedAuthController.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only images
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, JPG, and WebP images are allowed.'), false);
    }
  }
});

/**
 * @route   GET /api/auth/current-user
 * @desc    Get current user ID from token
 * @access  Private
 */
router.get('/current-user', auth, async (req, res) => {
  try {
    // If we get here, auth middleware has already verified the token
    // and attached the user ID to req.user
    
    // For development, if using the hardcoded user ID, return the real one
    if (req.user._id === 'development-user-id') {
      // Return a real user ID for development purposes
      return res.status(200).json({ 
        userId: '68b9b01bc8481ddc55fbd1f2', // Your actual user ID
        message: 'Development user ID' 
      });
    }
    
    // Return the user ID from the token
    return res.status(200).json({ 
      userId: req.user._id,
      message: 'User ID retrieved successfully' 
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/auth/login-jwt
 * @desc    Login user with JWT
 * @access  Public
 */
router.post('/login-jwt', loginUser);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticateJWT, getCurrentUser);

/**
 * @route   GET /api/auth/validate
 * @desc    Validate current token and get user info
 * @access  Private
 */
router.get('/validate', authenticateJWT, validateToken);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Private
 */
router.post('/refresh-token', refreshToken);

/**
 * @route   POST /api/auth/logout-jwt
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout-jwt', authenticateJWT, logoutUser);

/**
 * @route   PUT /api/auth/profile/basic
 * @desc    Update user basic information
 * @access  Private
 */
router.put('/profile/basic', authenticateJWT, updateBasicInfo);

/**
 * @route   PUT /api/auth/profile/image
 * @desc    Update user profile image
 * @access  Private
 */
router.put('/profile/image', authenticateJWT, upload.single('image'), updateProfileImage);

/**
 * @route   GET /api/auth/profile/enhanced
 * @desc    Get enhanced profile data including yearsOfExperience
 * @access  Private
 */
router.get('/profile/enhanced', authenticateJWT, getEnhancedProfile);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset OTP to user's email
 * @access  Public
 */
router.post('/forgot-password', forgotPassword);

/**
 * @route   POST /api/auth/verify-reset-otp
 * @desc    Verify password reset OTP
 * @access  Public
 */
router.post('/verify-reset-otp', verifyResetOTP);

/**
 * @route   POST /api/auth/resend-reset-otp
 * @desc    Resend password reset OTP
 * @access  Public
 */
router.post('/resend-reset-otp', resendResetOTP);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset user password with token
 * @access  Public
 */
router.post('/reset-password', resetPassword);

/**
 * @route   POST /api/auth/test-email
 * @desc    Test email functionality
 * @access  Public
 */
router.post('/test-email', testEmail);

export default router;