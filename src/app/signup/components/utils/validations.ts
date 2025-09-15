/**
 * Email validation using regex pattern
 */
export const isEmailValid = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password validation - at least 6 characters with uppercase, lowercase, and special character
 */
export const isPasswordValid = (password: string): boolean => {
  // For backend compatibility, password must have uppercase, lowercase, and special character
  return password.length >= 6 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /[!@#$%^&*(),.?":{}|<>]/.test(password);
};

/**
 * Phone validation - basic format check
 */
export const isPhoneValid = (phone: string): boolean => {
  // Allow digits, spaces, dashes, parentheses, and plus sign
  return /^[0-9\s\-\(\)\+]{10,15}$/.test(phone);
};

/**
 * OTP validation - must be 6 digits
 */
export const isOtpValid = (otp: string[]): boolean => {
  return otp.join("").length === 6 && /^\d{6}$/.test(otp.join(""));
};
