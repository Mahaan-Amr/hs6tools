# 🚀 Deployment Instructions - Payment & Address Fixes

## Summary of Issues Fixed

### Issue 1: ZarinPal Payment 401 Error ✅
**Problem:** Payment requests failing with 401 error
**Root Cause:** `ZARINPAL_MERCHANT_ID` environment variable not loaded in PM2
**Status:** Code fixed, requires server-side action

### Issue 2: Address Duplication ✅
**Problem:** Addresses duplicated on failed payment attempts
**Root Cause:** API always creates new address instead of reusing saved ones
**Status:** Fully fixed in code

## Files Changed

### Code Changes (Already Committed)
1. **src/app/[locale]/checkout/CheckoutPageClient.tsx**
   - Added `addressId` field when using saved addresses
   - Line 315: Added `addressId: selectedShippingAddress.id`

2. **src/app/api/customer/orders/route.ts**
   - Modified address creation logic to check for existing `addressId`
   - Lines 374-407: Added conditional logic to reuse or create address

3. **docs/PAYMENT_AND_ADDRESS_FIXES.md**
   - Comprehensive documentation of issues and fixes

### New Scripts Created
1. **scripts/fix-payment-env.sh** - Fixes PM2 environment variables
2. **scripts/fix-payment-settings.sh** - Updates database PaymentSettings  
3. **scripts/fix-payment-settings.sql** - SQL to update PaymentSettings

## Deployment Steps

### Step 1: Deploy Code Changes to Server

```bash
# On your local machine (if not already pushed)
git add .
git commit -m "fix: resolve payment 401 error and address duplication issues"
git push origin master

# On the server (87.107.73.10)
ssh root@87.107.73.10
cd /var/www/hs6tools
bash update.sh
```

The `update.sh` script will:
- Pull latest changes
- Install dependencies
- Run migrations
- Build application
- Restart PM2 with updated environment

### Step 2: Fix Payment Environment (Choose ONE Option)

#### Option A: Use Fix Script (Recommended)
```bash
# On the server
cd /var/www/hs6tools
bash scripts/fix-payment-env.sh
```

This script will:
- Copy `.env.production` to `.env`
- Restart PM2 with fresh environment
- Verify `ZARINPAL_MERCHANT_ID` is loaded

#### Option B: Fix Database Settings
```bash
# On the server
cd /var/www/hs6tools
bash scripts/fix-payment-settings.sh
```

This script will:
- Update `payment_settings` table with correct merchant ID
- Set sandbox mode to false

#### Option C: Manual Database Fix (Quickest)
```bash
# On the server
psql -U hs6tools -d hs6tools_prod
```
```sql
UPDATE payment_settings 
SET "zarinpalMerchantId" = '34f387ef-3ba2-41ba-85ee-c86813806726',
    "zarinpalSandbox" = false,
    "updatedAt" = NOW()
WHERE id = (SELECT id FROM payment_settings LIMIT 1);

-- Verify
SELECT 
    SUBSTRING("zarinpalMerchantId", 1, 8) || '...' as merchant_id,
    "zarinpalSandbox" as sandbox
FROM payment_settings;
```
Then restart PM2:
```bash
pm2 restart hs6tools
```

### Step 3: Verify Deployment

#### Check PM2 Status
```bash
pm2 status hs6tools
pm2 logs hs6tools --lines 50
```

#### Check Environment Variables
```bash
pm2 env hs6tools | grep ZARINPAL
```

Expected output:
```
ZARINPAL_MERCHANT_ID: 34f387ef-3ba2-41ba-85ee-c86813806726
ZARINPAL_SANDBOX: false
```

#### Check Database Settings
```bash
psql -U hs6tools -d hs6tools_prod -c "SELECT SUBSTRING(\"zarinpalMerchantId\", 1, 8) || '...' as merchant_id, \"zarinpalSandbox\" FROM payment_settings;"
```

Expected output:
```
 merchant_id | zarinpalSandbox 
-------------+-----------------
 34f387ef... | f
```

### Step 4: Test Payment Flow

1. **Navigate to website:** https://hs6tools.com/fa
2. **Add product to cart**
3. **Go to checkout:** https://hs6tools.com/fa/checkout
4. **Select saved address** (to test address duplication fix)
5. **Click "پرداخت"** (Pay button)
6. **Expected:** Should redirect to ZarinPal payment page
7. **Check console:** Should NOT see 401 error

#### What to Look For

