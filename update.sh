#!/bin/bash

# HS6Tools Comprehensive Update Script
# This script handles complete application updates with automatic recovery
# Designed specifically for the HS6Tools e-commerce platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="${PWD}"
PM2_APP_NAME="hs6tools"
BACKUP_BEFORE_UPDATE=true
NODE_MIN_VERSION="18.0.0"
NPM_MIN_VERSION="8.0.0"

# Required environment variables (add more if needed)
# Note: SMS service variables (SMS.ir or Kavenegar) are validated separately in validate_sms_config()
REQUIRED_ENV_VARS=(
  "DATABASE_URL"
  "NEXTAUTH_URL"
  "NEXTAUTH_SECRET"
  "ZARINPAL_MERCHANT_ID"
  "ZARINPAL_SANDBOX"
  "NEXT_PUBLIC_APP_URL"
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
        error "Git is not installed. Please install git first."
    fi
    
    if [ ! -d ".git" ]; then
        error "Not a git repository. Please run this script from the project root directory."
    fi
    
    log "Git check passed"
}

# Check Node.js and npm versions
check_node_npm() {
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js ${NODE_MIN_VERSION} or higher."
    fi
    
    if ! command -v npm &> /dev/null; then
        error "npm is not installed. Please install npm ${NPM_MIN_VERSION} or higher."
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    NPM_VERSION=$(npm -v)
    
    info "Node.js version: v${NODE_VERSION}"
    info "npm version: ${NPM_VERSION}"
}

# Check if PM2 is available
check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        warning "PM2 is not installed. Application restart will be skipped."
        return 1
    fi
    return 0
}

