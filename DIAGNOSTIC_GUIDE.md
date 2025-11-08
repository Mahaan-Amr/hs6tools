# 🔍 Deep Diagnostic Guide for HS6Tools Server Issues

This guide helps you systematically diagnose and fix server issues without making assumptions.

## 📋 Step-by-Step Diagnostic Process

### Step 1: Run the Deep Diagnostic Script

```bash
ssh root@87.107.73.10
cd /var/www/hs6tools
git pull origin master
chmod +x deep-diagnose.sh
./deep-diagnose.sh
```

This script collects **all** relevant information and saves it to a file.

### Step 2: Review the Diagnostic Report

The script saves output to: `/tmp/hs6tools-diagnostic-YYYYMMDD-HHMMSS.txt`

**Key sections to analyze:**

#### ✅ Section 4: PM2 Status
- **What to check:**
  - Is `hs6tools` showing as `online`?
  - What's the restart count? (should be 0 or very low)
  - What's the memory usage? (should be reasonable, not maxed out)
  
- **If issues found:**
  - High restart count → Application is crashing
  - Status `stopped` → Application not running
  - High memory → Memory leak or insufficient resources

#### ✅ Section 7: Next.js Application Test
- **What to check:**
  - HTTP Status Code from `localhost:3000` (should be 200, 301, 302, or 307)
  - Response headers (should show Next.js headers)
  - Response body (should show HTML, not error)
  
- **If issues found:**
  - Connection refused → Next.js not running
  - 500 error → Application error (check PM2 logs)
  - Timeout → Application hanging

#### ✅ Section 8: Nginx Configuration
- **What to check:**
  - Is Nginx running? (`systemctl status nginx`)
  - Does `nginx -t` pass? (configuration valid)
  - Is `proxy_pass` pointing to `http://127.0.0.1:3000` or `http://localhost:3000`?
  - Are proxy headers set correctly?
  
- **If issues found:**
  - Config test fails → Syntax error in Nginx config
  - Wrong proxy_pass → Requests not reaching Next.js
  - Missing headers → Next.js might not work correctly

#### ✅ Section 9: Nginx Logs
- **What to check:**
  - Error logs: Look for `502 Bad Gateway`, `504 Gateway Timeout`, `Connection refused`
  - Access logs: Are requests reaching Nginx?
  
- **Common errors:**
  - `502 Bad Gateway` → Nginx can't reach Next.js (Next.js not running or wrong port)
  - `504 Gateway Timeout` → Next.js is too slow to respond
  - `Connection refused` → Next.js not listening on port 3000

#### ✅ Section 14: External Connectivity Test
- **What to check:**
  - Can the server reach itself via external IP?
  - What HTTP code is returned?
  - Are headers correct?
  
- **If issues found:**
  - Connection refused → Firewall blocking or service not listening
  - Wrong HTTP code → Nginx or Next.js misconfiguration
  - Timeout → Network or firewall issue

### Step 3: Identify the Root Cause

Based on the diagnostic report, identify which component is failing:

#### 🔴 **Issue Type 1: Next.js Not Running**
**Symptoms:**
- PM2 shows `stopped` or high restart count
- `curl http://localhost:3000` fails
- Nginx logs show `502 Bad Gateway`

**Diagnosis:**
```bash
# Check PM2
pm2 status
pm2 logs hs6tools --lines 50

# Check if port 3000 is in use
lsof -i:3000
```

**Fix:**
- Check PM2 error logs for crash reason
- Verify environment variables
- Check database connection
- Rebuild application if needed

#### 🔴 **Issue Type 2: Nginx Not Proxying**
**Symptoms:**
- Next.js works on `localhost:3000`
- External access fails
- Nginx logs show errors

**Diagnosis:**
```bash
# Test Nginx config
nginx -t

# Check Nginx is running
systemctl status nginx

# Test proxy
curl -H "Host: hs6tools.com" http://localhost
```

**Fix:**
- Update Nginx configuration
- Ensure `proxy_pass` is correct
- Check proxy headers
- Reload Nginx

#### 🔴 **Issue Type 3: Firewall Blocking**
**Symptoms:**
- Everything works internally
- External access fails
- `curl http://87.107.73.10` times out

