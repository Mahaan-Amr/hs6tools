# 🚀 Security Update Deployment Guide

## ✅ Status: Ready to Deploy

All security fixes have been committed and pushed to GitHub. Running `update.sh` on your server will apply **ALL** security changes automatically.

---

## 📋 What `update.sh` Will Do

The `update.sh` script will automatically:

### 1. **Pull Latest Code** ✅
- Pulls updated `package.json` with patched React 19.2.1 and Next.js 15.5.7
- Pulls all security hardening code changes

### 2. **Install Updated Dependencies** ✅
- Runs `npm install` which will install:
  - ✅ React 19.2.1 (patched - fixes CVE-2025-55182)
  - ✅ React-DOM 19.2.1 (patched)
  - ✅ Next.js 15.5.7 (patched)
  - ✅ All other updated dependencies

### 3. **Apply Security Code Changes** ✅
- All security headers (CSP, HSTS, etc.) from `next.config.ts`
- Rate limiting on all protected endpoints
- CSRF protection on sensitive routes
- Centralized authz checks
- Redirect allowlist protection
- Image domain restrictions

### 4. **Rebuild Application** ✅
- Builds Next.js app with all security fixes
- Verifies build integrity

### 5. **Restart Server** ✅
- Restarts PM2 with updated code
- Loads new environment variables

---

## 🔒 Security Changes That Will Be Applied

### Critical Fixes:
- ✅ **CVE-2025-55182 (React2Shell RCE)** - FIXED
  - React: 19.1.0 → 19.2.1
  - Next.js: 15.4.6 → 15.5.7

### Security Hardening:
- ✅ Enhanced security headers (HSTS, CSP, Permissions-Policy, COOP/CORP)
- ✅ Image domain restrictions (SSRF protection)
- ✅ Redirect allowlist (open redirect prevention)
- ✅ Rate limiting on all sensitive endpoints
- ✅ CSRF protection with origin checks
- ✅ Centralized authorization checks
- ✅ Environment variable security improvements

### Infrastructure:
- ✅ npm provenance enabled
- ✅ Dependabot configured
- ✅ GitHub Actions security workflow
- ✅ Comprehensive security documentation

---

## 🚀 Deployment Steps

### On Your Server:

```bash
# 1. Navigate to project directory
cd /path/to/hs6tools

# 2. Make sure update.sh is executable
chmod +x update.sh

# 3. Run the update script
./update.sh
```

### What Happens:

1. **Pre-flight Checks** - Verifies environment, git, Node.js
2. **Environment Setup** - Refreshes `.env` from `.env.production`
3. **Security Audit** - Checks for vulnerabilities
4. **Pull Changes** - Gets latest code from GitHub (including security fixes)
5. **Install Dependencies** - Installs patched React/Next.js versions
6. **Generate Prisma** - Updates database client
7. **Run Migrations** - Applies any database changes
8. **Build Application** - Compiles with all security fixes
9. **Restart PM2** - Starts server with new code
10. **Test Connectivity** - Verifies application is running

---

## ✅ Verification After Update

After `update.sh` completes, verify:

### 1. Check Installed Versions:
```bash
npm list react react-dom next
# Should show:
# react@19.2.1
# react-dom@19.2.1
# next@15.5.7
```

### 2. Check Application Status:
```bash
pm2 status
# Should show application as "online"
```

### 3. Test Application:
```bash
curl -I https://your-domain.com
# Should return security headers:
# - Strict-Transport-Security
# - Content-Security-Policy
# - X-Frame-Options: DENY
# - Permissions-Policy
```

### 4. Check Logs:
```bash
pm2 logs hs6tools --lines 50
# Should show no errors related to React/Next.js
```

---

## ⚠️ Important Notes

1. **The update script uses `npm install --no-audit`** - This is fine because we've already fixed the critical vulnerability. The script focuses on installing the correct versions.

2. **Build Time** - The build may take a few minutes as it compiles all the new security code.

3. **Downtime** - There will be a brief downtime (usually 10-30 seconds) while PM2 restarts.

4. **Environment Variables** - The script refreshes `.env` from `.env.production`. Make sure your production env file has all required variables.

5. **Database Migrations** - If there are any new migrations, they will run automatically.

---

## 🔍 Monitoring After Deployment

### Check for React2Shell Exploitation Attempts:

Monitor logs for suspicious patterns:
```bash
# Check for RSC exploitation attempts
grep -i "react-server-dom" /var/log/pm2/hs6tools-error.log
grep -i "_next/static.*rsc" /var/log/pm2/hs6tools-error.log

# Check for unusual errors
pm2 logs hs6tools --err --lines 100 | grep -i "error\|exception"
```

### Verify Security Headers:

```bash
# Test security headers
curl -I https://your-domain.com | grep -i "security\|csp\|hsts"
```

---

## 📝 Post-Deployment Checklist

- [ ] Verify React/Next.js versions are updated
- [ ] Check application is running (pm2 status)
- [ ] Test application functionality
- [ ] Verify security headers are present
- [ ] Check logs for any errors
- [ ] Monitor for suspicious activity
- [ ] Test rate limiting (try multiple requests)
- [ ] Verify CSRF protection (test from different origin)

---

## 🆘 If Something Goes Wrong

### Rollback Steps:

```bash
# 1. Stop PM2
pm2 stop hs6tools

# 2. Restore previous version
git checkout HEAD~1

# 3. Reinstall old dependencies
npm install

# 4. Rebuild
npm run build

# 5. Restart
pm2 restart hs6tools
```

### Get Help:

- Check PM2 logs: `pm2 logs hs6tools`
- Check build errors: Look for `.next` folder issues
- Check dependency issues: `npm list react react-dom next`
- Review update script output for specific errors

---

## 📊 Summary

**YES, running `update.sh` will apply ALL security changes:**

✅ Pulls updated code with security fixes  
✅ Installs patched React 19.2.1 and Next.js 15.5.7  
✅ Applies all security headers and configurations  
✅ Implements rate limiting and CSRF protection  
✅ Rebuilds application with all fixes  
✅ Restarts server with secure code  

**The script is designed to handle everything automatically!**

---

**Last Updated:** December 9, 2025  
**Status:** ✅ Ready for Deployment

