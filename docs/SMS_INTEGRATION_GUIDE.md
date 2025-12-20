# 📱 Kavehnegar SMS Integration Guide

## Overview

This guide explains how to integrate and use Kavehnegar SMS service in the HS6Tools project for various use cases like order notifications, authentication, and customer communications.

## Setup

### 1. Install Package

The package is already installed:
```bash
npm install kavenegar @types/kavenegar
```

**Note:** We use the official `kavenegar` package (not `kavenegar-api`). The package uses callback-based API with `Kavenegar.KavenegarApi({apikey: 'YOUR_KEY'})`.

### 2. Environment Variables

Add these to your `.env.local` file:

```env
# Kavehnegar SMS Service
KAVENEGAR_API_KEY=your_api_key_here
KAVENEGAR_SENDER=10004346  # Optional: Default sender number
```

**How to get your API key:**
1. Register at [Kavehnegar.com](https://panel.kavenegar.com/client/membership/register)
2. Go to your dashboard
3. Navigate to "API Keys" section
4. Copy your API key

### 3. Create SMS Templates in Kavehnegar Panel

For verification codes and structured messages, you need to create templates in your Kavehnegar panel:

1. Login to [Kavehnegar Panel](https://panel.kavenegar.com)
2. Go to "Templates" section
3. Create templates like:
   - `verify` - For phone verification
   - `order-confirmed` - For order confirmation
   - `password-reset` - For password reset

**Template Format Example:**
```
کد تأیید شما: {token}
```

## Usage Examples

### 1. Send Simple SMS

```typescript
import { sendSMS } from '@/lib/sms';

// Send order confirmation
const result = await sendSMS({
  receptor: '09123456789',
  message: 'سفارش شما با شماره ORD-12345 ثبت شد. از خرید شما متشکریم.',
});

if (result.success) {
  console.log('SMS sent:', result.messageId);
}
```

### 2. Send Verification Code (OTP)

```typescript
import { sendVerificationCode } from '@/lib/sms';

// Send phone verification code
const code = '123456';
const result = await sendVerificationCode({
  receptor: '09123456789',
  token: code,
  template: '408915', // Template ID for SMS.ir (or template name 'verify' for Kavenegar)
});

if (result.success) {
  console.log('Verification code sent');
}
```

### 3. Use Predefined Templates

```typescript
import { sendSMS, SMSTemplates } from '@/lib/sms';

// Order confirmed
await sendSMS({
  receptor: customerPhone,
  message: SMSTemplates.ORDER_CONFIRMED(orderNumber, customerName),
});

// Order shipped
await sendSMS({
  receptor: customerPhone,
  message: SMSTemplates.ORDER_SHIPPED(orderNumber, trackingNumber),
});
```

### 4. Send Bulk SMS

```typescript
import { sendBulkSMS } from '@/lib/sms';

const phoneNumbers = ['09123456789', '09187654321'];
const result = await sendBulkSMS(
  phoneNumbers,
  'پیام گروهی شما'
);
```

## Integration Points

### 1. Order Notifications ✅ IMPLEMENTED

**Location:** 
- `src/app/api/customer/orders/route.ts` - Order creation
- `src/app/api/orders/[id]/route.ts` - Order status updates

**Implemented Features:**
- ✅ Order created (PENDING) - Sends confirmation SMS
- ✅ Order confirmed (CONFIRMED) - Sends confirmation SMS
- ✅ Order shipped (SHIPPED) - Sends shipping SMS with tracking number
- ✅ Order delivered (DELIVERED) - Sends delivery SMS

**How it works:**
- When an order is created, an SMS is automatically sent to the customer's phone number
- When an admin updates order status to CONFIRMED, SHIPPED, or DELIVERED, SMS notifications are sent
- All SMS sending is non-blocking (uses `sendSMSSafe` helper) so failures don't break order processing

### 2. User Registration ✅ IMPLEMENTED

**Location:** `src/app/api/auth/register/route.ts`

**Implemented Features:**
- ✅ Welcome SMS sent after successful registration (if phone provided)

**How it works:**
- After a user successfully registers, a welcome SMS is automatically sent to their phone number
- Uses `SMSTemplates.WELCOME()` template
- Non-blocking - registration succeeds even if SMS fails

### 3. Password Change Security Alert ✅ IMPLEMENTED

**Location:** `src/app/api/customer/security/password/route.ts`

**Implemented Features:**
- ✅ Security alert SMS sent when password is changed

**How it works:**
- When a user successfully changes their password, a security alert SMS is sent
- Uses `SMSTemplates.PASSWORD_CHANGED()` template
- Helps users detect unauthorized password changes
- Non-blocking - password change succeeds even if SMS fails

### 4. Low Stock Alerts ✅ IMPLEMENTED

**Location:** `src/app/api/customer/orders/route.ts`

**Implemented Features:**
- ✅ Low stock alert SMS sent to all admin users when product stock goes below threshold

**How it works:**
- When an order is created and product stock is decremented, the system checks if stock is now below threshold
- If stock is low, SMS alerts are sent to all active admin users (ADMIN and SUPER_ADMIN roles) who have phone numbers
- Uses `sendLowStockAlert()` helper function
- Non-blocking - order processing continues even if SMS fails

### 5. Quote to Order Conversion ✅ IMPLEMENTED

**Location:** `src/app/api/crm/quotes/[id]/convert/route.ts`

**Implemented Features:**
- ✅ Order confirmation SMS sent when quote is converted to order

**How it works:**
- When a quote is successfully converted to an order, an order confirmation SMS is sent to the customer
- Uses phone number from shipping address or customer profile
- Uses `SMSTemplates.ORDER_CONFIRMED()` template
- Non-blocking - conversion succeeds even if SMS fails

### 6. Phone Verification ✅ IMPLEMENTED

**Location:** 
- `src/app/api/auth/verify-phone/send/route.ts` - Send verification code
- `src/app/api/auth/verify-phone/verify/route.ts` - Verify code

**Implemented Features:**
- ✅ Send phone verification code via SMS
- ✅ Verify phone number with code
- ✅ Automatic phone verification status update

**How it works:**
1. User requests verification code via `POST /api/auth/verify-phone/send`
2. System generates 6-digit code, stores it in database (expires in 5 minutes)
3. Code is sent via SMS using Kavehnegar template or simple SMS
4. User submits code via `POST /api/auth/verify-phone/verify`
5. System validates code and marks phone as verified

**Usage Example:**
```typescript
// Send verification code
const sendResponse = await fetch('/api/auth/verify-phone/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phone: '09123456789' })
});

// Verify code
const verifyResponse = await fetch('/api/auth/verify-phone/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phone: '09123456789', code: '123456' })
});
```

### 7. Password Reset ✅ IMPLEMENTED

**Location:**
- `src/app/api/auth/reset-password/request/route.ts` - Request reset code
- `src/app/api/auth/reset-password/reset/route.ts` - Reset password with code

**Implemented Features:**
- ✅ Request password reset code via SMS
- ✅ Reset password using verification code
- ✅ Secure code validation and expiration

**How it works:**
1. User requests password reset via `POST /api/auth/reset-password/request`
2. System generates 6-digit code, stores it in database (expires in 10 minutes)
3. Code is sent via SMS using Kavehnegar template or simple SMS
4. User submits new password and code via `POST /api/auth/reset-password/reset`
5. System validates code and updates password

**Usage Example:**
```typescript
// Request reset code
const requestResponse = await fetch('/api/auth/reset-password/request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phone: '09123456789' })
});

// Reset password
const resetResponse = await fetch('/api/auth/reset-password/reset', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    phone: '09123456789', 
    code: '123456',
    newPassword: 'newSecurePassword123'
  })
});
```

## API Endpoint

### POST `/api/sms/send`

Send SMS through API (Admin only)

**Request:**
```json
{
  "type": "simple",
  "receptor": "09123456789",
  "message": "Your message here"
}
```

**For Verification:**
```json
{
  "type": "verification",
  "receptor": "09123456789",
  "token": "123456",
  "template": "verify"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "SMS sent successfully",
    "messageId": "12345678"
  }
}
```

## Error Handling

Always handle errors when sending SMS:

```typescript
const result = await sendSMS({...});

if (!result.success) {
  console.error('SMS failed:', result.error);
  // Log error but don't break the main flow
  // SMS failures shouldn't prevent order processing
}
```

## Best Practices

1. **Don't Block Main Operations**: SMS sending should be async and non-blocking
2. **Handle Failures Gracefully**: SMS failures shouldn't prevent order processing
3. **Rate Limiting**: Be mindful of SMS rate limits
4. **Template Usage**: Use templates for structured messages (verification codes)
5. **Phone Number Validation**: Always validate phone numbers before sending
6. **Logging**: Log all SMS operations for debugging
7. **Testing**: Test with your own phone number first

## Testing

### Test in Development

1. Use Kavehnegar test mode (if available)
2. Test with your own phone number
3. Check Kavehnegar panel for delivery reports

### Test SMS Sending

```typescript
// Test script
import { sendSMS } from '@/lib/sms';

const test = async () => {
  const result = await sendSMS({
    receptor: '09123456789', // Your test number
    message: 'Test message from HS6Tools',
  });
  
  console.log('Result:', result);
};

test();
```

## Cost Considerations

- Kavehnegar charges per SMS sent
- Check your account balance regularly
- Use SMS only for important notifications
- Consider email for non-critical communications

## Support

- Kavehnegar Documentation: https://kavenegar.com/rest.html
- Kavehnegar Panel: https://panel.kavenegar.com
- Support: support@kavenegar.com

## Implementation Status

1. ✅ SMS service utility created (`src/lib/sms.ts`)
2. ✅ API endpoint created (`src/app/api/sms/send/route.ts`)
3. ✅ Order notification SMS (created, confirmed, shipped, delivered)
4. ✅ Welcome SMS after registration
5. ✅ Password change security alert SMS
6. ✅ Low stock alert SMS to admins
7. ✅ Quote to order conversion SMS
8. ✅ Phone verification SMS (send code, verify code)
9. ✅ Password reset SMS (request code, reset password)
10. ✅ **UI Integration** - Phone verification in registration page
11. ✅ **UI Integration** - Forgot password page
12. ✅ **UI Integration** - Password reset page

## Next Steps

1. ✅ **Phone Verification**: API endpoints and UI created
2. ✅ **Password Reset**: API endpoints and UI created
3. ⏳ **Testing**: Test all SMS integrations in production environment
4. ⏳ **Monitoring**: Set up logging and monitoring for SMS delivery rates
5. ⏳ **Rate Limiting**: Implement rate limiting for SMS sending to prevent abuse
6. ⏳ **SMS Templates**: Create templates in Kavehnegar panel (optional - system falls back to simple SMS)

