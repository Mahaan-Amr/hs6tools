#!/bin/bash

# HS6Tools One-Click Deployment Script
# This script will deploy the entire application to your Ubuntu server

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
SERVER_PASS="OzyNIV29@hm4"

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

log "🚀 Starting HS6Tools One-Click Deployment..."

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    warning "sshpass not found. Installing..."
    if command -v apt &> /dev/null; then
        sudo apt update && sudo apt install -y sshpass
    elif command -v yum &> /dev/null; then
        sudo yum install -y sshpass
    elif command -v brew &> /dev/null; then
        brew install hudochenkov/sshpass/sshpass
    else
        error "Could not install sshpass. Please install it manually."
    fi
fi

# Function to run commands on remote server
run_remote() {
    sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "$1"
}

# Function to copy files to remote server
copy_to_server() {
    sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no "$1" ${SERVER_USER}@${SERVER_IP}:"$2"
}

# Test server connection
log "Testing server connection..."
if ! run_remote "echo 'Connection successful'" &> /dev/null; then
    error "Cannot connect to server. Please check your credentials and network connection."
fi

log "✅ Server connection successful!"

# Step 1: Copy setup script to server
log "Step 1: Copying setup script to server..."
copy_to_server "deploy/setup-server.sh" "/tmp/setup-server.sh"

# Step 2: Run server setup
log "Step 2: Running server setup (this may take 10-15 minutes)..."
run_remote "chmod +x /tmp/setup-server.sh && /tmp/setup-server.sh"

# Step 3: Clone repository
log "Step 3: Cloning repository..."
run_remote "cd /var/www/hs6tools && git clone https://github.com/Mahaan-Amr/hs6tools.git ."

# Step 4: Set up environment
log "Step 4: Setting up environment..."
run_remote "cd /var/www/hs6tools && cp .env.production .env"

# Step 5: Install dependencies
log "Step 5: Installing dependencies..."
run_remote "cd /var/www/hs6tools && npm ci --only=production"

# Step 6: Generate Prisma client
log "Step 6: Generating Prisma client..."
run_remote "cd /var/www/hs6tools && npx prisma generate"

# Step 7: Run database migrations
log "Step 7: Running database migrations..."
run_remote "cd /var/www/hs6tools && npx prisma migrate deploy"

# Step 8: Seed database
log "Step 8: Seeding database..."
run_remote "cd /var/www/hs6tools && npm run db:seed"

# Step 9: Build application
log "Step 9: Building application..."
run_remote "cd /var/www/hs6tools && npm run build"

# Step 10: Start with PM2
log "Step 10: Starting application with PM2..."
run_remote "cd /var/www/hs6tools && pm2 start ecosystem.config.js --env production"
run_remote "pm2 save"
run_remote "pm2 startup"

# Step 11: Final configuration
log "Step 11: Final configuration..."
run_remote "chown -R hs6tools:hs6tools /var/www/hs6tools"
run_remote "systemctl restart nginx"

# Step 12: Health check
log "Step 12: Performing health check..."
sleep 10
if run_remote "curl -f http://localhost:3000 > /dev/null 2>&1"; then
    log "✅ Application is running successfully!"
else
    warning "⚠️  Application health check failed. Please check logs manually."
fi

log ""
log "🎉 HS6Tools Deployment Completed Successfully!"
log ""
log "📋 Deployment Summary:"
log "   Server: ${SERVER_IP}"
log "   Application: /var/www/hs6tools"
log "   Admin Panel: http://${SERVER_IP}/fa/admin"
log "   Main Site: http://${SERVER_IP}"
log ""
log "🔑 Admin Credentials:"
log "   Email: admin@hs6tools.com"
log "   Password: Admin123!"
log ""
log "📊 Quick Commands:"
log "   Check status: ssh root@${SERVER_IP} 'pm2 status'"
log "   View logs: ssh root@${SERVER_IP} 'pm2 logs hs6tools'"
log "   Restart: ssh root@${SERVER_IP} 'pm2 restart hs6tools'"
log ""
log "🔄 Future Updates:"
log "   ssh root@${SERVER_IP} 'cd /var/www/hs6tools && ./deploy.sh'"
log ""
log "💾 Backup:"
log "   ssh root@${SERVER_IP} 'cd /var/www/hs6tools && ./backup.sh'"
log ""
log "🌐 Next Steps:"
log "   1. Domain hs6tools.com will be configured automatically"
log "   2. SSL certificate will be installed automatically"
log "   3. Update environment variables for production"
log "   4. Configure payment gateway credentials"
log ""
log "📞 Support:"
log "   Check logs if you encounter issues:"
log "   - Application: pm2 logs hs6tools"
log "   - Nginx: tail -f /var/log/nginx/error.log"
log "   - System: journalctl -u nginx"
