import { client, TWILIO_PHONE_NUMBER } from '../configs/twilio.config.js';
import { generateOtp } from './otp.service.js';
import redisClient from '../configs/redis.config.js';

/**
 * SMS Service for sending OTP and other SMS messages
 */
class SMSService {
  /**
   * Send OTP via SMS
   * @param {string} phoneNumber - The phone number to send OTP to
   * @param {string} purpose - Purpose of OTP (e.g., 'mobile_verification')
   * @returns {Promise<{success: boolean, otp: string, messageId: string}>}
   */
  static async sendOTP(phoneNumber, purpose = 'mobile_verification') {
    try {
      // Generate 6-digit OTP
      const otp = generateOtp();
      
      // Create OTP message
      const message = `Your VoxVertex verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`;
      
      console.log(`📱 Sending OTP to ${phoneNumber} for ${purpose}`);
      
      // Check if Twilio is configured with a valid phone number
      const isInvalidTwilioNumber = !TWILIO_PHONE_NUMBER || 
                                   TWILIO_PHONE_NUMBER.length < 10 ||
                                   !TWILIO_PHONE_NUMBER.startsWith('+');
      
      if (!client || isInvalidTwilioNumber) {
        console.warn('⚠️ Twilio not properly configured or invalid phone number, simulating SMS send');
        console.log(`📱 [SIMULATED] SMS to ${phoneNumber}: ${message}`);
        console.log(`📱 [SIMULATED] OTP: ${otp}`);
        console.log(`📱 [SIMULATED] Reason: ${!client ? 'No Twilio client' : 'Invalid Twilio phone number'}`);
        
        // Store OTP in Redis with 10-minute expiration
        const redisKey = `otp:${purpose}:${phoneNumber}`;
        await redisClient.setex(redisKey, 600, otp); // 600 seconds = 10 minutes
        
        console.log(`💾 OTP stored in Redis with key: ${redisKey}`);
        console.log(`💾 Stored OTP value: ${otp}`);
        console.log(`💾 Expiration: 600 seconds (10 minutes)`);
        
        return {
          success: true,
          otp: otp, // Return OTP for testing
          messageId: 'simulated-' + Date.now(),
          expiresIn: 600 // 10 minutes in seconds
        };
      }
      
      // Try to send SMS via Twilio
      try {
        const messageResponse = await client.messages.create({
          body: message,
          from: TWILIO_PHONE_NUMBER,
          to: phoneNumber
        });
        
        console.log(`✅ SMS sent successfully. Message SID: ${messageResponse.sid}`);
        
        // Store OTP in Redis with 10-minute expiration
        const redisKey = `otp:${purpose}:${phoneNumber}`;
        await redisClient.setex(redisKey, 600, otp); // 600 seconds = 10 minutes
        
        console.log(`💾 OTP stored in Redis with key: ${redisKey}`);
        console.log(`💾 Stored OTP value: ${otp}`);
        console.log(`💾 Expiration: 600 seconds (10 minutes)`);
        
        return {
          success: true,
          otp: otp, // Return OTP for testing (remove in production)
          messageId: messageResponse.sid,
          expiresIn: 600 // 10 minutes in seconds
        };
      } catch (twilioError) {
        // If Twilio fails, fallback to simulation mode
        console.warn('⚠️ Twilio SMS failed, falling back to simulation mode');
        console.warn('⚠️ Twilio error:', twilioError.message);
        console.log(`📱 [SIMULATED] SMS to ${phoneNumber}: ${message}`);
        console.log(`📱 [SIMULATED] OTP: ${otp}`);
        
        // Store OTP in Redis with 10-minute expiration
        const redisKey = `otp:${purpose}:${phoneNumber}`;
        await redisClient.setex(redisKey, 600, otp); // 600 seconds = 10 minutes
        
        console.log(`💾 OTP stored in Redis with key: ${redisKey}`);
        console.log(`💾 Stored OTP value: ${otp}`);
        console.log(`💾 Expiration: 600 seconds (10 minutes)`);
        
        return {
          success: true,
          otp: otp, // Return OTP for testing
          messageId: 'simulated-' + Date.now(),
          expiresIn: 600 // 10 minutes in seconds
        };
      }
      
    } catch (error) {
      console.error('❌ Failed to send SMS:', error);
      
      // If it's a Twilio error about invalid phone number, try simulation mode
      if (error.message && error.message.includes('not a Twilio phone number')) {
        console.warn('⚠️ Invalid Twilio phone number detected, using simulation mode');
        console.log(`📱 [SIMULATED] SMS to ${phoneNumber}: Your VoxVertex verification code is: ${generateOtp()}`);
        
        // Store OTP in Redis with 10-minute expiration
        const otp = generateOtp();
        const redisKey = `otp:${purpose}:${phoneNumber}`;
        await redisClient.setex(redisKey, 600, otp);
        
        console.log(`💾 OTP stored in Redis with key: ${redisKey}`);
        console.log(`💾 Stored OTP value: ${otp}`);
        console.log(`💾 Expiration: 600 seconds (10 minutes)`);
        
        return {
          success: true,
          otp: otp,
          messageId: 'simulated-' + Date.now(),
          expiresIn: 600
        };
      }
      
      // Handle other specific Twilio errors
      if (error.code) {
        switch (error.code) {
          case 21211:
            throw new Error('Invalid phone number format');
          case 21408:
            throw new Error('Permission to send SMS to this number is denied');
          case 21610:
            throw new Error('Phone number is not a valid mobile number');
          case 21614:
            throw new Error('Phone number is not a valid mobile number');
          default:
            throw new Error(`SMS sending failed: ${error.message}`);
        }
      }
      
      throw new Error('Failed to send SMS. Please try again.');
    }
  }
  
