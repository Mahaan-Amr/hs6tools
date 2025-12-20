# 📱 SMS.ir Platform Deep Analysis & Integration Guide

## Platform Exploration Summary

Based on deep exploration of the SMS.ir platform, here are the key findings and integration requirements:

---

## 🔍 Account Status

**Current Account Information:**
- **User:** ماهان امیریان (Mahan Amirian)
- **Current Credit:** 21,900 Rials (10 SMS)
- **Plan:** Free Plan (پلن رایگان)
- **Version:** 8.6.3

**Account Status:**
- ✅ Account is active and verified
- ⚠️ No API keys created yet
- ⚠️ No templates created yet
- ✅ No API errors (clean slate for integration)

---

## 📋 Platform Structure

### 1. **Developer Section (برنامه نویسان)**

The platform has a comprehensive developer section with the following subsections:

#### a. **API Keys List (لیست کلیدهای API)**
- **Location:** `https://app.sms.ir/developer/list`
- **Purpose:** Create and manage API keys
- **Current Status:** No API keys exist yet
- **Action Required:** Create API key for integration

**How to Create API Key:**
1. Navigate to "لیست کلیدهای API"
2. Click "افزودن کلید جدید" (Add New Key)
3. Provide a name (e.g., "HS6Tools Production")
4. Copy the generated API key

**Important Notes:**
- ⚠️ **New SMS.ir panels only provide API Key** (no Secret Key required)
- The API key is the only credential needed
- Secret Key can be set to `null` or empty string in code

#### b. **Templates List (لیست قالبها)**
- **Location:** `https://app.sms.ir/developer/tpl-list`
- **Purpose:** View and manage SMS templates
- **Current Status:** No templates exist yet
- **Action Required:** Create verification and password reset templates

**How to Create Template:**
1. Navigate to "ارسال سریع" > "لیست قالبها"
2. Click "افزودن قالب" (Add Template)
3. Provide title and content
4. Use `#OTP#` placeholder for verification codes
5. Note the **Pattern Code** (Template ID) after creation

**Template Requirements:**
- Templates must be approved before use
- Use Pattern Code (number) in API calls, not template name
- Placeholders: `#OTP#` for verification codes

#### c. **Fast Send (ارسال سریع)**
- **Location:** `https://app.sms.ir/developer/fast-send`
- **Purpose:** Send SMS using templates
- **Usage:** For testing and manual sending

#### d. **API Usage Guide (راهنمای استفاده از API)**
- **Location:** `https://app.sms.ir/developer/help/introduction`
- **Purpose:** API documentation and examples
- **Content:** REST API endpoints, authentication, examples

#### e. **Latest API Call Errors (آخرین خطاهای فراخوانی API)**
- **Location:** `https://app.sms.ir/developer/logs`
- **Purpose:** View API call errors and debugging
- **Current Status:** No errors (no API calls made yet)

#### f. **Libraries and Plugins (کتابخانه ها و افزونه ها)**
- **Location:** Available in developer section
- **Purpose:** Download SDKs and plugins
- **Available:** Node.js, C#, PHP, Python, WordPress plugins, etc.

---

## 🔧 API Integration Details

### Authentication

**New SMS.ir Panels:**
- ✅ Only **API Key** is required
- ❌ **Secret Key is NOT needed** (can be `null` or empty)
- Token-based authentication using API key

**Authentication Flow:**
1. Get token using API key: `Token.get(apiKey, null)`
2. Use token for subsequent API calls
3. Token expires after a period (handled automatically)

### SMS Sending Methods

#### 1. **Simple SMS (SimpleSend)**
- **Use Case:** Basic text messages
- **Endpoint:** SimpleSend API
- **Parameters:**
  - Token (from authentication)
  - Line Number (optional, uses default if not set)
  - Message Text
  - Phone Number

#### 2. **Verification Code (VerificationCode)**
- **Use Case:** OTP/verification codes
- **Endpoint:** VerificationCode API
- **Parameters:**
  - Token
  - Phone Number
  - Code (6-digit verification code)
  - Template ID (Pattern Code)

**Note:** This method uses a simple template format, not the UltraFastSend pattern system.

#### 3. **Ultra Fast Send (UltraFastSend)** ⭐ RECOMMENDED
- **Use Case:** Template-based SMS with variables
- **Endpoint:** UltraFastSend API
- **Parameters:**
  - Token
  - Phone Number
  - Pattern Code (Template ID)
  - Variables (object with placeholders like `{OTP}`)

**Why Recommended:**
- More flexible template system
- Supports multiple variables
- Better for production use
- Matches the template system in the panel

---

## 📝 Template System

### Template Creation Process

1. **Create Template in Panel:**
   - Go to "ارسال سریع" > "لیست قالبها"
   - Click "افزودن قالب"
   - Enter title and content
   - Use placeholders: `#OTP#` or `{OTP}`

