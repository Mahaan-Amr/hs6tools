# 🚨 Quick Fix for Static Files Issue

## Problem
After updating, the website shows "Application error" and static files (CSS/JS) are returning 404 or wrong MIME types.

## Root Cause
The issue is likely one of these:
1. Build didn't complete successfully - `.next` folder is missing or incomplete
2. Nginx configuration conflict - static files are being served incorrectly
3. PM2 application not running or crashed

## Quick Fix (Run on Server)

### Option 1: Use the Fix Script (Recommended)

```bash
# SSH into your server
ssh root@87.107.73.10

# Navigate to project
cd /var/www/hs6tools

# Download and run the fix script
curl -o fix-server.sh https://raw.githubusercontent.com/Mahaan-Amr/hs6tools/master/fix-server.sh
# OR copy the fix-server.sh file to your server manually

chmod +x fix-server.sh
./fix-server.sh
```

### Option 2: Manual Fix

```bash
# 1. SSH into server
ssh root@87.107.73.10
cd /var/www/hs6tools

# 2. Check if build exists
ls -la .next/static/

# 3. If missing, rebuild
npm run build

# 4. Fix permissions
chown -R hs6tools:hs6tools .next
chmod -R 755 .next

# 5. Update Nginx config to let Next.js handle static files
cat > /etc/nginx/sites-available/hs6tools << 'EOF'
server {
    listen 80;
    server_name hs6tools.com www.hs6tools.com 87.107.73.10;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
    
    client_max_body_size 10M;
    
    # Let Next.js handle ALL requests including static files
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Uploads (serve directly)
    location /uploads {
        alias /var/www/hs6tools/public/uploads;
        expires 30d;
    }
    
    # Fonts (serve directly)
    location /fonts {
        alias /var/www/hs6tools/public/fonts;
        expires 365d;
    }
}
EOF

# 6. Test and reload Nginx
nginx -t
systemctl reload nginx

# 7. Restart PM2
pm2 restart hs6tools

# 8. Check status
pm2 status
pm2 logs hs6tools --lines 30
```

### Option 3: Complete Rebuild

```bash
# Stop PM2
pm2 stop hs6tools

# Clean build
cd /var/www/hs6tools
rm -rf .next
rm -rf node_modules/.cache

# Rebuild
npm run build

# Verify build
ls -la .next/static/chunks/ | head -20

# Fix permissions
chown -R hs6tools:hs6tools .next
chmod -R 755 .next

# Start PM2
pm2 start ecosystem.config.js --env production
pm2 save

# Check logs
pm2 logs hs6tools --lines 50
```

## Verification

After running the fix, verify:

1. **Check PM2 status:**
   ```bash
   pm2 status
   pm2 logs hs6tools --lines 20
   ```

2. **Test static files:**
   ```bash
   curl -I http://localhost:3000/_next/static/chunks/webpack.js
   ```

3. **Check Nginx:**
   ```bash
   tail -f /var/log/nginx/error.log
   ```

4. **Visit website:**
   - Open https://hs6tools.com
   - Check browser console (F12) for errors
   - Verify CSS and JS files are loading

## If Still Not Working

1. **Check build output:**
   ```bash
   ls -la /var/www/hs6tools/.next/static/
   ```

2. **Check PM2 logs:**
   ```bash
   pm2 logs hs6tools --err --lines 100
   ```

3. **Check Next.js is running:**
   ```bash
   curl http://localhost:3000
   ```

4. **Rebuild from scratch:**
   ```bash
   cd /var/www/hs6tools
   git pull origin master
   npm install
   npm run build
   pm2 restart hs6tools
   ```

