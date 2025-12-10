# 🔍 Server Troubleshooting Guide

## Quick Diagnostic Commands

### 1. Check PM2 Status
```bash
# Check if application is running
pm2 status

# Detailed status
pm2 describe hs6tools

# Check if PM2 process exists
pm2 list
```

### 2. Check Application Logs

#### PM2 Logs (Most Important):
```bash
# View all logs (last 100 lines)
pm2 logs hs6tools --lines 100

# View only errors
pm2 logs hs6tools --err --lines 100

# View only output
pm2 logs hs6tools --out --lines 100

# Follow logs in real-time
pm2 logs hs6tools --lines 0

# Check specific log files
tail -f /var/log/pm2/hs6tools-error.log
tail -f /var/log/pm2/hs6tools-out.log
tail -f /var/log/pm2/hs6tools-combined.log
```

#### Next.js Build Logs:
```bash
# Check if build completed
ls -la .next/

# Check build ID
cat .next/BUILD_ID

# Check for build errors
grep -i "error\|failed\|exception" .next/trace 2>/dev/null || echo "No trace file"
```

### 3. Check System Logs

```bash
# Check systemd logs (if using systemd)
journalctl -u hs6tools -n 100 --no-pager

# Check system logs
tail -f /var/log/syslog | grep hs6tools

# Check for OOM (Out of Memory) kills
dmesg | grep -i "killed process"
```

### 4. Check Application Health

```bash
# Test if port 3000 is listening
netstat -tulpn | grep 3000
# OR
ss -tulpn | grep 3000

# Test localhost connection
curl -I http://localhost:3000

# Test with timeout
curl -I --max-time 5 http://localhost:3000

# Check if process is running
ps aux | grep node
ps aux | grep next
```

### 5. Check Resource Usage

```bash
# Check memory usage
free -h

# Check disk space
df -h

# Check CPU usage
top -bn1 | head -20

# Check PM2 memory usage
pm2 monit
```

### 6. Check Environment Variables

```bash
# Check if .env file exists
ls -la .env

# Check if critical env vars are set
grep -E "DATABASE_URL|NEXTAUTH_SECRET|KAVENEGAR_API_KEY" .env

# Check PM2 environment
pm2 env hs6tools
```

### 7. Check Database Connection

```bash
# Test database connection
npx prisma db execute --stdin <<< "SELECT 1;"

# Check database status
npx prisma migrate status
```

### 8. Check Nginx (if using reverse proxy)

```bash
# Check Nginx status
systemctl status nginx

# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Check Nginx access logs
tail -f /var/log/nginx/access.log

# Test Nginx config
nginx -t
```

---

## Common Issues & Solutions

### Issue 1: Application Not Starting

**Symptoms:**
- `pm2 status` shows "errored" or "stopped"
- No response on port 3000

**Diagnosis:**
```bash
# Check PM2 logs for errors
pm2 logs hs6tools --err --lines 50

# Check if build exists
ls -la .next/

# Check if dependencies are installed
ls -la node_modules/next
```

**Common Causes:**
- Build failed (check `.next/` folder)
- Missing dependencies (check `node_modules/`)
- Environment variables missing (check `.env`)
- Port already in use (check `netstat -tulpn | grep 3000`)
- Out of memory (check `free -h`)

### Issue 2: Application Crashes on Startup

**Symptoms:**
- PM2 shows "restarting" or "errored"
- Logs show crash immediately after start

**Diagnosis:**
```bash
# Check error logs
pm2 logs hs6tools --err --lines 100

# Check for specific errors
pm2 logs hs6tools --err | grep -i "error\|exception\|fatal"
```

**Common Causes:**
- Database connection failed
- Missing environment variables
- Prisma client not generated
- Port conflict
- Memory limit exceeded

### Issue 3: Build Failed

**Symptoms:**
- `.next/` folder missing or incomplete
- Build errors in logs

**Diagnosis:**
```bash
# Check if build directory exists
ls -la .next/

# Try manual build
npm run build

# Check for build errors
npm run build 2>&1 | tee build-error.log
```

