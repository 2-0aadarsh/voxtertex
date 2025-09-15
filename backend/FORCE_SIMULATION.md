# Force SMS Simulation Mode

## Quick Fix for Testing

To force the system into simulation mode and avoid Twilio errors, temporarily update your `.env` file:

### Option 1: Comment out Twilio credentials
```env
# TWILIO_ACCOUNT_SID=your_account_sid
# TWILIO_AUTH_TOKEN=your_auth_token
# TWILIO_PHONE_NUMBER=+918210508119
```

### Option 2: Use invalid phone number
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=invalid_number
```

### Option 3: Use test credentials
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_test_auth_token
TWILIO_PHONE_NUMBER=+15005550006
```

## What Happens Now

With the latest fix, the system will:

1. **Detect** the invalid Twilio phone number `+918210508119`
2. **Automatically switch** to simulation mode
3. **Log OTP** in console: `📱 [SIMULATED] OTP: XXXXXX`
4. **Store OTP** in Redis for verification
5. **Allow testing** of the complete verification flow

## Testing Steps

1. **Restart your backend server**
2. **Enter phone number**: `7488167674`
3. **Click "Verify"**
4. **Check console** for: `📱 [SIMULATED] OTP: XXXXXX`
5. **Enter OTP** from console
6. **Verification works!**

## Console Output You Should See

```
⚠️ Twilio not properly configured or invalid phone number, simulating SMS send
📱 [SIMULATED] SMS to +917488167674: Your VoxVertex verification code is: XXXXXX
📱 [SIMULATED] OTP: XXXXXX
📱 [SIMULATED] Reason: Invalid Twilio phone number
💾 OTP stored in Redis with key: otp:mobile_verification:+917488167674
```

The error should be completely resolved now!

