#!/bin/bash

# Sync environment file and restart PM2 with updated vars
# Safe to run on the server. Backs up .env first and only copies if a source exists.

set -e

APP_NAME="hs6tools"
APP_DIR="$(pwd)"

log() { echo "[sync-env] $1"; }
warn() { echo "[sync-env][WARN] $1"; }
err()  { echo "[sync-env][ERROR] $1"; exit 1; }

# 1) Sanity checks
[ -f "package.json" ] || err "Run this script from the project root (package.json not found)"

# 2) Backup current .env
if [ -f ".env" ]; then
  BACKUP=".env.backup-$(date +'%Y%m%d-%H%M%S')"
  cp .env "$BACKUP"
  log "Backed up existing .env to $BACKUP"
fi

# 3) Copy env from available source
if [ -f ".env.production" ]; then
  cp .env.production .env
  log "Copied .env.production to .env"
elif [ -f ".env.local" ]; then
  cp .env.local .env
  log "Copied .env.local to .env"
else
  warn "No .env.production or .env.local found. Skipping env copy."
fi

# 4) Update ecosystem.config.js to load .env (with fallback parser)
log "Generating ecosystem.config.js to load .env..."
cat > ecosystem.config.js << 'EOF'
// Load env from .env (dotenv if available, fallback to manual parser)
try {
  require('dotenv').config({ path: require('path').join(__dirname, '.env') });
} catch (e) {
  console.warn('[ecosystem] dotenv not available, using manual parse + process.env');
}

const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env');
let envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#') && line.includes('=')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      if (key && value !== undefined) envVars[key.trim()] = value.trim();
    }
  });
}

const finalEnv = { ...envVars, ...process.env };

module.exports = {
  apps: [{
    name: 'hs6tools',
    script: 'npm',
    args: 'start',
    cwd: __dirname,
    instances: 1,
    exec_mode: 'fork',
    env: finalEnv,
    env_production: finalEnv,
    error_file: '/var/log/pm2/hs6tools-error.log',
    out_file: '/var/log/pm2/hs6tools-out.log',
    log_file: '/var/log/pm2/hs6tools-combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};
EOF

# 5) Restart PM2 cleanly with new config
log "Restarting PM2 app '${APP_NAME}' with updated env..."
pm2 delete "${APP_NAME}" >/dev/null 2>&1 || true
pm2 start ecosystem.config.js --env production
pm2 save

# 6) Verify critical envs in PM2
log "Verifying critical env vars in PM2..."
pm2 env "${APP_NAME}" 2>/dev/null | grep -Ei "KAVENEGAR|ZARINPAL|NEXTAUTH|DATABASE_URL" || warn "Env vars not visible via pm2 env (check manually)"

log "Done. If values still missing, ensure .env has correct keys and rerun."
