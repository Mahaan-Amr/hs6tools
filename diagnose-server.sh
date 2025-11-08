#!/bin/bash

# Comprehensive Server Diagnostic Script
# This script checks all aspects of the server to identify issues

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

section() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

APP_DIR="/var/www/hs6tools"

section "🔍 HS6Tools Server Diagnostic"

# Step 1: Check PM2 Status
section "1. PM2 Status"
pm2 status
echo ""

# Check restart count
RESTART_COUNT=$(pm2 jlist | grep -o '"restart_time":[0-9]*' | head -1 | cut -d':' -f2)
if [ "$RESTART_COUNT" -gt 10 ]; then
    error "HIGH RESTART COUNT DETECTED: $RESTART_COUNT restarts - Application is crashing!"
fi

# Step 2: Check PM2 Logs
section "2. Recent PM2 Error Logs (Last 50 lines)"
pm2 logs hs6tools --err --lines 50 --nostream
echo ""

# Step 3: Check PM2 Output Logs
section "3. Recent PM2 Output Logs (Last 30 lines)"
pm2 logs hs6tools --out --lines 30 --nostream
echo ""

# Step 4: Check if application is listening on port 3000
section "4. Port 3000 Status"
if netstat -tuln | grep -q ":3000"; then
    log "Port 3000 is in use"
    netstat -tuln | grep ":3000"
else
    error "Port 3000 is NOT in use - Application is not running!"
fi
echo ""

# Step 5: Test localhost connection
section "5. Testing Localhost Connection"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
    log "Application responds on localhost:3000"
    curl -I http://localhost:3000 2>&1 | head -10
else
    error "Application does NOT respond on localhost:3000"
    info "Response code: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>&1)"
fi
echo ""

# Step 6: Check build output
section "6. Build Output Check"
cd "${APP_DIR}" || exit 1

if [ -d ".next" ]; then
    log ".next folder exists"
    if [ -d ".next/static" ]; then
        log ".next/static folder exists"
        info "Static files count: $(find .next/static -type f | wc -l)"
    else
        error ".next/static folder is MISSING!"
    fi
    
    if [ -f ".next/BUILD_ID" ]; then
        log "Build ID exists: $(cat .next/BUILD_ID)"
    else
        warning "Build ID file is missing"
    fi
else
    error ".next folder is MISSING - Build not found!"
fi
echo ""

# Step 7: Check environment variables
section "7. Environment Variables"
if [ -f ".env" ]; then
    log ".env file exists"
    info "Checking critical variables..."
    if grep -q "DATABASE_URL" .env; then
        log "DATABASE_URL is set"
    else
        error "DATABASE_URL is MISSING!"
    fi
    
    if grep -q "NEXTAUTH_SECRET" .env; then
        log "NEXTAUTH_SECRET is set"
    else
        error "NEXTAUTH_SECRET is MISSING!"
    fi
else
    error ".env file is MISSING!"
fi
echo ""

# Step 8: Check database connection
section "8. Database Connection"
if command -v psql &> /dev/null; then
    if PGPASSWORD=hs6tools_password psql -h localhost -U hs6tools -d hs6tools_prod -c "SELECT 1;" &> /dev/null; then
        log "Database connection successful"
    else
        error "Database connection FAILED!"
        info "Trying to connect..."
        PGPASSWORD=hs6tools_password psql -h localhost -U hs6tools -d hs6tools_prod -c "SELECT 1;" 2>&1 || true
    fi
else
    warning "psql not found, skipping database check"
fi
echo ""

# Step 9: Check Nginx status
section "9. Nginx Status"
if systemctl is-active --quiet nginx; then
    log "Nginx is running"
else
    error "Nginx is NOT running!"
fi

info "Checking Nginx error logs..."
tail -20 /var/log/nginx/error.log 2>&1 | head -20
echo ""

# Step 10: Check Nginx configuration
section "10. Nginx Configuration Test"
if nginx -t 2>&1; then
    log "Nginx configuration is valid"
else
    error "Nginx configuration has ERRORS!"
fi
echo ""

# Step 11: Check disk space
section "11. Disk Space"
df -h / | tail -1
echo ""

# Step 12: Check memory
section "12. Memory Usage"
free -h
echo ""

# Step 13: Check Node.js and npm versions
section "13. Node.js Environment"
info "Node.js version: $(node -v)"
info "npm version: $(npm -v)"
echo ""

# Step 14: Check if process is actually running
section "14. Process Check"
ps aux | grep -E "node|next" | grep -v grep || warning "No Node.js processes found"
echo ""

# Step 15: Try to manually start the application
section "15. Manual Application Test"
info "Stopping PM2 to test manual start..."
pm2 stop hs6tools 2>&1 || true
sleep 2

info "Trying to start application manually..."
cd "${APP_DIR}"
timeout 10 npm start 2>&1 || error "Application failed to start or timed out"
echo ""

# Restart PM2
info "Restarting PM2..."
pm2 restart hs6tools 2>&1 || pm2 start ecosystem.config.js --env production

section "📊 Diagnostic Summary"
echo "Check the errors above to identify the issue."
echo ""
info "Most common issues:"
echo "  1. Application crashing on startup (check PM2 error logs)"
echo "  2. Missing environment variables"
echo "  3. Database connection issues"
echo "  4. Port 3000 not available"
echo "  5. Build errors or missing .next folder"
echo ""
info "Next steps:"
echo "  1. Review PM2 error logs: pm2 logs hs6tools --err --lines 100"
echo "  2. Check application logs: pm2 logs hs6tools --lines 100"
echo "  3. Test database: psql -h localhost -U hs6tools -d hs6tools_prod"
echo "  4. Rebuild application: npm run build"
echo ""

