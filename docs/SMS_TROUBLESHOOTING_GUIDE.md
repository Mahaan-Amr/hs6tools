# 📱 SMS Troubleshooting Guide

## Issue: SMS Verification Codes Not Being Sent

### Symptoms
- User tries to register but no verification code is received
- Error message: "Failed to get SMS.ir token: SMS.ir token API returned null/undefined response"
- PM2 environment check shows "No SMS service API key found" (may be false positive)
- Application logs show SMS provider detection works but token retrieval fails

---

## 🔍 Diagnostic Steps

### Step 1: Check PM2 Startup Logs

The `ecosystem.config.js` now logs when it loads environment variables. Check for these messages:

```bash
pm2 logs hs6tools --lines 50 | grep -i "PM2 Config"
```

**Expected Output:**
```
[PM2 Config] Loaded 45 environment variables from .env
[PM2 Config] SMS.ir API Key present: YES (qr6OhgdzDXrmHeEh...)
[PM2 Config] SMS.ir Template ID: 408915
```

**If you see "NO" or "NOT SET":**
- The `.env` file is not being read correctly
- Check file permissions: `ls -la .env`
- Verify file exists: `cat .env | grep SMSIR_API_KEY`

---

### Step 2: Check Application Logs for SMS Provider Detection

```bash
pm2 logs hs6tools --lines 100 | grep -i "sms\|provider"
```

**Expected Output (when SMS is sent):**
```
📱 [verify-phone/send] SMS Provider Detection: {
  smsirApiKey: 'qr6OhgdzDXrmHeEh... (48 chars)',
  smsirTemplateId: '408915',
  kavenegarApiKey: 'NOT SET',
  nodeEnv: 'production'
}
📱 [SMS Provider] Detected SMS.ir: {
  apiKeyLength: 48,
  smsIrPackageAvailable: true,
  templateId: '408915'
}
📱 [sendVerificationCode] SMS.ir - Attempting to send verification code: {
  receptor: '09387058566',
  templateId: 408915,
  token: '123456'
}
```

**If you see "No SMS provider detected":**
- Environment variables are not loaded in the application
- Check `.env.production` file on server
- Verify `ecosystem.config.js` is being used by PM2

---

### Step 3: Verify Environment Variables in .env File

```bash
cd /var/www/hs6tools
cat .env | grep SMSIR
```

**Expected Output:**
```
SMSIR_API_KEY=qr6OhgdzDXrmHeEhS3MrJ6PbDF4fxehV86y8QvhEzrQKRyFw
SMSIR_VERIFY_TEMPLATE_ID=408915
```

**If variables are missing:**
1. Check `.env.production` file:
   ```bash
   cat .env.production | grep SMSIR
   ```
2. If missing, add them:
   ```bash
   nano .env.production
   # Add:
   SMSIR_API_KEY=qr6OhgdzDXrmHeEhS3MrJ6PbDF4fxehV86y8QvhEzrQKRyFw
   SMSIR_VERIFY_TEMPLATE_ID=408915
   ```
3. Run update script:
   ```bash
   bash update.sh
   ```

---

### Step 4: Verify PM2 is Using ecosystem.config.js

```bash
pm2 describe hs6tools | grep -i "script\|config"
```

**Expected Output:**
```
script path: /var/www/hs6tools/ecosystem.config.js
```

**If PM2 is not using ecosystem.config.js:**
1. Delete and restart PM2:
   ```bash
   pm2 delete hs6tools
   pm2 start ecosystem.config.js --env production
   pm2 save
   ```

---

### Step 5: Test SMS Provider Detection Directly

Check if the application can detect the SMS provider:

```bash
pm2 logs hs6tools --lines 200 | grep -i "SMS Provider\|smsir\|kavenegar" | tail -20
```

**Look for:**
- `📱 [SMS Provider] Detected SMS.ir` - ✅ Good
- `❌ [SMS Provider] No SMS provider detected` - ❌ Problem

---

## 🔧 Common Issues and Fixes

### Issue 1: PM2 Environment Check Shows "No SMS service API key found"

**Cause:** PM2's `pm2 env` command might not display all variables, even if they're loaded.

**Solution:**
1. Check if variables exist in `.env` file (Step 3 above)
2. Check PM2 startup logs for `[PM2 Config]` messages (Step 1)
3. If `.env` has variables but PM2 doesn't show them, the app should still work
4. Verify by checking application logs when SMS is sent (Step 2)

