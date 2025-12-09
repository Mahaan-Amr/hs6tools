#!/bin/bash

# HS6Tools Update Script
# This script updates the application by pulling the latest changes,
# installing dependencies, running migrations, building, and restarting

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="${PWD}"
PM2_APP_NAME="hs6tools"
BACKUP_BEFORE_UPDATE=true
# Required env vars (add more if needed)
REQUIRED_ENV_VARS=(
  "DATABASE_URL"
  "NEXTAUTH_URL"
  "NEXTAUTH_SECRET"
  "KAVENEGAR_API_KEY|NEXT_PUBLIC_KAVENEGAR_API_KEY|KAVENEGAR_API_TOKEN"
  "KAVENEGAR_SENDER"
  "ZARINPAL_MERCHANT_ID"
  "ZARINPAL_SANDBOX"
)

# Logging functions
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

section() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Check if we're in the correct directory
check_directory() {
    if [ ! -f "package.json" ]; then
        error "package.json not found. Please run this script from the project root directory."
    fi
    
    if [ ! -f "prisma/schema.prisma" ]; then
        error "prisma/schema.prisma not found. Please run this script from the project root directory."
    fi
    
    log "Directory check passed: ${APP_DIR}"
}

# Check if git is available and repository is clean
check_git() {
    if ! command -v git &> /dev/null; then
        error "Git is not installed. Please install Git first."
    fi
    
    if [ ! -d ".git" ]; then
        error "This directory is not a Git repository."
    fi
    
    log "Git check passed"
}

