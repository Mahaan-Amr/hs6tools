# ✅ Automatic API Key Setup on Server

## Overview

The `update.sh` script **automatically sets and loads SMS.ir API keys** from `.env.production` when you run it on the server. No manual configuration needed!

---

## 🔄 How It Works Automatically

### Step 1: Copy Environment Variables
When you run `update.sh`, it automatically:
```bash
# Copies .env.production to .env
cp .env.production .env
```
✅ **All API keys from `.env.production` are automatically loaded into `.env`**

### Step 2: Validate Configuration
The script validates:
- ✅ SMS.ir API key is present: `qr6OhgdzDXrmHeEhS3MrJ6PbDF4fxehV86y8QvhEzrQKRyFw`
- ✅ Template ID is present: `408915`
- ✅ All required variables are set

### Step 3: Update PM2 Configuration
The script automatically updates `ecosystem.config.js` to:
- ✅ Load all variables from `.env` file
- ✅ Include SMS.ir API keys
- ✅ Include Template IDs

### Step 4: Restart PM2
When PM2 restarts, it automatically:
- ✅ Loads all environment variables from `.env`
- ✅ Includes SMS.ir API keys
- ✅ Includes Template IDs
- ✅ Makes them available to your application

---

## 📋 What You Need to Do

### On Your Server

1. **Add API keys to `.env.production`:**
   ```bash
   # Edit .env.production on your server
   nano .env.production
   ```

2. **Add these lines:**
   ```env
   SMSIR_API_KEY=qr6OhgdzDXrmHeEhS3MrJ6PbDF4fxehV86y8QvhEzrQKRyFw
   SMSIR_VERIFY_TEMPLATE_ID=408915
   ```

3. **Run the update script:**
   ```bash
   bash update.sh
   ```

4. **That's it!** The script will:
   - ✅ Copy `.env.production` to `.env`
   - ✅ Validate API keys
   - ✅ Update PM2 configuration
   - ✅ Restart PM2 with API keys loaded
   - ✅ Verify API keys are loaded in PM2

---

## ✅ Automatic Verification

The script automatically verifies that API keys are loaded:

### During Validation:
```
✅ SMSIR_API_KEY validated (length: 48 chars)
✅ SMSIR_VERIFY_TEMPLATE_ID validated: 408915
✅ SMS.ir configuration validated successfully
```

### After PM2 Restart:
```
✅ SMSIR_API_KEY is loaded in PM2 (length: 48 chars)
✅ SMSIR_VERIFY_TEMPLATE_ID is loaded in PM2: 408915
```

---

## 🔍 What Happens Automatically

1. **Environment File Refresh:**
   - Script copies `.env.production` → `.env`
   - All API keys are automatically included

2. **PM2 Configuration:**
   - Script updates `ecosystem.config.js`
   - PM2 automatically loads from `.env`
   - All API keys are available to the app

3. **Application Restart:**
   - PM2 restarts with new environment variables
   - SMS.ir API keys are automatically available
   - No manual configuration needed

---

## 📝 Example .env.production

```env
# SMS.ir Configuration (automatically loaded by update.sh)
SMSIR_API_KEY=qr6OhgdzDXrmHeEhS3MrJ6PbDF4fxehV86y8QvhEzrQKRyFw
SMSIR_VERIFY_TEMPLATE_ID=408915

# Optional
SMSIR_SECRET_KEY=
SMSIR_LINE_NUMBER=
SMSIR_PASSWORD_RESET_TEMPLATE_ID=
```

---

## 🚀 Deployment Steps

1. **Push to GitHub** ✅ (Already done)
2. **On Server:**
   ```bash
   # Pull latest changes
   git pull origin master
   
   # Ensure .env.production has API keys
   # (Add them if not already present)
   
   # Run update script
   bash update.sh
   ```

3. **The script will automatically:**
   - ✅ Load API keys from `.env.production`
   - ✅ Validate configuration
   - ✅ Update PM2
   - ✅ Restart application
   - ✅ Verify API keys are loaded

---

## ✅ Verification Checklist

After running `update.sh`, verify:

- [x] Script shows: `✅ SMSIR_API_KEY validated`
- [x] Script shows: `✅ SMSIR_VERIFY_TEMPLATE_ID validated: 408915`
- [x] Script shows: `✅ SMSIR_API_KEY is loaded in PM2`
- [x] Script shows: `✅ SMSIR_VERIFY_TEMPLATE_ID is loaded in PM2: 408915`
- [x] Application restarts successfully
- [x] SMS verification works

---

## 🎯 Summary

**The `update.sh` script automatically:**
- ✅ Copies API keys from `.env.production` to `.env`
- ✅ Validates API keys are present and correct
- ✅ Updates PM2 configuration to load API keys
- ✅ Restarts PM2 with API keys loaded
- ✅ Verifies API keys are loaded in PM2

**You only need to:**
1. Add API keys to `.env.production` on server
2. Run `bash update.sh`
3. Everything else is automatic! 🎉

---

**Status:** ✅ **AUTOMATIC**  
**Manual Steps Required:** Only adding API keys to `.env.production`  
**Everything Else:** Fully automated by `update.sh`

