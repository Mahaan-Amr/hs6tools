#!/bin/bash

# HS6Tools Complete Deployment Script
# This script will deploy the entire application to the server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="87.107.73.10"
SERVER_USER="root"
REPO_URL="https://github.com/Mahaan-Amr/hs6tools.git"
APP_DIR="/var/www/hs6tools"
DOMAIN="hs6tools.com"

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

# Function to run commands on remote server
run_remote() {
    ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "$1"
}

# Function to copy files to remote server
copy_to_server() {
    scp -o StrictHostKeyChecking=no "$1" ${SERVER_USER}@${SERVER_IP}:"$2"
}

log "Starting HS6Tools Complete Deployment..."

# Step 1: Run server setup script
log "Step 1: Running server setup script..."
copy_to_server "deploy/setup-server.sh" "/tmp/setup-server.sh"
run_remote "chmod +x /tmp/setup-server.sh && /tmp/setup-server.sh"

# Step 2: Clone repository
log "Step 2: Cloning repository..."
run_remote "cd ${APP_DIR} && git clone ${REPO_URL} ."

# Step 3: Set up environment
log "Step 3: Setting up environment..."
run_remote "cd ${APP_DIR} && cp .env.production .env"

# Step 4: Install dependencies
log "Step 4: Installing dependencies..."
run_remote "cd ${APP_DIR} && npm ci --only=production"

# Step 5: Generate Prisma client
log "Step 5: Generating Prisma client..."
run_remote "cd ${APP_DIR} && npx prisma generate"

# Step 6: Run database migrations
log "Step 6: Running database migrations..."
run_remote "cd ${APP_DIR} && npx prisma migrate deploy"

# Step 7: Seed database
log "Step 7: Seeding database..."
run_remote "cd ${APP_DIR} && npm run db:seed"

# Step 8: Build application
log "Step 8: Building application..."
run_remote "cd ${APP_DIR} && npm run build"

# Step 9: Set up PM2
log "Step 9: Setting up PM2..."
run_remote "cd ${APP_DIR} && pm2 start ecosystem.config.js --env production"
run_remote "pm2 save"
run_remote "pm2 startup"

# Step 10: Set up SSL
log "Step 10: Setting up SSL..."
run_remote "certbot --nginx -d hs6tools.com -d www.hs6tools.com --non-interactive --agree-tos --email admin@hs6tools.com"

# Step 11: Final configuration
log "Step 11: Final configuration..."
run_remote "chown -R hs6tools:hs6tools ${APP_DIR}"
run_remote "systemctl restart nginx"

# Step 12: Health check
log "Step 12: Performing health check..."
sleep 10
if run_remote "curl -f http://localhost:3000 > /dev/null 2>&1"; then
    log "Application is running successfully!"
else
    error "Application health check failed!"
fi

log "Deployment completed successfully!"
log ""
log "🎉 HS6Tools is now deployed!"
log ""
log "📋 Deployment Summary:"
log "   Server: ${SERVER_IP}"
log "   Application: ${APP_DIR}"
log "   Domain: ${DOMAIN}"
log "   Admin Panel: http://${SERVER_IP}/fa/admin"
log "   Main Site: http://${SERVER_IP}"
log ""
log "🔑 Admin Credentials:"
log "   Email: admin@hs6tools.com"
log "   Password: Admin123!"
log ""
log "📊 Monitoring:"
log "   PM2 Status: pm2 status"
log "   PM2 Logs: pm2 logs hs6tools"
log "   Nginx Logs: tail -f /var/log/nginx/access.log"
log ""
log "🔄 Future Deployments:"
log "   Run: cd ${APP_DIR} && ./deploy.sh"
log ""
log "💾 Backup:"
log "   Manual: cd ${APP_DIR} && ./backup.sh"
log "   Automatic: Daily at 2 AM"
