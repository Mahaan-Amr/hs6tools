# 📱 SMS Implementation Summary

## ✅ What Has Been Implemented

### 1. **SMS Service Library** (`src/lib/sms.ts`)
   - ✅ Complete SMS service with TypeScript types
   - ✅ **SMS.ir Integration** (Primary Provider)
   - ✅ **Kavenegar Integration** (Fallback Provider)
   - ✅ Automatic provider detection (SMS.ir priority)
   - ✅ `sendSMS()` - Send simple SMS messages
   - ✅ `sendVerificationCode()` - Send OTP/verification codes using templates
   - ✅ `sendBulkSMS()` - Send SMS to multiple recipients
   - ✅ `getSMSStatus()` - Check SMS delivery status
   - ✅ `sendSMSSafe()` - Helper for non-blocking SMS sending
   - ✅ `sendLowStockAlert()` - Helper for low stock alerts to admins
   - ✅ Predefined SMS templates for common use cases

### 2. **API Endpoint** (`src/app/api/sms/send/route.ts`)
   - ✅ REST API endpoint for sending SMS (Admin only)
   - ✅ Supports both simple SMS and verification codes
   - ✅ Phone number validation
   - ✅ Error handling

### 3. **Documentation**
   - ✅ Complete integration guide (`docs/SMS_INTEGRATION_GUIDE.md`)
   - ✅ Usage examples for all scenarios
   - ✅ Integration points documentation

## 📦 Packages Installed

- ✅ `sms-ir` - SMS.ir Node.js package (Primary)
- ✅ `kavenegar` - Official Kavenegar Node.js package (Fallback)
- ✅ `@types/kavenegar` - TypeScript type definitions

**Note:** 
- SMS.ir uses Promise-based API (modern)
- Kavenegar uses callback-based API (wrapped in Promises)

## 🔧 Required Configuration

### Environment Variables

**Option 1: SMS.ir (Recommended)**
```env
# SMS.ir Configuration
SMSIR_API_KEY=your_smsir_api_key
SMSIR_VERIFY_TEMPLATE_ID=your_template_id
SMSIR_SECRET_KEY=  # Optional (not needed for new panels)
SMSIR_LINE_NUMBER=  # Optional
```

**Option 2: Kavenegar (Fallback)**
```env
# Kavenegar Configuration
KAVENEGAR_API_KEY=your_api_key_here
KAVENEGAR_SENDER=2000660110  # Optional
# The service also accepts NEXT_PUBLIC_KAVENEGAR_API_KEY or KAVENEGAR_API_TOKEN
```

**Provider Priority:** SMS.ir (if configured) > Kavenegar (if configured) > Error

> Note: `update.sh` validates both SMS.ir and Kavenegar configurations. Ensure at least one is set before running the update on the server.

**How to get API keys:**
- **SMS.ir:** Register at https://sms.ir/ → Get API key from panel → Create templates
- **Kavenegar:** Register at https://panel.kavenegar.com → Get API key from dashboard

## ✅ Recent Updates (2025-01-XX)

### Enhanced SMS Templates
- **ORDER_CONFIRMED**: Now includes product list and total amount
- **ORDER_PAYMENT_SUCCESS**: New template for payment success with product details and refId

### SMS Integration Points
1. **Order Creation** (`src/app/api/customer/orders/route.ts`):
   - Sends SMS when order is created
   - Includes product list and total amount
   - Non-blocking (uses `sendSMSSafe`)

2. **Payment Success** (`src/app/api/payment/zarinpal/callback/route.ts`):
   - Sends SMS after successful payment verification
   - Includes product list, total amount, and payment reference ID
   - Non-blocking (uses `sendSMSSafe`)

### Configuration
- **SMS.ir:** API key and template ID configured
- **Kavenegar:** Fallback support maintained
- Sender number: Uses SMS.ir default or Kavenegar configured number
- All SMS sending is non-blocking to prevent order/payment flow interruption
- Automatic provider detection ensures seamless operation

## 🎯 Where to Use SMS in Your Project

### 1. **Order Notifications** ✅ IMPLEMENTED
   - ✅ Order confirmation (when order is created)
   - ✅ Order confirmed (when status changes to CONFIRMED)
   - ✅ Order shipped (when status changes to SHIPPED with tracking number)
   - ✅ Order delivered (when status changes to DELIVERED)
   - ✅ Quote to order conversion notification

### 2. **Customer Communications** ✅ IMPLEMENTED
   - ✅ Welcome messages (after registration)
   - ✅ Security alerts (password change)

### 3. **Admin Notifications** ✅ IMPLEMENTED
   - ✅ Low stock alerts (when product stock goes below threshold)

