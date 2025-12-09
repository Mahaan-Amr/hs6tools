# HS6Tools Update Script - Comprehensive Guide

## 📋 Overview

The `update.sh` script is a fully automated deployment and update tool designed specifically for the HS6Tools e-commerce platform. It handles the complete update lifecycle with automatic error detection, recovery, and rollback capabilities.

## 🎯 Purpose

This script automates:
- Code updates from GitHub
- Dependency management with conflict resolution
- Database migrations
- Application building
- PM2 process management
- Environment variable synchronization
- Security audits
- Automatic error recovery

## 🔧 System Requirements

### Required Software
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **Git**: Any recent version
- **PostgreSQL**: v15 or higher
- **PM2**: v5.0.0 or higher (optional but recommended)

### Required Files
- `.env.production` - Production environment configuration
- `package.json` - Node.js dependencies
- `prisma/schema.prisma` - Database schema
- `ecosystem.config.js` - PM2 configuration (auto-generated)

### Required Environment Variables

The script validates these critical environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/hs6tools_prod"

# Authentication
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key"

# SMS Service (at least one required)
KAVENEGAR_API_KEY="your-api-key"
# OR
NEXT_PUBLIC_KAVENEGAR_API_KEY="your-api-key"
# OR
KAVENEGAR_API_TOKEN="your-token"

KAVENEGAR_SENDER="your-sender-number"

# Payment Gateway
ZARINPAL_MERCHANT_ID="your-merchant-id"
ZARINPAL_SANDBOX="false"

# Application
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## 🚀 Usage

### Basic Usage

```bash
cd /var/www/hs6tools
bash update.sh
```

### First-Time Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/hs6tools.git
cd hs6tools

# 2. Create .env.production file
nano .env.production
# Add all required environment variables

# 3. Make script executable
chmod +x update.sh

