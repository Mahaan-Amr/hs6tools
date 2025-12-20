# 🔍 Kavenegar Panel Exploration Guide

## Overview

This guide documents what needs to be checked and configured in the Kavenegar console panel to ensure SMS functionality works correctly.

---

## 📋 Key Sections to Check

### 1. **Account Status** ✅

**Location:** Profile → Account Management → "سرویس فعال" (Active Service)

**What to Check:**
- ✅ **Service Type:** "سرویس پیشرفته" (Advanced Service) - Good!
- ⚠️ **Upgrade Link:** "ارتقا" (Upgrade) - May indicate account needs verification
- ✅ **Service Expiry:** Check expiration date
- ✅ **Dedicated Lines:** Number of dedicated lines available

**Action Required:**
- If "ارتقا" (Upgrade) link is visible, account may need verification
- Check if service is expired and needs renewal

---

### 2. **API Key** ✅

**Location:** Profile → Account Management → "API Key"

**Current API Key:**
```
566555476F46314A72326D365563685134615464536C785744572F775A4463484B6469334E6E6F6B4D2F453D
```

**What to Verify:**
- ✅ API key matches what's in `.env.production`
- ✅ API key is active (not revoked)
- ✅ API key has proper permissions

**Action Required:**
- Copy API key to `.env.production` if different
- Regenerate API key if compromised

---

### 3. **Account Verification** ⚠️ **CRITICAL**

**Location:** Profile → Account Management → "سرویس فعال" (Active Service)

**Current Status:**
- Account shows "سرویس پیشرفته" (Advanced Service)
- "ارتقا" (Upgrade) link visible - **May indicate verification needed**

**Error Message:**
- "حساب کاربری احراز هویت نشده است" (Account is not verified)

**Action Required:**
1. **Check Verification Status:**
   - Look for verification badges/indicators
   - Check if ID verification is pending
   - Verify account email and phone number

2. **Complete Verification:**
   - Upload ID document (National ID or Passport)
   - Verify phone number
   - Complete profile information
   - Submit for review

3. **Wait for Approval:**
   - Usually takes 1-24 hours
   - Check email for status updates

---

### 4. **Account Credit** 💰

**Location:** Dashboard → "افزایش اعتبار" (Increase Credit)

**What to Check:**
- Current account balance
- Minimum credit required (usually 10,000+ Rials)
- Credit history

**Action Required:**
- Add credit if balance is low
- Monitor credit usage
- Set up low balance alerts

---

### 5. **Sender Numbers** 📱

**Location:** Dashboard → "مدیریت خطوط" (Line Management) or similar

**Current Configuration:**
- **Purchased Number:** `2000660110` (configured as default)
- **Public Number:** `10004346` (fallback option)

**What to Verify:**
- ✅ Sender number `2000660110` is active
- ✅ Number is assigned to your account
- ✅ Number has sending permissions

**Action Required:**
- Verify `2000660110` is active in panel
- Check if number needs activation
- Contact support if number is not working

---

### 6. **SMS Templates** 📝

**Location:** Dashboard → "احراز هویت" (Authentication) → Templates or "Lookup"

**Required Templates:**

#### Template 1: `verify`
**Used For:** Phone verification during registration

**Template Content:**
```
کد تأیید شما: {token}
این کد 5 دقیقه اعتبار دارد.
```

**Variables:**
- `{token}` - 6-digit verification code

**Status:** ⚠️ **NEEDS VERIFICATION**
- Check if template exists
- Create if missing
- Verify template is approved

#### Template 2: `password-reset` (Optional)
**Used For:** Password reset codes

**Template Content:**
```
کد بازیابی رمز عبور: {token}
این کد 10 دقیقه اعتبار دارد.
```

**Status:** ⚠️ **OPTIONAL**
- System falls back to simple SMS if template doesn't exist
- Create for better delivery rates

**Action Required:**
1. Navigate to Templates section
2. Check if `verify` template exists
3. Create template if missing:
   - Name: `verify`
   - Content: `کد تأیید شما: {token} - این کد 5 دقیقه اعتبار دارد.`
   - Variables: `{token}`
4. Wait for approval (usually instant)
5. Verify template is active

---

### 7. **Web Service Errors** ⚠️

**Location:** Dashboard → "خطاهای وب سرویس" (Web Service Errors)

**Current Status:**
- **8 errors** shown in dashboard (last 30 days)

**What to Check:**
1. Click on "8 خطاهای وب سرویس" link
2. Review error details:
   - Error codes (403, 401, etc.)
   - Error messages
   - Timestamps
   - Phone numbers that failed

**Common Errors:**
- **403:** Account verification required
- **401:** Invalid API key
- **402:** Insufficient credit
- **404:** Template not found
- **501:** Test account limitation

**Action Required:**
- Review error details
- Fix root cause (verification, credit, etc.)
- Retry failed SMS sends

---

### 8. **SMS Reports** 📊

**Location:** Dashboard → Reports

