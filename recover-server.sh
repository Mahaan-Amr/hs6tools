#!/bin/bash

# Server Recovery Script
# This script attempts to recover a crashed application

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
echo "🔧 HS6Tools Server Recovery Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "${APP_DIR}" || exit 1

# Step 1: Stop PM2 to prevent restart loops
log "Step 1: Stopping PM2..."
pm2 stop hs6tools || pm2 delete hs6tools || true
sleep 2

# Step 2: Kill any hanging Node processes
log "Step 2: Cleaning up hanging processes..."
pkill -f "node.*hs6tools" || true
pkill -f "next-server" || true
sleep 2

# Step 3: Check if port 3000 is free
log "Step 3: Checking port 3000..."
if lsof -i:3000 &> /dev/null; then
    warning "Port 3000 is still in use. Killing processes..."
    fuser -k 3000/tcp || true
    sleep 2
fi

# Step 4: Verify environment file
log "Step 4: Checking environment..."
if [ ! -f ".env" ]; then
    error ".env file is missing!"
    if [ -f ".env.production" ]; then
        info "Copying .env.production to .env..."
        cp .env.production .env
    else
        error "No .env file found. Please create one!"
        exit 1
    fi
fi

# Step 5: Verify Node.js version
log "Step 5: Checking Node.js..."
NODE_VERSION=$(node -v)
info "Node.js version: $NODE_VERSION"

# Step 6: Check and install dependencies
log "Step 6: Checking dependencies..."
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    warning "Dependencies might be missing. Installing..."
    npm install
fi

# Step 7: Generate Prisma client
log "Step 7: Generating Prisma client..."
npx prisma generate || warning "Prisma generate failed, but continuing..."

# Step 8: Rebuild application
log "Step 8: Rebuilding application..."
info "Removing old build..."
rm -rf .next
info "Building application..."
npm run build

# Verify build
if [ ! -d ".next" ]; then
    error "Build failed! .next folder not created."
    exit 1
fi

if [ ! -d ".next/static" ]; then
    error "Build incomplete! .next/static folder missing."
    exit 1
fi

log "Build completed successfully"

# Step 9: Fix permissions
log "Step 9: Fixing permissions..."
chown -R hs6tools:hs6tools .next 2>/dev/null || chown -R $(whoami):$(whoami) .next
chmod -R 755 .next

# Step 10: Test application startup
log "Step 10: Testing application startup..."
info "Starting application in test mode..."

# Start in background and capture output
timeout 15 npm start > /tmp/hs6tools-test.log 2>&1 &
TEST_PID=$!
sleep 10

# Check if process is still running
if ps -p $TEST_PID > /dev/null; then
    log "Application started successfully in test mode"
    # Test if it responds
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        log "Application is responding on localhost:3000"
    else
        warning "Application started but not responding"
    fi
    # Kill test process
    kill $TEST_PID 2>/dev/null || true
    wait $TEST_PID 2>/dev/null || true
else
    error "Application failed to start!"
    info "Check the logs:"
    cat /tmp/hs6tools-test.log
    exit 1
fi

# Step 11: Start with PM2
log "Step 11: Starting with PM2..."
pm2 delete hs6tools || true
pm2 start ecosystem.config.js --env production
sleep 3

# Step 12: Check PM2 status
log "Step 12: Checking PM2 status..."
pm2 status

# Check if application is running
if pm2 describe hs6tools | grep -q "online"; then
    log "✅ Application is running in PM2"
else
    error "❌ Application failed to start in PM2"
    info "Check logs: pm2 logs hs6tools --lines 50"
    exit 1
fi

# Step 13: Test connection
log "Step 13: Testing connection..."
sleep 5
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
    log "✅ Application is responding correctly"
else
    warning "⚠️ Application might not be responding correctly"
    info "Response: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)"
fi

# Step 14: Save PM2 configuration
log "Step 14: Saving PM2 configuration..."
pm2 save

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Recovery process completed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
info "Next steps:"
echo "  1. Check PM2 status: pm2 status"
echo "  2. Monitor logs: pm2 logs hs6tools --lines 50"
echo "  3. Test website: curl http://localhost:3000"
echo "  4. Check Nginx: systemctl status nginx"
echo ""