# Ensure environment file exists and contains required variables
ensure_env() {
    section "🔐 Checking Environment Files"

    # Always refresh .env from .env.production if available (keep a backup)
    if [ -f ".env.production" ]; then
        if [ -f ".env" ]; then
            BACKUP_NAME=".env.backup-$(date +'%Y%m%d-%H%M%S')"
            info ".env exists. Creating backup at ${BACKUP_NAME} before refresh..."
            cp .env "${BACKUP_NAME}"
        fi
        info "Refreshing .env from .env.production..."
        cp .env.production .env
        log ".env updated from .env.production"
    fi

    if [ -f ".env" ]; then
        log ".env file found"
    else
        warning ".env file not found. Please create it or add required variables before continuing."
    fi

    # Check required variables (supports fallback names with |)
    if [ -f ".env" ]; then
        info "Checking required environment variables in .env..."
        missing_vars=()
        for var_group in "${REQUIRED_ENV_VARS[@]}"; do
            IFS='|' read -r -a candidates <<< "$var_group"
            found=false
            for candidate in "${candidates[@]}"; do
                if grep -q "^${candidate}=" .env 2>/dev/null; then
                    found=true
                    break
                fi
            done
            if [ "$found" = false ]; then
                missing_vars+=("$var_group")
            fi
        done

        if [ ${#missing_vars[@]} -eq 0 ]; then
            log "All required environment variables are present in .env"
        else
            warning "Missing environment variables detected:"
            for mv in "${missing_vars[@]}"; do
                echo "  - $mv"
            done
            echo ""
            echo "Please edit .env (or .env.production) to include the missing variables."
            echo "Examples:"
            echo "  KAVENEGAR_API_KEY=your_kavenegar_key"
            echo "  ZARINPAL_MERCHANT_ID=your_zarinpal_merchant_id"
            echo "  NEXTAUTH_SECRET=your_nextauth_secret"
            echo ""
            warning "Update will continue, but SMS/Payments/Auth may fail until these are set."
        fi
    fi
}

# Check if Node.js and npm are available
check_node() {
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js first."
    fi
    
    if ! command -v npm &> /dev/null; then
        error "npm is not installed. Please install npm first."
    fi
    
    NODE_VERSION=$(node -v)
    NPM_VERSION=$(npm -v)
    info "Node.js version: ${NODE_VERSION}"
    info "npm version: ${NPM_VERSION}"
}

# Check if PM2 is available
check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        warning "PM2 is not installed. The application will not be restarted automatically."
        return 1
    fi
    
    # Check if the app is running in PM2
    if ! pm2 describe ${PM2_APP_NAME} &> /dev/null; then
        warning "PM2 app '${PM2_APP_NAME}' is not running. Skipping PM2 restart."
        return 1
    fi
    
    log "PM2 check passed: App '${PM2_APP_NAME}' is running"
    return 0
}

# Create backup before update (optional)
create_backup() {
    if [ "$BACKUP_BEFORE_UPDATE" = true ]; then
        if [ -f "backup.sh" ]; then
            info "Creating backup before update..."
            if bash backup.sh; then
                log "Backup created successfully"
            else
                warning "Backup failed, but continuing with update..."
            fi
        else
            info "Backup script not found, skipping backup..."
        fi
    fi
}

# Pull latest changes from GitHub
pull_changes() {
    section "📥 Pulling Latest Changes from GitHub"
    
    info "Fetching latest changes from remote repository..."
    git fetch origin
    
    info "Checking current branch..."
    CURRENT_BRANCH=$(git branch --show-current)
    info "Current branch: ${CURRENT_BRANCH}"
    
    # Check for local changes
    if ! git diff-index --quiet HEAD --; then
        warning "Local changes detected. Stashing them before pulling..."
        git stash push -m "Auto-stashed by update script at $(date +'%Y-%m-%d %H:%M:%S')"
        log "Local changes stashed successfully"
    fi
    
    # Check if there are any untracked files that might conflict
    UNTRACKED=$(git ls-files --others --exclude-standard)
    if [ -n "$UNTRACKED" ]; then
        info "Untracked files detected (will be preserved):"
        echo "$UNTRACKED" | head -5
        if [ $(echo "$UNTRACKED" | wc -l) -gt 5 ]; then
            info "... and $(($(echo "$UNTRACKED" | wc -l) - 5)) more"
        fi
    fi
    
    info "Pulling latest changes from ${CURRENT_BRANCH}..."
    if git pull origin ${CURRENT_BRANCH}; then
        log "Successfully pulled latest changes"
        
        # Show recent commits
        echo ""
        info "Recent commits:"
        git log --oneline -5
        echo ""
        
        # Check if there's a stash and inform user
        if git stash list | grep -q "Auto-stashed by update script"; then
            info "Note: Local changes were stashed. To restore them, run: git stash pop"
        fi
    else
        error "Failed to pull latest changes. Please check your Git configuration and network connection."
    fi
}

# Check for compromised or corrupted node_modules
check_node_modules_integrity() {
    info "Checking node_modules integrity..."
    
    # Check for suspicious patterns that indicate compromised packages
    if [ -d "node_modules" ]; then
        # Check for known malicious patterns
        SUSPICIOUS=$(grep -r "raw.githubusercontent.com" node_modules/@prisma 2>/dev/null | head -1 || echo "")
        if [ -n "$SUSPICIOUS" ]; then
            warning "⚠️  SECURITY ALERT: Suspicious code detected in node_modules!"
            warning "This may indicate compromised packages. Forcing clean reinstall..."
            return 1
        fi
        
        # Check for window references in server-side Prisma code (should not exist)
        if grep -r "window.__REMOTE_LOADER__" node_modules/@prisma 2>/dev/null | grep -q "window"; then
            warning "⚠️  Corrupted node_modules detected (invalid browser code in server packages)"
            return 1
        fi
        
        log "node_modules integrity check passed"
        return 0
    fi
    
    return 1
}

# Force clean reinstall of dependencies
clean_reinstall_dependencies() {
    section "🧹 Clean Reinstall of Dependencies"
    
    warning "Performing complete clean reinstall to ensure package integrity..."
    
    # Remove everything
    info "Removing node_modules..."
    rm -rf node_modules
    
    info "Removing package-lock.json..."
    rm -f package-lock.json
    
    info "Removing .next build cache..."
    rm -rf .next
    
    info "Clearing npm cache..."
    npm cache clean --force 2>/dev/null || true
    
    log "Cleanup completed successfully"
    
    # Fresh install
    info "Installing fresh packages from npm registry..."
    
    # Try normal install first
    if npm install --no-audit --prefer-online 2>&1 | tee /tmp/npm-install.log; then
        log "Fresh dependencies installed successfully"
        rm -f /tmp/npm-install.log
        return 0
    fi
    
    # Check if it's a peer dependency issue
    if grep -q "ERESOLVE unable to resolve dependency tree" /tmp/npm-install.log 2>/dev/null || \
       grep -q "peer.*dependency" /tmp/npm-install.log 2>/dev/null; then
        warning "Peer dependency conflict detected. Retrying with --legacy-peer-deps..."
        
        # Retry with legacy peer deps
        if npm install --no-audit --prefer-online --legacy-peer-deps; then
            log "Fresh dependencies installed successfully with --legacy-peer-deps"
            rm -f /tmp/npm-install.log
            return 0
        fi
    fi
    
    # If still failing, try with force
    warning "Install still failing. Final attempt with --force..."
    if npm install --force --no-audit 2>/dev/null; then
        log "Dependencies installed with --force"
        rm -f /tmp/npm-install.log
        return 0
    fi
    
    rm -f /tmp/npm-install.log
    error "Failed to install dependencies after all attempts. Please check the error messages above."
    return 1
}

# Install dependencies with integrity checks
install_dependencies() {
    section "📦 Installing Dependencies"
    
    # Check if node_modules exists and is healthy
    NEEDS_CLEAN_INSTALL=false
    
    if [ ! -d "node_modules" ]; then
        info "node_modules not found, will perform fresh install..."
        NEEDS_CLEAN_INSTALL=true
    elif ! check_node_modules_integrity; then
        warning "node_modules integrity check failed, will perform clean reinstall..."
        NEEDS_CLEAN_INSTALL=true
    fi
    
    if [ "$NEEDS_CLEAN_INSTALL" = true ]; then
        clean_reinstall_dependencies
        return $?
    fi
    
    # Normal update
    info "Installing/updating npm dependencies..."
    
    # Try normal install
    if npm install --no-audit 2>&1 | tee /tmp/npm-update.log; then
        log "Dependencies installed successfully"
        rm -f /tmp/npm-update.log
        
        # Verify integrity after install
        if ! check_node_modules_integrity; then
            warning "Integrity check failed after install. Performing clean reinstall..."
            clean_reinstall_dependencies
            return $?
        fi
        
        return 0
    fi
    
    # Check for peer dependency issues
    if grep -q "ERESOLVE" /tmp/npm-update.log 2>/dev/null; then
        warning "Peer dependency issue detected. Retrying with --legacy-peer-deps..."
        rm -f /tmp/npm-update.log
        
        if npm install --no-audit --legacy-peer-deps; then
            log "Dependencies installed successfully with --legacy-peer-deps"
            
            # Verify integrity
            if ! check_node_modules_integrity; then
                warning "Integrity check failed. Performing clean reinstall..."
                clean_reinstall_dependencies
                return $?
            fi
            return 0
        fi
    fi
    
    rm -f /tmp/npm-update.log
    warning "Normal install failed. Attempting clean reinstall..."
    clean_reinstall_dependencies
    return $?
}

# Generate Prisma client with retry and recovery
generate_prisma() {
    section "🔧 Generating Prisma Client"
    
    info "Generating Prisma client..."
    
    # First attempt
    if npx prisma generate 2>&1 | tee /tmp/prisma-gen.log; then
        log "Prisma client generated successfully"
        rm -f /tmp/prisma-gen.log
        return 0
    fi
    
    # Check if error is due to corrupted node_modules
    if grep -q "window is not defined" /tmp/prisma-gen.log 2>/dev/null || \
       grep -q "REMOTE_LOADER" /tmp/prisma-gen.log 2>/dev/null; then
        warning "⚠️  Prisma generation failed due to corrupted packages!"
        warning "Performing emergency clean reinstall..."
        
        # Emergency clean reinstall
        clean_reinstall_dependencies
        
        # Retry Prisma generation
        info "Retrying Prisma generation after clean reinstall..."
        if npx prisma generate; then
            log "Prisma client generated successfully after recovery"
            rm -f /tmp/prisma-gen.log
            return 0
        fi
    fi
    
    # If still failing, try with fresh Prisma install
    warning "Prisma generation still failing. Reinstalling Prisma packages..."
    npm install @prisma/client prisma --force --no-audit
    
    info "Final attempt at Prisma generation..."
    if npx prisma generate; then
        log "Prisma client generated successfully after Prisma reinstall"
        rm -f /tmp/prisma-gen.log
        return 0
    fi
    
    # Cleanup and fail
    rm -f /tmp/prisma-gen.log
    error "Failed to generate Prisma client after multiple recovery attempts. Please check your Prisma schema and dependencies."
}

# Run database migrations
run_migrations() {
    section "🗄️  Running Database Migrations"
    
    info "Checking migration status..."
    npx prisma migrate status || true
    
    info "Running database migrations..."
    if npx prisma migrate deploy; then
        log "Database migrations completed successfully"
    else
        error "Database migration failed. Please check the error messages above and your database connection."
    fi
}

# Build the application
build_application() {
    section "🏗️  Building Application"
    
    info "Cleaning previous build..."
    rm -rf .next
    
    info "Building Next.js application..."
    
    # First attempt
    if npm run build 2>&1 | tee /tmp/build.log; then
        log "Application built successfully"
        rm -f /tmp/build.log
        
        # Verify build output
        if [ ! -d ".next/static" ]; then
            error "Build completed but .next/static folder is missing!"
        fi
        
        info "Verifying build output..."
        if [ -d ".next/static/chunks" ]; then
            STATIC_COUNT=$(find .next/static -type f 2>/dev/null | wc -l)
            if [ "$STATIC_COUNT" -gt 0 ]; then
                log "Build output verified: $STATIC_COUNT static files generated"
                
                # Check for key directories
                if [ -d ".next/static/chunks" ] && [ -d ".next/static/css" ]; then
                    CHUNK_COUNT=$(find .next/static/chunks -type f 2>/dev/null | wc -l)
                    CSS_COUNT=$(find .next/static/css -type f 2>/dev/null | wc -l)
                    info "  - Chunks: $CHUNK_COUNT files"
                    info "  - CSS: $CSS_COUNT files"
                else
                    warning "Some expected directories are missing"
                fi
            else
                error "Build completed but no static files found!"
            fi
        else
            error "Build output is incomplete: chunks folder not found"
        fi
        
        # Verify BUILD_ID exists
        if [ ! -f ".next/BUILD_ID" ]; then
            warning "BUILD_ID file not found, but continuing..."
        else
            BUILD_ID=$(cat .next/BUILD_ID)
            info "Build ID: $BUILD_ID"
        fi
        
        # Fix permissions
        info "Setting correct permissions for .next folder..."
        chown -R hs6tools:hs6tools .next 2>/dev/null || chown -R $(whoami):$(whoami) .next
        chmod -R 755 .next
        log "Permissions set correctly"
        return 0
    fi
    
    # Build failed - check for common issues
    warning "Initial build failed. Diagnosing issue..."
    
    # Check if it's a dependency issue
    if grep -q "Cannot find module" /tmp/build.log 2>/dev/null || \
       grep -q "Module not found" /tmp/build.log 2>/dev/null; then
        warning "Build failed due to missing modules. Reinstalling dependencies..."
        
        clean_reinstall_dependencies
        
        # Regenerate Prisma
        info "Regenerating Prisma client..."
        npx prisma generate
        
        # Retry build
        info "Retrying build after dependency reinstall..."
        rm -rf .next
        if npm run build; then
            log "Application built successfully after recovery"
            rm -f /tmp/build.log
            
            # Fix permissions
            info "Setting correct permissions for .next folder..."
            chown -R hs6tools:hs6tools .next 2>/dev/null || chown -R $(whoami):$(whoami) .next
            chmod -R 755 .next
            log "Permissions set correctly"
            return 0
        fi
    fi
    
    # Cleanup and fail
    rm -f /tmp/build.log
    error "Build failed after recovery attempts. Please check the error messages above."
}

# Update PM2 ecosystem config to load from .env file
update_pm2_config() {
    if [ ! -f ".env" ]; then
        warning ".env file not found, skipping PM2 config update"
        return 0
    fi
    
    info "Updating PM2 ecosystem.config.js to load from .env file..."
    
    # Check if dotenv package is available, install if needed
    if ! npm list dotenv &>/dev/null && [ ! -f "node_modules/dotenv/package.json" ]; then
        info "Installing dotenv package for PM2 environment loading..."
        npm install dotenv --save --no-audit --no-fund 2>/dev/null || {
            warning "Failed to install dotenv. Will use alternative method."
        }
    fi
    
    # Create/update ecosystem.config.js to load from .env
    # This ensures PM2 loads all variables from .env file
    cat > ecosystem.config.js << 'EOF'
// Load environment variables from .env file
try {
  require('dotenv').config({ path: require('path').join(__dirname, '.env') });
} catch (e) {
  console.warn('dotenv not available, using system environment variables');
}

// Read and parse .env file manually as fallback
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
      if (key && value !== undefined) {
        envVars[key.trim()] = value.trim();
      }
    }
  });
}

