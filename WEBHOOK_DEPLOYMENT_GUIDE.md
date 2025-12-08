# 🚀 Webhook Deployment Guide - ZarinPal Integration

**Date:** December 8, 2025  
**Feature:** ZarinPal Webhook for Reliable Payment Processing  
**Deployment Time:** ~15 minutes

---

## 📋 What's Being Deployed

### New Feature:
✅ **ZarinPal Webhook Integration** - Backup payment verification

### Files Created:
1. `src/app/api/payment/zarinpal/webhook/route.ts` - Webhook endpoint (399 lines)
2. `docs/ZARINPAL_WEBHOOK_IMPLEMENTATION.md` - Complete documentation
3. `WEBHOOK_DEPLOYMENT_GUIDE.md` - This deployment guide

### Problem Solved:
- ❌ **Before:** If callback fails (network issue), payment never confirmed
- ✅ **After:** Webhook ensures payment is processed even if callback fails

---

## 🎯 Benefits

1. **More Reliable** - Server-to-server communication
2. **Automatic Retry** - ZarinPal retries if webhook fails
3. **Backup Mechanism** - Works even if user closes browser
4. **No Lost Payments** - Ensures every payment is processed

---

## 🚀 Deployment Steps

### Step 1: Generate Webhook Secret (Local Machine)

```bash
# Generate a strong random secret (32 bytes)
openssl rand -hex 32

# Example output:
# a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2

# Copy this value - you'll need it in next steps
```

**Important:** Keep this secret safe! Never commit to Git!

---

### Step 2: Add Webhook Secret to Server

```bash
# SSH to server
ssh root@87.107.73.10

# Edit .env.production
nano /var/www/hs6tools/.env.production

# Add this line at the end:
ZARINPAL_WEBHOOK_SECRET="paste-your-generated-secret-here"

# Save and exit (Ctrl+X, Y, Enter)
```

---

### Step 3: Commit and Push Code (Local Machine)

```bash
cd E:\hs6tools

# Add all changes
git add .

# Commit with descriptive message
git commit -m "feat: implement ZarinPal webhook for reliable payment processing

Webhook Integration:
- Add webhook endpoint at /api/payment/zarinpal/webhook
- Implement HMAC-SHA256 signature verification
- Add idempotency handling for duplicate webhooks
- Comprehensive logging and monitoring
- Backup mechanism when callback fails

Features:
- Server-to-server payment notification
- Automatic retry by ZarinPal
- Works even if user closes browser
- Prevents lost payments

Files created:
- src/app/api/payment/zarinpal/webhook/route.ts
- docs/ZARINPAL_WEBHOOK_IMPLEMENTATION.md

Security:
- Signature verification with HMAC-SHA256
- HTTPS only
- Idempotent processing
- Comprehensive validation"

# Push to GitHub
git push origin master
```

---

### Step 4: Deploy to Server

```bash
# Already SSH'd to server from Step 2
cd /var/www/hs6tools

# Pull latest changes
git pull origin master

# Install dependencies (if any)
npm install

# Build application
npm run build

# Restart PM2
pm2 restart hs6tools

# Verify it's running
pm2 status hs6tools

# Check logs for any errors
pm2 logs hs6tools --lines 50
```

---

### Step 5: Verify Webhook Secret is Loaded

```bash
# Check if webhook secret is in PM2 environment
pm2 env hs6tools | grep ZARINPAL_WEBHOOK_SECRET

# Should show:
# ZARINPAL_WEBHOOK_SECRET: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2

# If not showing, restart PM2:
pm2 restart hs6tools
```

---

### Step 6: Test Webhook Endpoint

```bash
# Test webhook health check
curl https://hs6tools.com/api/payment/zarinpal/webhook

# Expected response:
# {
#   "success": true,
#   "message": "ZarinPal Webhook endpoint is active",
#   "timestamp": "2025-12-08T16:00:00.000Z",
#   "configured": {
#     "webhookSecret": true,
#     "merchantId": true
#   }
# }
```

**If `webhookSecret: false`:**
- Check Step 2 (webhook secret added to .env.production)
- Check Step 5 (PM2 restarted)
- Try: `pm2 restart hs6tools --update-env`

---

### Step 7: Register Webhook URL with ZarinPal

