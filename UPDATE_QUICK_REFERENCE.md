# HS6Tools Update Script - Quick Reference

## 🚀 Quick Start

```bash
cd /var/www/hs6tools
bash update.sh
```

**That's it!** The script handles everything automatically.

---

## ✅ What It Does Automatically

1. ✅ **Pulls latest code** from GitHub
2. ✅ **Resolves dependency conflicts** (nodemailer, etc.)
3. ✅ **Detects malicious packages** and reinstalls if needed
4. ✅ **Generates Prisma client** with auto-recovery
5. ✅ **Runs database migrations**
6. ✅ **Builds Next.js application**
7. ✅ **Restarts PM2** with updated environment
8. ✅ **Verifies everything works**

---

## 📋 Expected Output

```
🚀 Starting HS6Tools Update Process
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Directory check passed
✅ Git check passed
✅ All required environment variables present
✅ No critical vulnerabilities found
✅ Successfully pulled latest changes
✅ Dependencies installed successfully
✅ Prisma client generated successfully
✅ Database migrations completed successfully
✅ Application built successfully
✅ Application started with updated environment variables
✅ Application is online in PM2
✅ Root endpoint responding: HTTP 307
✅ /fa endpoint responding: HTTP 200
✅ Nginx is running

🎉 All done! Your application is now updated and running.
```

---

## 🔍 Quick Checks

### After Update

```bash
# 1. Check PM2 status
pm2 status

# 2. View logs
pm2 logs hs6tools --lines 20

# 3. Test in browser
curl -I http://localhost:3000/fa
```

### If Something Looks Wrong

```bash
# View detailed logs
pm2 logs hs6tools --lines 100

# Check environment variables
pm2 env hs6tools | grep -E "KAVENEGAR|ZARINPAL"

# Restart if needed
pm2 restart hs6tools
```

---

## 🚨 Common Issues & Quick Fixes

### Issue: Peer Dependency Error

**You'll see**: `ERESOLVE unable to resolve dependency tree`

**Fix**: The script handles this automatically! It will:
1. Try normal install
2. Retry with `--legacy-peer-deps`
3. Try with `--force`
4. Clean reinstall if all fail

**No action needed!**

---

### Issue: Malicious Code Detected

**You'll see**: `⚠️  SECURITY ALERT: Suspicious code detected`

**Fix**: The script handles this automatically! It will:
1. Remove node_modules
2. Clear npm cache
3. Fresh install from registry

**No action needed!**

---

### Issue: Build Fails

**You'll see**: `❌ ERROR: Build failed`

**Fix**: The script tries auto-recovery. If it still fails:

```bash
# Manual recovery
rm -rf node_modules package-lock.json .next
npm install --legacy-peer-deps
npx prisma generate
npm run build
pm2 restart hs6tools
```

---

### Issue: PM2 Shows "errored"

**Check logs first**:
```bash
pm2 logs hs6tools --lines 50
```

**Common causes**:
1. **Database not running**: `systemctl start postgresql`
2. **Port 3000 in use**: `lsof -i :3000` then kill the process
3. **Missing env vars**: Check `.env` file

**Quick fix**:
```bash
pm2 delete hs6tools
bash update.sh
```

---

## 📊 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Status overview
pm2 status

# Detailed info
pm2 describe hs6tools

# Live logs
pm2 logs hs6tools
```

---

## 🔄 Rollback (If Needed)

```bash
cd /var/www/hs6tools

# 1. View recent commits
git log --oneline -10

# 2. Rollback to previous version
git reset --hard <previous-commit-hash>

# 3. Rebuild
npm install --legacy-peer-deps
npx prisma generate
npm run build

# 4. Restart
pm2 restart hs6tools
```

---

## 📝 Important Files

- **`.env.production`** - Your production environment config (EDIT THIS)
- **`.env`** - Auto-generated from .env.production (DON'T EDIT)
- **`ecosystem.config.js`** - Auto-generated PM2 config (DON'T EDIT)
- **`update.sh`** - This update script

---

## 🎯 Best Practices

### ✅ DO

- Run `bash update.sh` for all updates
- Check logs after updates: `pm2 logs hs6tools`
- Keep `.env.production` up to date
- Monitor for 5 minutes after updates

### ❌ DON'T

- Don't edit `.env` directly (edit `.env.production` instead)
- Don't edit `ecosystem.config.js` (it's auto-generated)
- Don't run `npm install` manually (use the script)
- Don't skip the update script

---

## 📞 Need Help?

1. **Check the logs**: `pm2 logs hs6tools --lines 100`
2. **Check PM2 status**: `pm2 status`
3. **Check environment**: `pm2 env hs6tools`
4. **Read full guide**: `docs/UPDATE_SCRIPT_COMPREHENSIVE_GUIDE.md`

---

## 🎉 Success Indicators

After running `bash update.sh`, you should see:

✅ `Application is online in PM2`
✅ `Root endpoint responding: HTTP 307`
✅ `/fa endpoint responding: HTTP 200`
✅ `Nginx is running`
✅ `All done! Your application is now updated and running.`

If you see all of these, **you're good to go!** 🚀

---

**Quick Command Reference**:

```bash
# Update application
bash update.sh

# Check status
pm2 status

# View logs
pm2 logs hs6tools

# Restart
pm2 restart hs6tools

# Monitor
pm2 monit
```

---

**Last Updated**: December 9, 2025

