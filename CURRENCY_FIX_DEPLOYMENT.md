# 🚀 Currency Display Fix - Deployment Guide

**Date:** December 8, 2025  
**Changes:** Convert all price displays from Rials to Tomans  
**Commit:** `ffcd14f`

---

## 📋 What Changed?

### Summary:
All prices across the platform now display in **Tomans (تومان)** instead of Rials (ریال).

**Example:**
- **Before:** 976,500 ریال
- **After:** 97,650 تومان

### Files Modified:
- ✅ 12 files updated
- ✅ 1 new documentation file
- ✅ 435 insertions, 68 deletions

---

## 🚀 Deployment Steps

### On Server (as root):

```bash
# 1. Navigate to project directory
cd /var/www/hs6tools

# 2. Pull latest changes
git pull origin master

# 3. Install dependencies (if needed)
npm install

# 4. Build the application
npm run build

# 5. Restart PM2
pm2 restart hs6tools

# 6. Check logs
pm2 logs hs6tools --lines 50

# 7. Verify status
pm2 status
```

---

## ✅ Post-Deployment Verification

### 1. **Check Application Status**
```bash
pm2 status
# Should show: hs6tools | online
```

### 2. **Test Price Display**

Visit these pages and verify prices show in **Tomans (تومان)**:

1. **Product Listing**: https://hs6tools.com/fa
   - ✅ Product cards show prices in Tomans

2. **Product Detail**: https://hs6tools.com/fa/products/[any-product]
   - ✅ Main price in Tomans
   - ✅ Variant prices in Tomans
   - ✅ Compare price (if any) in Tomans

3. **Cart**: https://hs6tools.com/fa/cart
   - ✅ Item prices in Tomans
   - ✅ Subtotal in Tomans
   - ✅ Total in Tomans

4. **Checkout**: https://hs6tools.com/fa/checkout
   - ✅ Order summary in Tomans
   - ✅ Shipping cost in Tomans
   - ✅ Total amount in Tomans

5. **ZarinPal Payment Gateway**
   - ✅ Payment amount matches checkout amount
   - ✅ Both show same Toman value

6. **Order History**: https://hs6tools.com/fa/customer/orders
   - ✅ Past orders show in Tomans

### 3. **Test Complete Flow**

```bash
# Test a real order:
1. Browse products → Check prices (Tomans)
2. Add to cart → Check cart total (Tomans)
3. Proceed to checkout → Check order summary (Tomans)
4. Complete payment → Check ZarinPal amount (Tomans)
5. Check SMS → Verify amount in Tomans
6. View order history → Check order shows Tomans
```

---

## 🔍 Troubleshooting

### Issue: Prices still showing in Rials

**Solution:**
```bash
# Clear Next.js cache
cd /var/www/hs6tools
rm -rf .next
npm run build
pm2 restart hs6tools
```

### Issue: Build fails

**Solution:**
```bash
# Check for errors
npm run build

# If dependency issues:
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Application not starting

**Solution:**
```bash
# Check PM2 logs
pm2 logs hs6tools --lines 100

# Restart with force
pm2 delete hs6tools
pm2 start npm --name "hs6tools" -- start

# Or use ecosystem file
pm2 start ecosystem.config.js
```

---

## 📊 Expected Results

### Before Fix:
| Location | Display | Status |
|----------|---------|--------|
| Products | 976,500 ریال | ❌ |
| Cart | 976,500 ریال | ❌ |
| Checkout | 976,500 ریال | ❌ |
| ZarinPal | 97,650 ریال | ⚠️ |

### After Fix:
| Location | Display | Status |
|----------|---------|--------|
| Products | 97,650 تومان | ✅ |
| Cart | 97,650 تومان | ✅ |
| Checkout | 97,650 تومان | ✅ |
| ZarinPal | 97,650 تومان | ✅ |

---

## 🔐 Important Notes

1. **Database Unchanged**: Prices still stored in Rials (no migration needed)
2. **ZarinPal Integration**: Already correct, no changes needed
3. **Backward Compatible**: Old orders display correctly in Tomans
4. **SMS Notifications**: Now show amounts in Tomans
5. **No Data Loss**: All conversions are display-only

---

## 📞 Support

If you encounter any issues:

1. Check PM2 logs: `pm2 logs hs6tools`
2. Check application logs in `/var/www/hs6tools/.next/`
3. Verify environment variables: `pm2 env hs6tools`
4. Test payment flow with a small amount

---

## ✅ Deployment Checklist

- [ ] Code pulled from GitHub
- [ ] Dependencies installed
- [ ] Application built successfully
- [ ] PM2 restarted
- [ ] Application status: online
- [ ] Product prices show Tomans
- [ ] Cart shows Tomans
- [ ] Checkout shows Tomans
- [ ] ZarinPal amount matches
- [ ] SMS shows Tomans
- [ ] Order history shows Tomans
- [ ] Complete test order successful

---

**Deployment Status:** ⏳ Pending  
**Deployed By:** [Your Name]  
**Deployment Time:** [Date/Time]  
**Verification:** [Pass/Fail]

