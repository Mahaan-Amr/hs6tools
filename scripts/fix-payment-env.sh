#!/bin/bash

# Fix Payment Environment Variables Script
# This script ensures ZarinPal merchant ID is properly loaded in PM2

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ ERROR: $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  WARNING: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ️  INFO: $1${NC}"
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Fixing Payment Environment Variables"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    error "package.json not found. Please run this script from the project root directory."
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    error ".env.production file not found!"
fi

info "Checking .env.production for ZARINPAL_MERCHANT_ID..."
if grep -q "ZARINPAL_MERCHANT_ID=" .env.production; then
    MERCHANT_ID=$(grep "ZARINPAL_MERCHANT_ID=" .env.production | cut -d'=' -f2 | tr -d '"' | tr -d "'")
    log "Found ZARINPAL_MERCHANT_ID in .env.production: ${MERCHANT_ID:0:8}..."
else
    error "ZARINPAL_MERCHANT_ID not found in .env.production!"
fi

# Copy .env.production to .env
info "Copying .env.production to .env..."
cp .env.production .env
log ".env updated from .env.production"

# Check if PM2 is available
if ! command -v pm2 &> /dev/null; then
    warning "PM2 is not installed. Please install PM2 first: npm install -g pm2"
    exit 1
fi

# Check if app is running in PM2
if ! pm2 describe hs6tools &> /dev/null; then
    warning "hs6tools app is not running in PM2"
    info "Starting app with PM2..."
    pm2 start ecosystem.config.js --env production
    pm2 save
    log "App started with PM2"
else
    info "Restarting PM2 app with updated environment..."
    
    # Delete and restart to ensure fresh environment
    pm2 delete hs6tools 2>/dev/null || true
    sleep 2
    
    pm2 start ecosystem.config.js --env production
    pm2 save
    
    log "PM2 app restarted with updated environment"
fi

# Wait for app to start
info "Waiting for app to start..."
sleep 5

# Verify environment variables are loaded
info "Verifying environment variables in PM2..."
PM2_ENV=$(pm2 env hs6tools 2>/dev/null || echo "")

if echo "$PM2_ENV" | grep -q "ZARINPAL_MERCHANT_ID"; then
    log "✅ ZARINPAL_MERCHANT_ID is loaded in PM2"
else
    warning "⚠️  ZARINPAL_MERCHANT_ID not found in PM2 environment"
    info "You may need to check ecosystem.config.js"
fi

# Check app status
info "Checking app status..."
pm2 status hs6tools

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Environment Fix Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
info "Next steps:"
echo "  1. Test payment: Try to make a purchase on the website"
echo "  2. Check logs: pm2 logs hs6tools"
echo "  3. If still not working, check PaymentSettings in database:"
echo "     psql -U hs6tools -d hs6tools_prod -c 'SELECT * FROM payment_settings;'"
echo ""
log "🎉 Done!"