  /**
   * Verify OTP
   * @param {string} phoneNumber - The phone number
   * @param {string} otp - The OTP to verify
   * @param {string} purpose - Purpose of OTP verification
   * @returns {Promise<{success: boolean, message: string}>}
   */
  static async verifyOTP(phoneNumber, otp, purpose = 'mobile_verification') {
    try {
      // Format the phone number to match the stored format
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const redisKey = `otp:${purpose}:${formattedNumber}`;
      
      console.log(`🔍 Verifying OTP for: ${phoneNumber} -> ${formattedNumber}`);
      console.log(`🔍 Redis key: ${redisKey}`);
      console.log(`🔍 OTP to verify: ${otp}`);
      
      const storedOTP = await redisClient.get(redisKey);
      console.log(`🔍 Stored OTP: ${storedOTP}`);
      
      if (!storedOTP) {
        console.log(`❌ No OTP found in Redis for key: ${redisKey}`);
        
        // Try to find OTP with different phone number formats
        const alternativeKeys = [
          `otp:${purpose}:${phoneNumber}`,
          `otp:${purpose}:+91${phoneNumber.replace(/^\+91/, '')}`,
          `otp:${purpose}:${phoneNumber.replace(/^\+91/, '')}`
        ];
        
        console.log(`🔍 Trying alternative keys:`, alternativeKeys);
        
        for (const altKey of alternativeKeys) {
          const altOTP = await redisClient.get(altKey);
          if (altOTP) {
            console.log(`✅ Found OTP with alternative key: ${altKey}`);
            console.log(`🔍 Alternative stored OTP: ${altOTP}`);
            
            if (altOTP === otp) {
              // OTP is valid, remove it from Redis
              await redisClient.del(altKey);
              console.log(`✅ OTP verified successfully for ${phoneNumber}`);
              return {
                success: true,
                message: 'OTP verified successfully'
              };
            } else {
              return {
                success: false,
                message: 'Invalid OTP'
              };
            }
          }
        }
        
        return {
          success: false,
          message: 'OTP has expired or does not exist'
        };
      }
      
      if (storedOTP !== otp) {
        console.log(`❌ OTP mismatch: stored=${storedOTP}, provided=${otp}`);
        return {
          success: false,
          message: 'Invalid OTP'
        };
      }
      
      // OTP is valid, remove it from Redis
      await redisClient.del(redisKey);
      
      console.log(`✅ OTP verified successfully for ${phoneNumber}`);
      
      return {
        success: true,
        message: 'OTP verified successfully'
      };
      
    } catch (error) {
      console.error('❌ OTP verification failed:', error);
      throw new Error('OTP verification failed. Please try again.');
    }
  }
  