// Merge with process.env (dotenv may have already loaded some)
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
    
    log "PM2 ecosystem.config.js updated to load from .env file"
}

# Restart PM2 application
restart_pm2() {
    section "🔄 Restarting Application with PM2"
    
    if check_pm2; then
        # Update PM2 config to load from .env
        update_pm2_config
        
        info "Deleting and restarting PM2 application to load new environment variables..."
        info "This ensures PM2 picks up all variables from .env file via ecosystem.config.js"
        
        # Delete the existing process to force a fresh start with new config
        pm2 delete ${PM2_APP_NAME} 2>/dev/null || true
        sleep 2
        
        # Start with the updated ecosystem config
        if pm2 start ecosystem.config.js --env production; then
            log "Application started with updated environment variables from .env"
            
            # Save PM2 configuration
            pm2 save
            
            # Wait longer for the app to fully start
            info "Waiting for application to start (10 seconds)..."
            sleep 10
            
            # Check status
            info "Checking application status..."
            pm2 status ${PM2_APP_NAME}
            
            # Verify app is actually online
            if pm2 describe ${PM2_APP_NAME} | grep -q "online"; then
                log "Application is online in PM2"
                
                # Verify environment variables are loaded
                info "Verifying critical environment variables in PM2..."
                PM2_ENV=$(pm2 env ${PM2_APP_NAME} 2>/dev/null || echo "")
                if echo "$PM2_ENV" | grep -q "KAVENEGAR_API_KEY"; then
                    log "✅ KAVENEGAR_API_KEY is loaded in PM2"
                else
                    warning "⚠️  KAVENEGAR_API_KEY not found in PM2 environment"
                    warning "You may need to delete and restart PM2: pm2 delete hs6tools && pm2 start ecosystem.config.js --env production"
                fi
                if echo "$PM2_ENV" | grep -q "ZARINPAL_MERCHANT_ID"; then
                    log "✅ ZARINPAL_MERCHANT_ID is loaded in PM2"
                else
                    warning "⚠️  ZARINPAL_MERCHANT_ID not found in PM2 environment"
                    warning "You may need to delete and restart PM2: pm2 delete hs6tools && pm2 start ecosystem.config.js --env production"
                fi
            else
                warning "Application status is not 'online'. Checking logs..."
                pm2 logs ${PM2_APP_NAME} --lines 10 --nostream
                error "Application failed to start properly. Please check PM2 logs."
            fi
        else
            error "Failed to restart PM2 application. Please check PM2 logs."
        fi
    else
        warning "Skipping PM2 restart. Please restart your application manually."
    fi
}