2. **Template Content Examples:**

   **Verification Code Template:**
   ```
   کد تأیید شما #OTP# می‌باشد. این کد 5 دقیقه اعتبار دارد.
   ```
   Or:
   ```
   کد تأیید شما {OTP} می‌باشد. این کد 5 دقیقه اعتبار دارد.
   ```

   **Password Reset Template:**
   ```
   کد بازیابی رمز عبور شما #OTP# می‌باشد. این کد 10 دقیقه اعتبار دارد.
   ```

3. **Get Pattern Code:**
   - After template creation, note the Pattern Code (Template ID)
   - This is a number (e.g., `123456`)
   - Use this in API calls, not the template name

4. **Template Approval:**
   - Templates are usually approved instantly
   - Check template status in panel
   - Only approved templates can be used

---

## 🔄 Code Implementation Updates Needed

Based on the platform analysis, here are the updates needed:

### 1. **Update SMS.ir Authentication**

**Current Implementation:**
```typescript
const tokenResult = await token.get(apiKey, secretKey);
```

**Updated Implementation:**
```typescript
// New SMS.ir panels only need API key, secretKey can be null
const tokenResult = await token.get(apiKey, secretKey || null);
```

### 2. **Use UltraFastSend for Templates**

**Current Implementation:**
```typescript
const verificationCode = new SMSIr.VerificationCode();
const result = await verificationCode.send(tokenKey, phoneNumber, code, templateId);
```

**Recommended Implementation:**
```typescript
const ultraFastSend = new SMSIr.UltraFastSend();
const result = await ultraFastSend.send(
  tokenKey,
  phoneNumber,
  templateId, // Pattern Code
  { OTP: code } // Variables object
);
```

### 3. **Environment Variables**

**Required:**
```env
SMSIR_API_KEY=your_api_key_here
SMSIR_VERIFY_TEMPLATE_ID=your_pattern_code_number
```

**Optional:**
```env
SMSIR_SECRET_KEY=  # Can be empty for new panels
SMSIR_LINE_NUMBER=your_line_number  # Optional
SMSIR_PASSWORD_RESET_TEMPLATE_ID=your_pattern_code_number
```

---

## 📊 Platform Features

### Available Features

1. **Simple SMS Sending**
   - Text messages
   - Bulk sending
   - Scheduled sending

2. **Template-Based Sending**
   - Fast Send templates
   - Ultra Fast Send (with variables)
   - Pattern-based messaging

3. **Reports & Analytics**
   - Send reports
   - Delivery status
   - Error logs
   - Usage statistics

4. **Account Management**
   - Credit management
   - Plan upgrades
   - Transaction history

---

## 🚀 Integration Steps

### Step 1: Create API Key
1. Go to `https://app.sms.ir/developer/list`
2. Click "افزودن کلید جدید"
3. Name it "HS6Tools Production"
4. Copy the API key

### Step 2: Create Templates
1. Go to `https://app.sms.ir/fast-send/template`
2. Click "افزودن قالب"
3. Create verification template:
   - Title: `verify`
   - Content: `کد تأیید شما #OTP# می‌باشد. این کد 5 دقیقه اعتبار دارد.`
4. Note the Pattern Code (Template ID)
5. Repeat for password reset template (optional)

### Step 3: Update Environment Variables
```env
SMSIR_API_KEY=your_api_key_from_step_1
SMSIR_VERIFY_TEMPLATE_ID=pattern_code_from_step_2
```

### Step 4: Test Integration
1. Test phone verification flow
2. Check SMS.ir panel for delivery reports
3. Monitor error logs if any issues

---

## ⚠️ Important Notes

1. **No Secret Key Required:**
   - New SMS.ir panels only provide API key
   - Set `SMSIR_SECRET_KEY` to empty or `null` in code

2. **Template IDs vs Names:**
   - Use **Pattern Code** (number) in API calls
   - Not template name (string)
   - Pattern Code is shown after template creation

3. **Template Placeholders:**
   - Can use `#OTP#` or `{OTP}` format
   - Check which format your template uses
   - UltraFastSend uses `{OTP}` format

4. **Free Plan Limitations:**
   - Current plan: Free
   - Credit: 21,900 Rials (10 SMS)
   - May need to upgrade for production use

5. **API Rate Limits:**
   - Check plan limits
   - Free plan may have restrictions
   - Monitor usage in reports section

---

## 🔍 Platform Navigation

**Key URLs:**
- Dashboard: `https://app.sms.ir/dashboard`
- API Keys: `https://app.sms.ir/developer/list`
- Templates: `https://app.sms.ir/fast-send/template`
- Fast Send: `https://app.sms.ir/developer/fast-send`
- API Guide: `https://app.sms.ir/developer/help/introduction`
- Error Logs: `https://app.sms.ir/developer/logs`
- Template List: `https://app.sms.ir/developer/tpl-list`

---

## 📚 Next Steps

1. ✅ Platform exploration complete
2. ⏳ Create API key in panel
3. ⏳ Create templates in panel
4. ⏳ Update code to use UltraFastSend (if needed)
5. ⏳ Test integration
6. ⏳ Monitor delivery reports

---

**Analysis Date:** 2025-01-20  
**Platform Version:** 8.6.3  
**Account Status:** Active, Free Plan

