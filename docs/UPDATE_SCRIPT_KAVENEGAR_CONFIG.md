# 📱 Update Script - Kavenegar Configuration Guide

## Overview

The `update.sh` script includes comprehensive validation and handling for Kavenegar SMS service configuration. This ensures that your SMS functionality works correctly after every update.

---

## ✅ What the Script Does

### 1. Environment Variable Validation

The script validates that Kavenegar configuration is present and correct:

- ✅ Checks for `KAVENEGAR_API_KEY`, `NEXT_PUBLIC_KAVENEGAR_API_KEY`, or `KAVENEGAR_API_TOKEN`
- ✅ Validates API key format (length, hexadecimal format)
- ✅ Detects placeholder values (e.g., "your-api-key")
- ✅ Validates `KAVENEGAR_SENDER` format
- ✅ Sets default sender number (`2000660110`) if missing

### 2. Automatic Configuration

If `KAVENEGAR_SENDER` is missing or contains a placeholder:

- ✅ Automatically sets to `2000660110` (your purchased number)
- ✅ Updates both `.env` and `.env.production` files
- ✅ Logs the change for transparency

### 3. PM2 Environment Verification

After restarting the application, the script verifies:

- ✅ Kavenegar API key is loaded in PM2
- ✅ Sender number is loaded in PM2
- ✅ Warns if using insecure `NEXT_PUBLIC_KAVENEGAR_API_KEY`
- ✅ Warns if using old default sender (`10004346`)

---

## 🔧 Required Configuration

### In `.env.production` File

Add these variables to your `.env.production` file:

```env
# Kavenegar SMS Configuration
KAVENEGAR_API_KEY=566555476F46314A72326D365563685134615464536C785744572F775A4463484B6469334E6E6F6B4D2F453D
KAVENEGAR_SENDER=2000660110
```

**Important Notes:**
- ✅ Use `KAVENEGAR_API_KEY` (server-only) - **DO NOT** use `NEXT_PUBLIC_KAVENEGAR_API_KEY`
- ✅ `KAVENEGAR_SENDER` is optional - defaults to `2000660110` if not set
- ✅ The script will automatically set `KAVENEGAR_SENDER` if missing

---

## 📋 Validation Rules

### API Key Validation

The script checks:

1. **Presence**: API key must be present in `.env.production`
2. **Format**: Must be hexadecimal string (32+ characters)
3. **Length**: Must be at least 32 characters (typically 64+)
4. **Placeholder Detection**: Rejects values containing "your", "YOUR", "example", "EXAMPLE"

**Example Valid API Key:**
```
566555476F46314A72326D365563685134615464536C785744572F775A4463484B6469334E6E6F6B4D2F453D
```

**Example Invalid (Placeholder):**
```
your-api-key-here
```

### Sender Number Validation

The script checks:

1. **Format**: Must be 10 digits starting with `1` or `2`
2. **Examples**: `2000660110` (valid), `10004346` (valid), `09123456789` (invalid)

**If Missing:**
- Automatically sets to `2000660110` (your purchased number)
- Updates both `.env` and `.env.production`
- Logs the change

---

## 🚀 Usage

### Running the Update Script

```bash
cd /var/www/hs6tools
bash update.sh
```

### What Happens

1. **Environment Check**: Script validates `.env.production` exists
2. **Copy to .env**: Copies `.env.production` → `.env`
3. **Validate Variables**: Checks all required variables including Kavenegar
4. **Validate Kavenegar Config**: 
   - Validates API key format
   - Validates/updates sender number
5. **Build & Deploy**: Builds application and restarts PM2
6. **Verify PM2**: Confirms Kavenegar variables are loaded in PM2

---

## 📊 Script Output Examples

### ✅ Success - Valid Configuration

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 Validating Kavenegar Configuration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2025-12-09 10:30:00] ✅ KAVENEGAR_API_KEY validated (length: 64 chars)
[2025-12-09 10:30:00] ✅ KAVENEGAR_SENDER validated: 2000660110
[2025-12-09 10:30:00] ℹ️  Kavenegar Configuration Summary:
[2025-12-09 10:30:00] ℹ️    API Key: 566555476F46314A... (64 chars)
[2025-12-09 10:30:00] ℹ️    Sender: 2000660110
```

### ⚠️ Warning - Missing Sender (Auto-Fixed)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 Validating Kavenegar Configuration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2025-12-09 10:30:00] ⚠️  KAVENEGAR_SENDER is not set or is a placeholder. Setting default to 2000660110 (purchased number)...
[2025-12-09 10:30:00] ✅ KAVENEGAR_SENDER set to default: 2000660110
[2025-12-09 10:30:00] ℹ️  Updated .env.production with KAVENEGAR_SENDER=2000660110
```

