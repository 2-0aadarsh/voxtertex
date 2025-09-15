const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * SMS Service for frontend
 */
class SMSService {
  /**
   * Validate phone number format
   * @param {string} phoneNumber - The phone number to validate
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  static async validatePhoneNumber(phoneNumber) {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/validate-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to validate phone number'
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Phone validation error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.'
      };
    }
  }

  /**
   * Send OTP to phone number
   * @param {string} phoneNumber - The phone number to send OTP to
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  static async sendOTP(phoneNumber) {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to send OTP'
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Send OTP error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.'
      };
    }
  }

  /**
   * Verify OTP
   * @param {string} phoneNumber - The phone number
   * @param {string} otp - The OTP to verify
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  static async verifyOTP(phoneNumber, otp) {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ phoneNumber, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to verify OTP'
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Verify OTP error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.'
      };
    }
  }

  /**
   * Send custom SMS message
   * @param {string} phoneNumber - The phone number to send SMS to
   * @param {string} message - The message to send
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  static async sendSMS(phoneNumber, message) {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ phoneNumber, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to send SMS'
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Send SMS error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.'
      };
    }
  }
}

export default SMSService;