# 4. Run the update script
bash update.sh
```

### Regular Updates

```bash
cd /var/www/hs6tools
bash update.sh
```

The script will:
1. ✅ Pull latest code from GitHub
2. ✅ Update dependencies
3. ✅ Run database migrations
4. ✅ Build the application
5. ✅ Restart PM2
6. ✅ Verify everything is working

## 📊 Update Process Flow

```
┌─────────────────────────────────────────┐
│  1. Pre-flight Checks                   │
│     - Directory validation              │
│     - Git repository check              │
│     - Node.js/npm versions              │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  2. Environment Setup                   │
│     - Validate .env.production          │
│     - Refresh .env from .env.production │
│     - Check required variables          │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  3. Security Audit                      │
│     - npm vulnerability scan            │
│     - File permission checks            │
│     - Malicious code detection          │
│     - Backup creation                   │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  4. Code Update                         │
│     - Stash local changes               │
│     - Pull from GitHub                  │
│     - Show recent commits               │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  5. Dependency Management               │
│     - Integrity check                   │
│     - npm install                       │
│     - Peer dependency resolution        │
│     - Auto-recovery on failure          │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  6. Prisma Client Generation            │
│     - Generate Prisma client            │
│     - Auto-recovery on corruption       │
│     - Multiple retry strategies         │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  7. Database Migrations                 │
│     - Test database connection          │
│     - Run Prisma migrations             │
│     - Verify migration success          │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  8. Application Build                   │
│     - Clean previous build              │
│     - Build Next.js application         │
│     - Verify build output               │
│     - Fix permissions                   │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  9. PM2 Restart                         │
│     - Update PM2 config                 │
│     - Delete old process                │
│     - Start with new config             │
│     - Verify environment variables      │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  10. Verification                       │
│     - Test HTTP endpoints               │
│     - Check static file serving         │
│     - Verify Nginx status               │
│     - Show application logs             │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  11. Summary & Completion               │
│     - Print success message             │
│     - Show next steps                   │
│     - Display backup locations          │
└─────────────────────────────────────────┘
```

## 🛡️ Automatic Recovery Features

### 1. Dependency Conflicts

**Problem**: npm peer dependency conflicts (e.g., nodemailer v6 vs v7)

**Solution**:
```bash
# Automatic retry sequence:
1. Try: npm install
2. If ERESOLVE error → npm install --legacy-peer-deps
3. If still failing → npm install --force
4. If all fail → Clean reinstall
```

### 2. Corrupted Packages

**Problem**: Malicious or corrupted code in node_modules

**Detection**:
- Scans for suspicious patterns
- Checks for `window.__REMOTE_LOADER__`
- Validates critical packages

**Solution**:
```bash
# Automatic clean reinstall:
1. Remove node_modules
2. Remove package-lock.json
3. Clear npm cache
4. Fresh install from registry
```

### 3. Prisma Generation Failures

**Problem**: Prisma client generation fails

**Recovery Strategies**:
```bash
# Try in sequence:
1. npx prisma generate
2. If corrupted → Clean reinstall + retry
3. If still failing → Reinstall Prisma packages
4. Final attempt → npx prisma generate
```

### 4. Build Failures

**Problem**: Next.js build fails

**Recovery**:
```bash
# Automatic diagnosis and fix:
1. Check for "Module not found" errors
2. If found → Clean reinstall dependencies
3. Regenerate Prisma client
4. Retry build
```

## 🔍 Security Features

### 1. Malicious Code Detection

Scans `node_modules` for:
- Remote code execution attempts
- Suspicious GitHub raw content loading
- `window.__REMOTE_LOADER__` patterns

### 2. File Permission Checks

- Validates `.env` permissions (should be 600 or 400)
- Auto-fixes insecure permissions
- Protects sensitive configuration

### 3. npm Vulnerability Audit

- Runs `npm audit` for critical vulnerabilities
- Reports security issues
- Suggests fixes

### 4. Backup Creation

- Backs up `.env` before updates
- Stashes local git changes
- Preserves untracked files

## 📝 Environment Management

### .env File Handling

The script ensures consistency:

```bash
# Every update:
1. Backup existing .env → .env.backup-TIMESTAMP
2. Copy .env.production → .env
3. Validate all required variables
4. Update PM2 config to load from .env
```

### PM2 Environment Loading

The script generates `ecosystem.config.js` that:
- Loads variables from `.env` file
- Falls back to system environment
- Merges both sources
- Ensures all variables are available

## 🔧 PM2 Configuration

### Auto-Generated Config

```javascript
module.exports = {
  apps: [{
    name: 'hs6tools',
    script: 'npm',
    args: 'start',
    instances: 1,
    exec_mode: 'fork',
    env: /* loaded from .env */,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};
```

### Why Fork Mode?

- Next.js handles clustering internally
- Avoids port conflicts
- Better stability
- Easier debugging

## 🧪 Testing & Verification

### Automatic Tests

The script tests:

1. **Root Endpoint**: `http://localhost:3000`
   - Expected: 307/301/302 (redirect) or 200

2. **Localized Endpoint**: `http://localhost:3000/fa`
   - Expected: 200

3. **Static Files**: `/_next/static/chunks/*.js`
   - Expected: 200

4. **PM2 Status**: Application should be "online"

5. **Environment Variables**: Critical vars should be loaded

### Manual Verification

After update, check:

```bash
# 1. PM2 status
pm2 status

# 2. Application logs
pm2 logs hs6tools --lines 50

# 3. Environment variables
pm2 env hs6tools | grep -E "KAVENEGAR|ZARINPAL"

# 4. Test in browser
curl -I http://localhost:3000/fa
```

## 🚨 Troubleshooting

### Issue: Script fails at dependency installation

**Error**: `ERESOLVE unable to resolve dependency tree`

**Solution**: The script auto-handles this. If it still fails:
```bash
# Manual fix:
npm install --legacy-peer-deps
```

---

### Issue: Prisma generation fails with "window is not defined"

**Error**: `ReferenceError: window is not defined`

**Solution**: The script auto-detects and fixes this. If it persists:
```bash
# Manual fix:
rm -rf node_modules package-lock.json .next
npm cache clean --force
npm install --legacy-peer-deps
npx prisma generate
```

---

### Issue: Build succeeds but application won't start

**Symptoms**: PM2 shows "errored" or constant restarts

**Check**:
```bash
# View detailed logs
pm2 logs hs6tools --lines 100

# Check for common issues:
# 1. Database connection
# 2. Missing environment variables
# 3. Port already in use
```

**Solution**:
```bash
# Verify DATABASE_URL
grep DATABASE_URL .env

# Verify port 3000 is free
lsof -i :3000

# Restart with fresh config
pm2 delete hs6tools
bash update.sh
```

---

### Issue: Environment variables not loaded in PM2

**Symptoms**: Application errors about missing env vars

**Solution**:
```bash
# The script should handle this, but if needed:
pm2 delete hs6tools
pm2 start ecosystem.config.js --env production
pm2 save

# Verify:
pm2 env hs6tools | grep KAVENEGAR_API_KEY
```

---

### Issue: Nginx shows 502 Bad Gateway

**Check**:
```bash
# Is the app running?
pm2 status

# Is it listening on port 3000?
curl http://localhost:3000

# Check Nginx config
nginx -t

# Check Nginx logs
tail -f /var/log/nginx/error.log
```

**Solution**:
```bash
# Restart application
pm2 restart hs6tools

# Reload Nginx
systemctl reload nginx
```

---

### Issue: Database migration fails

**Error**: `Can't reach database server`

**Check**:
```bash
# Is PostgreSQL running?
systemctl status postgresql

# Can you connect?
psql -U hs6tools -d hs6tools_prod -h localhost
```

**Solution**:
```bash
# Start PostgreSQL
systemctl start postgresql

# Verify DATABASE_URL in .env
grep DATABASE_URL .env

# Run migrations manually
npx prisma migrate deploy
```

## 📊 Logs & Monitoring

### PM2 Logs

```bash
# Real-time logs
pm2 logs hs6tools

# Last 100 lines
pm2 logs hs6tools --lines 100

# Error logs only
pm2 logs hs6tools --err

# Save logs to file
pm2 logs hs6tools --lines 1000 > app.log
```

### Log Locations

- **PM2 Error Log**: `/var/log/pm2/hs6tools-error.log`
- **PM2 Out Log**: `/var/log/pm2/hs6tools-out.log`
- **PM2 Combined**: `/var/log/pm2/hs6tools-combined.log`
- **Nginx Access**: `/var/log/nginx/access.log`
- **Nginx Error**: `/var/log/nginx/error.log`

### Monitoring

```bash
# PM2 monitoring dashboard
pm2 monit

# Resource usage
pm2 status

# Detailed process info
pm2 describe hs6tools
```

## 🔄 Rollback Procedure

If an update fails or causes issues:

### 1. Git Rollback

```bash
cd /var/www/hs6tools

# View recent commits
git log --oneline -10

# Rollback to previous commit
git reset --hard <commit-hash>

# Restore stashed changes if needed
git stash list
git stash pop
```

### 2. Restore Environment

```bash
# Find backup
ls -lt .env.backup-*

# Restore
cp .env.backup-20251209-150000 .env
```

### 3. Rebuild & Restart

```bash
# Reinstall dependencies
npm install --legacy-peer-deps

# Regenerate Prisma
npx prisma generate

# Rebuild
npm run build

# Restart
pm2 restart hs6tools
```

## 🎯 Best Practices

### 1. Always Use .env.production

- Never edit `.env` directly on the server
- Always update `.env.production` first
- Let the script sync `.env` from `.env.production`

### 2. Test Before Deploying

```bash
# On development:
npm install
npm run build
npm start

# If successful, commit and push
git add .
git commit -m "Your changes"
git push origin master
```

### 3. Monitor After Updates

```bash
# Watch logs for 5 minutes after update
pm2 logs hs6tools

# Check for errors
pm2 logs hs6tools --err --lines 50

# Monitor resource usage
pm2 monit
```

### 4. Keep Backups

The script auto-creates backups:
- `.env.backup-TIMESTAMP` - Environment backups
- Git stash - Code changes

Keep at least 3 recent backups.

### 5. Regular Maintenance

```bash
# Weekly: Check for updates
cd /var/www/hs6tools
git fetch origin
git log HEAD..origin/master --oneline

# Monthly: Clean old logs
pm2 flush

# Monthly: Check disk space
df -h
```

## 📚 Related Documentation

- [ZarinPal Integration](./ZARINPAL_INTEGRATION.md)
- [Kavenegar SMS](./KAVENEGAR_COMPREHENSIVE_AUDIT.md)
- [Registration Flow](./REGISTRATION_FLOW_FIX.md)
- [Currency Fix](./ZARINPAL_CURRENCY_FIX.md)
- [Payment Flow](./PAYMENT_FLOW_ANALYSIS.md)

## 🆘 Getting Help

If you encounter issues not covered here:

1. **Check PM2 logs**: `pm2 logs hs6tools --lines 100`
2. **Check script output**: Review the colored output for warnings
3. **Verify environment**: `pm2 env hs6tools`
4. **Test manually**: Follow the manual verification steps
5. **Rollback if needed**: Use the rollback procedure

## 📝 Change Log

### Version 2.0 (Current)
- ✅ Automatic peer dependency resolution
- ✅ Malicious code detection
- ✅ Multiple recovery strategies
- ✅ Comprehensive error handling
- ✅ Environment variable validation
- ✅ PM2 config auto-generation
- ✅ Build verification
- ✅ Connectivity testing

### Version 1.0
- Basic update functionality
- Manual intervention required for errors

---

**Last Updated**: December 9, 2025
**Script Version**: 2.0
**Compatibility**: HS6Tools v0.1.0+

