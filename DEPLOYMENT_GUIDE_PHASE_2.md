# 🚀 Deployment Guide - Phase 2: High Priority Features

**Date:** December 8, 2025  
**Phase:** 2 of 2  
**Status:** Ready for Deployment

---

## 📦 What's Being Deployed

### Phase 1 (Already Deployed):
- ✅ Stock restoration on payment failure
- ✅ Duplicate payment protection
- ✅ Order expiry system (30 min)

### Phase 2 (This Deployment):
- ✅ Coupon usage restoration
- ✅ Admin refund system
- ✅ Customer SMS notifications (all events)

---

## 📋 Files Changed Summary

### New Files (4):
1. `src/app/api/admin/orders/[id]/refund/route.ts` - Admin refund endpoint
2. `docs/HIGH_PRIORITY_FEATURES_IMPLEMENTATION.md` - Feature documentation
3. `DEPLOYMENT_GUIDE_PHASE_2.md` - This file

### Modified Files (4):
1. `src/lib/inventory.ts` - Added coupon restoration
2. `src/lib/sms.ts` - Added new SMS templates
3. `src/app/api/payment/zarinpal/callback/route.ts` - Added SMS notifications
4. `src/app/api/customer/orders/[id]/route.ts` - Added SMS on cancellation
5. `src/lib/cron/expire-orders.ts` - Added coupon restoration + SMS

**Total:** 8 files, ~500 lines of new code

---

## 🚀 Deployment Steps (15 minutes)

### Step 1: Commit and Push (Local Machine)

```bash
cd E:\hs6tools

# Add all changes
git add .

# Commit with descriptive message
git commit -m "feat: implement high priority features - coupon restoration, admin refund, SMS notifications

Phase 2 Implementation:
- Add coupon usage restoration on failed payments and refunds
- Implement complete admin refund system with stock restoration
- Add customer SMS notifications for all order events
- Enhance inventory management with coupon handling

Features:
- Coupon usage now accurately tracked across all scenarios
- Admin can refund orders with one click
- Customers notified via SMS for: cancellation, expiry, payment failure, refunds
- All operations are atomic and safe

Files created:
- src/app/api/admin/orders/[id]/refund/route.ts
- docs/HIGH_PRIORITY_FEATURES_IMPLEMENTATION.md

Files modified:
- src/lib/inventory.ts (coupon restoration)
- src/lib/sms.ts (new templates)
- src/app/api/payment/zarinpal/callback/route.ts (SMS notifications)
- src/app/api/customer/orders/[id]/route.ts (SMS on cancellation)
- src/lib/cron/expire-orders.ts (coupon + SMS)"

# Push to GitHub
git push origin master
```

---

### Step 2: Deploy to Server

```bash
# SSH to server
ssh root@87.107.73.10

# Navigate to project
cd /var/www/hs6tools

# Pull latest changes
git pull origin master

# Install dependencies (if any)
npm install

# Generate Prisma client (to pick up any schema changes)
npx prisma generate

# Build application
npm run build

# Restart PM2
pm2 restart hs6tools

# Verify it's running
pm2 status hs6tools
```

---

### Step 3: Verify Deployment

```bash
# Check logs for startup errors
pm2 logs hs6tools --lines 50

# Should see successful startup messages
# Look for any errors related to:
# - SMS initialization
# - Prisma client
# - API routes
```

---

### Step 4: Test Refund Endpoint

**Test with cURL:**
```bash
# First, get an admin session token
# Login to admin panel in browser, then get cookie

# Test refund (replace ORDER_ID and SESSION_TOKEN)
curl -X POST https://hs6tools.com/api/admin/orders/ORDER_ID/refund \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=SESSION_TOKEN" \
  -d '{
    "reason": "Test refund - deployment verification",
    "notifyCustomer": true
  }'

# Expected response:
# {
#   "success": true,
#   "data": {
#     "orderNumber": "HS6-016235",
#     "status": "REFUNDED",
#     "refundAmount": 976500,
#     "itemsRestored": 3,
#     "couponRestored": true,
#     "customerNotified": true
#   }
# }
```

**Or test via Admin UI:**
1. Login as admin
2. Go to Orders management
3. Find a PAID order
4. Click "Refund" button
5. Verify:
   - Order status changes to REFUNDED
   - Stock is restored
   - Customer receives SMS

---

### Step 5: Test SMS Notifications

**Test 1: Create and Cancel Order**
```bash
# 1. As customer, create an order
# 2. Cancel payment on ZarinPal
# 3. Check customer's phone for SMS
# 4. Check logs:
pm2 logs hs6tools | grep "Payment cancelled"
```

**Test 2: Manual Order Cancellation**
```bash
# 1. Create order (don't pay)
# 2. Go to order history
# 3. Cancel order
# 4. Check phone for SMS
# 5. Check logs:
pm2 logs hs6tools | grep "Order cancelled"
```

**Test 3: Order Expiry**
```bash
# Manually trigger cron to test
curl -X POST https://hs6tools.com/api/cron/expire-orders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Check logs:
pm2 logs hs6tools | grep "Order expired"
```

---

### Step 6: Verify Coupon Restoration

```bash
# On server, connect to database
psql -U hs6tools -h localhost -d hs6tools_prod

# Check coupon usage counts
SELECT 
  code,
  "usageCount",
  "usageLimit",
  (SELECT COUNT(*) FROM orders WHERE "couponId" = coupons.id AND "paymentStatus" = 'PAID') as actual_paid_usage
FROM coupons
WHERE "usageCount" > 0;

# usageCount should equal actual_paid_usage
```

