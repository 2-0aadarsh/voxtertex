import { verifyAccessToken, verifyRefreshToken, generateTokenPair } from '../utils/tokens/jwt.utils.js';
import { setAuthCookies, setAllAuthCookies } from '../utils/cookies/cookie.utils.js';
import UserService from '../services/user.service.js';

/**
 * JWT Authentication Middleware
 * Verifies access token and refreshes if necessary
 */
export const authenticateJWT = async (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    const accessToken = req.cookies.accessToken || 
                       req.header('Authorization')?.replace('Bearer ', '');
    const refreshToken = req.cookies.refreshToken;

    // If no tokens provided
    if (!accessToken && !refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'NO_TOKEN'
      });
    }

    // Try to verify access token first
    if (accessToken) {
      try {
        const decoded = verifyAccessToken(accessToken);
        
        // Get fresh user data
        const { user } = await UserService.getUserById(decoded.id);
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'User not found',
            code: 'USER_NOT_FOUND'
          });
        }

        req.user = user;
        req.tokenData = decoded;
        return next();
      } catch (accessError) {
        // Access token is invalid/expired, try refresh token
        console.log('Access token invalid, trying refresh token');
      }
    }

    // If access token failed, try refresh token
    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        
        // Get fresh user data
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
        
        // Set new cookies including user role
        setAllAuthCookies(res, tokens, user);
        
        req.user = user;
        req.tokenData = { ...decoded, refreshed: true };
        return next();
      } catch (refreshError) {
        return res.status(401).json({
          success: false,
          message: 'Session expired. Please login again.',
          code: 'TOKEN_EXPIRED'
        });
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid authentication',
      code: 'INVALID_TOKEN'
    });
  } catch (error) {
    console.error('JWT Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Optional JWT Authentication Middleware
 * Doesn't fail if no token, but sets user if valid token exists
 */
export const optionalAuthenticateJWT = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    
    if (accessToken) {
      try {
        const decoded = verifyAccessToken(accessToken);
        const { user } = await UserService.getUserById(decoded.id);
        
        if (user) {
          req.user = user;
          req.tokenData = decoded;
        }
      } catch (error) {
        // Silently fail for optional auth
        console.log('Optional auth failed:', error.message);
      }
    }
    
    return next();
  } catch (error) {
    console.error('Optional JWT Authentication error:', error);
    return next(); // Continue without authentication
  }
};

/**
 * Role-based Authorization Middleware
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "NO_AUTH"
      });
    }

    // Convert both required roles and user's role to lowercase
    const allowedRoles = roles.map(role => role.toLowerCase());
    const userRole = req.user.role?.toLowerCase();

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
        code: "INSUFFICIENT_PERMISSIONS",
        required: roles,
        current: req.user.role
      });
    }

    return next();
  };
};


/**
 * Check if user profile is complete
 */
export const requireCompleteProfile = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'NO_AUTH'
    });
  }

  if (!req.user.isProfileComplete) {
    return res.status(403).json({
      success: false,
      message: 'Profile completion required',
      code: 'PROFILE_INCOMPLETE'
    });
  }

  return next();
};

/**
 * Check if email is verified
 */
export const requireVerifiedEmail = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'NO_AUTH'
    });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required',
      code: 'EMAIL_NOT_VERIFIED'
    });
  }

  return next();
};


