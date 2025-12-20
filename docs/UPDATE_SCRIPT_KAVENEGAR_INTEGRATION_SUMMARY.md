# 📱 Update Script - Kavenegar Integration Summary

## ✅ What Was Implemented

The `update.sh` script has been enhanced with comprehensive Kavenegar SMS service configuration validation and handling.

---

## 🎯 Key Features

### 1. **Automatic Kavenegar Configuration Validation**

The script now includes a dedicated `validate_kavenegar_config()` function that:

- ✅ **Validates API Key Format**
  - Checks for placeholder values ("your-api-key", "example", etc.)
  - Validates length (minimum 32 characters, typically 64+)
  - Validates hexadecimal format
  - Supports multiple variable names: `KAVENEGAR_API_KEY`, `NEXT_PUBLIC_KAVENEGAR_API_KEY`, `KAVENEGAR_API_TOKEN`

- ✅ **Validates Sender Number**
  - Checks format (10 digits starting with 1 or 2)
  - Automatically sets default to `2000660110` if missing or placeholder
  - Updates both `.env` and `.env.production` files
  - Warns if using old default (`10004346`)

- ✅ **Security Warnings**
  - Warns if using `NEXT_PUBLIC_KAVENEGAR_API_KEY` (exposes key to client)
  - Recommends using server-only `KAVENEGAR_API_KEY`

### 2. **Enhanced PM2 Verification**

After restarting the application, the script now:

- ✅ Verifies Kavenegar API key is loaded in PM2 (checks all variable names)
- ✅ Verifies sender number is loaded in PM2
- ✅ Shows actual values loaded
- ✅ Provides helpful warnings and recommendations

### 3. **Automatic Configuration Fixes**

If `KAVENEGAR_SENDER` is missing or contains a placeholder:

- ✅ Automatically sets to `2000660110` (your purchased number)
- ✅ Updates `.env` file
- ✅ Updates `.env.production` file for future runs
- ✅ Logs all changes transparently

---

## 📋 Configuration Requirements

### Required in `.env.production`:

```env
# Kavenegar SMS Configuration
KAVENEGAR_API_KEY=566555476F46314A72326D365563685134615464536C785744572F775A4463484B6469334E6E6F6B4D2F453D
KAVENEGAR_SENDER=2000660110
```

**Note:** `KAVENEGAR_SENDER` is optional - script will auto-set to `2000660110` if missing.

---

## 🔄 Script Execution Flow

```
1. Check .env.production exists
   ↓
2. Copy .env.production → .env
   ↓
3. Validate required environment variables
   ↓
4. Validate Kavenegar Configuration:
   ├─ Check API key format & length
   ├─ Detect placeholder values
   ├─ Validate sender number format
   └─ Set defaults if missing
   ↓
5. Install dependencies
   ↓
6. Build application
   ↓
7. Restart PM2 with new config
   ↓
8. Verify Kavenegar variables in PM2:
   ├─ Check API key loaded
   ├─ Check sender number loaded
   └─ Show values & warnings
   ↓
9. Done! ✅
```

---

## 📊 Example Output

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

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 Restarting Application with PM2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2025-12-09 10:35:00] ✅ KAVENEGAR_API_KEY is loaded in PM2
[2025-12-09 10:35:00] ✅ KAVENEGAR_SENDER is loaded in PM2: 2000660110
```

### ⚠️ Auto-Fix - Missing Sender

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

---

## 🔍 Validation Rules

### API Key Validation

- ✅ **Presence**: Must exist in `.env.production`
- ✅ **Format**: Hexadecimal string (0-9, A-F, a-f)
- ✅ **Length**: Minimum 32 characters (typically 64+)
- ✅ **Placeholder Detection**: Rejects "your", "YOUR", "example", "EXAMPLE"

### Sender Number Validation

- ✅ **Format**: 10 digits starting with `1` or `2`
- ✅ **Examples**: `2000660110` ✅, `10004346` ✅, `09123456789` ❌
- ✅ **Auto-Fix**: Sets to `2000660110` if missing or placeholder

---

## 🚀 Usage

Simply run the update script as usual:

```bash
cd /var/www/hs6tools
bash update.sh
```

The script will automatically:
1. Validate your Kavenegar configuration
2. Fix missing sender numbers
3. Verify PM2 environment variables
4. Provide clear feedback on any issues

---

## 📚 Documentation

- **[Update Script - Kavenegar Config Guide](./UPDATE_SCRIPT_KAVENEGAR_CONFIG.md)** - Complete guide
- **[Kavenegar Production Setup](./KAVENEGAR_PRODUCTION_SETUP.md)** - Production implementation
- **[Update Script Comprehensive Guide](./UPDATE_SCRIPT_COMPREHENSIVE_GUIDE.md)** - Full script documentation

---

## ✅ Benefits

1. **Automatic Validation**: Catches configuration errors before deployment
2. **Auto-Fix**: Sets correct defaults automatically
3. **Security**: Warns about insecure configurations
4. **Transparency**: Clear logging of all actions
5. **Consistency**: Ensures same configuration across `.env` and `.env.production`

---

**Last Updated:** December 9, 2025  
**Status:** ✅ Fully Integrated  
**Default Sender:** `2000660110` (Purchased Number)