1. **Login to ZarinPal Dashboard:**
   - Go to: https://dashboard.zarinpal.com
   - Login with your merchant account

2. **Navigate to Webhook Settings:**
   - Click on **Settings** (تنظیمات)
   - Click on **Webhooks** or **وب‌هوک**

3. **Add Webhook URL:**
   ```
   https://hs6tools.com/api/payment/zarinpal/webhook
   ```

4. **Configure Settings:**
   - **URL:** `https://hs6tools.com/api/payment/zarinpal/webhook`
   - **Method:** POST
   - **Retry:** Enable (recommended: 3 retries)
   - **Events:** Payment Success, Payment Failed

5. **Save Settings**

6. **Test Webhook (Optional):**
   - ZarinPal dashboard has a "Test Webhook" button
   - Click it to send a test webhook
   - Check your server logs: `pm2 logs hs6tools | grep "Webhook"`

---

### Step 8: Verify Deployment

```bash
# Monitor logs for webhook activity
pm2 logs hs6tools | grep "Webhook"

# You should see:
# 🔔 [Webhook] ========== WEBHOOK RECEIVED ==========
# ✅ [Webhook] Signature validated
# ✅ [Webhook] ========== WEBHOOK PROCESSED SUCCESSFULLY ==========
```

---

## ✅ Post-Deployment Checklist

- [ ] Webhook secret generated
- [ ] Webhook secret added to `.env.production`
- [ ] Code pushed to GitHub
- [ ] Server updated (git pull)
- [ ] Application built (npm run build)
- [ ] PM2 restarted
- [ ] Webhook secret loaded in PM2
- [ ] Webhook endpoint accessible (health check passes)
- [ ] Webhook URL registered in ZarinPal dashboard
- [ ] Test webhook sent successfully
- [ ] Logs show webhook activity

---

## 🧪 Testing Scenarios

### Test 1: Normal Payment Flow

```bash
# 1. Create order as customer
# 2. Complete payment on ZarinPal
# 3. Monitor logs:
pm2 logs hs6tools | grep "Payment Callback\|Webhook"

# Expected: Both callback and webhook process payment
# One processes first, other sees "already paid"
```

### Test 2: Callback Failure Simulation

This is hard to test in production, but webhook ensures:
- If callback fails (network issue, user closes browser)
- Webhook will still process payment
- Order will be marked as PAID

### Test 3: Duplicate Webhook

```bash
# ZarinPal may send webhook multiple times
# Our system handles this with idempotency

# In logs, you should see:
# ⚠️ [Webhook] Order already paid (idempotent), returning success
```

### Test 4: Invalid Signature

```bash
# Send webhook without signature
curl -X POST https://hs6tools.com/api/payment/zarinpal/webhook \
  -H "Content-Type: application/json" \
  -d '{"authority":"test","status":"OK","amount":10000}'

# Expected: 401 Unauthorized
# {
#   "success": false,
#   "error": "Missing webhook signature"
# }
```

---

## 📊 Monitoring After Deployment

### Day 1: Intensive Monitoring

```bash
# Watch all webhook activity
pm2 logs hs6tools | grep "Webhook"

# Watch for successful webhooks
pm2 logs hs6tools | grep "WEBHOOK PROCESSED SUCCESSFULLY"

# Watch for errors
pm2 logs hs6tools | grep "WEBHOOK ERROR"

# Watch for idempotent cases
pm2 logs hs6tools | grep "already paid (idempotent)"
```

### Week 1: Daily Checks

```bash
# Count successful webhooks today
pm2 logs hs6tools --lines 10000 | grep "WEBHOOK PROCESSED SUCCESSFULLY" | grep "$(date +%Y-%m-%d)" | wc -l

# Count webhook errors today
pm2 logs hs6tools --lines 10000 | grep "WEBHOOK ERROR" | grep "$(date +%Y-%m-%d)" | wc -l

# Check webhook success rate
# Should be > 99%
```

### Database Queries

```sql
-- Check recent payments processed via webhook
-- (Look for payments where callback might have failed)
SELECT 
  "orderNumber",
  "paymentStatus",
  "paymentDate",
  "createdAt",
  EXTRACT(EPOCH FROM ("paymentDate" - "createdAt")) as seconds_to_payment
FROM orders
WHERE "paymentStatus" = 'PAID'
  AND DATE("paymentDate") = CURRENT_DATE
ORDER BY "paymentDate" DESC
LIMIT 20;

-- If seconds_to_payment > 60, likely processed by webhook (callback failed)
```

