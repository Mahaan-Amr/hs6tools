#!/bin/bash

# Fix PM2 Cluster Mode Issue
# Next.js doesn't work well with PM2 cluster mode - use fork mode instead

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

APP_DIR="/var/www/hs6tools"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Fixing PM2 Configuration (Cluster → Fork Mode)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "${APP_DIR}" || exit 1

# Step 1: Stop PM2
log "Step 1: Stopping PM2..."
pm2 stop hs6tools || true
pm2 delete hs6tools || true
sleep 2

# Step 2: Kill any hanging processes
log "Step 2: Cleaning up processes..."
pkill -f "next start" || true
pkill -f "next-server" || true
sleep 2

# Step 3: Update ecosystem.config.js to use fork mode
log "Step 3: Updating PM2 configuration to fork mode..."

cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'hs6tools',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/hs6tools',
    instances: 1,  // Single instance - Next.js handles clustering internally
    exec_mode: 'fork',  // Fork mode instead of cluster
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
    node_args: '--max-old-space-size=1024',
    // Auto-restart with exponential backoff
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};
EOF

log "PM2 configuration updated"

# Step 4: Start with new configuration
log "Step 4: Starting application with fork mode..."
pm2 start ecosystem.config.js --env production
sleep 5

# Step 5: Check status
log "Step 5: Checking PM2 status..."
pm2 status

# Step 6: Wait and check if it's stable
log "Step 6: Waiting 10 seconds to check stability..."
sleep 10

pm2 status

# Check restart count
RESTART_COUNT=$(pm2 jlist | grep -o '"restart_time":[0-9]*' | head -1 | cut -d':' -f2)
if [ "$RESTART_COUNT" -gt 5 ]; then
    error "Application still restarting. Check logs: pm2 logs hs6tools --lines 50"
else
    log "Application appears stable (restart count: $RESTART_COUNT)"
fi

# Step 7: Test connection
log "Step 7: Testing application connection..."
sleep 3

# Test with redirect following
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -L http://localhost:3000/fa 2>&1)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    log "✅ Application is responding (HTTP $HTTP_CODE)"
else
    info "Response code: $HTTP_CODE"
    info "Testing without redirect..."
    curl -I http://localhost:3000 2>&1 | head -5
fi

# Step 8: Save PM2 configuration
log "Step 8: Saving PM2 configuration..."
pm2 save

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "PM2 configuration fixed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
info "Monitor the application:"
echo "  pm2 status"
echo "  pm2 logs hs6tools --lines 50"
echo "  pm2 monit"
echo ""
info "If it's still restarting, check:"
echo "  pm2 logs hs6tools --err --lines 100"
echo "  pm2 logs hs6tools --out --lines 100"
echo ""

