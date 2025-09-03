#!/bin/bash

# HS6Tools Server Deployment Script
# This script will deploy the application when run directly on the server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
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

log "🚀 Starting HS6Tools Server Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    error "Please run this script from the /var/www/hs6tools directory"
fi

# Step 1: Set up environment
log "Step 1: Setting up environment..."
if [ -f ".env.production" ]; then
    cp .env.production .env
    log "✅ Environment file created from .env.production"
else
    warning "⚠️  .env.production not found, using existing .env"
fi

# Step 2: Install dependencies
log "Step 2: Installing dependencies..."
# Clean old dependencies first
rm -rf node_modules package-lock.json
# Install all dependencies (including dev dependencies needed for build)
npm install
log "✅ Dependencies installed"

# Step 3: Generate Prisma client
log "Step 3: Generating Prisma client..."
npx prisma generate
log "✅ Prisma client generated"

# Step 4: Run database migrations
log "Step 4: Running database migrations..."
npx prisma migrate deploy
log "✅ Database migrations completed"

# Step 5: Seed database
log "Step 5: Seeding database..."
npm run db:seed
log "✅ Database seeded with sample data"

# Step 6: Build application
log "Step 6: Building application..."
npm run build
log "✅ Application built successfully"

# Step 7: Create PM2 ecosystem file if it doesn't exist
log "Step 7: Setting up PM2 configuration..."
if [ ! -f "ecosystem.config.js" ]; then
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'hs6tools',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/hs6tools',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/hs6tools-error.log',
    out_file: '/var/log/pm2/hs6tools-out.log',
    log_file: '/var/log/pm2/hs6tools-combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF
    log "✅ PM2 ecosystem file created"
else
    log "✅ PM2 ecosystem file already exists"
fi

# Step 8: Create log directory
log "Step 8: Setting up logging..."
mkdir -p /var/log/pm2
chown hs6tools:hs6tools /var/log/pm2 2>/dev/null || chown root:root /var/log/pm2
log "✅ Log directory created"

# Step 9: Start with PM2
log "Step 9: Starting application with PM2..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
log "✅ Application started with PM2"

# Step 10: Set up Nginx configuration
log "Step 10: Setting up Nginx configuration..."
if [ ! -f "/etc/nginx/sites-available/hs6tools" ]; then
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
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
    
    # Client max body size for file uploads
    client_max_body_size 10M;
    
    # Proxy to Next.js app
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
    
    # Static files
    location /_next/static {
        alias /var/www/hs6tools/.next/static;
        expires 365d;
        access_log off;
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
}
EOF

    # Enable site
    ln -sf /etc/nginx/sites-available/hs6tools /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    nginx -t
    
    # Restart Nginx
    systemctl restart nginx
    log "✅ Nginx configuration created and enabled"
else
    log "✅ Nginx configuration already exists"
fi

# Step 11: Set up SSL certificate
log "Step 11: Setting up SSL certificate..."
if command -v certbot &> /dev/null; then
    certbot --nginx -d hs6tools.com -d www.hs6tools.com --non-interactive --agree-tos --email admin@hs6tools.com || warning "SSL certificate setup failed or already exists"
    log "✅ SSL certificate configured"
else
    warning "⚠️  Certbot not found, SSL setup skipped"
fi

# Step 12: Set proper permissions
log "Step 12: Setting final permissions..."
chown -R hs6tools:hs6tools /var/www/hs6tools 2>/dev/null || chown -R root:root /var/www/hs6tools
log "✅ Permissions set"

# Step 13: Health check
log "Step 13: Performing health check..."
sleep 5
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    log "✅ Application is running successfully!"
else
    warning "⚠️  Application health check failed. Please check logs manually."
fi

log ""
log "🎉 HS6Tools Deployment Completed Successfully!"
log ""
log "📋 Deployment Summary:"
log "   Server: 87.107.73.10"
log "   Application: /var/www/hs6tools"
log "   Admin Panel: https://hs6tools.com/fa/admin"
log "   Main Site: https://hs6tools.com"
log ""
log "🔑 Admin Credentials:"
log "   Email: admin@hs6tools.com"
log "   Password: Admin123!"
log ""
log "📊 Quick Commands:"
log "   Check status: pm2 status"
log "   View logs: pm2 logs hs6tools"
log "   Restart: pm2 restart hs6tools"
log ""
log "🔄 Future Updates:"
log "   cd /var/www/hs6tools && ./deploy.sh"
log ""
log "💾 Backup:"
log "   cd /var/www/hs6tools && ./backup.sh"
log ""
log "📞 Support:"
log "   Check logs if you encounter issues:"
log "   - Application: pm2 logs hs6tools"
log "   - Nginx: tail -f /var/log/nginx/error.log"
log "   - System: journalctl -u nginx"