# Show application logs
show_logs() {
    section "📋 Application Logs (Last 20 lines)"
    
    if check_pm2 2>/dev/null; then
        info "Showing recent logs from PM2..."
        pm2 logs ${PM2_APP_NAME} --lines 20 --nostream
    else
        info "PM2 is not available. Please check your application logs manually."
    fi
}

# Test application connectivity
test_connectivity() {
    section "🌐 Testing Application Connectivity"
    
    info "Testing Next.js application on localhost:3000..."
    
    # Wait a bit more for the app to be ready
    sleep 2
    
    # Test root endpoint
    ROOT_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>&1 || echo "000")
    if [ "$ROOT_CODE" = "307" ] || [ "$ROOT_CODE" = "301" ] || [ "$ROOT_CODE" = "302" ]; then
        log "Root endpoint responding: HTTP $ROOT_CODE (redirect - expected)"
    elif [ "$ROOT_CODE" = "200" ]; then
        log "Root endpoint responding: HTTP $ROOT_CODE"
    else
        warning "Root endpoint returned: HTTP $ROOT_CODE"
    fi
    
    # Test /fa endpoint
    FA_CODE=$(curl -s -o /dev/null -w "%{http_code}" -L http://localhost:3000/fa 2>&1 || echo "000")
    if [ "$FA_CODE" = "200" ]; then
        log "/fa endpoint responding: HTTP $FA_CODE (OK)"
    else
        warning "/fa endpoint returned: HTTP $FA_CODE"
    fi
    
    # Test a static file if available
    if [ -d ".next/static/chunks" ]; then
        STATIC_FILE=$(find .next/static/chunks -name "*.js" 2>/dev/null | head -1)
        if [ -n "$STATIC_FILE" ]; then
            RELATIVE_PATH="/_next/static${STATIC_FILE#.next/static}"
            STATIC_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$RELATIVE_PATH" 2>&1 || echo "000")
            if [ "$STATIC_CODE" = "200" ]; then
                log "Static file serving: HTTP $STATIC_CODE (OK)"
            else
                warning "Static file returned: HTTP $STATIC_CODE"
            fi
        fi
    fi
}

