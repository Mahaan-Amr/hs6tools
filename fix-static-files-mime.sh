#!/bin/bash

# Fix Static Files MIME Type Issue
# This script fixes the issue where CSS/JS files are served with wrong MIME type

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[✅] $1${NC}"
}

error() {
    echo -e "${RED}[❌] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[⚠️] $1${NC}"
}

info() {
    echo -e "${BLUE}[ℹ️] $1${NC}"
}

APP_DIR="/var/www/hs6tools"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Fixing Static Files MIME Type Issue"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "${APP_DIR}" || exit 1

# Step 1: Check if build exists
log "Step 1: Checking build status..."
if [ ! -d ".next" ]; then
    error ".next directory not found! Build is missing."
    info "Running build..."
    npm run build
else
    log ".next directory exists"
fi

# Step 2: Verify static files
log "Step 2: Verifying static files..."
if [ ! -d ".next/static" ]; then
    error ".next/static directory not found!"
    info "Rebuilding application..."
    rm -rf .next
    npm run build
else
    STATIC_COUNT=$(find .next/static -type f 2>/dev/null | wc -l)
    if [ "$STATIC_COUNT" -eq 0 ]; then
        error "No static files found! Rebuilding..."
        rm -rf .next
        npm run build
    else
        log "Found $STATIC_COUNT static files"
    fi
fi

# Step 3: Check specific CSS file
log "Step 3: Checking CSS files..."
CSS_FILE=$(find .next/static/css -name "*.css" 2>/dev/null | head -1)
if [ -n "$CSS_FILE" ]; then
    log "CSS file found: $CSS_FILE"
    info "File size: $(du -h "$CSS_FILE" | cut -f1)"
    info "File type: $(file "$CSS_FILE" | cut -d: -f2)"
else
    error "No CSS files found! This is the problem."
    info "Rebuilding..."
    rm -rf .next
    npm run build
fi

# Step 4: Test if Next.js can serve the file
log "Step 4: Testing Next.js static file serving..."
sleep 2

if [ -n "$CSS_FILE" ]; then
    RELATIVE_PATH="/_next/static${CSS_FILE#.next/static}"
    info "Testing: http://localhost:3000$RELATIVE_PATH"
    
    RESPONSE=$(curl -s -I "http://localhost:3000$RELATIVE_PATH" 2>&1 | head -1)
    CONTENT_TYPE=$(curl -s -I "http://localhost:3000$RELATIVE_PATH" 2>&1 | grep -i "content-type" || echo "")
    
    info "Response: $RESPONSE"
    info "Content-Type: $CONTENT_TYPE"
    
    if echo "$CONTENT_TYPE" | grep -qi "text/css"; then
        log "✅ Next.js is serving CSS with correct MIME type"
    elif echo "$CONTENT_TYPE" | grep -qi "text/html"; then
        error "❌ Next.js is serving CSS as HTML (404 page)"
        warning "This means the file path is wrong or Next.js can't find it"
    else
        warning "Could not determine Content-Type"
    fi
fi

# Step 5: Update Nginx config to ensure proper proxying
log "Step 5: Updating Nginx configuration..."

cat > /etc/nginx/sites-available/hs6tools << 'EOF'
server {
    listen 80;
    listen [::]:80;
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
    
    # Client max body size for file uploads
    client_max_body_size 10M;
    
    # Increase timeouts for Next.js
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    # CRITICAL: Let Next.js handle ALL requests including static files
    # This ensures correct MIME types and proper file serving
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
        proxy_buffering off;
        
        # Don't buffer responses - let Next.js handle MIME types
        proxy_no_cache 1;
        proxy_cache_bypass 1;
    }
    
    # Uploads (serve directly from filesystem)
    location /uploads {
        alias /var/www/hs6tools/public/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Fonts (serve directly from filesystem)
    location /fonts {
        alias /var/www/hs6tools/public/fonts;
        expires 365d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
}
EOF

# Test Nginx config
log "Testing Nginx configuration..."
if nginx -t; then
    log "Nginx configuration is valid"
    systemctl reload nginx
    log "Nginx reloaded"
else
    error "Nginx configuration test failed!"
    exit 1
fi

# Step 6: Restart PM2 to ensure fresh state
log "Step 6: Restarting PM2 application..."
pm2 restart hs6tools
sleep 5

# Step 7: Verify application is running
log "Step 7: Verifying application..."
if pm2 describe hs6tools | grep -q "online"; then
    log "Application is online"
else
    error "Application is not online!"
    pm2 logs hs6tools --lines 20
    exit 1
fi

# Step 8: Final test
log "Step 8: Final connectivity test..."
sleep 3

ROOT_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>&1)
FA_CODE=$(curl -s -o /dev/null -w "%{http_code}" -L http://localhost:3000/fa 2>&1)

info "Root endpoint: HTTP $ROOT_CODE"
info "/fa endpoint: HTTP $FA_CODE"

if [ -n "$CSS_FILE" ]; then
    RELATIVE_PATH="/_next/static${CSS_FILE#.next/static}"
    CSS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$RELATIVE_PATH" 2>&1)
    CSS_TYPE=$(curl -s -I "http://localhost:3000$RELATIVE_PATH" 2>&1 | grep -i "content-type" || echo "")
    
    info "CSS file endpoint: HTTP $CSS_CODE"
    info "CSS Content-Type: $CSS_TYPE"
    
    if echo "$CSS_TYPE" | grep -qi "text/css"; then
        log "✅ CSS is being served with correct MIME type!"
    else
        warning "⚠️ CSS MIME type issue may still exist"
        info "Check browser console for errors"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Fix completed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
info "Next steps:"
echo "  1. Clear browser cache (Ctrl+Shift+Delete)"
echo "  2. Hard refresh the page (Ctrl+F5)"
echo "  3. Check browser console (F12) for any remaining errors"
echo "  4. If issues persist, check:"
echo "     - pm2 logs hs6tools --lines 50"
echo "     - tail -f /var/log/nginx/error.log"
echo ""

