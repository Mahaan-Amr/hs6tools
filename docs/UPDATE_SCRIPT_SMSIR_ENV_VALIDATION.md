# ✅ Update Script SMS.ir Environment Variable Validation

## Overview

The `update.sh` script has been updated to properly validate SMS.ir environment variables and ensure at least one SMS provider is configured before building and deploying.

---

## ✅ Changes Made

### 1. Required Environment Variables Updated

**Before:**
- `KAVENEGAR_API_KEY` was in `REQUIRED_ENV_VARS` array
- `KAVENEGAR_SENDER` was in `REQUIRED_ENV_VARS` array

**After:**
- Removed hard requirement for Kavenegar variables
- SMS service validation moved to separate `validate_sms_config()` function
- Ensures at least one SMS provider (SMS.ir or Kavenegar) is configured

### 2. Enhanced SMS Configuration Validation

#### `validate_sms_config()` Function
- ✅ Checks for SMS.ir API key first (priority)
- ✅ Checks for Kavenegar API key as fallback
- ✅ **Fails early** if neither provider is configured
- ✅ Validates the configured provider's specific requirements

#### SMS.ir Validation (`validate_smsir_config()`)
- ✅ Validates `SMSIR_API_KEY` is set and not a placeholder
- ✅ Validates `SMSIR_VERIFY_TEMPLATE_ID` is set and is a number
- ✅ Checks `SMSIR_SECRET_KEY` (optional - warns if missing but doesn't fail)
- ✅ Checks `SMSIR_LINE_NUMBER` (optional)
- ✅ Checks `SMSIR_PASSWORD_RESET_TEMPLATE_ID` (optional)
- ✅ **Fails if required variables are missing or invalid**

#### Kavenegar Validation (`validate_kavenegar_config()`)
- ✅ Validates `KAVENEGAR_API_KEY` is set and not a placeholder
- ✅ Validates API key format (hexadecimal, 32+ chars)
- ✅ Validates or auto-sets `KAVENEGAR_SENDER` (default: 2000660110)

### 3. PM2 Environment Variable Verification

Enhanced PM2 environment variable checks to include:

#### SMS.ir Variables
- ✅ `SMSIR_API_KEY` - Required
- ✅ `SMSIR_SECRET_KEY` - Optional
- ✅ `SMSIR_VERIFY_TEMPLATE_ID` - Required (warns if missing)
- ✅ `SMSIR_PASSWORD_RESET_TEMPLATE_ID` - Optional
- ✅ `SMSIR_LINE_NUMBER` - Optional

#### Kavenegar Variables (Fallback)
- ✅ `KAVENEGAR_API_KEY` - Required if using Kavenegar
- ✅ `KAVENEGAR_SENDER` - Optional (defaults to 2000660110)
- ✅ `NEXT_PUBLIC_KAVENEGAR_API_KEY` - Warns (not recommended)
- ✅ `KAVENEGAR_API_TOKEN` - Alternative API key

---

## 🔍 Validation Flow

### Step 1: Check Required Variables
```bash
REQUIRED_ENV_VARS=(
  "DATABASE_URL"
  "NEXTAUTH_URL"
  "NEXTAUTH_SECRET"
  "ZARINPAL_MERCHANT_ID"
  "ZARINPAL_SANDBOX"
  "NEXT_PUBLIC_APP_URL"
)
```
- Validates core application variables
- SMS variables are validated separately

### Step 2: Validate SMS Configuration
```bash
validate_sms_config()
```
1. Check for `SMSIR_API_KEY`
2. If found → Validate SMS.ir configuration
3. If not found → Check for `KAVENEGAR_API_KEY`
4. If found → Validate Kavenegar configuration
5. If neither found → **ERROR: No SMS provider configured**

### Step 3: Provider-Specific Validation

#### SMS.ir Validation
- ✅ API Key exists and is not placeholder
- ✅ Verify Template ID exists and is numeric
- ⚠️ Secret Key optional (warns if missing)
- ⚠️ Line Number optional (warns if missing)
- ⚠️ Password Reset Template ID optional (warns if missing)

#### Kavenegar Validation
- ✅ API Key exists and is not placeholder
- ✅ API Key format validation (hex, 32+ chars)
- ✅ Sender number validation or auto-set

### Step 4: PM2 Environment Verification
After restarting PM2, the script verifies:
- ✅ SMS provider API key is loaded
- ✅ Required template IDs are loaded (for SMS.ir)
- ✅ Optional variables are noted
- ⚠️ Warnings if required variables are missing

---

## 📋 Validation Rules

### SMS.ir Required Variables
| Variable | Required | Validation | Error Action |
|----------|----------|------------|--------------|
| `SMSIR_API_KEY` | ✅ Yes | Not empty, not placeholder | **ERROR** |
| `SMSIR_VERIFY_TEMPLATE_ID` | ✅ Yes | Numeric, not empty | **ERROR** |
| `SMSIR_SECRET_KEY` | ❌ No | - | Warning if missing |
| `SMSIR_LINE_NUMBER` | ❌ No | - | Info if missing |
| `SMSIR_PASSWORD_RESET_TEMPLATE_ID` | ❌ No | Numeric if set | Warning if invalid |

### Kavenegar Required Variables
| Variable | Required | Validation | Error Action |
|----------|----------|------------|--------------|
| `KAVENEGAR_API_KEY` | ✅ Yes* | Not empty, not placeholder, hex format | **ERROR** |
| `KAVENEGAR_SENDER` | ❌ No | Auto-set to 2000660110 if missing | Info |

*Required only if SMS.ir is not configured

---

## 🚨 Error Messages

### No SMS Provider Configured
```
❌ ERROR: No SMS service configured! Please set either SMSIR_API_KEY (for SMS.ir) or KAVENEGAR_API_KEY (for Kavenegar) in .env.production
```

### SMS.ir Template ID Missing
```
❌ ERROR: SMSIR_VERIFY_TEMPLATE_ID not set. This is required for SMS.ir verification codes.
❌ ERROR: Please create a template in SMS.ir panel (https://app.sms.ir/fast-send/template) and set SMSIR_VERIFY_TEMPLATE_ID to the Template ID.
```

### SMS.ir Template ID Invalid
```
❌ ERROR: SMSIR_VERIFY_TEMPLATE_ID must be a number (Template ID/Pattern Code from SMS.ir panel). Current value: <value>
```

### Kavenegar API Key Missing
```
❌ ERROR: KAVENEGAR_API_KEY not found in .env file. Please add it to .env.production
```

---

## ✅ Success Messages

### SMS.ir Configuration Validated
```
✅ SMSIR_API_KEY validated (length: 64 chars)
✅ SMSIR_VERIFY_TEMPLATE_ID validated: 408915
ℹ️  SMSIR_SECRET_KEY not set (optional - new panels don't require it)
ℹ️  SMSIR_LINE_NUMBER not set (will use default service number)
✅ SMS.ir configuration validated successfully
```

### PM2 Environment Verified
```
✅ SMSIR_API_KEY is loaded in PM2 (length: 64 chars)
✅ SMSIR_VERIFY_TEMPLATE_ID is loaded in PM2: 408915
ℹ️  SMSIR_SECRET_KEY not found in PM2 (optional - new panels don't require it)
ℹ️  SMSIR_LINE_NUMBER not found in PM2 (will use default service number)
```

---

## 📝 Example .env.production Configuration

### Using SMS.ir (Recommended)
```env
# SMS.ir Configuration
SMSIR_API_KEY=your-smsir-api-key-here
SMSIR_VERIFY_TEMPLATE_ID=408915
# Optional
SMSIR_SECRET_KEY=
SMSIR_LINE_NUMBER=
SMSIR_PASSWORD_RESET_TEMPLATE_ID=
```

### Using Kavenegar (Fallback)
```env
# Kavenegar Configuration
KAVENEGAR_API_KEY=your-kavenegar-api-key-here
KAVENEGAR_SENDER=2000660110
```

---

## 🔄 Update Script Execution Flow

1. **Pre-flight Checks**
   - ✅ Directory check
   - ✅ Git check
   - ✅ Node/npm check

2. **Environment Setup**
   - ✅ Check `.env.production` exists
   - ✅ Copy `.env.production` to `.env`
   - ✅ Validate required variables
   - ✅ **Validate SMS configuration** ← **NEW**

3. **Code Update**
   - ✅ Pull latest changes
   - ✅ Install dependencies
   - ✅ Generate Prisma client
   - ✅ Run migrations
   - ✅ Build application

4. **Deployment**
   - ✅ Restart PM2
   - ✅ **Verify PM2 environment variables** ← **ENHANCED**
   - ✅ Test connectivity
   - ✅ Check Nginx

---

## ✅ Benefits

1. **Early Detection**: SMS configuration issues are caught before build
2. **Clear Errors**: Specific error messages guide users to fix issues
3. **Provider Priority**: SMS.ir is checked first, Kavenegar as fallback
4. **Comprehensive Validation**: All SMS variables are validated
5. **PM2 Verification**: Ensures variables are loaded in production
6. **User-Friendly**: Clear warnings and info messages

---

## 🎯 Summary

The `update.sh` script now:
- ✅ Validates SMS.ir configuration before build
- ✅ Ensures at least one SMS provider is configured
- ✅ Validates template IDs are numeric
- ✅ Verifies PM2 environment variables after restart
- ✅ Provides clear error messages and guidance
- ✅ Supports both SMS.ir (primary) and Kavenegar (fallback)

**Status:** ✅ **COMPLETE**  
**Validation:** ✅ **COMPREHENSIVE**  
**Error Handling:** ✅ **USER-FRIENDLY**

