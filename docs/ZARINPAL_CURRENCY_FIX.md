# ZarinPal Currency Fix - Rials vs Tomans

**Date:** December 8, 2025  
**Status:** ✅ Completed  
**Priority:** 🔴 Critical

---

## 📋 Problem Summary

After implementing the UI currency display fix (showing prices in Tomans), ZarinPal payment gateway was showing **incorrect amounts** - it was displaying the Toman value as Rials, making it 10x less than the actual price.

### Issue Reported by User:
> "ok still the zarin pal is showing the exact price but in rials so we should send the price to zarin pal with and extra 0 so it goes from toman to rials"

### Example:
- **Platform shows:** 97,650 تومان (correct)
- **ZarinPal showed:** 97,650 ریال (wrong - should be 976,500 ریال)
- **Expected:** 976,500 ریال in ZarinPal

---

## 🔍 Root Cause Analysis

### Initial Misunderstanding:
We initially thought ZarinPal v4 REST API expected amounts in **Tomans**, so we were converting:
```typescript
// ❌ WRONG APPROACH
const amountInTomans = rialsToTomans(Number(order.totalAmount)); // 976500 / 10 = 97650
// Send 97,650 to ZarinPal → Shows as 97,650 ریال (WRONG!)
```

### Actual Requirement:
**ZarinPal v4 REST API expects amounts in RIALS**, not Tomans!

```typescript
// ✅ CORRECT APPROACH
const amountInRials = Number(order.totalAmount); // 976500
// Send 976,500 to ZarinPal → Shows as 976,500 ریال (CORRECT!)
```

---

## 📚 Research & Verification

### ZarinPal API Documentation:
- **Official API:** https://www.zarinpal.com/docs/
- **Currency Unit:** Rials (IRR)
- **Minimum Amount:** 10,000 Rials

### Key Findings:
1. **REST API v4** expects amounts in **Rials**
2. Some older SDKs had a `currency` or `isTomam` parameter, but the raw REST API uses **Rials**
3. The `amount` parameter in both request and verify endpoints is in **Rials**

---

## ✅ Solution Implemented

### 1. **Updated Payment Request** (`src/app/api/payment/zarinpal/request/route.ts`)

```typescript
// ❌ BEFORE: Converting to Tomans
const amountInTomans = rialsToTomans(Number(order.totalAmount));
if (amountInTomans < 1000) { // Checking for 1000 Tomans
  // Error
}
const amountInteger = Math.floor(amountInTomans);

// ✅ AFTER: Using Rials directly
const amountInRials = Number(order.totalAmount);
if (amountInRials < 10000) { // Checking for 10,000 Rials
  // Error
}
const amountInteger = Math.floor(amountInRials);
```

### 2. **Updated Payment Verification** (`src/app/api/payment/zarinpal/callback/route.ts`)

```typescript
// ❌ BEFORE: Converting to Tomans
const amountInTomans = rialsToTomans(Number(order.totalAmount));
const verifyResult = await verifyPayment({
  merchantId: paymentSettings.zarinpalMerchantId,
  authority,
  amount: amountInTomans, // Wrong!
  sandbox: paymentSettings.zarinpalSandbox,
});

// ✅ AFTER: Using Rials directly
const amountInRials = Number(order.totalAmount);
const verifyResult = await verifyPayment({
  merchantId: paymentSettings.zarinpalMerchantId,
  authority,
  amount: amountInRials, // Correct!
  sandbox: paymentSettings.zarinpalSandbox,
});
```

### 3. **Updated Webhook Handler** (`src/app/api/payment/zarinpal/webhook/route.ts`)

