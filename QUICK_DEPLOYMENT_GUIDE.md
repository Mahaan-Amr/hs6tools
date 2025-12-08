# 🚀 Quick Deployment Guide - Payment & Address Fixes

## What Was Fixed

### ✅ Issue 1: Payment 401 Error
- **Problem:** ZarinPal payment requests failing with 401 error
- **Cause:** `ZARINPAL_MERCHANT_ID` not loaded in server environment
- **Fix:** Created scripts to load environment variables properly

### ✅ Issue 2: Address Duplication
- **Problem:** Addresses duplicated every time payment fails
- **Cause:** API always creates new address instead of reusing saved ones
- **Fix:** Modified code to check for existing address before creating new one

## Quick Deployment (3 Steps)

### Step 1: Deploy Code to Server
```bash
# On server (87.107.73.10)
ssh root@87.107.73.10
cd /var/www/hs6tools
bash update.sh
```

### Step 2: Fix Payment Environment (Choose ONE)

**Option A - Quick Database Fix (30 seconds):**
```bash
psql -U hs6tools -d hs6tools_prod -c "UPDATE payment_settings SET \"zarinpalMerchantId\" = '34f387ef-3ba2-41ba-85ee-c86813806726', \"zarinpalSandbox\" = false;"
pm2 restart hs6tools
```

**Option B - Use Fix Script:**
```bash
bash scripts/fix-payment-env.sh
```

**Option C - Database Script:**
```bash
bash scripts/fix-payment-settings.sh
```

### Step 3: Test
1. Go to https://hs6tools.com/fa/checkout
2. Add item to cart and checkout
3. Click "پرداخت" button
4. Should redirect to ZarinPal (no 401 error)

## Verify Success

```bash
# Check PM2 is running
pm2 status hs6tools

# Check environment variable
pm2 env hs6tools | grep ZARINPAL_MERCHANT_ID

# Check database
psql -U hs6tools -d hs6tools_prod -c "SELECT SUBSTRING(\"zarinpalMerchantId\", 1, 8) || '...' FROM payment_settings;"
```

## Expected Results

✅ No 401 errors in payment  
✅ Payment redirects to ZarinPal  
✅ Addresses don't duplicate  
✅ Saved addresses are reused  

## If Something Goes Wrong

```bash
# Check logs
pm2 logs hs6tools --lines 50

# Restart PM2
pm2 restart hs6tools

# Re-run fix script
bash scripts/fix-payment-env.sh
```

## Files Changed

- `src/app/[locale]/checkout/CheckoutPageClient.tsx` - Added addressId field
- `src/app/api/customer/orders/route.ts` - Check for existing address
- `scripts/fix-payment-env.sh` - New fix script
- `scripts/fix-payment-settings.sh` - New fix script
- `scripts/fix-payment-settings.sql` - New SQL script
- `docs/PAYMENT_AND_ADDRESS_FIXES.md` - Documentation
- `DEPLOYMENT_INSTRUCTIONS_PAYMENT_FIX.md` - Detailed guide

## Need Help?

See detailed documentation:
- **Full Guide:** `DEPLOYMENT_INSTRUCTIONS_PAYMENT_FIX.md`
- **Technical Details:** `docs/PAYMENT_AND_ADDRESS_FIXES.md`

---

**Total Time:** ~5 minutes  
**Difficulty:** Easy  
**Risk:** Low (changes are isolated and tested)