### ❌ Error - Invalid API Key

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 Validating Kavenegar Configuration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2025-12-09 10:30:00] ❌ ERROR: KAVENEGAR_API_KEY appears to be a placeholder value. Please set your actual API key in .env.production
```

### ✅ PM2 Verification

```
[2025-12-09 10:35:00] ℹ️  Verifying critical environment variables in PM2...
[2025-12-09 10:35:00] ✅ KAVENEGAR_API_KEY is loaded in PM2
[2025-12-09 10:35:00] ✅ KAVENEGAR_SENDER is loaded in PM2: 2000660110
```

---

## 🔍 Troubleshooting

### Issue: "KAVENEGAR_API_KEY appears to be a placeholder value"

**Solution:**
1. Open `.env.production` file
2. Replace placeholder with your actual API key:
   ```env
   KAVENEGAR_API_KEY=566555476F46314A72326D365563685134615464536C785744572F775A4463484B6469334E6E6F6B4D2F453D
   ```
3. Re-run `update.sh`

### Issue: "KAVENEGAR_SENDER not found in PM2 environment"

**Solution:**
- The script automatically sets this if missing
- Check `.env.production` has `KAVENEGAR_SENDER=2000660110`
- Re-run `update.sh` to sync to PM2

### Issue: "Using NEXT_PUBLIC_KAVENEGAR_API_KEY (not recommended)"

**Solution:**
1. Remove `NEXT_PUBLIC_KAVENEGAR_API_KEY` from `.env.production`
2. Add `KAVENEGAR_API_KEY` instead (server-only)
3. Re-run `update.sh`

### Issue: "Using public sender number (10004346)"

**Solution:**
1. Update `.env.production`:
   ```env
   KAVENEGAR_SENDER=2000660110
   ```
2. Re-run `update.sh`

---

## 📝 Best Practices

### 1. Always Use `.env.production`

- ✅ Store all production configuration in `.env.production`
- ✅ Never commit `.env.production` to version control
- ✅ The script automatically copies `.env.production` → `.env`

### 2. Use Server-Only API Key

- ✅ Use `KAVENEGAR_API_KEY` (server-only)
- ❌ Avoid `NEXT_PUBLIC_KAVENEGAR_API_KEY` (exposes key to client)

### 3. Set Sender Number Explicitly

- ✅ Always set `KAVENEGAR_SENDER=2000660110` in `.env.production`
- ✅ Script will auto-set if missing, but explicit is better

### 4. Verify After Update

After running `update.sh`, verify:

```bash
# Check PM2 environment
pm2 env hs6tools | grep KAVENEGAR

# Check application logs
pm2 logs hs6tools | grep -i kavenegar

# Test SMS functionality
# Try registering a new user or sending a test SMS
```

---

## 🔄 Update Script Flow

```
1. Check .env.production exists
   ↓
2. Copy .env.production → .env
   ↓
3. Validate required environment variables
   ↓
4. Validate Kavenegar configuration:
   - API key format & length
   - Sender number format
   - Set defaults if missing
   ↓
5. Install dependencies
   ↓
6. Build application
   ↓
7. Restart PM2 with new config
   ↓
8. Verify Kavenegar variables in PM2
   ↓
9. Done! ✅
```

---

## 📚 Related Documentation

- **[Kavenegar Production Setup](./KAVENEGAR_PRODUCTION_SETUP.md)** - Complete implementation guide
- **[Update Script Guide](./UPDATE_SCRIPT_COMPREHENSIVE_GUIDE.md)** - Full update script documentation
- **[Environment Requirements](./ENVIRONMENT_REQUIREMENTS.md)** - Environment variable reference

---

**Last Updated:** December 9, 2025  
**Status:** ✅ Integrated with Update Script  
**Default Sender:** `2000660110` (Purchased Number)