---

## 🔍 Troubleshooting

### Issue: Webhook secret not loaded

**Symptoms:**
```json
{
  "configured": {
    "webhookSecret": false
  }
}
```

**Solution:**
```bash
# 1. Check .env.production
cat /var/www/hs6tools/.env.production | grep ZARINPAL_WEBHOOK_SECRET

# 2. If missing, add it:
echo 'ZARINPAL_WEBHOOK_SECRET="your-secret-here"' >> /var/www/hs6tools/.env.production

# 3. Restart PM2
pm2 restart hs6tools --update-env

# 4. Verify
pm2 env hs6tools | grep ZARINPAL_WEBHOOK_SECRET
```

---

### Issue: Webhook not being called

**Possible causes:**
1. URL not registered in ZarinPal dashboard
2. Wrong URL registered
3. Firewall blocking ZarinPal

**Solution:**
```bash
# 1. Verify webhook URL is accessible
curl https://hs6tools.com/api/payment/zarinpal/webhook

# 2. Check ZarinPal dashboard
# Login and verify webhook URL matches exactly

# 3. Check server firewall
# Ensure port 443 (HTTPS) is open

# 4. Test with ZarinPal's test button in dashboard
```

---

### Issue: Invalid signature error

**Symptoms:**
```
❌ [Webhook] Invalid signature
```

**Solution:**
```bash
# 1. Verify webhook secret matches ZarinPal dashboard
# Login to ZarinPal → Settings → Webhooks
# Compare secret

# 2. If different, update .env.production
nano /var/www/hs6tools/.env.production

# 3. Restart PM2
pm2 restart hs6tools
```

---

### Issue: Order not found

**Symptoms:**
```
❌ [Webhook] Order not found for authority
```

**Solution:**
```sql
-- Check if order exists
SELECT "orderNumber", "paymentId", "paymentStatus"
FROM orders
WHERE "paymentId" = 'AUTHORITY_FROM_WEBHOOK';

-- If not found, check payment request logs
```

---

## 📈 Success Metrics

### Week 1 Goals:

| Metric | Target | How to Check |
|--------|--------|--------------|
| Webhook Success Rate | > 99% | Count success vs errors in logs |
| Invalid Signatures | 0 | `grep "Invalid signature"` |
| Idempotent Hits | 2-5% | `grep "already paid (idempotent)"` |
| Response Time | < 500ms | Check logs for "Processing time" |

### Month 1 Goals:

- Zero lost payments
- Webhook handles all callback failures
- No manual intervention needed
- Customer satisfaction improved

---

## 🎯 What's Next?

After webhook is stable (1-2 weeks), consider:

1. **Email Notifications** - Add email alongside SMS
2. **Webhook Dashboard** - Admin UI to view webhook logs
3. **Payment Analytics** - Track webhook vs callback success rates
4. **Multi-Gateway** - Add other payment gateways

---

## 📚 Documentation

**Complete Documentation:**
- `docs/ZARINPAL_WEBHOOK_IMPLEMENTATION.md` - Full technical docs
- `WEBHOOK_DEPLOYMENT_GUIDE.md` - This deployment guide

**Related Documentation:**
- `COMPLETE_IMPLEMENTATION_SUMMARY.md` - All features overview
- `docs/COMPLETE_PAYMENT_FLOW_ANALYSIS.md` - Payment flow analysis

---

## 🎉 Summary

**What We Deployed:**
- ✅ ZarinPal webhook endpoint
- ✅ Signature verification
- ✅ Idempotency handling
- ✅ Comprehensive logging
- ✅ Complete documentation

**Benefits:**
- ✅ More reliable payment processing
- ✅ No lost payments
- ✅ Automatic retry
- ✅ Works even if callback fails

**Deployment Time:** ~15 minutes  
**Risk Level:** Low (additive feature)  
**Rollback:** Not needed (webhook is optional)

---

**Ready for Production!** 🚀

**Deployment Status:** ⏳ PENDING  
**Next Action:** Follow steps above to deploy

