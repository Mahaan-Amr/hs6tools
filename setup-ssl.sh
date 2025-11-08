#!/bin/bash

# Setup SSL/HTTPS with Let's Encrypt
# This script configures SSL certificate for hs6tools.com

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

DOMAIN="hs6tools.com"
EMAIL="admin@hs6tools.com"  # Change this to your email

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔒 Setting up SSL/HTTPS with Let's Encrypt"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Check if certbot is installed
log "Step 1: Checking Certbot installation..."
if ! command -v certbot &> /dev/null; then
    warning "Certbot not found. Installing..."
    apt update
    apt install -y certbot python3-certbot-nginx
else
    log "Certbot is installed"
    certbot --version
fi
echo ""

# Step 2: Verify domain DNS
log "Step 2: Verifying domain DNS..."
DOMAIN_IP=$(dig +short $DOMAIN | tail -1)
SERVER_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "87.107.73.10")

info "Domain $DOMAIN resolves to: $DOMAIN_IP"
info "Server IP is: $SERVER_IP"

if [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
    warning "DNS might not be pointing correctly!"
    warning "Domain IP: $DOMAIN_IP"
    warning "Server IP: $SERVER_IP"
    info "Make sure $DOMAIN points to $SERVER_IP before continuing"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    log "DNS is correctly configured"
fi
echo ""

# Step 3: Update Nginx config for SSL
log "Step 3: Updating Nginx configuration for SSL..."

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
    
    # Let's Encrypt challenge
    location ~ /.well-known/acme-challenge {
        allow all;
        root /var/www/html;
    }
}
EOF

# Test Nginx config
log "Testing Nginx configuration..."
if nginx -t; then
    log "Nginx configuration is valid"
    systemctl reload nginx
else
    error "Nginx configuration test failed!"
    exit 1
fi
echo ""

# Step 4: Obtain SSL certificate
log "Step 4: Obtaining SSL certificate from Let's Encrypt..."
info "This will use Certbot to get a free SSL certificate"
info "Make sure port 80 is accessible from the internet"

# Check if certificate already exists
if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    warning "SSL certificate already exists for $DOMAIN"
    info "Certificate location: /etc/letsencrypt/live/$DOMAIN"
    read -p "Renew certificate? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        certbot renew --dry-run
        log "Certificate renewal test completed"
    fi
else
    info "Obtaining new certificate..."
    info "You'll need to provide an email address for Let's Encrypt"
    
    # Run certbot
    certbot --nginx -d $DOMAIN -d www.$DOMAIN \
        --non-interactive \
        --agree-tos \
        --email $EMAIL \
        --redirect || {
        error "Failed to obtain SSL certificate"
        info "Common issues:"
        info "  1. Port 80 not accessible from internet"
        info "  2. DNS not pointing to this server"
        info "  3. Firewall blocking port 80"
        exit 1
    }
    
    log "SSL certificate obtained successfully!"
fi
echo ""

# Step 5: Verify SSL configuration
log "Step 5: Verifying SSL configuration..."
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    log "SSL certificate files found"
    info "Certificate: /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
    info "Private key: /etc/letsencrypt/live/$DOMAIN/privkey.pem"
else
    error "SSL certificate files not found"
    exit 1
fi
echo ""

# Step 6: Test Nginx with SSL
log "Step 6: Testing Nginx configuration with SSL..."
nginx -t && log "Nginx SSL configuration is valid" || error "Nginx SSL configuration has errors"
echo ""

# Step 7: Reload Nginx
log "Step 7: Reloading Nginx..."
systemctl reload nginx || systemctl restart nginx
log "Nginx reloaded"
echo ""

# Step 8: Test HTTPS
log "Step 8: Testing HTTPS connection..."
sleep 2

HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/fa 2>&1 || echo "000")
if [ "$HTTPS_CODE" = "200" ] || [ "$HTTPS_CODE" = "301" ] || [ "$HTTPS_CODE" = "302" ] || [ "$HTTPS_CODE" = "307" ]; then
    log "✅ HTTPS is working! (HTTP $HTTPS_CODE)"
else
    warning "HTTPS test returned: $HTTPS_CODE"
    info "This might be normal if certificate was just installed"
    info "Wait a few minutes and try again"
fi
echo ""

# Step 9: Set up auto-renewal
log "Step 9: Setting up automatic certificate renewal..."
# Certbot automatically sets up a cron job, but let's verify
if [ -f "/etc/cron.d/certbot" ]; then
    log "Auto-renewal cron job exists"
    cat /etc/cron.d/certbot
else
    info "Setting up renewal cron job..."
    echo "0 0,12 * * * root certbot renew --quiet" > /etc/cron.d/certbot
    log "Auto-renewal cron job created"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "SSL/HTTPS setup completed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
info "Your site should now be accessible via:"
echo "  ✅ https://hs6tools.com"
echo "  ✅ https://www.hs6tools.com"
echo ""
info "Next steps:"
echo "  1. Test in browser: https://hs6tools.com/fa"
echo "  2. Check SSL certificate: openssl s_client -connect hs6tools.com:443 -servername hs6tools.com"
echo "  3. Verify auto-renewal: certbot renew --dry-run"
echo ""
warning "Note: It may take a few minutes for DNS/SSL to propagate"
echo ""