```typescript
// ❌ BEFORE: Converting to Tomans
const amountInTomans = rialsToTomans(Number(order.totalAmount));
const verifyResult = await verifyPayment({
  merchantId: paymentSettings.zarinpalMerchantId,
  authority,
  amount: amountInTomans,
  sandbox: paymentSettings.zarinpalSandbox,
});

// ✅ AFTER: Using Rials directly
const amountInRials = Number(order.totalAmount);
const verifyResult = await verifyPayment({
  merchantId: paymentSettings.zarinpalMerchantId,
  authority,
  amount: amountInRials,
  sandbox: paymentSettings.zarinpalSandbox,
});
```

### 4. **Updated Documentation** (`src/lib/zarinpal.ts`)

```typescript
// Updated interface comments
export interface PaymentRequestOptions {
  merchantId: string;
  amount: number; // Amount in Rials (IRR) - ZarinPal v4 REST API expects Rials
  description: string;
  callbackUrl: string;
  mobile?: string;
  email?: string;
  sandbox?: boolean;
}

export interface PaymentVerifyOptions {
  merchantId: string;
  authority: string;
  amount: number; // Amount in Rials (IRR) - ZarinPal v4 REST API expects Rials
  sandbox?: boolean;
}

// Updated validation
// Validate amount is at least 10,000 Rials
if (amountInteger < 10000) {
  console.error('❌ [Zarinpal] Amount too low:', amountInteger);
  return {
    success: false,
    error: `مبلغ باید حداقل ۱۰,۰۰۰ ریال باشد. مبلغ فعلی: ${amountInteger.toLocaleString('fa-IR')} ریال`,
  };
}

// Updated helper function comments
/**
 * Convert Rials to Tomans (for display purposes)
 * Note: ZarinPal v4 REST API expects amounts in Rials, not Tomans
 * This function is for display formatting only
 */
export function rialsToTomans(rials: number): number {
  return Math.round(rials / 10);
}
```

---

## 📊 Complete Currency Flow

### Database → Display → ZarinPal:

```
┌─────────────────┐
│   DATABASE      │
│  976,500 Rials  │ ← Stored in Rials
└────────┬────────┘
         │
         ├──────────────────────────────┐
         │                              │
         ▼                              ▼
┌─────────────────┐          ┌─────────────────┐
│   UI DISPLAY    │          │   ZARINPAL API  │
│  97,650 تومان   │          │  976,500 Rials  │
│  (÷ 10)         │          │  (No conversion)│
└─────────────────┘          └─────────────────┘
         │                              │
         │                              ▼
         │                   ┌─────────────────┐
         │                   │ ZARINPAL SHOWS  │
         │                   │  976,500 ریال   │
         │                   └─────────────────┘
         │                              │
         └──────────────────────────────┘
                     MATCH! ✅
```

### Key Points:
1. **Database:** Stores in Rials (976,500)
2. **UI Display:** Converts to Tomans for display (97,650 تومان)
3. **ZarinPal API:** Receives Rials (976,500)
4. **ZarinPal Gateway:** Shows Rials (976,500 ریال)
5. **User sees:** Same amount in Tomans on platform (97,650) and Rials on ZarinPal (976,500)

---

## 📁 Files Changed

### Modified (4 files):
1. `src/app/api/payment/zarinpal/request/route.ts` - Payment request
2. `src/app/api/payment/zarinpal/callback/route.ts` - Payment verification
3. `src/app/api/payment/zarinpal/webhook/route.ts` - Webhook handler
4. `src/lib/zarinpal.ts` - Core library & documentation

### New (1 file):
1. `docs/ZARINPAL_CURRENCY_FIX.md` - This documentation

---

## 🧪 Testing Checklist

### Manual Tests:
- [ ] **Browse products** → Check price shows in Tomans (97,650 تومان)
- [ ] **Add to cart** → Verify cart total in Tomans
- [ ] **Proceed to checkout** → Confirm order summary in Tomans
- [ ] **Click "Pay"** → Verify redirected to ZarinPal
- [ ] **ZarinPal page** → **CRITICAL: Verify amount shows in Rials (976,500 ریال)**
- [ ] **Complete payment** → Check success page
- [ ] **View order** → Confirm order shows in Tomans
- [ ] **Check SMS** → Verify amount in Tomans