**Diagnosis:**
```bash
# Check firewall
ufw status
iptables -L -n

# Check if port 80 is listening
netstat -tuln | grep :80
```

**Fix:**
- Allow port 80: `ufw allow 80/tcp`
- Allow port 443: `ufw allow 443/tcp`
- Check cloud provider firewall rules

#### 🔴 **Issue Type 4: DNS Issues**
**Symptoms:**
- IP access works: `http://87.107.73.10`
- Domain doesn't work: `http://hs6tools.com`

**Diagnosis:**
```bash
# Check DNS
nslookup hs6tools.com
dig hs6tools.com

# Test with IP directly
curl http://87.107.73.10
```

**Fix:**
- Update DNS records to point to `87.107.73.10`
- Wait for DNS propagation
- Use IP directly if DNS not configured

### Step 4: Share Diagnostic Information

When asking for help, provide:

1. **The diagnostic report file** (or key sections)
2. **Specific error messages** from logs
3. **What you've already tried**
4. **Current status** of each component:
   - PM2: `pm2 status`
   - Nginx: `systemctl status nginx`
   - Next.js: `curl http://localhost:3000`

## 🛠️ Quick Diagnostic Commands

### Check Application Status
```bash
# PM2
pm2 status
pm2 logs hs6tools --lines 20

# Next.js
curl -I http://localhost:3000

# Nginx
systemctl status nginx
nginx -t
tail -20 /var/log/nginx/error.log
```

### Test Connectivity
```bash
# Internal
curl http://localhost:3000

# External (from server)
curl http://87.107.73.10

# With domain
curl -H "Host: hs6tools.com" http://localhost
```

### Check Network
```bash
# Ports
netstat -tuln | grep -E ":(80|443|3000)"

# Firewall
ufw status
iptables -L -n | grep -E "80|443"

# DNS
nslookup hs6tools.com
```

## 📊 Diagnostic Checklist

Before reporting an issue, verify:

- [ ] PM2 shows application as `online` with 0 restarts
- [ ] `curl http://localhost:3000` returns 200/301/302/307
- [ ] Nginx is running: `systemctl status nginx`
- [ ] Nginx config is valid: `nginx -t`
- [ ] Port 80 is listening: `netstat -tuln | grep :80`
- [ ] Firewall allows port 80: `ufw status | grep 80`
- [ ] DNS resolves correctly: `nslookup hs6tools.com`
- [ ] No errors in Nginx logs: `tail -20 /var/log/nginx/error.log`
- [ ] No errors in PM2 logs: `pm2 logs hs6tools --err --lines 20`

## 🎯 Common Issues and Solutions

### Issue: "502 Bad Gateway"
**Cause:** Nginx can't reach Next.js
**Fix:**
1. Check PM2: `pm2 status`
2. Restart if needed: `pm2 restart hs6tools`
3. Verify Next.js: `curl http://localhost:3000`

### Issue: "Connection Refused"
**Cause:** Service not listening or firewall blocking
**Fix:**
1. Check if service is running
2. Check firewall: `ufw status`
3. Check if port is listening: `netstat -tuln`

### Issue: "504 Gateway Timeout"
**Cause:** Next.js taking too long to respond
**Fix:**
1. Check PM2 logs for errors
2. Check database connection
3. Increase Nginx timeout in config

### Issue: "Application Keeps Restarting"
**Cause:** Application crashing on startup
**Fix:**
1. Check PM2 error logs: `pm2 logs hs6tools --err --lines 100`
2. Check environment variables
3. Check database connection
4. Rebuild application

## 📝 Reporting Issues

When reporting, include:

1. **Diagnostic report** (run `./deep-diagnose.sh`)
2. **Error messages** (exact text, not paraphrased)
3. **What works:**
   - Does `curl http://localhost:3000` work?
   - Does `pm2 status` show online?
4. **What doesn't work:**
   - What error do you see in browser?
   - What's in Nginx error logs?
5. **What you've tried:**
   - List all commands you ran
   - What was the result?

This systematic approach helps identify the exact issue without guessing!

