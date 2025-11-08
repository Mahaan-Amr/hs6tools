#!/bin/bash

# Fix Static Files Serving Issue
# This script diagnoses and fixes issues with Next.js static file serving

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

log "Starting static files fix process..."

# Check if .next folder exists
if [ ! -d "${APP_DIR}/.next" ]; then
    warning ".next folder not found. Rebuilding application..."
    cd "${APP_DIR}"
    npm run build
fi

# Check if static folder exists
if [ ! -d "${APP_DIR}/.next/static" ]; then
    error ".next/static folder not found. Build may have failed."
fi

# Fix permissions
log "Fixing file permissions..."
chown -R hs6tools:hs6tools "${APP_DIR}/.next"
chmod -R 755 "${APP_DIR}/.next"

# Update Nginx configuration
log "Updating Nginx configuration..."

cat > /etc/nginx/sites-available/hs6tools << 'EOF'
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
    
    # Static files - MUST come before the proxy location
    location /_next/static/ {
        alias /var/www/hs6tools/.next/static/;
        expires 365d;
        add_header Cache-Control "public, immutable";
        access_log off;
        # Ensure correct MIME types
        types {
            text/css css;
            application/javascript js;
            application/json json;
            image/png png;
            image/jpeg jpg jpeg;
            image/gif gif;
            image/svg+xml svg;
            font/woff2 woff2;
            font/woff woff;
        }
        default_type application/octet-stream;
    }
    
    # Public files
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

# Test Nginx configuration
log "Testing Nginx configuration..."
if nginx -t; then
    log "Nginx configuration is valid"
else
    error "Nginx configuration test failed"
fi

# Reload Nginx
log "Reloading Nginx..."
systemctl reload nginx

# Check PM2 status
log "Checking PM2 status..."
pm2 status

# Restart PM2 application
log "Restarting PM2 application..."
cd "${APP_DIR}"
pm2 restart hs6tools

# Wait for application to start
sleep 5

# Check if application is running
if pm2 describe hs6tools | grep -q "online"; then
    log "Application is running"
else
    warning "Application might not be running. Check logs with: pm2 logs hs6tools"
fi

log "Fix process completed!"
info "Please check your website now. If issues persist, check:"
info "  1. PM2 logs: pm2 logs hs6tools"
info "  2. Nginx error logs: tail -f /var/log/nginx/error.log"
info "  3. Verify .next folder exists: ls -la /var/www/hs6tools/.next/static"