### Expected Results:
| Location | Display | Value | Status |
|----------|---------|-------|--------|
| Product Page | 97,650 تومان | Tomans | ✅ |
| Cart | 97,650 تومان | Tomans | ✅ |
| Checkout | 97,650 تومان | Tomans | ✅ |
| **ZarinPal** | **976,500 ریال** | **Rials** | ✅ |
| Order History | 97,650 تومان | Tomans | ✅ |
| SMS | 97,650 تومان | Tomans | ✅ |

---

## 🚀 Deployment Steps

### On Server:

```bash
# 1. Navigate to project
cd /var/www/hs6tools

# 2. Pull latest changes
git pull origin master

# 3. Build application
npm run build

# 4. Restart PM2
pm2 restart hs6tools

# 5. Check logs
pm2 logs hs6tools --lines 50

# 6. Verify status
pm2 status
```

### Post-Deployment Verification:

```bash
# Test a real payment with small amount
# 1. Add product to cart (e.g., 50,000 Rials = 5,000 Tomans)
# 2. Proceed to checkout
# 3. Click pay
# 4. VERIFY: ZarinPal shows 50,000 ریال (not 5,000 ریال)
# 5. Complete or cancel payment
# 6. Check order status
```

---

## 📊 Impact Analysis

### Before Fix:
```
Platform:    97,650 تومان  ✅
ZarinPal:    97,650 ریال   ❌ (10x less than expected!)
Customer:    Confused - amounts don't match
Result:      Payment fails or customer pays wrong amount
```

### After Fix:
```
Platform:    97,650 تومان  ✅ (Same value)
ZarinPal:    976,500 ریال  ✅ (10x of Toman value = correct Rial value)
Customer:    Clear - amounts match (97,650 Tomans = 976,500 Rials)
Result:      Payment succeeds with correct amount
```

---

## 🔐 Data Integrity

### Database:
- ✅ **No changes** - Prices remain stored in Rials
- ✅ **No migration** needed
- ✅ **Backward compatible** - Old orders work correctly

### Conversion Points:
1. **Display Layer**: Rials → Tomans (÷ 10) for UI
2. **ZarinPal API**: Rials (no conversion)
3. **SMS Messages**: Rials → Tomans (÷ 10) for display

---

## 🎯 Key Learnings

### 1. **ZarinPal v4 REST API Uses Rials**
- Not Tomans!
- Minimum: 10,000 Rials (not 1,000 Tomans)
- Both request and verify use Rials

### 2. **Display vs API Currency**
- **Display:** Show in Tomans (user-friendly)
- **API:** Send in Rials (API requirement)
- **Never mix** the two!

### 3. **Always Verify API Documentation**
- Don't assume based on SDKs
- Check official REST API docs
- Test with real transactions

---

## 📚 Related Documentation

- [Currency Display Fix](./CURRENCY_DISPLAY_FIX.md) - UI Tomans display
- [ZarinPal Integration](./ZARINPAL_WEBHOOK_IMPLEMENTATION.md) - Webhook setup
- [Payment Flow Analysis](./COMPLETE_PAYMENT_FLOW_ANALYSIS.md) - Complete flow

---

## ✅ Completion Checklist

- [x] Updated payment request to send Rials
- [x] Updated payment verification to use Rials
- [x] Updated webhook to use Rials
- [x] Updated zarinpal.ts documentation
- [x] Updated minimum amount validation (10,000 Rials)
- [x] Build successful
- [x] Documentation created
- [ ] Deployed to production (pending)
- [ ] Tested with real payment (pending)
- [ ] Verified ZarinPal shows correct Rial amount (pending)

---

**Implementation Date:** December 8, 2025  
**Implemented By:** AI Assistant  
**Reviewed By:** [Pending]  
**Status:** ✅ Ready for Deployment

