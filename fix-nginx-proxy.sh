#!/bin/bash

# Fix Nginx Proxy Configuration
# Ensures Nginx properly proxies all requests to Next.js

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

info() {
    echo -e "${BLUE}[ℹ️] $1${NC}"
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Fixing Nginx Proxy Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Test if Next.js is responding
log "Step 1: Testing Next.js on localhost:3000..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302\|307"; then
    log "Next.js is responding on localhost:3000"
    curl -I http://localhost:3000 2>&1 | head -5
else
    error "Next.js is NOT responding on localhost:3000"
    info "Response: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>&1)"
    exit 1
fi
echo ""

# Step 2: Update Nginx configuration
log "Step 2: Updating Nginx configuration..."

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
    
    # Let Next.js handle ALL requests (including static files)
    # This is the simplest and most reliable approach
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
        
        # Don't buffer responses
        proxy_buffering off;
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

log "Nginx configuration updated"

# Step 3: Test Nginx configuration
log "Step 3: Testing Nginx configuration..."
if nginx -t 2>&1; then
    log "Nginx configuration is valid"
else
    error "Nginx configuration has ERRORS!"
    exit 1
fi
echo ""

# Step 4: Reload Nginx
log "Step 4: Reloading Nginx..."
if systemctl reload nginx 2>&1; then
    log "Nginx reloaded successfully"
else
    warning "Reload failed, trying restart..."
    systemctl restart nginx
fi
echo ""

# Step 5: Check Nginx status
log "Step 5: Checking Nginx status..."
if systemctl is-active --quiet nginx; then
    log "Nginx is running"
else
    error "Nginx is NOT running!"
    systemctl status nginx
    exit 1
fi
echo ""

# Step 6: Test external access
log "Step 6: Testing external access..."
sleep 2

# Test HTTP response
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://87.107.73.10 2>&1)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ] || [ "$HTTP_CODE" = "307" ]; then
    log "✅ External access working (HTTP $HTTP_CODE)"
    curl -I http://87.107.73.10 2>&1 | head -10
else
    warning "⚠️ External access might have issues (HTTP $HTTP_CODE)"
    info "Testing with domain name..."
    HTTP_CODE_DOMAIN=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: hs6tools.com" http://87.107.73.10 2>&1)
    info "Domain response: $HTTP_CODE_DOMAIN"
fi
echo ""

# Step 7: Check firewall
log "Step 7: Checking firewall..."
if command -v ufw &> /dev/null; then
    info "UFW status:"
    ufw status | head -10
else
    info "UFW not found, checking iptables..."
    iptables -L -n | grep -E "80|443" || info "No specific firewall rules found"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Nginx configuration fixed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
info "Next steps:"
echo "  1. Test website: http://hs6tools.com or http://87.107.73.10"
echo "  2. Check Nginx logs: tail -f /var/log/nginx/error.log"
echo "  3. Check access logs: tail -f /var/log/nginx/access.log"
echo "  4. Verify PM2: pm2 status"
echo ""
info "If still not working:"
echo "  - Check DNS: nslookup hs6tools.com"
echo "  - Check firewall: ufw status"
echo "  - Test direct: curl http://localhost:3000"
echo ""