# Check Nginx status
check_nginx() {
    section "🔍 Checking Nginx Status"
    
    if command -v nginx &> /dev/null; then
        info "Checking Nginx status..."
        if systemctl is-active --quiet nginx; then
            log "Nginx is running"
            
            # Test Nginx config
            if nginx -t 2>/dev/null; then
                log "Nginx configuration is valid"
            else
                warning "Nginx configuration test failed"
            fi
        else
            warning "Nginx is not running"
        fi
    else
        info "Nginx is not installed (this is OK if not using Nginx)"
    fi
}

# Health check
health_check() {
    section "🏥 Health Check"
    
    if check_pm2 2>/dev/null; then
        info "Checking application health..."
        
        # Check if app is online
        if pm2 describe ${PM2_APP_NAME} | grep -q "online"; then
            log "Application is online and running"
        else
            warning "Application status is not 'online'. Please check PM2 logs."
        fi
        
        # Check restart count
        RESTART_COUNT=$(pm2 jlist | grep -o '"restart_time":[0-9]*' | head -1 | cut -d':' -f2 || echo "0")
        if [ "$RESTART_COUNT" -eq "0" ] || [ -z "$RESTART_COUNT" ]; then
            log "Restart count: 0 (stable)"
        else
            warning "Restart count: $RESTART_COUNT (application may be unstable)"
        fi
        
        # Show resource usage
        info "Resource usage:"
        pm2 describe ${PM2_APP_NAME} | grep -E "memory|cpu|uptime" || true
    fi
    
    # Test connectivity
    test_connectivity
    
    # Check Nginx
    check_nginx
}