---

## ✅ Post-Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Server updated (git pull)
- [ ] Dependencies installed (npm install)
- [ ] Prisma client generated
- [ ] Application built (npm run build)
- [ ] PM2 restarted
- [ ] No errors in PM2 logs
- [ ] Refund endpoint accessible
- [ ] SMS notifications working
- [ ] Coupon restoration verified
- [ ] Stock restoration verified
- [ ] Admin can refund orders
- [ ] Customers receive SMS

---

## 🔍 Troubleshooting

### Issue: Refund endpoint returns 403

**Cause:** User is not admin

**Solution:**
```sql
-- Check user role
SELECT id, email, role FROM users WHERE id = 'USER_ID';

-- Update user to admin (if needed)
UPDATE users SET role = 'ADMIN' WHERE id = 'USER_ID';
```

### Issue: SMS not sending

**Check 1: Kavenegar API Key**
```bash
pm2 env hs6tools | grep KAVENEGAR_API_KEY
```

**Check 2: Phone number format**
```bash
pm2 logs hs6tools | grep "Invalid phone number"
```

**Check 3: SMS service status**
```bash
pm2 logs hs6tools | grep "SMS.*error"
```

### Issue: Coupon usage not restored

**Check logs:**
```bash
pm2 logs hs6tools | grep "Restoring coupon usage"
```

**Verify in database:**
```sql
SELECT * FROM coupons WHERE code = 'YOUR_COUPON_CODE';
```

**Manual fix if needed:**
```sql
UPDATE coupons 
SET "usageCount" = "usageCount" - 1 
WHERE id = 'COUPON_ID';
```

---

## 📊 Monitoring After Deployment

### Day 1: Intensive Monitoring

```bash
# Watch all logs
pm2 logs hs6tools

# Watch SMS specifically
pm2 logs hs6tools | grep "SMS"

# Watch refunds
pm2 logs hs6tools | grep "Refund"

# Watch inventory operations
pm2 logs hs6tools | grep "Inventory"
```

### Week 1: Daily Checks

```bash
# Check for errors
pm2 logs hs6tools --err --lines 100

# Check refund count
psql -U hs6tools -h localhost -d hs6tools_prod -c "SELECT COUNT(*) FROM orders WHERE status = 'REFUNDED' AND DATE(\"updatedAt\") = CURRENT_DATE;"

# Check SMS success rate
pm2 logs hs6tools | grep "SMS sent successfully" | wc -l
pm2 logs hs6tools | grep "SMS.*error" | wc -l
```

### Ongoing: Weekly Review

```sql
-- Refund statistics
SELECT 
  DATE("updatedAt") as refund_date,
  COUNT(*) as refund_count,
  SUM("totalAmount") as total_refunded
FROM orders
WHERE status = 'REFUNDED'
  AND "updatedAt" >= NOW() - INTERVAL '7 days'
GROUP BY DATE("updatedAt")
ORDER BY refund_date DESC;

-- Coupon accuracy check
SELECT 
  code,
  "usageCount" as recorded_usage,
  (SELECT COUNT(*) FROM orders WHERE "couponId" = coupons.id AND "paymentStatus" = 'PAID') as actual_usage,
  "usageCount" - (SELECT COUNT(*) FROM orders WHERE "couponId" = coupons.id AND "paymentStatus" = 'PAID') as difference
FROM coupons
WHERE "usageCount" > 0;
-- Difference should be 0 for all coupons
```

---

## 🎯 Success Criteria

### Must Have (Critical):
- ✅ Refund endpoint works without errors
- ✅ Stock restored on refunds
- ✅ Coupons restored on failures
- ✅ SMS sent for all events
- ✅ No linting errors
- ✅ No runtime errors in logs

### Should Have (Important):
- ✅ SMS delivery rate > 95%
- ✅ Refund processing time < 1 second
- ✅ Coupon usage accuracy = 100%
- ✅ Zero manual inventory adjustments needed

### Nice to Have (Optional):
- Admin dashboard showing refund statistics
- SMS delivery status tracking
- Automated tests for refund flow

---

## 📞 Support

### If Issues Occur:

1. **Check Logs First:**
   ```bash
   pm2 logs hs6tools --lines 200
   ```

2. **Check Database:**
   ```bash
   psql -U hs6tools -h localhost -d hs6tools_prod
   ```

3. **Rollback if Needed:**
   ```bash
   git log --oneline -5
   git reset --hard PREVIOUS_COMMIT_HASH
   bash update.sh
   ```

4. **Contact Developer:**
   - Provide logs
   - Provide error messages
   - Provide steps to reproduce

---

## 📚 Related Documentation

- `CRITICAL_FIXES_IMPLEMENTATION.md` - Phase 1 fixes
- `docs/HIGH_PRIORITY_FEATURES_IMPLEMENTATION.md` - Feature details
- `docs/COMPLETE_PAYMENT_FLOW_ANALYSIS.md` - Complete analysis
- `docs/SMS_IMPLEMENTATION_SUMMARY.md` - SMS system docs

---

**Deployment Time:** ~15 minutes  
**Risk Level:** Low (all changes are additive)  
**Rollback Time:** ~5 minutes if needed

**Ready to deploy!** 🚀