**Common Causes:**
- TypeScript errors
- Missing dependencies
- Prisma client not generated
- Memory issues during build

### Issue 4: Application Responds Slowly or Not at All

**Symptoms:**
- Port 3000 is listening but no response
- Timeout errors

**Diagnosis:**
```bash
# Check if process is running
ps aux | grep node

# Check memory usage
pm2 monit

# Check for hanging requests
netstat -an | grep 3000 | grep ESTABLISHED
```

**Common Causes:**
- High memory usage
- Database connection issues
- Infinite loops in code
- Too many concurrent requests

---

## Emergency Recovery Steps

### Step 1: Stop Everything
```bash
# Stop PM2
pm2 stop hs6tools
pm2 delete hs6tools

# Kill any hanging Node processes
pkill -f "next"
pkill -f "node.*hs6tools"
```

### Step 2: Check What Went Wrong
```bash
# Check last PM2 logs
pm2 logs hs6tools --lines 200 --nostream > /tmp/pm2-logs.txt
cat /tmp/pm2-logs.txt

# Check build status
ls -la .next/BUILD_ID

# Check dependencies
npm list react react-dom next
```

### Step 3: Clean and Rebuild
```bash
# Clean everything
rm -rf .next
rm -rf node_modules
rm -f package-lock.json

# Reinstall
npm install

# Regenerate Prisma
npx prisma generate

# Rebuild
npm run build
```

### Step 4: Restart Carefully
```bash
# Start with PM2 and watch logs
pm2 start ecosystem.config.js --env production
pm2 logs hs6tools --lines 0
```

---

## Quick Health Check Script

Create a file `check-server.sh`:

```bash
#!/bin/bash

echo "=== PM2 Status ==="
pm2 status

echo ""
echo "=== Application Logs (Last 20 lines) ==="
pm2 logs hs6tools --lines 20 --nostream

echo ""
echo "=== Port 3000 Status ==="
netstat -tulpn | grep 3000 || echo "Port 3000 not listening"

echo ""
echo "=== Build Status ==="
if [ -d ".next" ]; then
    echo "✅ Build directory exists"
    if [ -f ".next/BUILD_ID" ]; then
        echo "✅ Build ID: $(cat .next/BUILD_ID)"
    else
        echo "❌ Build ID missing"
    fi
else
    echo "❌ Build directory missing"
fi

echo ""
echo "=== Dependencies ==="
npm list react react-dom next 2>/dev/null | head -5

echo ""
echo "=== Memory Usage ==="
free -h

echo ""
echo "=== Disk Space ==="
df -h | grep -E "Filesystem|/$"
```

Make it executable and run:
```bash
chmod +x check-server.sh
./check-server.sh
```

---

## Most Common Commands (Quick Reference)

```bash
# 1. Check if app is running
pm2 status

# 2. View logs
pm2 logs hs6tools --lines 100

# 3. Check errors only
pm2 logs hs6tools --err --lines 50

# 4. Restart app
pm2 restart hs6tools

# 5. Check port
netstat -tulpn | grep 3000

# 6. Test connection
curl -I http://localhost:3000

# 7. Check build
ls -la .next/

# 8. Check memory
free -h
pm2 monit
```

---

## Getting Help

If the issue persists, collect this information:

```bash
# 1. PM2 status
pm2 status > /tmp/pm2-status.txt

# 2. Application logs
pm2 logs hs6tools --lines 200 --nostream > /tmp/pm2-logs.txt

# 3. System info
uname -a > /tmp/system-info.txt
free -h >> /tmp/system-info.txt
df -h >> /tmp/system-info.txt

# 4. Node/npm versions
node -v > /tmp/versions.txt
npm -v >> /tmp/versions.txt
npm list react react-dom next >> /tmp/versions.txt

# 5. Build status
ls -la .next/ > /tmp/build-status.txt 2>&1

# Then review these files
cat /tmp/pm2-status.txt
cat /tmp/pm2-logs.txt
cat /tmp/system-info.txt
cat /tmp/versions.txt
cat /tmp/build-status.txt
```

---

**Last Updated:** December 9, 2025