### 4. **Authentication** ✅ IMPLEMENTED
   - ✅ Phone verification (send code, verify code)
   - ✅ Password reset (request code, reset password)

## 📝 Quick Start Example

```typescript
import { sendSMS, SMSTemplates } from '@/lib/sms';

// Send order confirmation
await sendSMS({
  receptor: '09123456789',
  message: SMSTemplates.ORDER_CONFIRMED('ORD-12345', 'علی احمدی'),
});
```

## ✅ Implementation Status

### Completed Integrations

1. ✅ **Order Creation** (`src/app/api/customer/orders/route.ts`)
   - Sends confirmation SMS when order is created

2. ✅ **Order Status Updates** (`src/app/api/orders/[id]/route.ts`)
   - Sends SMS when order status changes to CONFIRMED, SHIPPED, or DELIVERED

3. ✅ **User Registration** (`src/app/api/auth/register/route.ts`)
   - Sends welcome SMS after successful registration

4. ✅ **Password Change** (`src/app/api/customer/security/password/route.ts`)
   - Sends security alert SMS when password is changed

5. ✅ **Low Stock Alerts** (`src/app/api/customer/orders/route.ts`)
   - Sends SMS to all admin users when product stock goes below threshold

6. ✅ **Quote Conversion** (`src/app/api/crm/quotes/[id]/convert/route.ts`)
   - Sends order confirmation SMS when quote is converted to order

### Completed Integrations (Continued)

7. ✅ **Phone Verification** (`src/app/api/auth/verify-phone/`)
   - Send verification code endpoint
   - Verify code endpoint
   - Automatic phone verification status update
   - ✅ **UI Integration** - Phone verification step in registration page

8. ✅ **Password Reset** (`src/app/api/auth/reset-password/`)
   - Request reset code endpoint
   - Reset password endpoint
   - Secure code validation with expiration
   - ✅ **UI Integration** - Forgot password page
   - ✅ **UI Integration** - Password reset page

## 🚀 Next Steps

1. ✅ **Add API Key to Environment** - DONE
   - API key added to `.env.local`

2. **Create SMS Templates** (Required for SMS.ir, Optional for Kavenegar)
   - **SMS.ir:** Login to https://app.sms.ir/ → Create templates → Note Template ID (Pattern Code)
   - **Kavenegar:** Login to https://panel.kavenegar.com → Create templates: `verify`, `password-reset`
   - If templates don't exist, system uses simple SMS format (Kavenegar only)

3. **Test All Integrations**
   - ✅ Test phone verification flow in registration page
   - ✅ Test password reset flow (forgot password → reset password)
   - Test with your phone number
   - Verify delivery in SMS.ir panel (or Kavenegar panel if using fallback)
   - Check logs for any errors
   - Monitor provider used in logs (should show 'smsir' or 'kavenegar')

4. ✅ **Phone Verification UI** - Integrated into registration page
   - Automatic verification step after registration (if phone provided)
   - Verification code input with countdown timer
   - Resend code functionality
   - Skip verification option

5. ✅ **Password Reset UI** - Complete flow implemented
   - Forgot password page with phone input
   - Password reset page with code and new password
   - Link from login page to forgot password
   - Form validation and error handling

6. **Test All Integrations**
   - Test phone verification flow in registration
   - Test password reset flow
   - Verify SMS delivery in Kavehnegar panel

## 📚 Documentation

See `docs/SMS_INTEGRATION_GUIDE.md` for:
- Complete usage examples
- Integration points
- Best practices
- Error handling
- Testing guide

## ⚠️ Important Notes

1. **SMS Costs Money**: Be mindful of usage
2. **Rate Limits**: Both providers have rate limits
3. **Phone Format**: Use format `09123456789` (no +98)
4. **Templates Required**: 
   - **SMS.ir:** Template ID (Pattern Code) required for verification codes
   - **Kavenegar:** Template name required (falls back to simple SMS if not found)
5. **Error Handling**: Always handle SMS failures gracefully
6. **Provider Detection**: System automatically uses SMS.ir if configured, otherwise Kavenegar

## 🔗 Resources

### SMS.ir (Primary)
- Panel: https://app.sms.ir/
- API Documentation: https://github.com/movahhedi/sms-ir-node
- Package: https://www.npmjs.com/package/sms-ir

### Kavenegar (Fallback)
- Panel: https://panel.kavenegar.com
- API Documentation: https://kavenegar.com/rest.html
- Package: https://www.npmjs.com/package/kavenegar
- Type Definitions: https://www.npmjs.com/package/@types/kavenegar

