# Payment and Address Duplication Fixes

## Issues Identified

### Issue 1: ZarinPal Payment 401 Error
**Symptom:** Payment request fails with error code 401 when customer tries to pay
**Root Cause:** Environment variable `ZARINPAL_MERCHANT_ID` is not loaded in the production server's Node.js process

**Error in console:**
```
POST https://hs6tools.com/api/payment/zarinpal/request 500 (Internal Server Error)
❌ Payment request failed: خطا در درخواست پرداخت (کد: 401)
```

**Analysis:**
1. `.env.production` file exists with correct `ZARINPAL_MERCHANT_ID="34f387ef-3ba2-41ba-85ee-c86813806726"`
2. When checking `process.env.ZARINPAL_MERCHANT_ID` in Node.js, it returns `undefined`
3. The API endpoint creates default `PaymentSettings` with empty merchant ID
4. ZarinPal API returns 401 because merchant ID is invalid/empty

### Issue 2: Address Duplication on Failed Transactions
**Symptom:** Every time a payment fails or user retries checkout, addresses get duplicated
**Root Cause:** Order creation API always creates a NEW address, even when user selects an existing saved address

**Code Location:** `src/app/api/customer/orders/route.ts` lines 376-391

```typescript
// PROBLEM: Always creates new address
const shippingAddr = await tx.address.create({
  data: {
    userId: session.user.id,
    type: "SHIPPING",
    title: "آدرس ارسال",
    firstName: shippingAddress.firstName,
    lastName: shippingAddress.lastName,
    addressLine1: shippingAddress.address,
    city: shippingAddress.city,
    state: shippingAddress.province,
    postalCode: shippingAddress.postalCode,
    country: "Iran",
    phone: shippingAddress.phone,
    isDefault: false
  }
});
```

**Flow:**
1. User selects saved address from dropdown
2. Checkout sends address data to `/api/customer/orders`
3. API creates NEW address record (duplicate)
4. If payment fails, user tries again
5. Another NEW address is created (more duplicates)

## Solutions

### Solution 1: Fix Environment Variables in Production

**Option A: Use PM2 Ecosystem File (Recommended)**
Update `update.sh` to ensure PM2 loads environment variables:

```bash
# In update.sh, ensure PM2 is started with env file
pm2 restart hs6tools --update-env
pm2 save
```

**Option B: Set in PaymentSettings Database**
Manually set the merchant ID in the database:

```sql
UPDATE payment_settings 
SET "zarinpalMerchantId" = '34f387ef-3ba2-41ba-85ee-c86813806726',
    "zarinpalSandbox" = false
WHERE id = (SELECT id FROM payment_settings LIMIT 1);
```

**Option C: Use Admin Panel**
Navigate to Admin → Settings → Payment Settings and enter:
- Merchant ID: `34f387ef-3ba2-41ba-85ee-c86813806726`
- Sandbox Mode: Disabled (unchecked)

### Solution 2: Fix Address Duplication

**Approach:** 
1. Add `addressId` field to order creation request
2. If `addressId` is provided, use existing address
3. Only create new address if no `addressId` provided

**Implementation:**

#### Step 1: Update Checkout Client
Send `addressId` when using saved address:

```typescript
// In CheckoutPageClient.tsx
if (useSavedAddresses && selectedShippingAddress) {
  shippingAddressData = {
    addressId: selectedShippingAddress.id, // ADD THIS
    firstName: selectedShippingAddress.firstName,
    lastName: selectedShippingAddress.lastName,
    // ... rest of fields
  };
}
```

#### Step 2: Update Order API
Check for `addressId` before creating new address:

```typescript
// In src/app/api/customer/orders/route.ts
let shippingAddr;

if (shippingAddress.addressId) {
  // Use existing address
  shippingAddr = await tx.address.findUnique({
    where: { 
      id: shippingAddress.addressId,
      userId: session.user.id // Verify ownership
    }
  });
  
  if (!shippingAddr) {
    throw new Error("Selected address not found");
  }
} else {
  // Create new address
  shippingAddr = await tx.address.create({
    data: {
      // ... address data
    }
  });
}
```

