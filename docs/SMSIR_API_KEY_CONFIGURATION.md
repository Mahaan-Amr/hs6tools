# SMS.ir API Key Configuration

## Your API Key

**API Key:** `qr6OhgdzDXrmHeEhS3MrJ6PbDF4fxehV86y8QvhEzrQKRyFw`

**Status:** ✅ Active (Production)

**Key Type:** Operational - Production

**Created:** 1404/09/29 | 17:38:37

---

## Environment Variable Configuration

### Required Configuration

Add to `.env.production`:

```env
# SMS.ir Configuration
SMSIR_API_KEY=qr6OhgdzDXrmHeEhS3MrJ6PbDF4fxehV86y8QvhEzrQKRyFw
SMSIR_VERIFY_TEMPLATE_ID=408915
```

### Optional Configuration

```env
# Secret Key (optional - new panels don't require it)
SMSIR_SECRET_KEY=

# Password Reset Template ID (optional - will use SMSIR_VERIFY_TEMPLATE_ID if not set)
SMSIR_PASSWORD_RESET_TEMPLATE_ID=

# Line Number (optional - will use default service number if not set)
SMSIR_LINE_NUMBER=
```

---

## Template Configuration

**Verify Template ID:** `408915`

**Template Status:** در حال بررسی (Under Review - pending approval)

**Template Content:** `کد تأیید شما #OTP# میباشد. این کد ۵ دقیقه اعتبار دارد.`

**Placeholder:** `#OTP#`

---

## Validation

The `update.sh` script will validate:

1. ✅ API Key is set and not a placeholder
2. ✅ API Key length (should be 64 characters)
3. ✅ Verify Template ID is set and numeric
4. ✅ Template ID format validation

**Expected Validation Output:**
```
✅ SMSIR_API_KEY validated (length: 64 chars)
✅ SMSIR_VERIFY_TEMPLATE_ID validated: 408915
✅ SMS.ir configuration validated successfully
```

---

## PM2 Environment Verification

After deployment, the script verifies:

```
✅ SMSIR_API_KEY is loaded in PM2 (length: 64 chars)
✅ SMSIR_VERIFY_TEMPLATE_ID is loaded in PM2: 408915
```

---

## Important Notes

1. **API Key Security:**
   - Never commit API keys to version control
   - Keep `.env.production` secure and private
   - Rotate keys if compromised

2. **Template Approval:**
   - Template `408915` is currently "در حال بررسی" (Under Review)
   - SMS will not work until template is approved
   - Check status at: https://app.sms.ir/fast-send/template

3. **API Key Management:**
   - View API keys at: https://app.sms.ir/developer/list
   - Create new keys if needed
   - Delete unused keys for security

---

## Quick Setup Checklist

- [x] API Key obtained: `qr6OhgdzDXrmHeEhS3MrJ6PbDF4fxehV86y8QvhEzrQKRyFw`
- [x] Template created: `408915`
- [ ] Template approved (pending)
- [ ] Added to `.env.production`
- [ ] Tested locally
- [ ] Deployed to production
- [ ] Verified PM2 environment variables

---

**Last Updated:** 2025-01-20  
**API Key Status:** ✅ Active  
**Template Status:** ⏳ Pending Approval

