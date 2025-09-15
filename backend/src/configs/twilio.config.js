import dotenv from 'dotenv';
dotenv.config();

import twilio from 'twilio';

// Twilio configuration
const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Validate required environment variables
if (!ACCOUNT_SID || !AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
  console.error('❌ Missing required Twilio environment variables:');
  console.error('   TWILIO_ACCOUNT_SID:', ACCOUNT_SID ? '✅ Set' : '❌ Missing');
  console.error('   TWILIO_AUTH_TOKEN:', AUTH_TOKEN ? '✅ Set' : '❌ Missing');
  console.error('   TWILIO_PHONE_NUMBER:', TWILIO_PHONE_NUMBER ? '✅ Set' : '❌ Missing');
  console.warn('⚠️ Twilio SMS will run in simulation mode');
}

// Validate phone number format
if (TWILIO_PHONE_NUMBER && !TWILIO_PHONE_NUMBER.startsWith('+')) {
  console.warn('⚠️ TWILIO_PHONE_NUMBER should start with + (e.g., +91XXXXXXXXXX)');
  console.warn('⚠️ Current value:', TWILIO_PHONE_NUMBER);
  console.warn('⚠️ Twilio SMS will run in simulation mode');
} else if (TWILIO_PHONE_NUMBER) {
  console.log('✅ Twilio phone number format looks valid:', TWILIO_PHONE_NUMBER);
}

// Create Twilio client
const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

// Test Twilio connection
const testTwilioConnection = async () => {
  try {
    if (!ACCOUNT_SID || !AUTH_TOKEN) {
      console.warn('⚠️ Twilio credentials not provided, skipping connection test');
      return;
    }
    
    const account = await client.api.accounts(ACCOUNT_SID).fetch();
    console.log('✅ Twilio connection successful');
    console.log(`📱 Twilio Account: ${account.friendlyName}`);
    console.log(`📞 Twilio Phone Number: ${TWILIO_PHONE_NUMBER}`);
    
    // Validate phone number format
    if (TWILIO_PHONE_NUMBER && !TWILIO_PHONE_NUMBER.startsWith('+')) {
      console.warn('⚠️ Invalid Twilio phone number format. Should start with +');
      console.warn('⚠️ SMS will run in simulation mode');
    } else if (TWILIO_PHONE_NUMBER) {
      console.log('✅ Twilio phone number format is valid');
    }
  } catch (error) {
    console.error('❌ Twilio connection failed:', error.message);
    console.warn('⚠️ SMS will run in simulation mode');
  }
};

// Initialize connection test
testTwilioConnection().catch(() => {
  console.warn('⚠️ Twilio connection test failed, SMS will run in simulation mode');
});

export { client, TWILIO_PHONE_NUMBER };
export default client;
