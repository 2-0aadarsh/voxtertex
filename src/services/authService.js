/**
 * Authentication Service
 * Handles user authentication and session management
 */

// Base API URL - should be configured from environment variables in production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Get the current user ID from the server
 * @returns {Promise<string>} - Promise with the user ID
 */
export const getCurrentUserId = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/current-user`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'include' // Important for sending cookies
    });
    
    if (!response.ok) {
      console.warn('Failed to get current user ID, using development fallback');
      return 'current-user-id'; // Fallback for development
    }
    
    const data = await response.json();
    return data.userId;
  } catch (error) {
    console.error('Error fetching current user ID:', error);
    return 'current-user-id'; // Fallback for development
  }
};

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} - Promise with authentication status
 */
export const isAuthenticated = async () => {
  try {
    const userId = await getCurrentUserId();
    return userId !== 'current-user-id';
  } catch (error) {
    return false;
  }
};

/**
 * Get the real user ID or fallback to development ID
 * This is a utility function to handle both authenticated and development scenarios
 * @returns {Promise<string>} - Promise with the user ID
 */
export const getUserId = async () => {
  // For development, you can uncomment this to force using the real user ID
  // return "68b9b01bc8481ddc55fbd1f2";
  
  try {
    const userId = await getCurrentUserId();
    return userId;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return 'current-user-id'; // Fallback for development
  }
};