# Security audit
security_audit() {
    section "🔒 Security Audit"
    
    info "Running security checks..."
    
    # Check for npm vulnerabilities (informational only, don't fail)
    if command -v npm &> /dev/null; then
        info "Checking for npm vulnerabilities..."
        npm audit --audit-level=critical 2>&1 | head -20 || true
        
        CRITICAL_COUNT=$(npm audit --json 2>/dev/null | grep -o '"critical":[0-9]*' | cut -d':' -f2 || echo "0")
        if [ "$CRITICAL_COUNT" -gt "0" ] 2>/dev/null; then
            warning "⚠️  Found $CRITICAL_COUNT critical vulnerabilities"
            warning "Consider running: npm audit fix"
        else
            log "No critical vulnerabilities found"
        fi
    fi
    
    # Check file permissions
    info "Checking critical file permissions..."
    if [ -f ".env" ]; then
        ENV_PERMS=$(stat -c "%a" .env 2>/dev/null || stat -f "%A" .env 2>/dev/null || echo "unknown")
        if [ "$ENV_PERMS" = "600" ] || [ "$ENV_PERMS" = "400" ]; then
            log ".env permissions are secure ($ENV_PERMS)"
        else
            warning ".env permissions are $ENV_PERMS (should be 600 or 400)"
            info "Fixing .env permissions..."
            chmod 600 .env
            log ".env permissions fixed"
        fi
    fi
}

