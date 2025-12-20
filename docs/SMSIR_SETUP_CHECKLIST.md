# ✅ SMS.ir Setup Checklist

## Pre-Integration Checklist

### Account Setup
- [x] Account created and verified
- [x] Logged into SMS.ir panel
- [x] Current credit: 21,900 Rials (10 SMS)
- [x] Plan: Free Plan (may need upgrade for production)

### API Key Creation
- [ ] Navigate to: `https://app.sms.ir/developer/list`
- [ ] Click "افزودن کلید جدید" (Add New Key)
- [ ] Name: "HS6Tools Production"
- [ ] Copy API Key
- [ ] Add to `.env.production`: `SMSIR_API_KEY=your_api_key_here`

### Template Creation

#### Verification Code Template
- [ ] Navigate to: `https://app.sms.ir/fast-send/template`
- [ ] Click "افزودن قالب" (Add Template)
- [ ] Title: `verify`
- [ ] Content: `کد تأیید شما #OTP# می‌باشد. این کد 5 دقیقه اعتبار دارد.`
- [ ] Placeholder: `#OTP#`
- [ ] Wait for approval
- [ ] Note Pattern Code (Template ID) - it's a number
- [ ] Add to `.env.production`: `SMSIR_VERIFY_TEMPLATE_ID=your_pattern_code`

#### Password Reset Template (Optional)
- [ ] Navigate to: `https://app.sms.ir/fast-send/template`
- [ ] Click "افزودن قالب" (Add Template)
- [ ] Title: `password-reset`
- [ ] Content: `کد بازیابی رمز عبور شما #OTP# می‌باشد. این کد 10 دقیقه اعتبار دارد.`
- [ ] Placeholder: `#OTP#`
- [ ] Wait for approval
- [ ] Note Pattern Code (Template ID)
- [ ] Add to `.env.production`: `SMSIR_PASSWORD_RESET_TEMPLATE_ID=your_pattern_code`

### Environment Variables

Update `.env.production`:
```env
# Required
SMSIR_API_KEY=your_api_key_from_panel
SMSIR_VERIFY_TEMPLATE_ID=your_pattern_code_number

# Optional (new panels don't need secret key)
SMSIR_SECRET_KEY=  # Leave empty or null
SMSIR_LINE_NUMBER=  # Optional, uses default if not set
SMSIR_PASSWORD_RESET_TEMPLATE_ID=  # Optional
```

### Testing

#### Local Testing
- [ ] Copy `.env.production` to `.env.local`
- [ ] Update with your credentials
- [ ] Test phone verification flow
- [ ] Check SMS.ir panel for delivery reports
- [ ] Verify SMS received correctly

#### Production Deployment
- [ ] Push changes to GitHub
- [ ] Run `update.sh` on server
- [ ] Verify SMS.ir configuration in PM2
- [ ] Test phone verification
- [ ] Monitor error logs: `https://app.sms.ir/developer/logs`
- [ ] Check delivery reports

### Monitoring

#### Check Delivery Reports
- [ ] Navigate to: Reports section
- [ ] Verify SMS delivery status
- [ ] Check for any failed deliveries

#### Monitor API Errors
- [ ] Navigate to: `https://app.sms.ir/developer/logs`
- [ ] Check for API call errors
- [ ] Review error messages if any

#### Account Status
- [ ] Check credit balance
- [ ] Monitor usage
- [ ] Consider upgrading plan if needed

---

## Important Notes

1. **No Secret Key Required:**
   - New SMS.ir panels only provide API key
   - Set `SMSIR_SECRET_KEY` to empty or omit it

2. **Template IDs:**
   - Use Pattern Code (number), not template name
   - Pattern Code is shown after template creation
   - Must be approved before use

3. **Template Placeholders:**
   - Can use `#OTP#` or `{OTP}` format
   - UltraFastSend uses `{OTP}` format
   - VerificationCode uses `#OTP#` format

4. **Free Plan Limitations:**
   - Current credit: 21,900 Rials (10 SMS)
   - May need to upgrade for production
   - Check plan limits

---

## Troubleshooting

### API Key Issues
- Verify API key is correct
- Check API key is active in panel
- Ensure no extra spaces in environment variable

### Template Issues
- Verify Pattern Code (Template ID) is correct
- Check template is approved
- Ensure template ID matches panel

### SMS Not Received
- Check SMS.ir panel for delivery status
- Verify phone number format (09123456789)
- Check account credit balance
- Review error logs in panel

---

**Last Updated:** 2025-01-20

