# 📱 Kavenegar Production Implementation Guide

## Overview

This guide provides comprehensive instructions for implementing Kavenegar SMS service in production, ensuring reliable, secure, and error-free SMS delivery.

---

## ✅ Prerequisites

Before implementing Kavenegar SMS in production, ensure you have:

1. **Production Kavenegar Account** ✅
   - Account upgraded from test/sandbox to production
   - Account verified (ID verification completed)
   - Account has sufficient credit (minimum 10,000 Rials recommended)

2. **API Key** ✅
   - Production API key obtained from Kavenegar panel
   - API key is secure and not exposed publicly

3. **Sender Number** ✅
   - Purchased sender number: `2000660110` (configured as default)
   - Or use public number `10004346` (free alternative)

4. **Server Access** ✅
   - Access to server environment variables
   - Ability to restart server/PM2 processes

---

## 🔧 Configuration

### Step 1: Environment Variables Setup

Add the following to your `.env` or `.env.production` file:

```env
# Kavenegar SMS Configuration
KAVENEGAR_API_KEY=566555476F46314A72326D365563685134615464536C785744572F775A4463484B6469334E6E6F6B4D2F453D
KAVENEGAR_SENDER=2000660110
```

**Important Notes:**
- ✅ Use `KAVENEGAR_API_KEY` (server-only) - **DO NOT** use `NEXT_PUBLIC_KAVENEGAR_API_KEY` (exposes key to client)
- ✅ `KAVENEGAR_SENDER` is optional - defaults to `2000660110` if not set
- ✅ Never commit `.env` files to version control
- ✅ Restart server after updating environment variables

### Step 2: Verify Configuration

Check if environment variables are loaded:

```bash
# If using PM2
pm2 env <app-name> | grep KAVENEGAR

# Or check server logs for initialization
# Look for: "📱 [sendSMS] Attempting to send SMS"
```

### Step 3: Test SMS Sending

Test the SMS service with a simple request:

```bash
# Test API endpoint (if admin)
curl -X POST http://localhost:3000/api/sms/send \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "type": "simple",
    "receptor": "09123456789",
    "message": "Test message from HS6Tools"
  }'
```

---

## 📋 Implementation Details

### Default Sender Number

The system uses your purchased sender number `2000660110` as the default:

```typescript
// src/lib/sms.ts
const sender = options.sender || process.env.KAVENEGAR_SENDER || '2000660110';
```

**Priority Order:**
1. `options.sender` (explicitly provided in function call)
2. `process.env.KAVENEGAR_SENDER` (environment variable)
3. `'2000660110'` (default purchased number)

### Error Handling

The implementation includes comprehensive error handling for production scenarios:

#### Common Error Codes:

| Status Code | Meaning | Solution |
|------------|---------|----------|
| 200 | Success | SMS sent successfully |
| 400 | Bad Request | Check phone number format and message content |
| 401 | Unauthorized | Verify `KAVENEGAR_API_KEY` is correct |
| 402 | Insufficient Credit | Recharge Kavenegar account |
| 403 | Forbidden | Check account permissions and sender number |
| 404 | Not Found | Verify sender number or template exists |
| 501 | Test Account Limitation | Upgrade to production account |
| 502 | Invalid Phone Number | Use format: `09123456789` |

#### Error Response Format:

```typescript
{
  success: false,
  error: "User-friendly error message",
  status: 401,
  isTestAccountLimitation?: boolean // Only if status 501
}
```

### Timeout Protection

All SMS API calls include a 30-second timeout to prevent hanging:

```typescript
const timeout = setTimeout(() => {
  resolve({
    success: false,
    error: 'SMS service timeout - please try again',
    status: 408,
  });
}, 30000);
```

### Rate Limiting

SMS endpoints are protected with rate limiting:

- **Phone Verification:** 5 requests per 5 minutes per IP
- **Password Reset:** 5 requests per 5 minutes per IP
- **Admin SMS Send:** 20 requests per 5 minutes per IP
- **Registration:** 3 requests per 15 minutes per IP

