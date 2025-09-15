# SMS OTP Verification Setup

## Environment Variables Required

Add these environment variables to your `.env` file:

```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
```

## Twilio Setup Steps

1. **Create Twilio Account**: Go to [twilio.com](https://twilio.com) and create an account
2. **Get Credentials**: 
   - Account SID: Found in your Twilio Console Dashboard
   - Auth Token: Found in your Twilio Console Dashboard
   - Phone Number: Purchase a phone number from Twilio Console
3. **Add to Environment**: Add the credentials to your `.env` file

## Features Implemented

### Backend
- ✅ Twilio client configuration
- ✅ SMS service with OTP generation
- ✅ Redis caching for OTP (10-minute expiration)
- ✅ Phone number validation using Twilio Lookup API
- ✅ Mobile verification status tracking
- ✅ API endpoints for SMS operations

### Frontend
- ✅ SMS service integration
- ✅ Mobile verification modal with OTP input
- ✅ Phone number validation
- ✅ Real-time verification status updates
- ✅ Integration with EditProfile components

## API Endpoints

- `POST /api/sms/send-otp` - Send OTP to phone number
- `POST /api/sms/verify-otp` - Verify OTP
- `POST /api/sms/validate-phone` - Validate phone number format
- `POST /api/sms/send-message` - Send custom SMS

## Usage Flow

1. User enters phone number in EditProfile
2. Frontend validates phone number format
3. User clicks "Verify" button
4. Backend sends OTP via Twilio SMS
5. User enters OTP in verification modal
6. Backend verifies OTP and updates user status
7. User's `isMobileVerified` is set to `true`

## Security Features

- OTP expires in 10 minutes
- OTP is stored in Redis with expiration
- Phone number validation using Twilio Lookup API
- Prevents re-verification of already verified numbers
- JWT authentication required for all SMS endpoints