---

### Issue 2: Application Logs Show "No SMS provider detected"

**Cause:** Environment variables are not being loaded into the Node.js process.

**Solution:**
1. **Verify `.env.production` has the variables:**
   ```bash
   cat .env.production | grep SMSIR_API_KEY
   ```

2. **Ensure `.env` is copied from `.env.production`:**
   ```bash
   # The update.sh script does this automatically
   bash update.sh
   ```

3. **Restart PM2 to reload environment:**
   ```bash
   pm2 delete hs6tools
   pm2 start ecosystem.config.js --env production
   pm2 save
   ```

4. **Check PM2 startup logs:**
   ```bash
   pm2 logs hs6tools --lines 50 | grep "PM2 Config"
   ```

---

### Issue 3: SMS.ir API Returns Error

**Check application logs for SMS.ir errors:**
```bash
pm2 logs hs6tools --lines 100 | grep -i "sms.ir\|smsir\|error"
```

**Common Errors:**

1. **"Failed to get SMS.ir token"**
   - API key is incorrect
   - Check `.env.production` has correct `SMSIR_API_KEY`
   - Verify API key in SMS.ir panel: https://app.sms.ir/developer/list

2. **"Invalid SMS.ir template ID"**
   - Template ID is not a number
   - Check `.env.production` has `SMSIR_VERIFY_TEMPLATE_ID=408915` (number, not string)
   - Verify template is approved in SMS.ir panel: https://app.sms.ir/fast-send/template

3. **"UltraFastSend failed"**
   - Template might not be approved
   - Check template status in SMS.ir panel
   - System will fallback to `VerificationCode` method automatically

---

### Issue 4: UltraFastSend Parameter Order Issue

**Fixed in latest update:** The parameter order for `UltraFastSend` has been corrected:

```typescript
// Correct order:
ultraFastSend.send(
  tokenKey,        // 1. Token
  templateId,      // 2. Template ID (Pattern Code)
  receptor,        // 3. Phone number
  [{               // 4. Parameters array
    Parameter: 'OTP',
    ParameterValue: code
  }]
)
```

If you're still seeing errors, ensure you've pulled the latest code:
```bash
git pull origin master
bash update.sh
```

---

## ✅ Verification Checklist

After fixing issues, verify everything works:

- [ ] `.env.production` has `SMSIR_API_KEY` and `SMSIR_VERIFY_TEMPLATE_ID`
- [ ] `.env` file exists and has the same variables
- [ ] PM2 startup logs show `[PM2 Config] SMS.ir API Key present: YES`
- [ ] Application logs show `📱 [SMS Provider] Detected SMS.ir`
- [ ] Test registration and verify SMS is received
- [ ] Check SMS.ir panel for sent messages: https://app.sms.ir/developer/logs

---

## 📞 Still Having Issues?

1. **Check all logs:**
   ```bash
   pm2 logs hs6tools --lines 200
   ```

2. **Verify SMS.ir account:**
   - Login: https://app.sms.ir/dashboard
   - Check API key: https://app.sms.ir/developer/list
   - Check template: https://app.sms.ir/fast-send/template
   - Check logs: https://app.sms.ir/developer/logs

3. **Test SMS manually:**
   - Use SMS.ir panel to send a test SMS
   - Verify account has credit
   - Check if template is approved

4. **Contact Support:**
   - Include PM2 logs
   - Include application logs
   - Include `.env` file (remove sensitive values)
   - Include SMS.ir panel screenshots

---

## 🔄 Quick Fix Commands

If you need to quickly reset everything:

```bash
cd /var/www/hs6tools

# 1. Verify .env.production has SMS.ir keys
cat .env.production | grep SMSIR

# 2. Run update script (copies .env.production to .env)
bash update.sh

# 3. Check PM2 logs for [PM2 Config] messages
pm2 logs hs6tools --lines 50 | grep "PM2 Config"

# 4. Test registration and check logs
pm2 logs hs6tools --lines 100 | grep -i "sms\|provider"
```

---

**Last Updated:** 2025-12-20  
**Related Docs:**
- `docs/SMSIR_MIGRATION_GUIDE.md`
- `docs/ENVIRONMENT_REQUIREMENTS.md`
- `docs/UPDATE_SCRIPT_SMSIR_ENV_VALIDATION.md`