---

## 🚀 Usage Examples

### 1. Send Simple SMS

```typescript
import { sendSMS } from '@/lib/sms';

const result = await sendSMS({
  receptor: '09123456789',
  message: 'Your order has been confirmed!',
  sender: '2000660110' // Optional, uses default if not provided
});

if (result.success) {
  console.log('SMS sent:', result.messageId);
} else {
  console.error('SMS failed:', result.error);
}
```

### 2. Send Verification Code (Template)

```typescript
import { sendVerificationCode } from '@/lib/sms';

const result = await sendVerificationCode({
  receptor: '09123456789',
  token: '123456',
  template: 'verify' // Template name in Kavenegar panel
});

if (result.success) {
  console.log('Verification code sent:', result.messageId);
} else {
  // Falls back to simple SMS if template fails
  console.error('Template SMS failed:', result.error);
}
```

### 3. Send Bulk SMS

```typescript
import { sendBulkSMS } from '@/lib/sms';

const result = await sendBulkSMS(
  ['09123456789', '09187654321'],
  'Bulk message to all recipients'
);

if (result.success) {
  console.log('Bulk SMS sent successfully');
}
```

### 4. Safe SMS (Non-Blocking)

```typescript
import { sendSMSSafe } from '@/lib/sms';

// This function catches errors and logs them without throwing
// Use when SMS failure shouldn't break the main flow
await sendSMSSafe({
  receptor: '09123456789',
  message: 'Order notification',
}, 'Order confirmation');
```

---

## 🔒 Security Best Practices

### 1. API Key Security

✅ **DO:**
- Store API key in server-only environment variables
- Use `KAVENEGAR_API_KEY` (not `NEXT_PUBLIC_KAVENEGAR_API_KEY`)
- Rotate API keys periodically
- Use different keys for development and production

❌ **DON'T:**
- Expose API key in client-side code
- Commit API keys to version control
- Share API keys publicly
- Use test API keys in production

### 2. Rate Limiting

All SMS endpoints are protected with IP-based rate limiting to prevent abuse:

```typescript
// Example: Phone verification endpoint
const limitResult = rateLimitByIp(ip, "verify-phone-send", 5, 5 * 60 * 1000);
if (!limitResult.allowed) {
  return NextResponse.json(
    { success: false, error: "Too many requests. Please try again later." },
    { status: 429 }
  );
}
```

### 3. Input Validation

All phone numbers are validated before sending:

```typescript
const phoneRegex = /^09\d{9}$/;
if (!phoneRegex.test(phone)) {
  return NextResponse.json(
    { success: false, error: "Invalid phone number format. Use format: 09123456789" },
    { status: 400 }
  );
}
```

### 4. CSRF Protection

SMS endpoints include CSRF protection:

```typescript
const origin = request.headers.get("origin");
const host = request.headers.get("host") || "";
if (!isAllowedOrigin(origin, host)) {
  return NextResponse.json(
    { success: false, error: "Invalid origin" },
    { status: 403 }
  );
}
```

---

## 📊 Monitoring and Logging

### Log Messages

The implementation includes comprehensive logging:

**Success Logs:**
```
✅ [sendSMS] SMS sent successfully: { messageId: '12345', status: 5, receptor: '09123456789' }
```

**Error Logs:**
```
❌ [sendSMS] SMS sending failed: { status: 402, message: 'Insufficient credit', receptor: '09123456789' }
```

**Warning Logs:**
```
⚠️ [sendSMS] Kavenegar test account limitation: { status: 501, ... }
```

### Monitoring Checklist

- [ ] Monitor SMS success rate
- [ ] Track error rates by status code
- [ ] Monitor account credit balance
- [ ] Alert on repeated failures (401, 402)
- [ ] Track timeout occurrences
- [ ] Monitor rate limit hits

---

## 🛠️ Troubleshooting

### Issue: SMS Not Sending

