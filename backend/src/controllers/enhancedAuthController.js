import UserService from '../services/user.service.js';
import ProfileService from '../services/profile.service.js';
import EnhancedProfile from '../models/enhancedProfile.js';
import { formatName } from '../utils/helpers/stringHelpers.js';
import { generateTokenPair, verifyRefreshToken } from '../utils/tokens/jwt.utils.js';
import { setAuthCookies, clearAuthCookies } from '../utils/cookies/cookie.utils.js';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

/**
 * Enhanced Authentication Controller
 * Handles user registration, login, and profile management
 */

/**
 * Register a new user
 * @route POST /api/auth/register
 */
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role, industry, activities } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, and password are required'
      });
    }
    
    // Validate role
    const validRoles = ['participant', 'speaker', 'organizer'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }
    
    // Prepare role-specific data
    const roleSpecificData = {};
    if (role === 'speaker') {
      roleSpecificData.workEmail = email; // Can be updated later
    }
    if (industry) {
      roleSpecificData.industry = industry;
    }
    if (activities && Array.isArray(activities)) {
      roleSpecificData.activities = activities;
    }
    
    // Create user
    const userData = {
      firstName,
      lastName,
      email,
      mobileNo: phone || null, // Make phone optional
      password,
      role: role || 'participant',
      roleSpecificData
    };
    
    const { user, profile } = await UserService.createUser(userData);
    
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user,
      profile: {
        id: profile._id,
        sections: {
          experience: [],
          education: [],
          awards: [],
          videos: []
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    const user = await UserService.verifyCredentials(email, password);
    
    // Generate JWT tokens
    const tokens = generateTokenPair(user);
    
    // Set secure cookies
    setAuthCookies(res, tokens);
    
    // Get user profile for role-based routing
    const { profile } = await UserService.getUserById(user._id);
    
    // Simple redirect to dashboard for all users
    let redirectUrl = '/dashboard';
    
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        ...user,
        profile: profile ? {
          id: profile._id,
          isComplete: user.isProfileComplete
        } : null
      },
      redirectUrl,
      tokens: {
        accessToken: tokens.accessToken,
        // Don't send refresh token to client (it's in httpOnly cookie)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/profile
 */
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const { user, profile } = await UserService.getUserById(req.user._id);
    
    return res.status(200).json({
      success: true,
      user,
      profile
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update user basic information
 * @route PUT /api/auth/profile/basic
 */
export const updateBasicInfo = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    console.log('📥 Received profile update request:', JSON.stringify(req.body, null, 2));
    
    const allowedFields = [
      'bio', 'professionalTitle', 'location', 'areaOfExpertise', 'roleSpecificData', 'mobileNo', 'yearsOfExperience'
    ];
    
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        // Special handling for areaOfExpertise to ensure it's always an array
        if (field === 'areaOfExpertise') {
          updateData[field] = Array.isArray(req.body[field]) 
            ? req.body[field] 
            : [req.body[field]].filter(Boolean);
        } else {
          updateData[field] = req.body[field];
        }
      }
    });
    
    console.log('🔄 Processed update data:', JSON.stringify(updateData, null, 2));
    
    const user = await UserService.updateUserBasicInfo(req.user._id, updateData);
    
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update basic info error:', error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update profile image
 * @route PUT /api/auth/profile/image
 */

export const updateProfileImage = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }
    
    console.log('📸 Received image upload request:', req.file.originalname, req.file.mimetype, req.file.size);
    
    // Upload to Cloudinary
    try {
      // Create a stream from the buffer
      const stream = Readable.from(req.file.buffer);
      
      // Create a promise to handle the Cloudinary upload
      const cloudinaryUpload = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'profile_images',
            resource_type: 'image',
            public_id: `user_${req.user._id}_${Date.now()}`,
            transformation: [
              { width: 500, height: 500, crop: 'limit' },
              { quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        
        // Pipe the stream to the upload stream
        stream.pipe(uploadStream);
      });
      
      // Wait for the upload to complete
      const uploadResult = await cloudinaryUpload;
      console.log('☁️ Cloudinary upload successful:', uploadResult.secure_url);
      
      // Save the Cloudinary URL to the user's profile
      const imageData = {
        profileImageUrl: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id
      };
      
      const user = await UserService.updateProfileImage(req.user._id, imageData);
      
      return res.status(200).json({
        success: true,
        message: 'Profile image updated successfully',
        user
      });
    } catch (cloudinaryError) {
      console.error('Cloudinary upload error:', cloudinaryError);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image to cloud storage'
      });
    }
  } catch (error) {
    console.error('Update profile image error:', error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Complete signup process (for role-specific data)
 * @route POST /api/auth/complete-signup
 */
export const completeSignup = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const { roleSpecificData, profileData } = req.body;
    
    const signupData = {
      roleSpecificData,
      profileData
    };
    
    const user = await UserService.completeSignup(req.user._id, signupData);
    
    return res.status(200).json({
      success: true,
      message: 'Signup completed successfully',
      user
    });
  } catch (error) {
    console.error('Complete signup error:', error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get user profile by ID (public view)
 * @route GET /api/auth/user/:userId
 */
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { user, profile } = await UserService.getUserById(userId);
    
    // Increment profile views if viewing someone else's profile
    if (req.user && req.user._id.toString() !== userId) {
      await ProfileService.incrementProfileViews(userId);
    }
    
    // Filter sensitive information based on privacy settings
    if (profile && profile.privacy) {
      if (!profile.privacy.showEmail) {
        delete user.email;
      }
      if (!profile.privacy.showPhone) {
        delete user.mobileNo;
      }
    }
    
    return res.status(200).json({
      success: true,
      user,
      profile
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Search users
 * @route GET /api/auth/search
 */
export const searchUsers = async (req, res) => {
  try {
    const { q: query, role, location, page = 1, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const filters = {};
    if (role) filters.role = role;
    if (location) filters.location = location;
    
    const users = await UserService.searchUsers(query, filters);
    
    return res.status(200).json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: users.length
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get users by role
 * @route GET /api/auth/users/:role
 */
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const validRoles = ['participant', 'speaker', 'organizer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }
    
    const users = await UserService.getUsersByRole(role, parseInt(page), parseInt(limit));
    
    return res.status(200).json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: users.length
      }
    });
  } catch (error) {
    console.error('Get users by role error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Logout user
 * @route POST /api/auth/logout
 */
export const logoutUser = async (req, res) => {
  try {
    console.log('🚪 Logout request received for user:', req.user?.email);
    console.log('🍪 Cookies before clearing:', req.cookies);
    
    // Clear authentication cookies
    clearAuthCookies(res);
    
    console.log('🍪 Cookies cleared successfully');
    
    // If using sessions, logout from session too
    if (req.logout) {
      req.logout((err) => {
        if (err) {
          console.error('Session logout error:', err);
        }
      });
    }
    
    console.log('✅ Logout completed successfully');
    
    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Check authentication status
 * @route GET /api/auth/status
 */
export const checkAuthStatus = async (req, res) => {
  try {
    if (req.user) {
      const { user, profile } = await UserService.getUserById(req.user._id);
      
      return res.status(200).json({
        success: true,
        isAuthenticated: true,
        user,
        profile
      });
    } else {
      return res.status(200).json({
        success: true,
        isAuthenticated: false,
        message: 'Not authenticated'
      });
    }
  } catch (error) {
    console.error('Check auth status error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Refresh access token
 * @route POST /api/auth/refresh-token
 */
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided',
        code: 'NO_REFRESH_TOKEN'
      });
    }
    
    const decoded = verifyRefreshToken(refreshToken);
    const { user } = await UserService.getUserById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Generate new token pair
    const tokens = generateTokenPair(user);
    
    // Set new cookies
    setAuthCookies(res, tokens);
    
    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      tokens: {
        accessToken: tokens.accessToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    clearAuthCookies(res);
    
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
      code: 'INVALID_REFRESH_TOKEN'
    });
  }
};

/**
 * Validate current token and get user info
 * @route GET /api/auth/validate
 */
export const validateToken = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }
    
    const { profile } = await UserService.getUserById(req.user._id);
    
    // Determine redirect URL based on user role (skip profile completion check)
    let redirectUrl = '/dashboard';
    
    switch (req.user.role) {
      case 'speaker':
        redirectUrl = '/speakerUser';
        break;
      case 'organizer':
        redirectUrl = '/newuser';
        break;
      case 'participant':
        redirectUrl = '/participant';
        break;
      default:
        redirectUrl = '/dashboard';
    }
    
    return res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: {
        ...req.user,
        profile: profile ? {
          id: profile._id,
          isComplete: req.user.isProfileComplete
        } : null
      },
      redirectUrl,
      tokenRefreshed: req.tokenData?.refreshed || false
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get enhanced profile data
 * @route GET /api/auth/profile/enhanced
 */
export const getEnhancedProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const profile = await EnhancedProfile.findOne({ user: req.user._id });
    
    if (!profile) {
      // Create a new profile if it doesn't exist
      const newProfile = new EnhancedProfile({ user: req.user._id });
      await newProfile.save();
      
      return res.status(200).json({
        success: true,
        data: newProfile
      });
    }
    
    return res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get enhanced profile error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Deactivate user account
 * @route DELETE /api/auth/account
 */
export const deactivateAccount = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    await UserService.deactivateUser(req.user._id);
    
    // Clear authentication cookies
    clearAuthCookies(res);
    
    // Logout from session if exists
    if (req.logout) {
      req.logout((err) => {
        if (err) {
          console.error('Logout after deactivation error:', err);
        }
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate account error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
