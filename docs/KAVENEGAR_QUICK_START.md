# 📱 Kavenegar Quick Start Guide

## ✅ Your Configuration

**API Key:** `566555476F46314A72326D365563685134615464536C785744572F775A4463484B6469334E6E6F6B4D2F453D`  
**Sender Number:** `2000660110` (Purchased)

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Add to `.env` or `.env.production`

```env
KAVENEGAR_API_KEY=566555476F46314A72326D365563685134615464536C785744572F775A4463484B6469334E6E6F6B4D2F453D
KAVENEGAR_SENDER=2000660110
```

### Step 2: Restart Server

```bash
# If using PM2
pm2 restart all

# Or restart Next.js
npm run start
```

### Step 3: Test

Try registering a new user - SMS verification code should be sent automatically!

---

## ✅ What's Already Configured

- ✅ Default sender number: `2000660110` (your purchased number)
- ✅ Error handling for all common Kavenegar errors
- ✅ Timeout protection (30 seconds)
- ✅ Rate limiting (prevents abuse)
- ✅ CSRF protection
- ✅ Automatic fallback (template → simple SMS)
- ✅ Comprehensive logging

---

## 📋 Common Use Cases

### 1. Phone Verification (Automatic)
Already implemented in registration flow - no action needed!

### 2. Password Reset (Automatic)
Already implemented - no action needed!

### 3. Order Notifications (Automatic)
Already implemented in payment flow - no action needed!

### 4. Custom SMS (Admin Only)
Use the admin panel or API endpoint `/api/sms/send`

---

## 🔍 Troubleshooting

### SMS Not Sending?

1. **Check API Key:**
   ```bash
   pm2 env <app-name> | grep KAVENEGAR
   ```

2. **Check Account Credit:**
   - Login to https://panel.kavenegar.com
   - Check "Wallet" or "Account Balance"
   - Recharge if needed

3. **Check Server Logs:**
   ```bash
   pm2 logs <app-name>
   ```
   Look for: `✅ [sendSMS] SMS sent successfully` or error messages

4. **Verify Sender Number:**
   - Login to Kavenegar panel
   - Check "Lines" or "Sender Numbers"
   - Verify `2000660110` is active

---

## 📚 Full Documentation

- **[Production Setup Guide](./KAVENEGAR_PRODUCTION_SETUP.md)** - Complete implementation guide
- **[Troubleshooting Guide](./SMS_VERIFICATION_TROUBLESHOOTING.md)** - Common issues and solutions
- **[Account Setup Guide](./KAVENEGAR_ACCOUNT_SETUP_GUIDE.md)** - Account configuration

---

## 🎯 Production Checklist

- [x] API Key configured
- [x] Sender number set (`2000660110`)
- [ ] Account has credit (check in panel)
- [ ] Server restarted after config
- [ ] Test SMS sent successfully
- [ ] Error handling verified

---

**Last Updated:** December 9, 2025  
**Status:** ✅ Ready for Production