  /**
   * Send custom SMS message
   * @param {string} phoneNumber - The phone number to send SMS to
   * @param {string} message - The message to send
   * @returns {Promise<{success: boolean, messageId: string}>}
   */
  static async sendSMS(phoneNumber, message) {
    try {
      console.log(`📱 Sending SMS to ${phoneNumber}`);
      
      const messageResponse = await client.messages.create({
        body: message,
        from: TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      
      console.log(`✅ SMS sent successfully. Message SID: ${messageResponse.sid}`);
      
      return {
        success: true,
        messageId: messageResponse.sid
      };
      
    } catch (error) {
      console.error('❌ Failed to send SMS:', error);
      throw new Error('Failed to send SMS. Please try again.');
    }
  }
  
  /**
   * Format phone number with country code if missing
   * @param {string} phoneNumber - The phone number to format
   * @returns {string} - Formatted phone number
   */
  static formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // If it starts with 91 (India country code), add +
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return `+${cleaned}`;
    }
    
    // If it's a 10-digit Indian number, add +91
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }
    
    // If it already has +, return as is
    if (phoneNumber.startsWith('+')) {
      return phoneNumber;
    }
    
    // If it starts with country code without +, add +
    if (cleaned.length > 10) {
      return `+${cleaned}`;
    }
    
    // Return original if we can't determine format
    return phoneNumber;
  }

  /**
   * Check if phone number is valid
   * @param {string} phoneNumber - The phone number to validate
   * @returns {Promise<{isValid: boolean, formattedNumber: string}>}
   */
  static async validatePhoneNumber(phoneNumber) {
    try {
      // Format the phone number first
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      
      console.log(`🔍 Validating phone number: ${phoneNumber} -> ${formattedNumber}`);
      
      // Check if Twilio is configured
      if (!client || !TWILIO_PHONE_NUMBER) {
        console.warn('⚠️ Twilio not configured, using basic validation');
        // Basic validation fallback
        const cleaned = formattedNumber.replace(/\D/g, '');
        if (cleaned.length >= 10 && cleaned.length <= 15) {
          return {
            isValid: true,
            formattedNumber: formattedNumber,
            countryCode: 'IN',
            nationalFormat: formattedNumber
          };
        } else {
          return {
            isValid: false,
            error: 'Phone number must be 10-15 digits'
          };
        }
      }
      
      // Use Twilio's Lookup API to validate phone number
      const phoneNumberLookup = await client.lookups.v1.phoneNumbers(formattedNumber).fetch();
      
      return {
        isValid: true,
        formattedNumber: phoneNumberLookup.phoneNumber,
        countryCode: phoneNumberLookup.countryCode,
        nationalFormat: phoneNumberLookup.nationalFormat
      };
      
    } catch (error) {
      console.error('❌ Phone number validation failed:', error);
      console.error('❌ Original number:', phoneNumber);
      console.error('❌ Formatted number:', this.formatPhoneNumber(phoneNumber));
      
      // If it's a Twilio error, provide more specific message
      if (error.code === 20404) {
        return {
          isValid: false,
          error: 'Phone number not found. Please check the number and try again.'
        };
      }
      
      return {
        isValid: false,
        error: error.message || 'Invalid phone number format'
      };
    }
  }
}

export default SMSService;
