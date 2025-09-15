/**
 * Custom CORS middleware to ensure all responses have proper CORS headers
 */

const corsMiddleware = (req, res, next) => {
  // Allow requests from these origins
  const allowedOrigins = [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:5000',
    'http://localhost'
  ];
  
  const origin = req.headers.origin;
  
  // Check if the request origin is in our allowed list
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // For development, allow all origins
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  // Allow credentials
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Allow these headers
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Allow these methods
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Continue to the next middleware
  next();
};

export default corsMiddleware;
