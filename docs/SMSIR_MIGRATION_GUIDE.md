# 📱 SMS.ir Migration Guide - Complete Setup Instructions

## Overview

This guide provides step-by-step instructions for migrating from Kavenegar to SMS.ir SMS service. SMS.ir is a popular Iranian SMS service provider with comprehensive API support.

**Website:** https://sms.ir/  
**API Documentation:** https://github.com/movahhedi/sms-ir-node  
**Panel:** https://app.sms.ir/

---

## Step 1: Register and Set Up SMS.ir Account

### 1.1 Create Account

1. Visit https://sms.ir/
2. Click on **"رایگان ثبت نام کن"** (Free Registration)
3. Fill in your information:
   - Phone number
   - Email address
   - Password
   - Business/Personal information
4. Complete email verification

### 1.2 Account Verification

1. Log in to https://app.sms.ir/
2. Complete your profile:
   - Upload ID document (National ID or Passport)
   - Verify phone number
   - Complete business information
3. Wait for account approval (usually 1-24 hours)

### 1.3 Get API Credentials

1. Log in to SMS.ir panel: https://app.sms.ir/
2. Navigate to **"برنامه نویسان"** (Developers) section
3. Click on **"لیست کلیدهای API"** (API Keys List)
4. Click **"افزودن کلید جدید"** (Add New Key)
5. Provide a name (e.g., "HS6Tools Production")
6. Copy the generated:
   - **API Key** (کلید API)
   - **Secret Key** (کلید مخفی) - if required

**Important:** Keep these credentials secure and never commit them to version control.

---

## Step 2: Create SMS Templates (Patterns)

SMS.ir uses templates (patterns) for verification codes and structured messages. Templates must be created in the panel before use.

### 2.1 Create Verification Code Template

1. In SMS.ir panel, go to **"برنامه نویسان"** (Developers)
2. Navigate to **"ارسال سریع"** (Fast Send) > **"لیست قالب‌ها"** (Templates List)
3. Click **"افزودن قالب"** (Add Template)
4. Fill in:
   - **Title:** `verify` (or "کد تأیید")
   - **Message Content:** 
     ```
     کد تأیید شما #OTP# می‌باشد. این کد 5 دقیقه اعتبار دارد.
     ```
   - **Placeholder:** Use `#OTP#` for the verification code
5. Save and note the **Template ID** (شماره قالب)

### 2.2 Create Password Reset Template (Optional)

1. Follow same steps as above
2. **Title:** `password-reset`
3. **Message Content:**
   ```
   کد بازیابی رمز عبور شما #OTP# می‌باشد. این کد 10 دقیقه اعتبار دارد.
   ```

### 2.3 Template Approval