# Check and setup environment files
check_env_files() {
    section "🔐 Checking Environment Files"

    # Check if .env.production exists
    if [ ! -f ".env.production" ]; then
        error ".env.production file not found! This file is required for production deployment."
    fi
    
    # Backup existing .env if it exists
        if [ -f ".env" ]; then
        BACKUP_FILE=".env.backup-$(date +'%Y%m%d-%H%M%S')"
        info ".env exists. Creating backup at ${BACKUP_FILE} before refresh..."
        cp .env "${BACKUP_FILE}"
    fi
    
    # Always refresh .env from .env.production to ensure consistency
    # This ensures all environment variables (including SMS.ir API keys) are loaded
        info "Refreshing .env from .env.production..."
    info "This will automatically load SMS.ir API keys and all other environment variables"
        cp .env.production .env
    log ".env updated from .env.production (all API keys and variables loaded)"
    
    # Verify .env file exists
    if [ ! -f ".env" ]; then
        error ".env file not found after refresh!"
    fi
    
        log ".env file found"

    # Check required environment variables
        info "Checking required environment variables in .env..."
    MISSING_VARS=()
    
    for VAR_PATTERN in "${REQUIRED_ENV_VARS[@]}"; do
        # Handle OR patterns (e.g., "VAR1|VAR2|VAR3")
        if [[ "$VAR_PATTERN" == *"|"* ]]; then
            IFS='|' read -ra VARS <<< "$VAR_PATTERN"
            FOUND=false
            for VAR in "${VARS[@]}"; do
                if grep -q "^${VAR}=" .env 2>/dev/null; then
                    FOUND=true
                    break
                fi
            done
            if [ "$FOUND" = false ]; then
                MISSING_VARS+=("${VAR_PATTERN}")
            fi
        else
            if ! grep -q "^${VAR_PATTERN}=" .env 2>/dev/null; then
                MISSING_VARS+=("${VAR_PATTERN}")
            fi
            fi
        done

    if [ ${#MISSING_VARS[@]} -gt 0 ]; then
        warning "Missing or empty required environment variables:"
        for VAR in "${MISSING_VARS[@]}"; do
            warning "  - ${VAR}"
        done
        warning "Please add these variables to .env.production and re-run the script."
        error "Required environment variables are missing!"
    fi
    
    log "All required environment variables are present in .env"
    
    # Validate SMS configuration (SMS.ir takes priority, then Kavenegar)
    validate_sms_config
}

# Validate SMS configuration (SMS.ir priority, Kavenegar fallback)
validate_sms_config() {
    # Check which SMS provider is configured
    SMSIR_API_KEY_VALUE=""
    if grep -q "^SMSIR_API_KEY=" .env 2>/dev/null; then
        SMSIR_API_KEY_VALUE=$(grep "^SMSIR_API_KEY=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
    fi
    
    # Check for Kavenegar API key (all possible variable names)
    KAVENEGAR_API_KEY_VALUE=""
    if grep -q "^KAVENEGAR_API_KEY=" .env 2>/dev/null; then
        KAVENEGAR_API_KEY_VALUE=$(grep "^KAVENEGAR_API_KEY=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
    elif grep -q "^NEXT_PUBLIC_KAVENEGAR_API_KEY=" .env 2>/dev/null; then
        KAVENEGAR_API_KEY_VALUE=$(grep "^NEXT_PUBLIC_KAVENEGAR_API_KEY=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
    elif grep -q "^KAVENEGAR_API_TOKEN=" .env 2>/dev/null; then
        KAVENEGAR_API_KEY_VALUE=$(grep "^KAVENEGAR_API_TOKEN=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
    fi
    
    # Ensure at least one SMS provider is configured
    if [ -z "$SMSIR_API_KEY_VALUE" ] && [ -z "$KAVENEGAR_API_KEY_VALUE" ]; then
        error "No SMS service configured! Please set either SMSIR_API_KEY (for SMS.ir) or KAVENEGAR_API_KEY (for Kavenegar) in .env.production"
    fi
    
    # Validate the configured provider
    if [ -n "$SMSIR_API_KEY_VALUE" ]; then
        validate_smsir_config
    else
        validate_kavenegar_config
    fi
}

# Validate SMS.ir configuration
validate_smsir_config() {
    section "📱 Validating SMS.ir Configuration"
    
    # Get SMS.ir API key
    SMSIR_API_KEY_VALUE=""
    if grep -q "^SMSIR_API_KEY=" .env 2>/dev/null; then
        SMSIR_API_KEY_VALUE=$(grep "^SMSIR_API_KEY=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
    fi
    
    # Validate API key
    if [ -n "$SMSIR_API_KEY_VALUE" ]; then
        # Check for placeholder values
        if [[ "$SMSIR_API_KEY_VALUE" == *"your"* ]] || \
           [[ "$SMSIR_API_KEY_VALUE" == *"YOUR"* ]] || \
           [[ "$SMSIR_API_KEY_VALUE" == *"example"* ]] || \
           [[ "$SMSIR_API_KEY_VALUE" == *"EXAMPLE"* ]] || \
           [[ -z "$SMSIR_API_KEY_VALUE" ]]; then
            error "SMSIR_API_KEY appears to be a placeholder value. Please set your actual API key in .env.production"
        fi
        
        log "SMSIR_API_KEY validated (length: ${#SMSIR_API_KEY_VALUE} chars)"
    else
        error "SMSIR_API_KEY not found in .env file. Please add it to .env.production"
    fi
    
    # Get and validate SMSIR_SECRET_KEY (optional)
    SMSIR_SECRET_KEY_VALUE=""
    if grep -q "^SMSIR_SECRET_KEY=" .env 2>/dev/null; then
        SMSIR_SECRET_KEY_VALUE=$(grep "^SMSIR_SECRET_KEY=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
        if [ -n "$SMSIR_SECRET_KEY_VALUE" ]; then
            log "SMSIR_SECRET_KEY found (length: ${#SMSIR_SECRET_KEY_VALUE} chars)"
        fi
    else
        info "SMSIR_SECRET_KEY not set (optional - only required if your account needs it)"
    fi
    
    # Get and validate SMSIR_LINE_NUMBER (optional)
    SMSIR_LINE_NUMBER_VALUE=""
    if grep -q "^SMSIR_LINE_NUMBER=" .env 2>/dev/null; then
        SMSIR_LINE_NUMBER_VALUE=$(grep "^SMSIR_LINE_NUMBER=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
        if [ -n "$SMSIR_LINE_NUMBER_VALUE" ]; then
            log "SMSIR_LINE_NUMBER validated: ${SMSIR_LINE_NUMBER_VALUE}"
        fi
    else
        info "SMSIR_LINE_NUMBER not set (will use default service number)"
    fi
    
    # Get and validate SMSIR_VERIFY_TEMPLATE_ID (required for verification codes)
    SMSIR_VERIFY_TEMPLATE_ID_VALUE=""
    if grep -q "^SMSIR_VERIFY_TEMPLATE_ID=" .env 2>/dev/null; then
        SMSIR_VERIFY_TEMPLATE_ID_VALUE=$(grep "^SMSIR_VERIFY_TEMPLATE_ID=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
        if [ -n "$SMSIR_VERIFY_TEMPLATE_ID_VALUE" ]; then
            # Validate it's a number
            if [[ ! "$SMSIR_VERIFY_TEMPLATE_ID_VALUE" =~ ^[0-9]+$ ]]; then
                error "SMSIR_VERIFY_TEMPLATE_ID must be a number (Template ID/Pattern Code from SMS.ir panel). Current value: ${SMSIR_VERIFY_TEMPLATE_ID_VALUE}"
            else
                log "SMSIR_VERIFY_TEMPLATE_ID validated: ${SMSIR_VERIFY_TEMPLATE_ID_VALUE}"
            fi
        else
            error "SMSIR_VERIFY_TEMPLATE_ID is empty. Please set it to your Template ID (Pattern Code) from SMS.ir panel."
        fi
    else
        error "SMSIR_VERIFY_TEMPLATE_ID not set. This is required for SMS.ir verification codes."
        error "Please create a template in SMS.ir panel (https://app.sms.ir/fast-send/template) and set SMSIR_VERIFY_TEMPLATE_ID to the Template ID."
    fi
    
    # Get and validate SMSIR_PASSWORD_RESET_TEMPLATE_ID (optional, falls back to verify template)
    SMSIR_PASSWORD_RESET_TEMPLATE_ID_VALUE=""
    if grep -q "^SMSIR_PASSWORD_RESET_TEMPLATE_ID=" .env 2>/dev/null; then
        SMSIR_PASSWORD_RESET_TEMPLATE_ID_VALUE=$(grep "^SMSIR_PASSWORD_RESET_TEMPLATE_ID=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
        if [ -n "$SMSIR_PASSWORD_RESET_TEMPLATE_ID_VALUE" ]; then
            if [[ ! "$SMSIR_PASSWORD_RESET_TEMPLATE_ID_VALUE" =~ ^[0-9]+$ ]]; then
                warning "SMSIR_PASSWORD_RESET_TEMPLATE_ID should be a number. Will fallback to SMSIR_VERIFY_TEMPLATE_ID."
            else
                log "SMSIR_PASSWORD_RESET_TEMPLATE_ID validated: ${SMSIR_PASSWORD_RESET_TEMPLATE_ID_VALUE}"
            fi
        fi
    else
        info "SMSIR_PASSWORD_RESET_TEMPLATE_ID not set (optional - will use SMSIR_VERIFY_TEMPLATE_ID for password reset)"
    fi
    
    # Summary
    info "SMS.ir Configuration Summary:"
    info "  ✅ API Key: ${SMSIR_API_KEY_VALUE:0:16}... (${#SMSIR_API_KEY_VALUE} chars)"
    if [ -n "$SMSIR_SECRET_KEY_VALUE" ]; then
        info "  ✅ Secret Key: ${SMSIR_SECRET_KEY_VALUE:0:16}... (${#SMSIR_SECRET_KEY_VALUE} chars)"
    else
        info "  ℹ️  Secret Key: Not set (optional - new panels don't require it)"
    fi
    if [ -n "$SMSIR_LINE_NUMBER_VALUE" ]; then
        info "  ✅ Line Number: ${SMSIR_LINE_NUMBER_VALUE}"
    else
        info "  ℹ️  Line Number: Not set (will use default service number)"
    fi
    if [ -n "$SMSIR_VERIFY_TEMPLATE_ID_VALUE" ]; then
        info "  ✅ Verify Template ID: ${SMSIR_VERIFY_TEMPLATE_ID_VALUE}"
    else
        info "  ❌ Verify Template ID: Not set (REQUIRED)"
    fi
    if [ -n "$SMSIR_PASSWORD_RESET_TEMPLATE_ID_VALUE" ]; then
        info "  ✅ Password Reset Template ID: ${SMSIR_PASSWORD_RESET_TEMPLATE_ID_VALUE}"
    else
        info "  ℹ️  Password Reset Template ID: Not set (will use Verify Template ID)"
    fi
    log "SMS.ir configuration validated successfully"
}

# Validate Kavenegar configuration
validate_kavenegar_config() {
    section "📱 Validating Kavenegar Configuration"
    
    # Get Kavenegar API key (check all possible variable names)
    KAVENEGAR_API_KEY_VALUE=""
    if grep -q "^KAVENEGAR_API_KEY=" .env 2>/dev/null; then
        KAVENEGAR_API_KEY_VALUE=$(grep "^KAVENEGAR_API_KEY=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
    elif grep -q "^NEXT_PUBLIC_KAVENEGAR_API_KEY=" .env 2>/dev/null; then
        KAVENEGAR_API_KEY_VALUE=$(grep "^NEXT_PUBLIC_KAVENEGAR_API_KEY=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
        warning "Using NEXT_PUBLIC_KAVENEGAR_API_KEY (not recommended - exposes key to client)"
        warning "Consider using KAVENEGAR_API_KEY instead for better security"
    elif grep -q "^KAVENEGAR_API_TOKEN=" .env 2>/dev/null; then
        KAVENEGAR_API_KEY_VALUE=$(grep "^KAVENEGAR_API_TOKEN=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
    fi
    
    # Validate API key format
    if [ -n "$KAVENEGAR_API_KEY_VALUE" ]; then
        # Check for placeholder values
        if [[ "$KAVENEGAR_API_KEY_VALUE" == *"your"* ]] || \
           [[ "$KAVENEGAR_API_KEY_VALUE" == *"YOUR"* ]] || \
           [[ "$KAVENEGAR_API_KEY_VALUE" == *"example"* ]] || \
           [[ "$KAVENEGAR_API_KEY_VALUE" == *"EXAMPLE"* ]] || \
           [[ -z "$KAVENEGAR_API_KEY_VALUE" ]]; then
            error "KAVENEGAR_API_KEY appears to be a placeholder value. Please set your actual API key in .env.production"
        fi
        
        # Check API key length (Kavenegar API keys are typically 64+ characters)
        if [ ${#KAVENEGAR_API_KEY_VALUE} -lt 32 ]; then
            warning "KAVENEGAR_API_KEY seems too short (${#KAVENEGAR_API_KEY_VALUE} chars). Expected 64+ characters."
        fi
        
        # Verify it's the correct production API key format (hexadecimal)
        if [[ ! "$KAVENEGAR_API_KEY_VALUE" =~ ^[0-9A-Fa-f]{32,}$ ]]; then
            warning "KAVENEGAR_API_KEY format may be incorrect. Expected hexadecimal string."
        fi
        
        log "KAVENEGAR_API_KEY validated (length: ${#KAVENEGAR_API_KEY_VALUE} chars)"
    else
        error "KAVENEGAR_API_KEY not found in .env file. Please add it to .env.production"
    fi
    
    # Get and validate KAVENEGAR_SENDER
    KAVENEGAR_SENDER_VALUE=""
    if grep -q "^KAVENEGAR_SENDER=" .env 2>/dev/null; then
        KAVENEGAR_SENDER_VALUE=$(grep "^KAVENEGAR_SENDER=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
    fi
    
    # Validate or set default sender number
    if [ -z "$KAVENEGAR_SENDER_VALUE" ] || [[ "$KAVENEGAR_SENDER_VALUE" == *"your"* ]] || [[ "$KAVENEGAR_SENDER_VALUE" == *"YOUR"* ]]; then
        warning "KAVENEGAR_SENDER is not set or is a placeholder. Setting default to 2000660110 (purchased number)..."
        
        # Remove existing KAVENEGAR_SENDER line if it exists
        sed -i.bak '/^KAVENEGAR_SENDER=/d' .env 2>/dev/null || sed -i '/^KAVENEGAR_SENDER=/d' .env 2>/dev/null || true
        
        # Add correct sender number
        echo "" >> .env
        echo "# Kavenegar Sender Number (purchased)" >> .env
        echo "KAVENEGAR_SENDER=2000660110" >> .env
        
        log "KAVENEGAR_SENDER set to default: 2000660110"
        
        # Also update .env.production for future runs
        if [ -f ".env.production" ]; then
            # Remove existing KAVENEGAR_SENDER line if it exists
            sed -i.bak '/^KAVENEGAR_SENDER=/d' .env.production 2>/dev/null || sed -i '/^KAVENEGAR_SENDER=/d' .env.production 2>/dev/null || true
            
            # Add correct sender number
            echo "" >> .env.production
            echo "# Kavenegar Sender Number (purchased)" >> .env.production
            echo "KAVENEGAR_SENDER=2000660110" >> .env.production
            
            info "Updated .env.production with KAVENEGAR_SENDER=2000660110"
        fi
    else
        # Validate sender number format (should be 10 digits starting with 2 or 1)
        if [[ ! "$KAVENEGAR_SENDER_VALUE" =~ ^[12][0-9]{9}$ ]]; then
            warning "KAVENEGAR_SENDER format may be incorrect: ${KAVENEGAR_SENDER_VALUE}"
            warning "Expected format: 10 digits starting with 1 or 2 (e.g., 2000660110 or 10004346)"
        else
            log "KAVENEGAR_SENDER validated: ${KAVENEGAR_SENDER_VALUE}"
            
            # Warn if using old default instead of purchased number
            if [ "$KAVENEGAR_SENDER_VALUE" = "10004346" ]; then
                warning "Using public sender number (10004346). Consider using purchased number (2000660110) for better branding."
            fi
        fi
    fi
    
    # Summary
    info "Kavenegar Configuration Summary:"
    info "  API Key: ${KAVENEGAR_API_KEY_VALUE:0:16}... (${#KAVENEGAR_API_KEY_VALUE} chars)"
    info "  Sender: ${KAVENEGAR_SENDER_VALUE:-2000660110}"
}

# Security audit
security_audit() {
    section "🔒 Security Audit"
    
    info "Running security checks..."
    
    # Check for npm vulnerabilities (only if package-lock.json exists)
    if [ -f "package-lock.json" ]; then
        info "Checking for npm vulnerabilities..."
        if npm audit --audit-level=critical 2>&1 | tee /tmp/npm-audit.log; then
            log "No critical vulnerabilities found"
        else
            # Check if there are actual critical vulnerabilities or just warnings
            if grep -q "found 0 vulnerabilities" /tmp/npm-audit.log 2>/dev/null; then
                log "No vulnerabilities found"
            elif grep -q "critical" /tmp/npm-audit.log 2>/dev/null; then
                warning "Critical vulnerabilities found! Consider running: npm audit fix"
            else
                log "No critical vulnerabilities found"
            fi
        fi
        rm -f /tmp/npm-audit.log
    else
        info "package-lock.json not found, skipping npm audit (will run after dependencies are installed)"
    fi
    
    # Check for suspicious code patterns in node_modules
    if [ -d "node_modules" ]; then
        info "Checking critical file permissions..."
        
        # Check .env permissions
        if [ -f ".env" ]; then
            ENV_PERMS=$(stat -c "%a" .env 2>/dev/null || stat -f "%A" .env 2>/dev/null || echo "unknown")
            if [ "$ENV_PERMS" != "600" ] && [ "$ENV_PERMS" != "400" ] && [ "$ENV_PERMS" != "unknown" ]; then
                warning ".env permissions are ${ENV_PERMS} (should be 600 or 400)"
                info "Fixing .env permissions..."
                chmod 600 .env
                log ".env permissions fixed"
            fi
        fi
    fi
    
    # Run backup if enabled
    if [ "$BACKUP_BEFORE_UPDATE" = true ]; then
        if [ -f "scripts/backup.sh" ]; then
            info "Running backup script..."
            bash scripts/backup.sh || warning "Backup script failed, but continuing..."
        else
            info "Backup script not found, skipping backup..."
        fi
    fi
}

# Pull latest changes from git
pull_changes() {
    section "📥 Pulling Latest Changes from GitHub"
    
    info "Fetching latest changes from remote repository..."
    git fetch origin
    
    # Get current branch
    info "Checking current branch..."
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    info "Current branch: ${CURRENT_BRANCH}"
    
    # Check for local changes
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        warning "Local changes detected. These will be preserved."
        
        # Show untracked files
    UNTRACKED=$(git ls-files --others --exclude-standard)
    if [ -n "$UNTRACKED" ]; then
        info "Untracked files detected (will be preserved):"
            echo "$UNTRACKED" | while read -r file; do
                echo "  - $file"
            done
        fi
        
        # Stash local changes
        info "Stashing local changes..."
        git stash push -u -m "Auto-stash before update $(date +'%Y-%m-%d %H:%M:%S')" || true
    fi
    
    # Pull latest changes
    info "Pulling latest changes from ${CURRENT_BRANCH}..."
    if git pull origin "${CURRENT_BRANCH}"; then
        log "Successfully pulled latest changes"
    else
        error "Failed to pull changes from remote repository. Please resolve conflicts manually."
    fi
        
        # Show recent commits
        info "Recent commits:"
        git log --oneline -5
        
    # Note about stashed changes
    if git stash list | grep -q "Auto-stash before update"; then
            info "Note: Local changes were stashed. To restore them, run: git stash pop"
        fi
}

# Check node_modules integrity
check_node_modules_integrity() {
    if [ ! -d "node_modules" ]; then
        return 1
    fi
    
    # Check for malicious patterns
    if grep -r "window\.__REMOTE_LOADER__" node_modules 2>/dev/null | grep -q "githubusercontent"; then
        warning "⚠️  SECURITY ALERT: Suspicious code detected in node_modules!"
        warning "This may indicate compromised packages. Forcing clean reinstall..."
        return 1
    fi
    
    # Check for common corruption indicators
    if [ ! -f "node_modules/.package-lock.json" ]; then
        warning "node_modules appears incomplete or corrupted"
        return 1
    fi
    
    # Check critical packages
    CRITICAL_PACKAGES=("next" "@prisma/client" "react" "react-dom")
    for PKG in "${CRITICAL_PACKAGES[@]}"; do
        if [ ! -d "node_modules/${PKG}" ]; then
            warning "Critical package ${PKG} is missing"
            return 1
        fi
    done
    
    return 0
}

# Clean reinstall of dependencies
clean_reinstall_dependencies() {
    section "🧹 Clean Reinstall of Dependencies"
    
    warning "Performing complete clean reinstall to ensure package integrity..."
    
    # Remove node_modules
    info "Removing node_modules..."
    rm -rf node_modules
    
    # Remove package-lock.json
    info "Removing package-lock.json..."
    rm -f package-lock.json
    
    # Remove .next build cache
    info "Removing .next build cache..."
    rm -rf .next
    
    # Clear npm cache
    info "Clearing npm cache..."
    npm cache clean --force 2>/dev/null || true
    
    log "Cleanup completed successfully"
    
    # Fresh install
    info "Installing fresh packages from npm registry..."
    
    # Try normal install first
    npm install --no-audit --prefer-online 2>&1 | tee /tmp/npm-install.log
    INSTALL_EXIT_CODE=${PIPESTATUS[0]}
    
    if [ $INSTALL_EXIT_CODE -eq 0 ]; then
        # Verify critical packages are installed
        if [ -d "node_modules/next" ] && [ -d "node_modules/@prisma/client" ]; then
            log "Fresh dependencies installed successfully"
            rm -f /tmp/npm-install.log
            return 0
        else
            warning "Install completed but critical packages missing. Retrying..."
        fi
    fi
    
    # Check if it's a peer dependency issue
    if grep -q "ERESOLVE unable to resolve dependency tree" /tmp/npm-install.log 2>/dev/null || \
       grep -q "peer.*dependency" /tmp/npm-install.log 2>/dev/null; then
        warning "Peer dependency conflict detected. Retrying with --legacy-peer-deps..."
        
        # Retry with legacy peer deps
        npm install --no-audit --prefer-online --legacy-peer-deps 2>&1 | tee /tmp/npm-install.log
        INSTALL_EXIT_CODE=${PIPESTATUS[0]}
        
        if [ $INSTALL_EXIT_CODE -eq 0 ]; then
            # Verify critical packages are installed
            if [ -d "node_modules/next" ] && [ -d "node_modules/@prisma/client" ]; then
                log "Fresh dependencies installed successfully with --legacy-peer-deps"
                rm -f /tmp/npm-install.log
                return 0
            else
                warning "Install completed but critical packages missing. Trying --force..."
            fi
        fi
    fi
    
    # If still failing, try with force
    warning "Install still failing. Final attempt with --force..."
    npm install --force --no-audit 2>&1 | tee /tmp/npm-install.log
    INSTALL_EXIT_CODE=${PIPESTATUS[0]}
    
    if [ $INSTALL_EXIT_CODE -eq 0 ]; then
        # Verify critical packages are installed
        if [ -d "node_modules/next" ] && [ -d "node_modules/@prisma/client" ]; then
            log "Dependencies installed with --force"
            rm -f /tmp/npm-install.log
            return 0
        else
            error "Dependencies installed but critical packages are missing. Please check the error messages above."
        fi
    fi
    
    rm -f /tmp/npm-install.log
    error "Failed to install dependencies after all attempts. Please check the error messages above."
}

# Install or update dependencies
install_dependencies() {
    section "📦 Installing Dependencies"
    
    # Check if node_modules exists and is intact
    info "Checking node_modules integrity..."
    if ! check_node_modules_integrity; then
        warning "node_modules integrity check failed, will perform clean reinstall..."
        clean_reinstall_dependencies
        return $?
    fi
    
    # Normal update
    info "Installing/updating npm dependencies..."
    
    # Try normal install
    npm install --no-audit 2>&1 | tee /tmp/npm-update.log
    INSTALL_EXIT_CODE=${PIPESTATUS[0]}
    
    if [ $INSTALL_EXIT_CODE -eq 0 ]; then
        # Verify critical packages are installed
        if [ -d "node_modules/next" ] && [ -d "node_modules/@prisma/client" ]; then
        log "Dependencies installed successfully"
            rm -f /tmp/npm-update.log
            
            # Verify integrity after install
            if ! check_node_modules_integrity; then
                warning "Integrity check failed after install. Performing clean reinstall..."
                clean_reinstall_dependencies
                return $?
            fi
            
            return 0
        else
            warning "Install completed but critical packages missing. Checking for errors..."
        fi
    fi
    
    # Check for peer dependency issues
    if grep -q "ERESOLVE" /tmp/npm-update.log 2>/dev/null; then
        warning "Peer dependency issue detected. Retrying with --legacy-peer-deps..."
        rm -f /tmp/npm-update.log
        
        npm install --no-audit --legacy-peer-deps 2>&1 | tee /tmp/npm-update.log
        INSTALL_EXIT_CODE=${PIPESTATUS[0]}
        
        if [ $INSTALL_EXIT_CODE -eq 0 ]; then
            # Verify critical packages are installed
            if [ -d "node_modules/next" ] && [ -d "node_modules/@prisma/client" ]; then
                log "Dependencies installed successfully with --legacy-peer-deps"
                
                # Verify integrity
                if ! check_node_modules_integrity; then
                    warning "Integrity check failed. Performing clean reinstall..."
                    clean_reinstall_dependencies
                    return $?
                fi
                rm -f /tmp/npm-update.log
                return 0
            else
                warning "Install completed but critical packages missing. Trying clean reinstall..."
            fi
        fi
    fi
    
    rm -f /tmp/npm-update.log
    warning "Normal install failed. Attempting clean reinstall..."
    clean_reinstall_dependencies
    return $?
}

# Generate Prisma client
generate_prisma() {
    section "🔧 Generating Prisma Client"
    
    # Ensure we're using the correct Prisma version from package.json
    info "Checking Prisma version..."
    if [ -f "package.json" ]; then
        PRISMA_VERSION=$(grep -o '"prisma": "[^"]*"' package.json | cut -d'"' -f4 || echo "")
        if [ -n "$PRISMA_VERSION" ]; then
            info "Using Prisma version: ${PRISMA_VERSION}"
            # Ensure Prisma is installed at the correct version
            if ! npm list prisma@${PRISMA_VERSION} &>/dev/null; then
                info "Installing Prisma at version ${PRISMA_VERSION}..."
                npm install prisma@${PRISMA_VERSION} --no-audit --legacy-peer-deps 2>/dev/null || true
            fi
        fi
    fi
    
    info "Generating Prisma client..."
    
    # First attempt
    npx prisma generate 2>&1 | tee /tmp/prisma-gen.log
    PRISMA_EXIT_CODE=${PIPESTATUS[0]}
    
    if [ $PRISMA_EXIT_CODE -eq 0 ]; then
        # Check for Prisma 7 errors about datasource url
        if grep -q "The datasource property \`url\` is no longer supported" /tmp/prisma-gen.log 2>/dev/null; then
            warning "Prisma 7 detected but schema uses Prisma 6 syntax. Downgrading Prisma..."
            npm install prisma@^6.14.0 @prisma/client@^6.14.0 --no-audit --legacy-peer-deps --save-exact 2>/dev/null || true
            info "Retrying with Prisma 6..."
            npx prisma generate 2>&1 | tee /tmp/prisma-gen.log
            PRISMA_EXIT_CODE=${PIPESTATUS[0]}
        fi
        
        if [ $PRISMA_EXIT_CODE -eq 0 ]; then
        log "Prisma client generated successfully"
            rm -f /tmp/prisma-gen.log
            return 0
        fi
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
    section "📚 Running Database Migrations"
    
    info "Checking database connection..."
    if ! npx prisma db execute --stdin <<< "SELECT 1;" 2>/dev/null; then
        warning "Cannot connect to database. Skipping migrations."
        warning "Please ensure your DATABASE_URL is correct and the database is running."
        return 0
    fi
    
    log "Database connection successful"
    
    info "Running Prisma migrations..."
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
    
    # Verify Next.js is installed before building
    if [ ! -f "node_modules/.bin/next" ]; then
        error "Next.js is not installed. Cannot build application."
        error "Please ensure dependencies were installed successfully."
        return 1
    fi
    
    # First attempt
    npm run build 2>&1 | tee /tmp/build.log
    BUILD_EXIT_CODE=${PIPESTATUS[0]}
    
    if [ $BUILD_EXIT_CODE -eq 0 ]; then
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
        chown -R hs6tools:hs6tools .next 2>/dev/null || chown -R $(whoami):$(whoami) .next 2>/dev/null || true
        chmod -R 755 .next
        log "Permissions set correctly"
        return 0
    fi
    
    # Build failed - check for common issues
    warning "Initial build failed. Diagnosing issue..."
    
    # Check if 'next' command is missing (dependencies not installed)
    if grep -q "next: not found" /tmp/build.log 2>/dev/null || \
       [ ! -f "node_modules/.bin/next" ]; then
        error "Next.js is not installed. Dependencies installation must have failed."
        error "Please check the dependency installation step above."
        rm -f /tmp/build.log
        return 1
    fi
    
    # Check if it's a dependency issue
    if grep -q "Cannot find module" /tmp/build.log 2>/dev/null || \
       grep -q "Module not found" /tmp/build.log 2>/dev/null; then
        warning "Build failed due to missing modules. Reinstalling dependencies..."
        
        clean_reinstall_dependencies
        
        # Verify dependencies are installed
        if [ ! -f "node_modules/.bin/next" ]; then
            error "Dependencies reinstall failed. Next.js is still missing."
            rm -f /tmp/build.log
            return 1
        fi
        
        # Regenerate Prisma
        info "Regenerating Prisma client..."
        npx prisma generate
        
        # Retry build
        info "Retrying build after dependency reinstall..."
        rm -rf .next
        npm run build 2>&1 | tee /tmp/build.log
        BUILD_EXIT_CODE=${PIPESTATUS[0]}
        
        if [ $BUILD_EXIT_CODE -eq 0 ] && [ -d ".next/static" ]; then
            log "Application built successfully after recovery"
            rm -f /tmp/build.log
            
            # Fix permissions
            info "Setting correct permissions for .next folder..."
            chown -R hs6tools:hs6tools .next 2>/dev/null || chown -R $(whoami):$(whoami) .next 2>/dev/null || true
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
    
    # Create/update ecosystem.config.js to load from .env
    # This ensures PM2 loads all variables from .env file
    cat > ecosystem.config.js << 'EOF'
// Load environment variables from .env file
// This is critical for SMS.ir API keys and other sensitive configuration

const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env');

// Read and parse .env file manually (more reliable than dotenv for PM2)
let envVars = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    line = line.trim();
    // Skip comments and empty lines
    if (line && !line.startsWith('#') && line.includes('=')) {
      const equalIndex = line.indexOf('=');
      if (equalIndex > 0) {
        const key = line.substring(0, equalIndex).trim();
        let value = line.substring(equalIndex + 1).trim();
        
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        // Only set if value is not empty (unless it's explicitly empty string)
      if (key && value !== undefined) {
          envVars[key] = value;
        }
      }
    }
  });
  
  console.log(`[PM2 Config] Loaded ${Object.keys(envVars).length} environment variables from .env`);
  console.log(`[PM2 Config] SMS.ir API Key present: ${envVars.SMSIR_API_KEY ? 'YES (' + envVars.SMSIR_API_KEY.substring(0, 16) + '...)' : 'NO'}`);
  console.log(`[PM2 Config] SMS.ir Template ID: ${envVars.SMSIR_VERIFY_TEMPLATE_ID || 'NOT SET'}`);
} else {
  console.warn('[PM2 Config] .env file not found at:', envPath);
}

// Try dotenv as well (if available)
try {
  require('dotenv').config({ path: envPath });
  // Merge dotenv results
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('SMSIR_') || key.startsWith('KAVENEGAR_') || key.startsWith('DATABASE_') || key.startsWith('NEXTAUTH_') || key.startsWith('ZARINPAL_')) {
      envVars[key] = process.env[key];
    }
  });
} catch (e) {
  console.warn('[PM2 Config] dotenv not available, using manual parsing only');
}

// Merge with process.env (system environment takes precedence)
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
    info "All environment variables (including SMS.ir API keys) will be automatically loaded from .env.production"
}

# Restart PM2 application
restart_pm2() {
    section "🔄 Restarting Application with PM2"
    
    if check_pm2; then
        # Update PM2 config to load from .env
        update_pm2_config
        
        info "Deleting and restarting PM2 application to load new environment variables..."
        info "This ensures PM2 picks up all variables from .env file via ecosystem.config.js"
        info "SMS.ir API keys and Template IDs will be automatically loaded from .env.production"
        
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
                
                # Check .env file first to see what should be loaded
                if [ -f ".env" ]; then
                    info "Checking .env file for SMS.ir variables..."
                    if grep -q "^SMSIR_API_KEY=" .env 2>/dev/null; then
                        ENV_SMSIR_KEY=$(grep "^SMSIR_API_KEY=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
                        if [ -n "$ENV_SMSIR_KEY" ]; then
                            log "✅ SMSIR_API_KEY found in .env file (length: ${#ENV_SMSIR_KEY} chars)"
                        fi
                    fi
                    if grep -q "^SMSIR_VERIFY_TEMPLATE_ID=" .env 2>/dev/null; then
                        ENV_TEMPLATE_ID=$(grep "^SMSIR_VERIFY_TEMPLATE_ID=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
                        if [ -n "$ENV_TEMPLATE_ID" ]; then
                            log "✅ SMSIR_VERIFY_TEMPLATE_ID found in .env file: ${ENV_TEMPLATE_ID}"
                        fi
                    fi
                fi
                
                # Check PM2 environment (pm2 env command might not show all vars, so also check describe)
                PM2_ENV=$(pm2 env ${PM2_APP_NAME} 2>/dev/null || echo "")
                PM2_DESCRIBE=$(pm2 describe ${PM2_APP_NAME} 2>/dev/null || echo "")
                
                # Check SMS service configuration (SMS.ir takes priority)
                SMS_PROVIDER_FOUND=false
                
                # Check both PM2_ENV and PM2_DESCRIBE for SMSIR_API_KEY
                if echo "$PM2_ENV" | grep -q "SMSIR_API_KEY" || echo "$PM2_DESCRIBE" | grep -q "SMSIR_API_KEY"; then
                    SMS_PROVIDER_FOUND=true
                    SMSIR_API_KEY_PM2=$(echo "$PM2_ENV" | grep "SMSIR_API_KEY" | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
                    if [ -n "$SMSIR_API_KEY_PM2" ]; then
                        log "✅ SMSIR_API_KEY is loaded in PM2 (length: ${#SMSIR_API_KEY_PM2} chars)"
                    else
                        warning "⚠️  SMSIR_API_KEY is empty in PM2 environment"
                    fi
                    
                    # Check SMS.ir secret key (optional)
                    if echo "$PM2_ENV" | grep -q "SMSIR_SECRET_KEY"; then
                        SMSIR_SECRET_KEY_PM2=$(echo "$PM2_ENV" | grep "SMSIR_SECRET_KEY" | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
                        if [ -n "$SMSIR_SECRET_KEY_PM2" ]; then
                            log "✅ SMSIR_SECRET_KEY is loaded in PM2 (length: ${#SMSIR_SECRET_KEY_PM2} chars)"
                        fi
                    else
                        info "ℹ️  SMSIR_SECRET_KEY not found in PM2 (optional - new panels don't require it)"
                    fi
                    
                    # Check SMS.ir verify template ID (required)
                    if echo "$PM2_ENV" | grep -q "SMSIR_VERIFY_TEMPLATE_ID"; then
                        SMSIR_TEMPLATE_ID_PM2=$(echo "$PM2_ENV" | grep "SMSIR_VERIFY_TEMPLATE_ID" | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
                        if [ -n "$SMSIR_TEMPLATE_ID_PM2" ]; then
                            log "✅ SMSIR_VERIFY_TEMPLATE_ID is loaded in PM2: ${SMSIR_TEMPLATE_ID_PM2}"
                        else
                            warning "⚠️  SMSIR_VERIFY_TEMPLATE_ID is empty in PM2 environment"
                            warning "⚠️  Verification codes will not work. Please set SMSIR_VERIFY_TEMPLATE_ID in .env.production"
                        fi
                    else
                        warning "⚠️  SMSIR_VERIFY_TEMPLATE_ID not found in PM2 environment"
                        warning "⚠️  Verification codes will not work. Please set SMSIR_VERIFY_TEMPLATE_ID in .env.production"
                    fi
                    
                    # Check SMS.ir password reset template ID (optional)
                    if echo "$PM2_ENV" | grep -q "SMSIR_PASSWORD_RESET_TEMPLATE_ID"; then
                        SMSIR_PASSWORD_RESET_TEMPLATE_ID_PM2=$(echo "$PM2_ENV" | grep "SMSIR_PASSWORD_RESET_TEMPLATE_ID" | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
                        if [ -n "$SMSIR_PASSWORD_RESET_TEMPLATE_ID_PM2" ]; then
                            log "✅ SMSIR_PASSWORD_RESET_TEMPLATE_ID is loaded in PM2: ${SMSIR_PASSWORD_RESET_TEMPLATE_ID_PM2}"
                        fi
                    else
                        info "ℹ️  SMSIR_PASSWORD_RESET_TEMPLATE_ID not found in PM2 (optional - will use SMSIR_VERIFY_TEMPLATE_ID)"
                    fi
                    
                    # Check SMS.ir line number (optional)
                    if echo "$PM2_ENV" | grep -q "SMSIR_LINE_NUMBER"; then
                        SMSIR_LINE_PM2=$(echo "$PM2_ENV" | grep "SMSIR_LINE_NUMBER" | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
                        if [ -n "$SMSIR_LINE_PM2" ]; then
                            log "✅ SMSIR_LINE_NUMBER is loaded in PM2: ${SMSIR_LINE_PM2}"
                        fi
                    else
                        info "ℹ️  SMSIR_LINE_NUMBER not found in PM2 (will use default service number)"
                    fi
                elif echo "$PM2_ENV" | grep -q "KAVENEGAR_API_KEY"; then
                    SMS_PROVIDER_FOUND=true
                    KAVENEGAR_API_KEY_PM2=$(echo "$PM2_ENV" | grep "KAVENEGAR_API_KEY" | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
                    if [ -n "$KAVENEGAR_API_KEY_PM2" ]; then
                        log "✅ KAVENEGAR_API_KEY is loaded in PM2 (length: ${#KAVENEGAR_API_KEY_PM2} chars)"
                    else
                        warning "⚠️  KAVENEGAR_API_KEY is empty in PM2 environment"
                    fi
                elif echo "$PM2_ENV" | grep -q "NEXT_PUBLIC_KAVENEGAR_API_KEY"; then
                    SMS_PROVIDER_FOUND=true
                    log "✅ NEXT_PUBLIC_KAVENEGAR_API_KEY is loaded in PM2"
                    warning "⚠️  Using NEXT_PUBLIC_KAVENEGAR_API_KEY (not recommended - exposes key to client)"
                    warning "⚠️  Consider using KAVENEGAR_API_KEY instead for better security"
                elif echo "$PM2_ENV" | grep -q "KAVENEGAR_API_TOKEN"; then
                    SMS_PROVIDER_FOUND=true
                    log "✅ KAVENEGAR_API_TOKEN is loaded in PM2"
                fi
                
                if [ "$SMS_PROVIDER_FOUND" = false ]; then
                    warning "⚠️  No SMS service API key found in PM2 environment output"
                    warning "⚠️  This might be a PM2 display issue - checking .env file..."
                    
                    # Double-check .env file
                    if [ -f ".env" ] && grep -q "^SMSIR_API_KEY=" .env 2>/dev/null; then
                        ENV_CHECK_KEY=$(grep "^SMSIR_API_KEY=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
                        if [ -n "$ENV_CHECK_KEY" ]; then
                            warning "⚠️  SMSIR_API_KEY exists in .env file (${#ENV_CHECK_KEY} chars) but PM2 might not have loaded it."
                            warning "⚠️  The variables ARE in .env and ecosystem.config.js should load them."
                            warning "⚠️  Check PM2 startup logs for '[PM2 Config]' messages to verify loading."
                            info "ℹ️  Application should still work - PM2 loads from ecosystem.config.js at startup"
                            info "ℹ️  Check application logs: pm2 logs hs6tools --lines 50 | grep -i 'sms\|provider'"
                        fi
                    else
                        error "SMSIR_API_KEY not found in .env file! Please add it to .env.production and run update.sh again"
                    fi
                fi
                
                # Check Kavenegar sender number (only if using Kavenegar)
                if echo "$PM2_ENV" | grep -q "KAVENEGAR_SENDER"; then
                    SENDER_VALUE=$(echo "$PM2_ENV" | grep "KAVENEGAR_SENDER" | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
                    log "✅ KAVENEGAR_SENDER is loaded in PM2: ${SENDER_VALUE}"
                    
                    # Warn if using old default
                    if [ "$SENDER_VALUE" = "10004346" ]; then
                        warning "⚠️  Using public sender number (10004346). Consider using purchased number (2000660110)."
                    fi
                elif ! echo "$PM2_ENV" | grep -q "SMSIR_API_KEY"; then
                    warning "⚠️  KAVENEGAR_SENDER not found in PM2 environment"
                    info "ℹ️  Default sender (2000660110) will be used from code"
                fi
                
                # Check Zarinpal
                if echo "$PM2_ENV" | grep -q "ZARINPAL_MERCHANT_ID"; then
                    log "✅ ZARINPAL_MERCHANT_ID is loaded in PM2"
                else
                    warning "⚠️  ZARINPAL_MERCHANT_ID not found in PM2 environment"
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
        warning "PM2 is not installed. Skipping PM2 restart."
        warning "Please restart your application manually or install PM2: npm install -g pm2"
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
        if systemctl is-active --quiet nginx 2>/dev/null; then
            log "Nginx is running"
            
            # Test Nginx configuration
            info "Testing Nginx configuration..."
            if nginx -t 2>&1 | grep -q "successful"; then
                log "Nginx configuration is valid"
            else
                warning "Nginx configuration has issues"
            fi
            
            # Reload Nginx to pick up any changes
            info "Reloading Nginx..."
            if systemctl reload nginx 2>/dev/null; then
                log "Nginx reloaded successfully"
            else
                warning "Failed to reload Nginx"
            fi
        else
            warning "Nginx is not running"
            info "You may need to start Nginx: sudo systemctl start nginx"
        fi
    else
        info "Nginx is not installed (optional)"
    fi
}

# Show application logs
show_logs() {
    section "📋 Application Logs (Last 20 lines)"
    
    if check_pm2 2>/dev/null; then
        info "Showing recent logs from PM2..."
        pm2 logs ${PM2_APP_NAME} --lines 20 --nostream || true
    else
        info "PM2 is not available. Please check your application logs manually."
    fi
}

# Print summary
print_summary() {
    section "✨ Update Summary"
    
    echo ""
    log "Update process completed successfully!"
    echo ""
    info "Next steps:"
    echo "  1. Check application status: pm2 status"
    echo "  2. View logs: pm2 logs ${PM2_APP_NAME}"
    echo "  3. Monitor application: pm2 monit"
    echo "  4. Test your application in the browser"
    echo ""
    
    # Check for backup files (fix the glob issue)
    BACKUP_FILES=$(ls -t .env.backup-* 2>/dev/null | head -1)
    if [ -n "$BACKUP_FILES" ] && [ -f "$BACKUP_FILES" ]; then
        info "Environment backup created: ${BACKUP_FILES}"
    fi
    
    echo ""
    log "🎉 All done! Your application is now updated and running."
    echo ""
}

# Main execution
main() {
    section "🚀 Starting HS6Tools Update Process"
    
    info "Update script started at $(date)"
    info "Working directory: ${APP_DIR}"
    
    # Pre-flight checks
    check_directory
    check_git
    check_node_npm
    
    # Environment setup
    check_env_files
    
    # Security checks
    security_audit
    
    # Update code
    pull_changes
    
    # Install dependencies
    install_dependencies
    
    # Generate Prisma client
    generate_prisma
    
    # Run migrations
    run_migrations
    
    # Build application
    build_application
    
    # Restart application
        restart_pm2
    
    # Test connectivity
    test_connectivity
    
    # Check Nginx
    check_nginx
    
    # Show logs
    show_logs
    
    # Print summary
    print_summary
}

# Run main function
main