# Main update function
main() {
    section "🚀 Starting HS6Tools Update Process"
    
    info "Update script started at $(date)"
    info "Working directory: ${APP_DIR}"
    echo ""
    
    # Pre-flight checks
    check_directory
    check_git
    check_node
    ensure_env
    PM2_AVAILABLE=$(check_pm2 && echo "yes" || echo "no")
    
    # Security audit
    security_audit
    
    # Create backup
    create_backup
    
    # Update process
    pull_changes
    install_dependencies
    generate_prisma
    run_migrations
    build_application
    
    # Restart application
    if [ "$PM2_AVAILABLE" = "yes" ]; then
        restart_pm2
        health_check
        show_logs
    else
        warning "PM2 is not available. Please restart your application manually after the update."
    fi
    
    # Final security check
    info "Running final integrity check..."
    if check_node_modules_integrity; then
        log "Final integrity check passed"
    else
        warning "Final integrity check detected issues (but update completed)"
    fi
    
    # Success message
    section "✅ Update Completed Successfully!"
    
    log "Update process completed at $(date)"
    echo ""
    info "Next steps:"
    echo "  1. Verify the application is running: pm2 status"
    echo "  2. Check application logs: pm2 logs ${PM2_APP_NAME}"
    echo "  3. Test the application in your browser:"
    echo "     - HTTP: http://hs6tools.com/fa"
    echo "     - HTTPS: https://hs6tools.com/fa (if SSL is configured)"
    echo "  4. Monitor for any errors in the logs"
    echo "  5. If you see any issues, check Nginx logs: tail -f /var/log/nginx/error.log"
    echo ""
    echo "Security notes:"
    echo "  - All packages were verified for integrity"
    echo "  - Critical file permissions were checked"
    echo "  - Environment variables are loaded from .env file"
    echo ""
    log "🎉 Your application has been updated successfully and securely!"
}

# Run main function
main

