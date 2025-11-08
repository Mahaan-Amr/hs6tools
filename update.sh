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
    
    info "Pulling latest changes from ${CURRENT_BRANCH}..."
    if git pull origin ${CURRENT_BRANCH}; then
        log "Successfully pulled latest changes"
        
        # Show recent commits
        echo ""
        info "Recent commits:"
        git log --oneline -5
        echo ""
    else
        error "Failed to pull latest changes. Please check your Git configuration and network connection."
    fi
}

# Install dependencies
install_dependencies() {
    section "📦 Installing Dependencies"
    
    info "Installing npm dependencies..."
    if npm install; then
        log "Dependencies installed successfully"
    else
        error "Failed to install dependencies. Please check the error messages above."
    fi
}

# Generate Prisma client
generate_prisma() {
    section "🔧 Generating Prisma Client"
    
    info "Generating Prisma client..."
    if npx prisma generate; then
        log "Prisma client generated successfully"
    else
        error "Failed to generate Prisma client. Please check your Prisma schema."
    fi
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
    
    # Clean npm cache to avoid stale files
    info "Cleaning npm cache..."
    npm cache clean --force 2>/dev/null || true
    
    info "Building Next.js application..."
    if npm run build; then
        log "Application built successfully"
        
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
    else
        error "Build failed. Please check the error messages above."
    fi
}

# Restart PM2 application
restart_pm2() {
    section "🔄 Restarting Application with PM2"
    
    if check_pm2; then
        info "Restarting PM2 application '${PM2_APP_NAME}'..."
        if pm2 restart ${PM2_APP_NAME}; then
            log "Application restart command executed"
            
            # Wait longer for the app to fully start
            info "Waiting for application to start (10 seconds)..."
            sleep 10
            
            # Check status
            info "Checking application status..."
            pm2 status ${PM2_APP_NAME}
            
            # Verify app is actually online
            if pm2 describe ${PM2_APP_NAME} | grep -q "online"; then
                log "Application is online in PM2"
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
    PM2_AVAILABLE=$(check_pm2 && echo "yes" || echo "no")
    
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
    echo "  5. Check Nginx logs if issues persist: tail -f /var/log/nginx/error.log"
    echo ""
    log "🎉 Your application has been updated successfully!"
}

# Run main function
main

