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

# 3) Ensure we have a source env and copy to .env
if [ -f ".env.production" ]; then
  cp .env.production .env
  log "Copied .env.production to .env"
elif [ -f ".env.local" ]; then
  cp .env.local .env
  log "Copied .env.local to .env"
else
  warn "No .env.production or .env.local found. Creating .env.production from template..."
  cat > .env.production <<'EOF'
# Production Environment Configuration for HS6Tools

# Database Configuration
DATABASE_URL="postgresql://hs6tools:hs6tools_password@localhost:5432/hs6tools_prod"

# NextAuth.js Configuration
NEXTAUTH_URL="https://hs6tools.com"
NEXTAUTH_SECRET="hs6tools_production_secret_key_2025_secure_random_string"

# ZarinPal Payment Gateway (Production)
ZARINPAL_MERCHANT_ID="34f387ef-3ba2-41ba-85ee-c86813806726"
ZARINPAL_SANDBOX="false"

# File Upload Configuration
MAX_FILE_SIZE="10485760"
UPLOAD_DIR="/var/www/hs6tools/public/uploads"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="noreply@hs6tools.com"
SMTP_PASS="your-app-password"

# Redis Configuration (for caching)
REDIS_URL="redis://localhost:6379"

# Google Analytics
NEXT_PUBLIC_GA_ID="your-ga-id"

# App Configuration
NEXT_PUBLIC_APP_NAME="HS6Tools"
NEXT_PUBLIC_APP_URL="https://hs6tools.com"
NEXT_PUBLIC_SUPPORT_EMAIL="support@hs6tools.com"

# Kavehnegar SMS Service (Production)
KAVENEGAR_API_KEY="566555476F46314A72326D365563685134615464536C785744572F775A4463484B6469334E6E6F6B4D2F453D"
KAVENEGAR_SENDER="2000660110"

# Production Settings
NODE_ENV="production"
NEXT_TELEMETRY_DISABLED="1"
EOF
  log "Created .env.production from template; copying to .env"
  cp .env.production .env
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
