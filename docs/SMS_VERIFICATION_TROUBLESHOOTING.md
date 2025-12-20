# SMS Verification Troubleshooting Guide

## 🔍 Issue: SMS Verification Codes Not Sending

### Problem
Users cannot receive SMS verification codes during registration or phone verification.

---

## 🔎 Diagnostic Steps

### 1. Check Environment Variables

**Required Variables:**
```env
KAVENEGAR_API_KEY=your_api_key_here
# OR
NEXT_PUBLIC_KAVENEGAR_API_KEY=your_api_key_here
# OR
KAVENEGAR_API_TOKEN=your_api_key_here

KAVENEGAR_SENDER=2000660110  # Optional, defaults to 2000660110 (purchased number)
```

**Check if variables are set:**
- Check server logs for: `❌ SMS API key is not set`
- Verify `.env` or `.env.production` file exists
- Restart server after adding/changing environment variables

### 2. Check Server Logs

**Look for these log messages:**

✅ **Success indicators:**
```
📱 [sendVerificationCode] Attempting to send verification code
📱 [sendVerificationCode] Kavenegar callback received
✅ [sendVerificationCode] SMS sent successfully
```

❌ **Error indicators:**
```
❌ SMS API key is not set
❌ [sendVerificationCode] SMS sending failed
📱 [sendVerificationCode] Timeout: No response from Kavenegar API
```

### 3. Check Kavenegar Account

**Common Issues:**
1. **API Key Invalid**: Check Kavenegar panel → API Keys
2. **Insufficient Credit**: Check account balance in Kavenegar panel
3. **Template Not Found**: Template `verify` must exist in Kavenegar panel
4. **Test Account Limitation**: Test accounts can only send to account owner's number

### 4. Check Network Connectivity

**Server must be able to reach:**
- `api.kavenegar.com` (Kavenegar API endpoint)
- Check firewall rules
- Check DNS resolution

---

## 🛠️ Common Issues and Solutions

### Issue 1: API Key Not Set

**Symptoms:**
- Error: "SMS service is not configured"
- Server log: `❌ SMS API key is not set`

**Solution:**
1. Add `KAVENEGAR_API_KEY` to `.env` or `.env.production`
2. Restart server/PM2 process
3. Verify with: `pm2 env <app-name>` or check environment variables

### Issue 2: Template Not Found

**Symptoms:**
- Template SMS fails, fallback SMS works
- Error: Template not found or invalid