**Checklist:**
1. ✅ Verify `KAVENEGAR_API_KEY` is set correctly
2. ✅ Check account has sufficient credit
3. ✅ Verify sender number `2000660110` is active
4. ✅ Check phone number format: `09123456789`
5. ✅ Review server logs for error messages
6. ✅ Test API key directly with Kavenegar API

### Issue: "Invalid API Key" (401)

**Solution:**
1. Verify API key in Kavenegar panel
2. Ensure API key is from production account (not test)
3. Check for extra spaces or quotes in `.env` file
4. Restart server after updating environment variables

### Issue: "Insufficient Credit" (402)

**Solution:**
1. Login to Kavenegar panel
2. Go to "Charge Account" or "Wallet"
3. Add credit (minimum recommended: 10,000 Rials)
4. Wait for credit to be applied (usually instant)

### Issue: "Template Not Found" (404)

**Solution:**
1. Login to Kavenegar panel
2. Go to "Templates" section
3. Create template named `verify` (or update code to use existing template)
4. Wait for template approval (usually instant)
5. System will automatically fallback to simple SMS if template fails

### Issue: Timeout (408)

**Solution:**
1. Check server network connectivity
2. Verify firewall allows outbound HTTPS to `api.kavenegar.com`
3. Check DNS resolution
4. Review Kavenegar API status: https://status.kavenegar.com
5. Check server logs for network errors

---

## 📝 SMS Templates (Optional)

### Creating Templates in Kavenegar Panel

1. Login to [Kavenegar Panel](https://panel.kavenegar.com)
2. Go to **Templates** → **Create Template**
3. Create template named `verify`:
   ```
   کد تأیید شما: {token}
   این کد 5 دقیقه اعتبار دارد.
   ```
4. Wait for approval (usually instant)

### Using Templates

```typescript
const result = await sendVerificationCode({
  receptor: '09123456789',
  token: '123456',
  template: 'verify' // Template name from Kavenegar panel
});
```

**Note:** If template doesn't exist or fails, system automatically falls back to simple SMS.

---

## 🎯 Production Checklist

Before deploying to production:

- [ ] Production Kavenegar account activated
- [ ] Production API key obtained and configured
- [ ] Account has sufficient credit (minimum 10,000 Rials)
- [ ] Sender number `2000660110` verified and active
- [ ] Environment variables set in production server
- [ ] Server restarted after configuration
- [ ] Test SMS sent successfully
- [ ] Error handling tested (401, 402, 404, etc.)
- [ ] Rate limiting verified
- [ ] Monitoring and logging configured
- [ ] SMS templates created (optional)
- [ ] Documentation updated

---

## 📞 Support

### Kavenegar Support
- **Email:** support@kavenegar.com
- **Panel:** https://panel.kavenegar.com
- **Documentation:** https://kavenegar.com/rest.html

### Internal Documentation
- [SMS Verification Troubleshooting](./SMS_VERIFICATION_TROUBLESHOOTING.md)
- [Kavenegar Account Setup Guide](./KAVENEGAR_ACCOUNT_SETUP_GUIDE.md)
- [Environment Requirements](./ENVIRONMENT_REQUIREMENTS.md)
- [Update Script - Kavenegar Configuration](./UPDATE_SCRIPT_KAVENEGAR_CONFIG.md) - How update.sh handles Kavenegar config

---

## 🔄 Updates and Maintenance

### Regular Tasks

1. **Monitor Account Credit**
   - Check balance weekly
   - Set up low balance alerts
   - Recharge before running out

2. **Review Error Logs**
   - Check for recurring errors
   - Monitor success rates
   - Investigate timeout issues

3. **Update API Keys**
   - Rotate keys quarterly
   - Update environment variables
   - Test after rotation

4. **Verify Sender Number**
   - Confirm number is active
   - Check delivery rates
   - Update if needed

---

**Last Updated:** December 9, 2025  
**Status:** ✅ Production Ready  
**Default Sender:** `2000660110` (Purchased Number)

