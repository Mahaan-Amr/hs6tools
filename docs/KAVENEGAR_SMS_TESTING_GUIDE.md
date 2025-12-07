# 📱 Kavenegar SMS Testing Guide

## Overview

This guide explains how to test Kavenegar SMS functionality in the HS6Tools project, including order confirmation and payment success notifications.

## Prerequisites

1. **Kavenegar Account Setup:**
   - Register at [Kavenegar Panel](https://panel.kavenegar.com/client/membership/register)
   - Get your API key from the dashboard
   - Ensure you have sufficient credit in your account

2. **Environment Variables:**
   - `KAVENEGAR_API_KEY`: Your Kavenegar API key
   - `KAVENEGAR_SENDER`: Your sender number (default: 2000660110)

## Configuration Check

### Local Development (.env.local)

```env
KAVENEGAR_API_KEY="566555476F46314A72326D365563685134615464536C785744572F775A4463484B6469334E6E6F6B4D2F453D"
KAVENEGAR_SENDER="2000660110"
```

### Production (.env.production)

```env
KAVENEGAR_API_KEY="566555476F46314A72326D365563685134615464536C785744572F775A4463484B6469334E6E6F6B4D2F453D"
KAVENEGAR_SENDER="2000660110"
```

**Note:** Make sure to restart your server after updating environment variables.

## SMS Templates

The system uses the following SMS templates:

### 1. Order Confirmation SMS
Sent when an order is created (before payment).

**Template:**
```
سلام [Customer Name]، سفارش شما با شماره [Order Number] ثبت شد.
محصولات: [Product List]
مبلغ کل: [Total Amount] ریال
از خرید شما متشکریم.
```

### 2. Payment Success SMS
Sent after successful payment verification.

**Template:**
```
سلام [Customer Name]، پرداخت سفارش [Order Number] با موفقیت انجام شد.
محصولات: [Product List]
مبلغ پرداخت شده: [Total Amount] ریال
کد پیگیری پرداخت: [Ref ID]
سفارش شما در حال پردازش است.
```

## Important Notes About SMS in Development

### Kavenegar Test Account Limitation

**⚠️ Important:** In Kavenegar test/sandbox mode, SMS can **only** be sent to the account owner's phone number (the number registered with your Kavenegar account). This is a limitation of Kavenegar's test environment.

**What this means:**
- If you see error `501: امکان ارسال پیامک فقط به شماره صاحب حساب داده شده است`, this is expected in development
- In **production**, this limitation doesn't exist and SMS will be sent to any valid phone number
- The SMS code is working correctly; it's just a Kavenegar test account restriction

### Skip SMS in Development (Optional)

If you want to skip SMS sending entirely in development to avoid these errors, you can set:

```env
SKIP_SMS_IN_DEV="true"
```

This will log the SMS content instead of actually sending it, which is useful for:
- Testing without using SMS credits
- Avoiding test account limitations
- Faster development cycles

**Note:** Make sure to set `SKIP_SMS_IN_DEV="false"` or remove it in production!

## Testing Scenarios

### Test 1: Order Creation SMS

**Steps:**
1. Log in to the application with a user account that has a valid phone number
2. Add products to the shopping cart
3. Go to checkout and complete the order
4. **Expected Result:**
   - Order is created successfully
   - SMS is sent to the customer's phone number
   - SMS contains:
     - Customer name
     - Order number
     - List of products (up to 3, or "X products" if more)
     - Total amount in Rials

**Verification:**
- Check server logs for SMS sending confirmation
- Check your phone for the SMS message
- Verify SMS content matches the order details

### Test 2: Payment Success SMS

**Steps:**
1. Complete an order (as in Test 1)
2. Complete the payment process through Zarinpal
3. **Expected Result:**
   - Payment is verified successfully
   - SMS is sent to the customer's phone number
   - SMS contains:
     - Customer name
     - Order number
     - List of products
     - Total amount paid
     - Payment reference ID (refId)

**Verification:**
- Check server logs for payment verification and SMS sending
- Check your phone for the SMS message
- Verify SMS content includes payment reference ID

### Test 3: Multiple Products SMS

**Steps:**
1. Add 5+ different products to cart
2. Complete order and payment
3. **Expected Result:**
   - SMS shows first 2 products and "X products دیگر" (X more products)
   - Example: "محصولات: Product 1، Product 2 و 3 محصول دیگر"

### Test 4: Single Product with Quantity SMS

**Steps:**
1. Add multiple quantities of the same product
2. Complete order and payment
3. **Expected Result:**
   - SMS shows product name with quantity
   - Example: "Product Name (3 عدد)"

## Testing Checklist

- [ ] Order creation SMS is sent
- [ ] Payment success SMS is sent
- [ ] SMS contains correct customer name
- [ ] SMS contains correct order number
- [ ] SMS contains product list (or summary for many products)
- [ ] SMS contains correct total amount
- [ ] Payment success SMS contains refId
- [ ] SMS formatting is correct (Persian numbers, proper spacing)
- [ ] SMS is sent to correct phone number
- [ ] No SMS is sent if phone number is missing
- [ ] SMS sending doesn't block order/payment process (non-blocking)

## Debugging

### Check Server Logs

Look for these log messages:

**Order Creation:**
```
🛒 API: Order created successfully: [order-id]
[SMS] SMS sent successfully (Order created: [order-number]): [message-id]
```

**Payment Success:**
```
✅ [Payment Callback] Payment verified successfully: { orderId, orderNumber, refId }
[SMS] SMS sent successfully (Payment success: [order-number]): [message-id]
```

**Errors:**
```
[SMS] Failed to send SMS (Order created: [order-number]): [error message]
```

### Common Issues

1. **SMS Not Sent:**
   - Check if `KAVENEGAR_API_KEY` is set correctly
   - Verify phone number format (should be 11 digits starting with 09)
   - Check Kavenegar account balance
   - Review server logs for error messages

2. **SMS Content Issues:**
   - Verify order items are fetched correctly
   - Check product names are not null/empty
   - Ensure total amount is calculated correctly

3. **SMS Formatting Issues:**
   - Check Persian number formatting
   - Verify message length (SMS limit is 160 characters for single SMS)
   - Ensure proper line breaks (\n)

### Manual Testing via API

You can test SMS sending directly via the API endpoint:

```bash
# POST /api/sms/send
curl -X POST http://localhost:3000/api/sms/send \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-session-cookie]" \
  -d '{
    "receptor": "09123456789",
    "message": "Test SMS message"
  }'
```

**Note:** This endpoint requires admin authentication.

## Production Testing

Before deploying to production:

1. **Verify Environment Variables:**
   - Ensure `KAVENEGAR_API_KEY` is set in production environment
   - Verify `KAVENEGAR_SENDER` is correct

2. **Test with Real Phone Numbers:**
   - Use real customer phone numbers for testing
   - Verify SMS delivery time (usually instant)

3. **Monitor SMS Costs:**
   - Check Kavenegar panel for SMS costs
   - Monitor daily/monthly SMS usage

4. **Error Handling:**
   - Ensure SMS failures don't break order/payment flow
   - Monitor error logs for SMS sending issues

## Best Practices

1. **Phone Number Validation:**
   - Always validate phone numbers before sending SMS
   - Format: 11 digits starting with 09

2. **Error Handling:**
   - Use `sendSMSSafe()` for non-blocking SMS sending
   - Log errors but don't throw exceptions

3. **Message Length:**
   - Keep messages concise (under 160 characters for single SMS)
   - Use abbreviations when necessary

4. **Testing:**
   - Always test SMS functionality in development first
   - Use test phone numbers before production deployment
   - Monitor SMS delivery rates

## Support

If you encounter issues:

1. Check Kavenegar panel for account status
2. Review server logs for detailed error messages
3. Verify environment variables are set correctly
4. Contact Kavenegar support if API issues persist

---

**Last Updated:** 2025-01-XX
**Status:** ✅ Ready for Testing

