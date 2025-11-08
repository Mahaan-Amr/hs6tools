#!/bin/bash

# Server-Side Fix Script for Static Files Issue
# Run this on your server to fix the static files serving problem

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

APP_DIR="/var/www/hs6tools"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 HS6Tools Static Files Fix Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Check current directory
cd "${APP_DIR}" || error "Cannot access ${APP_DIR}"

# Step 2: Check if .next folder exists
log "Step 1: Checking build output..."
if [ ! -d ".next" ]; then
    warning ".next folder not found. Rebuilding application..."
    npm run build
else
    info ".next folder exists"
fi

# Step 3: Verify static folder
if [ ! -d ".next/static" ]; then
    warning ".next/static folder not found. Rebuilding..."
    rm -rf .next
    npm run build
else
    info ".next/static folder exists"
    ls -la .next/static/ | head -10
fi

# Step 4: Fix permissions
log "Step 2: Fixing file permissions..."
chown -R hs6tools:hs6tools .next 2>/dev/null || chown -R $(whoami):$(whoami) .next
chmod -R 755 .next
info "Permissions fixed"

# Step 5: Update Nginx configuration
log "Step 3: Updating Nginx configuration..."

cat > /tmp/hs6tools-nginx.conf << 'EOF'
server {
    listen 80;
    server_name hs6tools.com www.hs6tools.com 87.107.73.10;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
    
    # Client max body size for file uploads
    client_max_body_size 10M;
    
    # Static files - CRITICAL: Must come before proxy location
    location /_next/static/ {
        alias /var/www/hs6tools/.next/static/;
        expires 365d;
        add_header Cache-Control "public, immutable";
        access_log off;
        # Don't proxy, serve directly
        try_files $uri =404;
    }
    
    # All other _next requests go to Next.js
    location /_next/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Uploads
    location /uploads {
        alias /var/www/hs6tools/public/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Fonts
    location /fonts {
        alias /var/www/hs6tools/public/fonts;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
    
    # Proxy to Next.js app - MUST be last
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
}
EOF

# Copy configuration
cp /tmp/hs6tools-nginx.conf /etc/nginx/sites-available/hs6tools

# Test Nginx configuration
log "Step 4: Testing Nginx configuration..."
if nginx -t; then
    log "Nginx configuration is valid"
else
    error "Nginx configuration test failed. Please check the configuration."
fi

# Reload Nginx
log "Step 5: Reloading Nginx..."
systemctl reload nginx || systemctl restart nginx
info "Nginx reloaded"

# Step 6: Check PM2
log "Step 6: Checking PM2 status..."
pm2 status

# Step 7: Restart application
log "Step 7: Restarting application..."
pm2 restart hs6tools || pm2 start ecosystem.config.js --env production

# Wait a moment
sleep 3

# Step 8: Verify application is running
log "Step 8: Verifying application status..."
if pm2 describe hs6tools | grep -q "online"; then
    log "✅ Application is running"
else
    warning "⚠️  Application might not be running properly"
    info "Check logs with: pm2 logs hs6tools"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Fix process completed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
info "Next steps:"
echo "  1. Check your website: https://hs6tools.com"
echo "  2. If issues persist, check PM2 logs: pm2 logs hs6tools --lines 50"
echo "  3. Check Nginx error logs: tail -f /var/log/nginx/error.log"
echo "  4. Verify static files: ls -la /var/www/hs6tools/.next/static/chunks/ | head -20"
echo "  5. Test static file access: curl -I http://localhost:3000/_next/static/chunks/webpack-*.js"
echo ""

