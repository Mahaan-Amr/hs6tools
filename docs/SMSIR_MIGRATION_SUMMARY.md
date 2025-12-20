# 📱 SMS.ir Migration Summary

## Overview

The SMS service has been successfully migrated to support **SMS.ir** as the primary provider, with **Kavenegar** as a fallback option. The migration maintains backward compatibility while providing a seamless transition path.

---

## What Changed

### 1. **SMS Library (`src/lib/sms.ts`)**
- ✅ Refactored to support both SMS.ir and Kavenegar
- ✅ Automatic provider detection (SMS.ir takes priority)
- ✅ Same public API interface (no breaking changes)
- ✅ Comprehensive error handling for both providers
- ✅ Provider information included in responses

### 2. **API Routes**
- ✅ `src/app/api/auth/verify-phone/send/route.ts` - Updated to support SMS.ir template IDs
- ✅ `src/app/api/auth/reset-password/request/route.ts` - Updated to support SMS.ir template IDs
- ✅ Both routes check for SMS.ir first, then Kavenegar

### 3. **Update Script (`update.sh`)**
- ✅ Added `validate_sms_config()` function
- ✅ Added `validate_smsir_config()` function
- ✅ Updated PM2 environment variable verification
- ✅ Validates SMS.ir configuration (API key, secret key, template IDs, line number)

### 4. **Package Dependencies**
- ✅ Added `sms-ir` npm package
- ✅ Kavenegar package remains for fallback support

---

## Environment Variables

### SMS.ir Configuration (Priority)

```env
# Required
SMSIR_API_KEY=your_api_key_here
SMSIR_VERIFY_TEMPLATE_ID=123456

# Optional
SMSIR_SECRET_KEY=your_secret_key_here  # Only if required by your account
SMSIR_LINE_NUMBER=your_line_number     # Default service number used if not set
SMSIR_PASSWORD_RESET_TEMPLATE_ID=123457 # Optional, uses verify template if not set
```

### Kavenegar Configuration (Fallback)

```env
# Required (if not using SMS.ir)
KAVENEGAR_API_KEY=your_api_key_here
KAVENEGAR_SENDER=2000660110
```

---

## Migration Steps

### Step 1: Get SMS.ir Credentials

1. Register at https://sms.ir/
2. Complete account verification
3. Get API key from panel: **برنامه نویسان** > **لیست کلیدهای API**
4. Create templates and note Template IDs

### Step 2: Update Environment Variables

Add to `.env.production`:

```env
SMSIR_API_KEY=your_api_key
SMSIR_VERIFY_TEMPLATE_ID=your_template_id
```

### Step 3: Test

1. Run `update.sh` to validate configuration
2. Test phone verification flow
3. Check SMS.ir panel for delivery reports

### Step 4: Deploy

1. Push changes to repository
2. Run `update.sh` on server
3. Verify SMS.ir configuration in PM2
4. Test SMS functionality

---

## Template Configuration

### SMS.ir Templates

**Verification Code Template:**
- **Title:** `verify` (or any name)
- **Content:** `کد تأیید شما #OTP# می‌باشد. این کد 5 دقیقه اعتبار دارد.`
- **Placeholder:** `#OTP#`
- **Note:** Use the Template ID (number) in `SMSIR_VERIFY_TEMPLATE_ID`

**Password Reset Template (Optional):**
- **Title:** `password-reset`
- **Content:** `کد بازیابی رمز عبور شما #OTP# می‌باشد. این کد 10 دقیقه اعتبار دارد.`
- **Placeholder:** `#OTP#`
- **Note:** Use Template ID in `SMSIR_PASSWORD_RESET_TEMPLATE_ID`

### Kavenegar Templates (Fallback)

- **Template Name:** `verify` (for verification codes)
- **Template Name:** `password-reset` (for password reset)

---

## Provider Detection Logic

The system automatically detects which SMS provider to use:

1. **Check for SMS.ir:** If `SMSIR_API_KEY` is set → Use SMS.ir
2. **Check for Kavenegar:** If `KAVENEGAR_API_KEY` is set → Use Kavenegar
3. **Error:** If neither is set → Return error

**Priority:** SMS.ir > Kavenegar > Error

---

## API Compatibility

All existing code continues to work without changes:

```typescript
// Same interface, works with both providers
await sendSMS({
  receptor: '09123456789',
  message: 'Your message here'
});

await sendVerificationCode({
  receptor: '09123456789',
  token: '123456',
  template: 'verify' // Template name for Kavenegar, Template ID for SMS.ir
});
```

---

## Testing Checklist

- [ ] SMS.ir API key configured
- [ ] Template IDs configured
- [ ] Phone verification works
- [ ] Password reset works
- [ ] Order notifications work
- [ ] Welcome SMS works
- [ ] Error handling works
- [ ] Fallback to Kavenegar works (if needed)

---

## Troubleshooting

### SMS.ir Issues

**"Invalid API Key"**
- Verify API key in `.env.production`
- Check API key is active in SMS.ir panel

**"Template Not Found"**
- Verify Template ID is correct
- Check template is approved in panel
- Ensure Template ID matches panel

**"Insufficient Credit"**
- Check account balance in SMS.ir panel
- Recharge account if needed

### Fallback to Kavenegar

If SMS.ir is not configured, the system automatically falls back to Kavenegar (if configured). This ensures backward compatibility during migration.

---

## Documentation

- **Migration Guide:** `docs/SMSIR_MIGRATION_GUIDE.md`
- **Environment Requirements:** `docs/ENVIRONMENT_REQUIREMENTS.md`
- **Update Script Guide:** `docs/UPDATE_SCRIPT_COMPREHENSIVE_GUIDE.md`

---

## Support

- **SMS.ir Website:** https://sms.ir/
- **SMS.ir Panel:** https://app.sms.ir/
- **SMS.ir GitHub:** https://github.com/movahhedi/sms-ir-node
- **SMS.ir Documentation:** Available in GitHub repository

---

**Migration Status:** ✅ Complete  
**Last Updated:** 2025-01-20

