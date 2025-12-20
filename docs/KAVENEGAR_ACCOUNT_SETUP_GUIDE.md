# 📱 Kavenegar Account Setup Guide

## ❓ Do You Need to Buy a Phone Number?

**Short Answer: NO!** You don't need to buy a phone number. Here's what you actually need:

---

## 🎯 What You Actually Need

### 1. **Production Kavenegar Account** ✅ (Required)

**Current Issue:** You're using a **test/sandbox account**, which has limitations:
- ❌ Can only send SMS to account owner's phone number
- ❌ Error: "امکان ارسال پیامک فقط به شماره صاحب حساب داده شده است"

**Solution:** Upgrade to **production account** in Kavenegar panel:
1. Login to [Kavenegar Panel](https://panel.kavenegar.com)
2. Go to **Account Settings** or **Membership**
3. **Upgrade from Test/Sandbox to Production**
4. Complete account verification (usually requires ID verification)

**Cost:** Usually free to upgrade, but you need to verify your account

---

### 2. **API Key from Production Account** ✅ (Required)

**Current:** You have an API key, but it's from a test account

**Solution:**
1. After upgrading to production, get a new API key
2. Go to **API Keys** section in Kavenegar panel
3. Copy your production API key
4. Update your `.env` file:
   ```env
   KAVENEGAR_API_KEY=your_production_api_key_here
   ```

---

### 3. **Account Credit** ✅ (Required)

**What:** You need to have credit (balance) in your Kavenegar account to send SMS

**Cost:** 
- SMS prices vary (usually around 50-200 Rials per SMS in Iran)
- You need to charge your account with credit
- Check current prices in Kavenegar panel

**How to Charge:**
1. Login to Kavenegar panel
2. Go to **Charge Account** or **Wallet**
3. Add credit using payment methods (bank transfer, online payment, etc.)

---

### 4. **Sender Number** ✅ (Optional - Free Available)

**You have 3 options:**

#### Option A: Public Number (FREE) ✅ Recommended for Start
- **Number:** `10004346` (default in our code)
- **Cost:** FREE
- **Pros:** 
  - No setup required
  - Works immediately
  - Good for testing and small projects
- **Cons:** 
  - Generic sender ID (not your brand name)
  - Shared with other users

#### Option B: Dedicated Number (May have cost)
- **Number:** `30007732` or similar
- **Cost:** May require activation fee or monthly fee
- **Pros:** 
  - Dedicated to your account
  - Better delivery rates
- **Cons:** 
  - May have costs
  - Requires activation

#### Option C: Private Number (Your own number)
- **Number:** Your own phone number
- **Cost:** Usually free, but requires verification
- **Pros:** 
  - Your own number
  - Brand recognition
- **Cons:** 
  - Requires verification process
  - May take time to activate

**Current Setup:** We're using `10004346` (public number) - **this is FREE and works fine!**

---

## 📋 Step-by-Step Setup Guide

### Step 1: Check Your Current Account Status

1. Login to [Kavenegar Panel](https://panel.kavenegar.com)
2. Check your account type:
   - **Test/Sandbox** → Need to upgrade
   - **Production** → Good to go!

### Step 2: Upgrade to Production (If Needed)

1. Go to **Account Settings** → **Membership**
2. Click **Upgrade to Production** or **Activate Account**
3. Complete verification:
   - Upload ID document
   - Verify phone number
   - Complete profile information
4. Wait for approval (usually 1-24 hours)

### Step 3: Get Production API Key

1. After account is activated, go to **API Keys**
2. Create a new API key (or use existing if it's production)
3. Copy the API key

### Step 4: Charge Your Account

1. Go to **Charge Account** or **Wallet**
2. Add credit (minimum amount varies)
3. Complete payment

### Step 5: Update Environment Variables

Update your `.env` or `.env.production` file:

```env
# Production API Key (from production account)
KAVENEGAR_API_KEY=566555476F46314A72326D365563685134615464536C785744572F775A4463484B6469334E6E6F6B4D2F453D

# Sender number (optional - defaults to 2000660110 which is purchased)
KAVENEGAR_SENDER=2000660110
```

### Step 6: Restart Your Server

```bash
# If using PM2
pm2 restart all

# Or restart your Next.js server
npm run dev  # or npm run start
```

---

## 💰 Cost Breakdown

### What Costs Money:

1. **SMS Credits** ✅ (Required)
   - Cost per SMS: ~50-200 Rials (varies)
   - You pay per SMS sent
   - Example: 1000 SMS = ~50,000-200,000 Rials

2. **Account Upgrade** ❌ (Usually Free)
   - Upgrading from test to production is usually free
   - Just requires verification

3. **Phone Number** ❌ (Free Option Available)
   - Public number (10004346): **FREE**
   - Dedicated number: May have costs (optional)
   - Private number: Usually free (optional)

### What's Free:

- ✅ Account registration
- ✅ Account upgrade (verification)
- ✅ Public sender number (10004346)
- ✅ API access
- ✅ Templates (up to certain limit)

---

## 🎯 Recommended Setup for Your Project

### For Development/Testing:

```env
# Use test account (current limitation is expected)
KAVENEGAR_API_KEY=your_test_api_key
KAVENEGAR_SENDER=10004346
```

**Note:** Test account limitation is expected - use the code display feature we implemented!

### For Production:

```env
# Use production account
KAVENEGAR_API_KEY=566555476F46314A72326D365563685134615464536C785744572F775A4463484B6469334E6E6F6B4D2F453D
KAVENEGAR_SENDER=2000660110  # Purchased sender number (default)
```

**Benefits:**
- ✅ Can send to any phone number
- ✅ No limitations
- ✅ Professional SMS delivery
- ✅ Free sender number included

---

## ✅ Checklist

Before going to production, make sure:

- [ ] Account upgraded to **Production** (not test/sandbox)
- [ ] Production API key obtained and set in `.env`
- [ ] Account has sufficient credit (at least 10,000 Rials recommended)
- [ ] Sender number configured (10004346 is fine, it's free)
- [ ] SMS templates created in Kavenegar panel (optional but recommended)
- [ ] Server restarted after updating environment variables
- [ ] Test SMS sent successfully to verify setup

---

## 🔍 How to Verify Your Account Type

### Check in Kavenegar Panel:

1. Login to [Kavenegar Panel](https://panel.kavenegar.com)
2. Look at your account dashboard
3. Check for indicators:
   - **"Test Account"** or **"Sandbox"** → Need to upgrade
   - **"Production"** or **"Active"** → Good!
   - **"Pending Verification"** → Wait for approval

### Check via API:

Try sending an SMS to a number other than your account owner's:
- **Test Account:** Will fail with error 501
- **Production Account:** Will work for any valid number

---

## 🚀 Quick Start (Minimum Requirements)

**To start sending SMS to your users, you need:**

1. ✅ **Production Kavenegar account** (upgrade from test)
2. ✅ **Production API key** (get from panel)
3. ✅ **Account credit** (charge your wallet)
4. ✅ **Public sender number** (10004346 - already configured, FREE)

**Total Cost:** Only SMS credits (pay per SMS sent)

**No need to buy:**
- ❌ Phone number (public number is free)
- ❌ Dedicated sender (optional, not required)
- ❌ Special subscription (pay per SMS only)

---

## 📞 Support

If you need help:
1. **Kavenegar Support:** [support@kavenegar.com](mailto:support@kavenegar.com)
2. **Kavenegar Panel:** [panel.kavenegar.com](https://panel.kavenegar.com)
3. **Documentation:** Check our troubleshooting guide

---

## 📝 Summary

**What you need:**
- ✅ Production account (upgrade from test - usually free)
- ✅ Production API key
- ✅ Account credit (pay per SMS)
- ✅ Public sender number (10004346 - free, already configured)

**What you DON'T need:**
- ❌ Buy a phone number (public number is free)
- ❌ Special subscription
- ❌ Dedicated sender (optional)

**Current Issue:**
- You're using a **test account** which has limitations
- **Solution:** Upgrade to production account in Kavenegar panel

---

**Last Updated:** December 9, 2025

