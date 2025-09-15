/**
 * Mobile Verification Service
 * Handles API calls for mobile number verification
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Send OTP to mobile number
 */
export const sendMobileOTP = async (mobileNo) => {
  try {
    const response = await fetch(`${API_BASE_URL}/mobile-verification/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify({ mobileNo }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send OTP');
    }

    return data;
  } catch (error) {
    console.error('Send mobile OTP error:', error);
    throw error;
  }
};

/**
 * Verify OTP for mobile number
 */
export const verifyMobileOTP = async (mobileNo, otp) => {
  try {
    const response = await fetch(`${API_BASE_URL}/mobile-verification/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify({ mobileNo, otp }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify OTP');
    }

    return data;
  } catch (error) {
    console.error('Verify mobile OTP error:', error);
    throw error;
  }
};

/**
 * Resend OTP to mobile number
 */
export const resendMobileOTP = async (mobileNo) => {
  try {
    const response = await fetch(`${API_BASE_URL}/mobile-verification/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify({ mobileNo }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to resend OTP');
    }

    return data;
  } catch (error) {
    console.error('Resend mobile OTP error:', error);
    throw error;
  }
};

/**
 * Get mobile verification status
 */
export const getMobileVerificationStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/mobile-verification/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get verification status');
    }

    return data;
  } catch (error) {
    console.error('Get mobile verification status error:', error);
    throw error;
  }
};




