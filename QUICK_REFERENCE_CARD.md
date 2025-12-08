# 🎯 Quick Reference Card - HS6Tools Payment System

**Last Updated:** December 8, 2025  
**Status:** All Features Implemented ✅

---

## 📊 What's Been Implemented

### ✅ Phase 1: Critical Fixes
1. **Stock Restoration** - Automatic on all failures
2. **Duplicate Payment Protection** - Prevents double-charging
3. **Order Expiry** - 30-minute timeout with cleanup

### ✅ Phase 2: High Priority Features
4. **Coupon Restoration** - Usage count accurate
5. **Admin Refund System** - One-click refunds
6. **SMS Notifications** - All order events

---

## 🚀 Quick Deploy Commands

```bash
# On Local Machine
cd E:\hs6tools
git add .
git commit -m "feat: implement phase 2 - coupon restoration, refunds, SMS"
git push origin master

# On Server
ssh root@87.107.73.10
cd /var/www/hs6tools
git pull origin master
npm install
npx prisma generate
npm run build
pm2 restart hs6tools
pm2 logs hs6tools --lines 50
```

---

## 🔍 Quick Health Check

```bash
# Check app status
pm2 status hs6tools

# Check logs for errors
pm2 logs hs6tools --err --lines 20

# Check SMS sending
pm2 logs hs6tools | grep "SMS sent successfully"

# Check inventory operations
pm2 logs hs6tools | grep "Stock restored"
```

---

## 📱 Test Scenarios

### Test 1: Payment Cancellation
1. Add product to cart
2. Proceed to checkout
3. Cancel payment on ZarinPal
4. ✅ Stock restored
5. ✅ Coupon restored (if used)
6. ✅ SMS sent to customer

### Test 2: Order Cancellation
1. Create order (don't pay)
2. Go to order history
3. Click "Cancel Order"
4. ✅ Stock restored
5. ✅ Coupon restored (if used)
6. ✅ SMS sent to customer

### Test 3: Admin Refund
1. Complete a payment
2. Login as admin
3. Find order, click "Refund"
4. ✅ Stock restored
5. ✅ Coupon restored (if used)
6. ✅ SMS sent to customer
7. ✅ Order status: REFUNDED

---

## 🎯 Key Files

### Core Libraries:
- `src/lib/inventory.ts` - Stock restoration
- `src/lib/sms.ts` - SMS templates
- `src/lib/cron/expire-orders.ts` - Expiry logic

### API Endpoints:
- `src/app/api/payment/zarinpal/callback/route.ts` - Payment callback
- `src/app/api/customer/orders/[id]/route.ts` - Order management
- `src/app/api/admin/orders/[id]/refund/route.ts` - Admin refund
- `src/app/api/cron/expire-orders/route.ts` - Cron endpoint

### Database:
- `prisma/schema.prisma` - Added `expiresAt` field
- `prisma/migrations/20251208000000_add_order_expiry/` - Migration

---

## 📚 Documentation

### Implementation Docs:
- `COMPLETE_IMPLEMENTATION_SUMMARY.md` - Full overview
- `docs/HIGH_PRIORITY_FEATURES_IMPLEMENTATION.md` - Feature details
- `docs/COMPLETE_PAYMENT_FLOW_ANALYSIS.md` - Flow analysis

### Deployment Guides:
- `DEPLOYMENT_GUIDE_PHASE_2.md` - This deployment
- `CRITICAL_FIXES_IMPLEMENTATION.md` - Phase 1 guide

---

## 🆘 Quick Troubleshooting

### Issue: SMS not sending
```bash
# Check API key
pm2 env hs6tools | grep KAVENEGAR_API_KEY

# Check logs
pm2 logs hs6tools | grep "SMS.*error"
```

### Issue: Stock not restored
```bash
# Check logs
pm2 logs hs6tools | grep "Inventory"

# Check database
psql -U hs6tools -h localhost -d hs6tools_prod -c "SELECT name, \"stockQuantity\" FROM products WHERE id = 'PRODUCT_ID';"
```

### Issue: Refund endpoint not working
```bash
# Check user role
psql -U hs6tools -h localhost -d hs6tools_prod -c "SELECT email, role FROM users WHERE id = 'USER_ID';"

# Should be 'ADMIN' or 'SUPER_ADMIN'
```

---

## 📊 Database Quick Queries

```sql
-- Check recent refunds
SELECT "orderNumber", status, "paymentStatus", "updatedAt"
FROM orders
WHERE status = 'REFUNDED'
ORDER BY "updatedAt" DESC
LIMIT 5;

-- Check coupon accuracy
SELECT 
  code,
  "usageCount",
  (SELECT COUNT(*) FROM orders WHERE "couponId" = coupons.id AND "paymentStatus" = 'PAID') as actual
FROM coupons
WHERE "usageCount" > 0;

-- Check expired orders today
SELECT COUNT(*) 
FROM orders 
WHERE status = 'CANCELLED' 
  AND "paymentStatus" = 'FAILED'
  AND DATE("updatedAt") = CURRENT_DATE;
```

---

## 🎉 Success Indicators

✅ Zero linting errors  
✅ PM2 running without restarts  
✅ SMS delivery rate > 95%  
✅ Stock counts accurate  
✅ Coupon usage accurate  
✅ No duplicate payments  
✅ Orders expire after 30 min  
✅ Refunds work smoothly  

---

## 📞 Emergency Rollback

```bash
# If something goes wrong
cd /var/www/hs6tools
git log --oneline -5
git reset --hard PREVIOUS_COMMIT_HASH
npm run build
pm2 restart hs6tools
```

---

**Ready for Production!** 🚀

