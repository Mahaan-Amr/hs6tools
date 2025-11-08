#!/bin/bash

# Fix Build and Cache Issues
# Rebuilds the application and ensures all static files are generated correctly

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
echo "🔧 Fixing Build and Cache Issues"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "${APP_DIR}" || exit 1

# Step 1: Stop PM2
log "Step 1: Stopping PM2..."
pm2 stop hs6tools || true
sleep 2

# Step 2: Clean build artifacts
log "Step 2: Cleaning build artifacts..."
info "Removing .next directory..."
rm -rf .next
info "Cleaning npm cache..."
npm cache clean --force || true
info "Removing node_modules/.cache..."
rm -rf node_modules/.cache || true
log "Cleanup complete"

# Step 3: Verify dependencies
log "Step 3: Verifying dependencies..."
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    warning "Dependencies might be missing. Installing..."
    npm install
else
    info "Dependencies appear to be installed"
fi

# Step 4: Generate Prisma client
log "Step 4: Generating Prisma client..."
npx prisma generate || warning "Prisma generate had issues, but continuing..."

# Step 5: Rebuild application
log "Step 5: Rebuilding application..."
info "This may take a few minutes..."
if npm run build; then
    log "Build completed successfully"
else
    error "Build failed! Check the error messages above."
    exit 1
fi

# Step 6: Verify build output
log "Step 6: Verifying build output..."
if [ ! -d ".next" ]; then
    error ".next folder not created!"
    exit 1
fi

if [ ! -d ".next/static" ]; then
    error ".next/static folder not created!"
    exit 1
fi

if [ ! -d ".next/static/chunks" ]; then
    error ".next/static/chunks folder not created!"
    exit 1
fi

STATIC_COUNT=$(find .next/static -type f | wc -l)
log "Build verified: $STATIC_COUNT static files generated"

# List some key files
info "Sample static files:"
find .next/static/chunks -name "*.js" | head -5
find .next/static/css -name "*.css" | head -3

# Step 7: Fix permissions
log "Step 7: Fixing permissions..."
chown -R hs6tools:hs6tools .next 2>/dev/null || chown -R $(whoami):$(whoami) .next
chmod -R 755 .next
log "Permissions fixed"

# Step 8: Restart PM2
log "Step 8: Restarting PM2..."
pm2 restart hs6tools || pm2 start ecosystem.config.js --env production
sleep 5

# Step 9: Verify application
log "Step 9: Verifying application..."
if pm2 describe hs6tools | grep -q "online"; then
    log "Application is running"
else
    error "Application failed to start!"
    pm2 logs hs6tools --lines 20
    exit 1
fi

# Step 10: Test endpoints
log "Step 10: Testing endpoints..."
sleep 3

# Test root
ROOT_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>&1)
info "Root endpoint: HTTP $ROOT_CODE"

# Test /fa
FA_CODE=$(curl -s -o /dev/null -w "%{http_code}" -L http://localhost:3000/fa 2>&1)
info "/fa endpoint: HTTP $FA_CODE"

# Test static file
STATIC_FILE=$(find .next/static/chunks -name "*.js" | head -1)
if [ -n "$STATIC_FILE" ]; then
    RELATIVE_PATH="/_next/static${STATIC_FILE#.next/static}"
    info "Testing static file: $RELATIVE_PATH"
    STATIC_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$RELATIVE_PATH" 2>&1)
    info "Static file response: HTTP $STATIC_CODE"
fi

# Step 11: Clear Nginx cache (if any)
log "Step 11: Reloading Nginx..."
systemctl reload nginx || systemctl restart nginx
log "Nginx reloaded"

# Step 12: Save PM2
log "Step 12: Saving PM2 configuration..."
pm2 save

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Build fix completed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
info "Next steps:"
echo "  1. Clear your browser cache (Ctrl+Shift+Delete)"
echo "  2. Try accessing: http://hs6tools.com/fa"
echo "  3. Check browser console (F12) for any errors"
echo "  4. If issues persist, check:"
echo "     - pm2 logs hs6tools --lines 50"
echo "     - tail -f /var/log/nginx/error.log"
echo ""

