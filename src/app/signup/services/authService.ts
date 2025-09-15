import { SignupResponse } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Register a new user
 */
export const registerUser = async (userData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role?: string;
  industry?: string;
  activities?: string[];
}): Promise<SignupResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      // Try to parse error response as JSON, fallback to status text
      let errorMessage = 'Registration failed. Please try again.';
      
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          // If not JSON, use status text or a generic message
          errorMessage = response.statusText || errorMessage;
        }
      } catch (parseError) {
        // If JSON parsing fails, use a generic message based on status code
        if (response.status === 404) {
          errorMessage = 'Registration service is currently unavailable. Please try again later.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error occurred. Please try again later.';
        } else {
          errorMessage = 'Registration failed. Please check your information and try again.';
        }
      }
      
      throw new Error(errorMessage);
    }

    // Parse successful response
    const data = await response.json();
    return data;
  } catch (error) {
    // Re-throw known errors, wrap unknown errors
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred. Please check your connection and try again.');
  }
};

/**
 * Send OTP to user's email for verification
 */
export const sendOtp = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to send verification code. Please try again.';
      
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        }
      } catch (parseError) {
        if (response.status === 404) {
          errorMessage = 'Verification service is currently unavailable. Please try again later.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error occurred. Please try again later.';
        }
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred. Please check your connection and try again.');
  }
};

/**
 * Verify OTP sent to user's email
 */
export const verifyOtp = async (email: string, otp: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, otp }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Invalid OTP');
  }

  return data;
};

/**
 * Resend OTP to user's email
 */
export const resendOtp = async (email: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to resend OTP');
  }

  return data;
};