- Templates are usually approved instantly
- Check template status in the panel
- Note the Template ID for each template (you'll need it in code)

---

## Step 3: Configure Line Number (Sender Number)

### 3.1 Get Your Line Number

1. In SMS.ir panel, go to **"مدیریت خطوط"** (Line Management)
2. Check your active line number(s)
3. Note the line number (e.g., `50004001` or `10004346`)

**Note:** If you don't have a dedicated line number, SMS.ir provides a default shared number.

### 3.2 Service Line Number

- SMS.ir provides service line numbers for different purposes
- For verification codes, you can use the default service number
- For branded messages, purchase a dedicated line number

---

## Step 4: Install SMS.ir Package

### 4.1 Install npm Package

```bash
npm install sms-ir
```

### 4.2 Package Structure

The `sms-ir` package provides:
- `Token` class - For authentication
- `VerificationCode` class - For sending verification codes
- `BulkSend` class - For bulk SMS sending
- `SimpleSend` class - For simple SMS messages

---

## Step 5: Environment Variables Configuration

### 5.1 Required Environment Variables

Add to `.env` and `.env.production`:

```env
# SMS.ir Configuration
SMSIR_API_KEY=your_api_key_here
SMSIR_SECRET_KEY=your_secret_key_here  # Optional, if required
SMSIR_LINE_NUMBER=your_line_number     # Optional, uses default if not set
SMSIR_VERIFY_TEMPLATE_ID=123456        # Template ID for verification codes
SMSIR_PASSWORD_RESET_TEMPLATE_ID=123457 # Template ID for password reset (optional)
```

### 5.2 Environment Variable Details

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SMSIR_API_KEY` | ✅ Yes | Your SMS.ir API key | `abc123...` |
| `SMSIR_SECRET_KEY` | ⚠️ Conditional | Secret key if required by your account | `xyz789...` |
| `SMSIR_LINE_NUMBER` | ❌ No | Your line/sender number | `50004001` |
| `SMSIR_VERIFY_TEMPLATE_ID` | ✅ Yes | Template ID for verification codes | `123456` |
| `SMSIR_PASSWORD_RESET_TEMPLATE_ID` | ❌ No | Template ID for password reset | `123457` |

### 5.3 Migration from Kavenegar

**Old Variables (Kavenegar):**
```env
KAVENEGAR_API_KEY=...
KAVENEGAR_SENDER=...
```

**New Variables (SMS.ir):**
```env
SMSIR_API_KEY=...
SMSIR_SECRET_KEY=...
SMSIR_LINE_NUMBER=...
SMSIR_VERIFY_TEMPLATE_ID=...
```

**Note:** The code will check for both sets of variables during migration period, but SMS.ir takes priority.

---

## Step 6: Code Implementation

### 6.1 SMS Service Library Structure

The SMS service (`src/lib/sms.ts`) will be refactored to support SMS.ir while maintaining the same interface:

```typescript
// Same interface, different implementation
export async function sendSMS(options: SendSMSOptions): Promise<SMSResponse>
export async function sendVerificationCode(options: VerifyLookupOptions): Promise<SMSResponse>
export async function sendBulkSMS(...): Promise<SMSResponse>
```

### 6.2 SMS.ir API Usage

**Simple SMS:**
```typescript
const { Token, SimpleSend } = require('sms-ir');
const token = new Token();
const simpleSend = new SimpleSend();

// Get token
const tokenResult = await token.get(apiKey, secretKey);

// Send SMS
const result = await simpleSend.send(
  tokenResult,
  lineNumber,      // Your line number
  message,         // Message text
  phoneNumber      // Recipient phone number
);
```

**Verification Code:**
```typescript
const { Token, VerificationCode } = require('sms-ir');
const token = new Token();
const verificationCode = new VerificationCode();

// Get token
const tokenResult = await token.get(apiKey, secretKey);

// Send verification code using template
const result = await verificationCode.send(
  tokenResult,
  phoneNumber,     // Recipient phone number
  code,            // 6-digit verification code
  templateId       // Template ID from panel
);
```

### 6.3 Error Handling

SMS.ir API returns structured error responses:
- **Status 200:** Success
- **Status 400:** Bad Request (invalid parameters)
- **Status 401:** Unauthorized (invalid API key)
- **Status 402:** Insufficient credit
- **Status 403:** Forbidden (account restrictions)
- **Status 404:** Not Found (template/line not found)

---

## Step 7: Testing

### 7.1 Test Simple SMS

```bash
# Use the admin SMS endpoint
POST /api/sms/send
{
  "type": "simple",
  "receptor": "09123456789",
  "message": "Test message from SMS.ir"
}
```

### 7.2 Test Verification Code

1. Go to registration page
2. Enter phone number
3. Request verification code
4. Check SMS.ir panel for delivery status
5. Verify code is received

### 7.3 Check SMS.ir Panel

1. Log in to https://app.sms.ir/
2. Go to **"گزارشات"** (Reports)
3. Check **"گزارش ارسال"** (Send Report)
4. Verify messages are being sent successfully

---

## Step 8: Migration Checklist

### Pre-Migration

- [ ] SMS.ir account created and verified
- [ ] API key and secret key obtained
- [ ] Templates created and approved
- [ ] Template IDs noted
- [ ] Line number identified
- [ ] Environment variables prepared

### Migration Steps

- [ ] Install `sms-ir` package: `npm install sms-ir`
- [ ] Update `.env` and `.env.production` with SMS.ir credentials
- [ ] Code updated to use SMS.ir API
- [ ] All SMS functions tested
- [ ] Error handling verified
- [ ] Documentation updated

### Post-Migration

- [ ] Test phone verification flow
- [ ] Test password reset flow
- [ ] Test order notification SMS
- [ ] Test welcome SMS
- [ ] Monitor SMS.ir panel for delivery reports
- [ ] Remove Kavenegar environment variables (optional)
- [ ] Update `update.sh` script validation

---

## Step 9: SMS.ir Panel Features

### 9.1 Dashboard

- **اعتبار حساب** (Account Credit): Check your SMS credit balance
- **گزارشات روزانه** (Daily Reports): View daily SMS statistics
- **خطاهای وب سرویس** (Web Service Errors): Check API errors

### 9.2 Reports

- **گزارش ارسال** (Send Report): View all sent messages
- **گزارش دریافت** (Receive Report): View received messages (if enabled)
- **گزارش خطاها** (Error Report): View failed messages

### 9.3 Account Management

- **شارژ حساب** (Recharge Account): Add SMS credit
- **مدیریت خطوط** (Line Management): Manage sender numbers
- **قالب‌ها** (Templates): Manage SMS templates

---

## Step 10: Troubleshooting

### Common Issues

#### 1. "Invalid API Key" Error

**Solution:**
- Verify API key is correct in `.env`
- Check API key is active in SMS.ir panel
- Ensure no extra spaces in environment variable

#### 2. "Template Not Found" Error

**Solution:**
- Verify template ID is correct
- Check template is approved in panel
- Ensure template ID matches the one in panel

#### 3. "Insufficient Credit" Error

**Solution:**
- Check account balance in SMS.ir panel
- Recharge account if needed
- Verify pricing plan

#### 4. SMS Not Received

**Solution:**
- Check SMS.ir panel for delivery status
- Verify phone number format (09123456789)
- Check if number is in blacklist
- Verify account is fully verified

#### 5. "Account Not Verified" Error

**Solution:**
- Complete account verification in SMS.ir panel
- Upload required documents
- Wait for approval (1-24 hours)

---

## Step 11: API Rate Limits

SMS.ir has rate limits based on your account type:

- **Free/Basic:** Limited requests per minute
- **Premium:** Higher rate limits
- **Enterprise:** Custom rate limits

**Best Practices:**
- Implement rate limiting in your application
- Use templates for faster delivery
- Monitor API usage in SMS.ir panel

---

## Step 12: Cost Comparison

### SMS.ir Pricing

- **Service SMS:** ~219 Toman per SMS
- **Verification SMS:** Similar pricing
- **Bulk SMS:** Discounts available for large volumes

### Cost Optimization

- Use templates (faster, more reliable)
- Send during off-peak hours (if applicable)
- Purchase credit in bulk for discounts

---

## Step 13: Support and Resources

### SMS.ir Support

- **Website:** https://sms.ir/
- **Panel:** https://app.sms.ir/
- **Documentation:** https://github.com/movahhedi/sms-ir-node
- **Support:** Available in panel

### Additional Resources

- **GitHub Repository:** https://github.com/movahhedi/sms-ir-node
- **npm Package:** https://www.npmjs.com/package/sms-ir
- **API Documentation:** Available in GitHub repository

---

## Step 14: Rollback Plan

If you need to rollback to Kavenegar:

1. Keep Kavenegar credentials in `.env` (commented out)
2. Code supports both services (SMS.ir takes priority)
3. To rollback:
   - Comment out SMS.ir variables
   - Uncomment Kavenegar variables
   - Restart application

---

## Summary

This migration guide covers:
- ✅ Account setup and verification
- ✅ API credentials configuration
- ✅ Template creation
- ✅ Environment variables
- ✅ Code implementation
- ✅ Testing procedures
- ✅ Troubleshooting
- ✅ Support resources

**Next Steps:**
1. Follow this guide step by step
2. Test thoroughly before production deployment
3. Monitor SMS.ir panel for delivery reports
4. Update documentation as needed

---

**Last Updated:** 2025-01-20  
**Migration Status:** Ready for Implementation

