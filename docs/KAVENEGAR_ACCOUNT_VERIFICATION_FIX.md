# 🔐 Kavenegar Account Verification Error Fix

## Issue: "حساب کاربری احراز هویت نشده است" (Account Not Verified)

### Problem

SMS verification codes are not being sent, and the error message indicates:
- **Error:** "حساب کاربری احراز هویت نشده است" (User account is not verified)
- **Status Code:** Usually 403 (Forbidden)
- **Symptom:** SMS API calls fail with account verification error

---

## 🔍 Root Cause

Your Kavenegar account needs to be verified/activated before you can send SMS to any phone number. This is a security measure by Kavenegar to prevent abuse.

---

## ✅ Solution

### Step 1: Verify Your Kavenegar Account

1. **Login to Kavenegar Console:**
   - Go to: https://console.kavenegar.com
   - Login with your account credentials

2. **Complete Account Verification:**
   - Navigate to **Account Settings** or **Membership** section
   - Look for **"Account Verification"** or **"احراز هویت"** option
   - Complete the verification process:
     - Upload ID document (National ID or Passport)
     - Verify phone number
     - Complete profile information
     - Submit for review

3. **Wait for Approval:**
   - Verification usually takes 1-24 hours
   - You'll receive an email notification when approved

### Step 2: Check Account Status

After verification, check your account status:

1. Go to **Dashboard** in Kavenegar console
2. Look for account status indicators:
   - ✅ **"Verified"** or **"فعال"** (Active) - Good!
   - ⚠️ **"Pending Verification"** - Still waiting
   - ❌ **"Not Verified"** - Need to verify

### Step 3: Test SMS Sending

After account is verified:

1. **Test from Kavenegar Panel:**
   - Go to **Send SMS** section
   - Try sending a test SMS to your phone number
   - If it works, your account is verified

2. **Test from Your Application:**
   - Try registering a new user
   - SMS should now be sent successfully

---

## 🔧 Enhanced Error Detection (Implemented)

The system now automatically detects account verification errors and provides clear guidance:

### Error Detection

The code now detects these error patterns:
- `احراز هویت نشده` (Not verified)
- `احراز هویت نشده است` (Account is not verified)
- `not verified`
- `account not verified`
- `verification required`

### Error Messages

When account verification error is detected:

**Server Logs:**
```
❌ [sendVerificationCode] Account verification required: {
  status: 403,
  message: "حساب کاربری احراز هویت نشده است",
  action: "Please verify your Kavenegar account at https://console.kavenegar.com",
  note: "Your Kavenegar account needs to be verified before you can send SMS..."
}
```

**API Response:**
```json
{
  "success": true,
  "message": "Verification code generated. SMS may not have been sent...",
  "warning": "SMS sending failed: Account verification required. Please verify your Kavenegar account at https://console.kavenegar.com. Code is saved in database..."
}
```

**Frontend Display:**
- Shows clear error message with link to Kavenegar console
- Code is still saved in database
- User can request new code after account verification

---

## 📋 Verification Checklist

Before sending SMS, ensure:

- [ ] Kavenegar account is created
- [ ] Account verification is completed
- [ ] Account status shows "Verified" or "Active"
- [ ] API key is obtained from verified account
- [ ] Account has sufficient credit
- [ ] Sender number is configured (optional - defaults to 2000660110)

---

## 🚨 Common Issues

### Issue 1: Verification Still Pending

**Symptoms:**
- Account verification submitted but not approved yet
- Error still appears

**Solution:**
- Wait for approval (usually 1-24 hours)
- Check email for verification status
- Contact Kavenegar support if pending > 24 hours

### Issue 2: Verification Rejected

**Symptoms:**
- Verification was rejected
- Cannot resubmit

**Solution:**
- Check rejection reason in Kavenegar panel
- Fix issues (e.g., unclear ID photo, wrong information)
- Resubmit verification documents
- Contact Kavenegar support if needed

### Issue 3: Account Verified But Still Getting Error

**Symptoms:**
- Account shows as verified
- Still getting verification error

**Possible Causes:**
1. **Wrong API Key:** Using API key from unverified account
2. **Cache Issue:** Old error cached
3. **Account Suspended:** Account was suspended after verification

**Solution:**
1. Verify API key is from verified account
2. Restart server/PM2 to clear cache
3. Check account status in Kavenegar panel
4. Contact Kavenegar support if issue persists

---

## 🔍 How to Check Account Status

### Method 1: Kavenegar Console

1. Login to https://console.kavenegar.com
2. Go to **Dashboard**
3. Check account status badge/indicator
4. Look for verification status

### Method 2: API Test

Try sending a test SMS from Kavenegar panel:
- If SMS sends successfully → Account is verified ✅
- If SMS fails with verification error → Account needs verification ❌

### Method 3: Check Server Logs

Look for these log messages:

**✅ Account Verified:**
```
✅ [sendSMS] SMS sent successfully: { messageId: '12345', ... }
```

**❌ Account Not Verified:**
```
❌ [sendSMS] Account verification required: {
  errorMessage: "Account verification required. Please verify your Kavenegar account...",
  action: "Please verify your Kavenegar account at https://console.kavenegar.com"
}
```

---

## 📞 Support

### Kavenegar Support

If you need help with account verification:

- **Email:** support@kavenegar.com
- **Panel:** https://console.kavenegar.com
- **Phone:** Check Kavenegar website for support phone number

### What to Include in Support Request

- Account email/username
- Error message received
- Screenshot of account status
- Steps you've already taken

---

## 🔄 After Verification

Once your account is verified:

1. **Restart Your Server:**
   ```bash
   pm2 restart hs6tools
   # or
   npm run start
   ```

2. **Test SMS Sending:**
   - Try registering a new user
   - SMS should now be sent successfully

3. **Monitor Logs:**
   - Check server logs for successful SMS sending
   - Verify SMS is received on phone

---

## 📚 Related Documentation

- [Kavenegar Production Setup](./KAVENEGAR_PRODUCTION_SETUP.md)
- [SMS Verification Troubleshooting](./SMS_VERIFICATION_TROUBLESHOOTING.md)
- [Kavenegar Account Setup Guide](./KAVENEGAR_ACCOUNT_SETUP_GUIDE.md)

---

**Last Updated:** December 9, 2025  
**Status:** ✅ Account Verification Error Detection Implemented  
**Action Required:** Verify your Kavenegar account at https://console.kavenegar.com

