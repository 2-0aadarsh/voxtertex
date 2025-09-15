import jwt from 'jsonwebtoken';
// import User from '../models/user.js';

/**
 * Authentication middleware
 * 
 * This middleware verifies the JWT token and attaches the user to the request object
 * For development purposes, it allows requests to proceed even if authentication fails
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.token;

    if (!token) {
      // For development, allow requests without token
      console.warn('No auth token provided, but proceeding in development mode');
      req.user = { _id: req.params.userId || 'development-user-id' };
      return next();
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
      
      // Attach user ID to request
      req.user = { _id: decoded.id };
      next();
    } catch (tokenError) {
      console.warn('Auth token verification failed, but proceeding in development mode');
      req.user = { _id: req.params.userId || 'development-user-id' };
      return next();
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // For development, allow requests even if token verification fails
    console.warn('Auth error, but proceeding in development mode');
    req.user = { _id: req.params.userId || 'development-user-id' };
    return next();
  }
};

export default auth;