**✅ Success Indicators:**
- Payment URL returned successfully
- Redirected to ZarinPal payment page
- Console shows: `✅ Payment request created successfully`
- No 401 errors in console

**❌ Failure Indicators:**
- 401 error in console
- Error message: "خطا در درخواست پرداخت (کد: 401)"
- Payment request fails

### Step 5: Test Address Duplication Fix

1. **Go to checkout with saved address**
2. **Note current address count:**
   ```sql
   SELECT COUNT(*) FROM addresses WHERE "userId" = 'YOUR_USER_ID';
   ```
3. **Complete checkout** (payment can fail)
4. **Try checkout again** with same address
5. **Check address count again** - should be SAME, not increased

## Rollback Plan

If issues occur after deployment:

### Rollback Code Changes
```bash
# On the server
cd /var/www/hs6tools
git log --oneline -5  # Find commit hash before changes
git reset --hard <previous-commit-hash>
bash update.sh
```

### Rollback Database Changes
```sql
-- If you updated payment_settings and need to revert
UPDATE payment_settings 
SET "zarinpalMerchantId" = '',
    "zarinpalSandbox" = true
WHERE id = (SELECT id FROM payment_settings LIMIT 1);
```

## Troubleshooting

### Issue: Still getting 401 error after deployment

**Solution 1:** Check if environment variable is loaded
```bash
pm2 env hs6tools | grep ZARINPAL_MERCHANT_ID
```

If empty, run:
```bash
cd /var/www/hs6tools
bash scripts/fix-payment-env.sh
```

**Solution 2:** Check database settings
```bash
psql -U hs6tools -d hs6tools_prod -c "SELECT * FROM payment_settings;"
```

If `zarinpalMerchantId` is empty, run:
```bash
bash scripts/fix-payment-settings.sh
```

### Issue: Addresses still duplicating

**Check:** Verify code changes are deployed
```bash
cd /var/www/hs6tools
git log --oneline -1  # Should show your latest commit
grep -n "addressId: selectedShippingAddress.id" src/app/[locale]/checkout/CheckoutPageClient.tsx
```

If not found, pull latest changes:
```bash
git pull origin master
bash update.sh
```

### Issue: PM2 not loading environment variables

**Solution:** Delete and restart PM2 with ecosystem config
```bash
pm2 delete hs6tools
pm2 start ecosystem.config.js --env production
pm2 save
```

## Post-Deployment Monitoring

### Monitor Logs
```bash
# Watch logs in real-time
pm2 logs hs6tools

# Check for payment errors
pm2 logs hs6tools | grep -i "payment\|zarinpal\|401"

# Check for address creation
pm2 logs hs6tools | grep -i "address"
```

### Monitor Database
```sql
-- Check payment settings
SELECT * FROM payment_settings;

-- Check recent orders
SELECT id, "orderNumber", "paymentStatus", "createdAt" 
FROM orders 
ORDER BY "createdAt" DESC 
LIMIT 10;

-- Check address growth
SELECT DATE("createdAt") as date, COUNT(*) as addresses_created
FROM addresses
GROUP BY DATE("createdAt")
ORDER BY date DESC
LIMIT 7;
```

## Success Criteria

✅ Payment requests return valid ZarinPal URLs  
✅ No 401 errors in payment flow  
✅ Saved addresses are reused (no duplicates)  
✅ New addresses are created only when needed  
✅ PM2 shows `ZARINPAL_MERCHANT_ID` in environment  
✅ Database `payment_settings` has correct merchant ID  
✅ Customers can complete purchases successfully  

## Support

If you encounter any issues:

1. **Check logs:** `pm2 logs hs6tools`
2. **Check database:** `psql -U hs6tools -d hs6tools_prod`
3. **Review documentation:** `docs/PAYMENT_AND_ADDRESS_FIXES.md`
4. **Contact:** Refer to error messages and logs

## Related Documentation

- `docs/PAYMENT_AND_ADDRESS_FIXES.md` - Detailed analysis and fixes
- `docs/ZARINPAL_PAYMENT_IMPLEMENTATION.md` - ZarinPal integration guide
- `docs/CART_AND_CHECKOUT_FIXES.md` - Previous checkout fixes
- `scripts/fix-payment-env.sh` - Environment fix script
- `scripts/fix-payment-settings.sh` - Database fix script

---

**Last Updated:** December 8, 2025  
**Version:** 1.0  
**Status:** Ready for Deployment