**What to Check:**
- **Daily Reports:** "گزارشات روزانه"
  - Sent count: Currently 0
  - Failed count: Currently 0
  - Delivered count: Currently 0
  - Web service errors: 8 errors

- **Monthly Reports:** "گزارش ماهیانه"
  - Overall statistics
  - Success rates
  - Cost analysis

**Action Required:**
- Monitor success rates
- Investigate failed sends
- Optimize based on reports

---

## 🔧 Configuration Checklist

### ✅ Completed
- [x] API Key obtained: `566555476F46314A72326D365563685134615464536C785744572F775A4463484B6469334E6E6F6B4D2F453D`
- [x] Sender number configured: `2000660110`
- [x] Account type: "سرویس پیشرفته" (Advanced Service)
- [x] Error detection implemented in code

### ⚠️ Action Required
- [ ] **Account Verification:** Complete account verification process
- [ ] **Template Creation:** Create `verify` template in panel
- [ ] **Error Review:** Review 8 web service errors
- [ ] **Credit Check:** Verify account has sufficient credit
- [ ] **Sender Number Verification:** Verify `2000660110` is active

---

## 🚨 Critical Issues Found

### Issue 1: Account Verification Required ⚠️ **HIGH PRIORITY**

**Evidence:**
- Error message: "حساب کاربری احراز هویت نشده است"
- "ارتقا" (Upgrade) link visible in profile
- 8 web service errors (likely verification-related)

**Solution:**
1. Go to Profile → Account Management
2. Look for verification section
3. Complete ID verification:
   - Upload National ID or Passport
   - Verify phone number
   - Complete profile
4. Wait for approval (1-24 hours)

### Issue 2: Template May Not Exist ⚠️ **MEDIUM PRIORITY**

**Evidence:**
- Code uses template `verify`
- System has fallback to simple SMS
- Template may not be created in panel

**Solution:**
1. Navigate to Templates section
2. Check if `verify` template exists
3. Create template if missing:
   ```
   Name: verify
   Content: کد تأیید شما: {token} - این کد 5 دقیقه اعتبار دارد.
   Variables: {token}
   ```
4. Wait for approval

### Issue 3: Web Service Errors ⚠️ **MEDIUM PRIORITY**

**Evidence:**
- 8 errors shown in dashboard
- Errors likely related to account verification

**Solution:**
1. Click on "8 خطاهای وب سرویس"
2. Review error details
3. Fix root cause (verification)
4. Monitor for new errors

---

## 📝 Step-by-Step Actions

### Step 1: Verify Account Status

1. Login to https://console.kavenegar.com
2. Go to Profile → Account Management → "سرویس فعال"
3. Check:
   - Service type
   - Expiration date
   - Verification status
4. If verification needed, complete it

### Step 2: Check API Key

1. Go to Profile → Account Management → "API Key"
2. Verify API key matches: `566555476F46314A72326D365563685134615464536C785744572F775A4463484B6469334E6E6F6B4D2F453D`
3. Copy to `.env.production` if different

### Step 3: Create SMS Template

1. Navigate to Templates section (usually under "احراز هویت" or "Lookup")
2. Create new template:
   - **Name:** `verify`
   - **Content:** `کد تأیید شما: {token} - این کد 5 دقیقه اعتبار دارد.`
   - **Variables:** `{token}`
3. Submit for approval
4. Wait for approval (usually instant)

### Step 4: Verify Sender Number

1. Navigate to "مدیریت خطوط" (Line Management) or similar
2. Check if `2000660110` is listed
3. Verify it's active
4. Contact support if number is not working

### Step 5: Review Errors

1. Click on "8 خطاهای وب سرویس"
2. Review error details
3. Note error codes and messages
4. Fix root causes

### Step 6: Check Credit

1. Go to Dashboard → "افزایش اعتبار"
2. Check current balance
3. Add credit if needed (minimum 10,000 Rials recommended)

---

## 🔍 Navigation Guide

### Main Menu Items (Sidebar):

1. **راهنمای شروع** (Getting Started Guide)
2. **پیشخوان** (Dashboard) - Statistics and info
3. **احراز هویت** (Authentication) - Templates and verification
4. **ارسال پیامک** (Send SMS) - Send SMS manually
5. **گزارش پیام ها** (Message Reports) - View SMS history
6. **مدیریت خطوط** (Line Management) - Sender numbers
7. **خرید** (Purchase) - Buy credit
8. **مدیریت مالی** (Financial Management) - Billing

### Key URLs:

- **Dashboard:** https://console.kavenegar.com/
- **Account Management:** https://console.kavenegar.com/profile
- **API Key:** https://console.kavenegar.com/profile (API Key tab)
- **Active Service:** https://console.kavenegar.com/profile (سرویس فعال tab)

---

## 📞 Support

If you need help:

- **Email:** support@kavenegar.com
- **Panel:** https://console.kavenegar.com
- **Documentation:** https://kavenegar.com/rest.html

---

**Last Updated:** December 9, 2025  
**Status:** ⚠️ Account Verification Required  
**Priority:** Complete account verification to enable SMS sending