**Solution:**
1. Login to [Kavenegar Panel](https://panel.kavenegar.com)
2. Go to "Templates" section
3. Create template named `verify` with format: `کد تأیید شما: {token}`
4. Wait for template approval (usually instant)
5. System will automatically use simple SMS as fallback if template fails

### Issue 3: Account Verification Required

**Symptoms:**
- Error: `403: حساب کاربری احراز هویت نشده است` (Account is not verified)
- SMS sending fails with account verification error
- Error message: "Account verification required"

**Solution:**
1. Login to [Kavenegar Console](https://console.kavenegar.com)
2. Go to **Account Settings** or **Membership** section
3. Complete account verification:
   - Upload ID document (National ID or Passport)
   - Verify phone number
   - Complete profile information
4. Wait for approval (usually 1-24 hours)
5. Once verified, SMS will work normally

**Note:** The system now automatically detects this error and provides clear guidance. See [Account Verification Fix](./KAVENEGAR_ACCOUNT_VERIFICATION_FIX.md) for detailed steps.

### Issue 4: Test Account Limitation

**Symptoms:**
- Error: `501: امکان ارسال پیامک فقط به شماره صاحب حساب داده شده است`
- SMS only works for account owner's phone number
- Warning message: "SMS sending failed: امکان ارسال پیامک فقط به شماره صاحب حساب داده شده است"

**Solution:**
- **This is expected in test/sandbox mode** - Kavenegar test accounts can only send SMS to the account owner's registered phone number
- **Development Mode:** The system automatically detects this limitation and provides the verification code in the response for testing purposes
- **Production:** Upgrade to production account in Kavenegar panel - this limitation doesn't exist in production
- **Testing:** Use account owner's phone number for testing, or check server logs/console for the verification code in development mode

**How It Works:**
1. System detects test account limitation (status 501 or error message contains "صاحب حساب")
2. Verification code is still generated and saved in database
3. In development mode, the code is included in the API response (`devCode` field)
4. Frontend displays the code prominently when test account limitation is detected
5. User can enter the code manually to complete registration

### Issue 5: Timeout Issues

**Symptoms:**
- Error: "SMS service timeout - please try again"
- No response from Kavenegar API

**Solution:**
1. Check server network connectivity
2. Check Kavenegar API status: https://status.kavenegar.com
3. Verify firewall allows outbound HTTPS to `api.kavenegar.com`
4. Check server DNS resolution

### Issue 5: Callback Not Firing

**Symptoms:**
- Code generated and saved in database
- But SMS never sent (no callback received)
- Timeout after 30 seconds

**Possible Causes:**
1. Network issues between server and Kavenegar
2. Kavenegar API temporarily down
3. Invalid API key
4. Server firewall blocking outbound requests

**Solution:**
1. Check server logs for timeout messages
2. Test API key directly: `curl https://api.kavenegar.com/v1/{API_KEY}/sms/send.json`
3. Check Kavenegar account status
4. Verify network connectivity

---

## 🧪 Testing SMS Sending

### Test 1: Check API Key

```bash
# On server, check if API key is loaded
pm2 env <app-name> | grep KAVENEGAR
```

### Test 2: Test API Directly

```bash
# Test Kavenegar API directly (replace YOUR_API_KEY and YOUR_PHONE)
curl -X POST "https://api.kavenegar.com/v1/YOUR_API_KEY/sms/send.json" \
  -d "sender=10004346" \
  -d "receptor=YOUR_PHONE" \
  -d "message=Test message"
```

### Test 3: Check Server Logs

**During registration attempt, check logs for:**
1. `📱 [verify-phone/send] Attempting to send verification code`
2. `📱 [sendVerificationCode] Attempting to send verification code`
3. `📱 [sendVerificationCode] Kavenegar callback received`
4. Success or error messages

### Test 4: Check Database

```sql
-- Check if verification codes are being generated
SELECT * FROM "VerificationCode" 
WHERE "phone" = 'YOUR_PHONE' 
ORDER BY "createdAt" DESC 
LIMIT 5;
```

---

## 🔧 Enhanced Error Handling (Implemented)

### Improvements Made:

1. **Detailed Logging:**
   - All SMS operations now log detailed information
   - Callback responses are fully logged
   - Timeout detection (30 seconds)

2. **Better Error Messages:**
   - Specific error messages for different failure types
   - Warning messages when SMS fails but code is saved
   - Frontend shows detailed error messages

3. **Fallback Mechanism:**
   - Template SMS → Simple SMS fallback
   - Code still saved even if SMS fails
   - User can request new code

4. **Timeout Protection:**
   - 30-second timeout prevents hanging
   - Returns error instead of waiting forever

---

## 📊 Error Response Codes

### Kavenegar API Status Codes:

- **200**: Success
- **400**: Bad Request (invalid parameters)
- **401**: Unauthorized (invalid API key)
- **403**: Forbidden (account restrictions)
- **408**: Timeout (our custom timeout)
- **500**: Internal Server Error
- **501**: Test account limitation (can only send to owner)

### Our Custom Status Codes:

- **408**: SMS service timeout
- **500**: SMS service not configured

---

## 🚀 Quick Fix Checklist

- [ ] Check `KAVENEGAR_API_KEY` is set in environment
- [ ] Restart server after setting environment variables
- [ ] Check Kavenegar account has credit
- [ ] Verify template `verify` exists in Kavenegar panel
- [ ] Check server logs for detailed error messages
- [ ] Test with account owner's phone (if test account)
- [ ] Check network connectivity to `api.kavenegar.com`
- [ ] Verify phone number format: `09xxxxxxxxx` (11 digits)
- [ ] Check if code is being generated (database)
- [ ] Try resending code (fallback might work)

---

## 📝 Server Log Examples

### ✅ Successful SMS:
```
📱 [verify-phone/send] Attempting to send verification code to 09123456789
📱 [verify-phone/send] Generated code: 123456
📱 [sendVerificationCode] Attempting to send verification code
📱 [sendVerificationCode] Kavenegar callback received: { status: 200, ... }
✅ [sendVerificationCode] SMS sent successfully: { messageId: '12345', ... }
✅ [verify-phone/send] Template SMS sent successfully: 12345
```

### ❌ Failed SMS (Template):
```
📱 [verify-phone/send] Attempting to send verification code to 09123456789
📱 [sendVerificationCode] Attempting to send verification code
📱 [sendVerificationCode] Kavenegar callback received: { status: 400, message: 'Template not found' }
❌ [sendVerificationCode] SMS sending failed
📱 [verify-phone/send] Template SMS failed, using simple SMS fallback
📱 [sendSMS] Attempting to send SMS
✅ [sendSMS] SMS sent successfully
✅ [verify-phone/send] Fallback SMS sent successfully
```

### ❌ Failed SMS (API Key):
```
❌ SMS API key is not set (KAVENEGAR_API_KEY / NEXT_PUBLIC_KAVENEGAR_API_KEY / KAVENEGAR_API_TOKEN)
```

### ❌ Failed SMS (Timeout):
```
📱 [sendVerificationCode] Attempting to send verification code
📱 [sendVerificationCode] Timeout: No response from Kavenegar API after 30 seconds
❌ [verify-phone/send] Both template and fallback SMS failed
```

---

## 🔗 Related Documentation

- [Account Verification Fix](./KAVENEGAR_ACCOUNT_VERIFICATION_FIX.md) - **NEW:** Fix for "Account not verified" error
- [SMS Integration Guide](./SMS_INTEGRATION_GUIDE.md)
- [Kavenegar Comprehensive Audit](./KAVENEGAR_COMPREHENSIVE_AUDIT.md)
- [Registration Flow Fix](./REGISTRATION_FLOW_FIX.md)

---

## 🎯 Test Account Limitation - Automatic Handling

### What Happens:

When a Kavenegar test account limitation is detected:

1. **Code Generation:** Verification code is still generated and saved in database ✅
2. **Error Detection:** System detects status 501 or error message containing "صاحب حساب"
3. **Development Mode:** Code is automatically provided in API response for testing
4. **User Experience:** Frontend displays code prominently with clear instructions
5. **Production Ready:** In production, this limitation doesn't exist

### Development Mode Behavior:

**API Response:**
```json
{
  "success": true,
  "message": "Verification code generated...",
  "warning": "SMS sending failed (Test account limitation...). Your verification code is: 123456.",
  "devCode": "123456"
}
```

**Frontend displays:**
```
Development Mode: Your verification code is 123456. 
Enter this code to continue. 
(SMS not sent due to test account limitation)
```

**Server Logs:**
```
⚠️ [sendVerificationCode] Kavenegar test account limitation: {
  status: 501,
  message: "امکان ارسال پیامک فقط به شماره صاحب حساب داده شده است",
  note: "In Kavenegar test/sandbox mode, SMS can only be sent to the account owner's number..."
}
🔑 [verify-phone/send] Development mode - Verification code for 09051305165: 123456
```

---

**Last Updated**: December 9, 2025
**Status**: ✅ Enhanced Error Handling + Test Account Limitation Detection Implemented