## Implementation Status

### ✅ Completed Fixes

#### 1. Address Duplication Fix (COMPLETED)
**Files Modified:**
- `src/app/[locale]/checkout/CheckoutPageClient.tsx` - Added `addressId` field when using saved address
- `src/app/api/customer/orders/route.ts` - Check for `addressId` and reuse existing address instead of creating duplicate

**Changes:**
```typescript
// CheckoutPageClient.tsx - Now sends addressId
if (useSavedAddresses && selectedShippingAddress) {
  shippingAddressData = {
    addressId: selectedShippingAddress.id, // Prevents duplication
    // ... rest of fields
  };
}

// orders/route.ts - Now checks for addressId
if (shippingAddress.addressId) {
  // Use existing address
  shippingAddr = await tx.address.findFirst({
    where: { 
      id: shippingAddress.addressId,
      userId: session.user.id
    }
  });
} else {
  // Create new address only if no addressId
  shippingAddr = await tx.address.create({ ... });
}
```

#### 2. Environment Variable Fix Scripts (CREATED)
**Scripts Created:**
- `scripts/fix-payment-env.sh` - Fixes PM2 environment variables
- `scripts/fix-payment-settings.sh` - Updates database PaymentSettings
- `scripts/fix-payment-settings.sql` - SQL script to update PaymentSettings

### 🔧 Server-Side Actions Required

The code fixes are complete, but you need to run ONE of these solutions on the server:

#### Option 1: Fix PM2 Environment (Recommended)
```bash
# On the server (87.107.73.10)
cd /var/www/hs6tools
bash scripts/fix-payment-env.sh
```

#### Option 2: Fix Database Settings (Alternative)
```bash
# On the server (87.107.73.10)
cd /var/www/hs6tools
bash scripts/fix-payment-settings.sh
```

#### Option 3: Manual Database Update (Quick Fix)
```bash
# On the server (87.107.73.10)
psql -U hs6tools -d hs6tools_prod
```
```sql
UPDATE payment_settings 
SET "zarinpalMerchantId" = '34f387ef-3ba2-41ba-85ee-c86813806726',
    "zarinpalSandbox" = false
WHERE id = (SELECT id FROM payment_settings LIMIT 1);
```

## Implementation Priority

1. **CRITICAL:** Fix environment variables (Solution 1, 2, or 3)
   - Without this, NO payments can be processed
   - Choose ONE option above and run it on the server
   
2. **✅ COMPLETED:** Fix address duplication
   - Code changes already implemented
   - Will work automatically after deployment

## Testing Checklist

### Payment Testing
- [ ] Verify `ZARINPAL_MERCHANT_ID` is loaded in PM2
- [ ] Check PaymentSettings in database has correct merchant ID
- [ ] Test payment request returns valid payment URL
- [ ] Complete a test payment successfully
- [ ] Verify order status updates to PAID

### Address Testing
- [ ] Create new address during checkout → Should create new address
- [ ] Select saved address during checkout → Should NOT create duplicate
- [ ] Fail payment and retry → Should NOT create duplicate address
- [ ] Complete payment with saved address → Should use existing address
- [ ] Check address count before and after multiple checkout attempts

## Files Modified

1. `src/app/api/customer/orders/route.ts` - Fix address duplication
2. `src/app/[locale]/checkout/CheckoutPageClient.tsx` - Send addressId
3. `update.sh` - Ensure PM2 loads environment variables
4. `docs/PAYMENT_AND_ADDRESS_FIXES.md` - This documentation

## Rollback Plan

If issues occur:
1. Revert `src/app/api/customer/orders/route.ts` to always create new address
2. Manually set merchant ID in database using SQL
3. Restart PM2 with `pm2 restart hs6tools`

## Related Documentation

- `docs/ZARINPAL_PAYMENT_IMPLEMENTATION.md` - ZarinPal integration guide
- `docs/CART_AND_CHECKOUT_FIXES.md` - Previous checkout fixes
- `scripts/sync-env-and-pm2.sh` - Environment sync script

