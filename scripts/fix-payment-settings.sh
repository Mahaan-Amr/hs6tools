#!/bin/bash

# Fix Payment Settings in Database
# This script updates the PaymentSettings table with correct ZarinPal configuration

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
echo "💳 Fixing Payment Settings in Database"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    error "package.json not found. Please run this script from the project root directory."
fi

# Check if SQL script exists
if [ ! -f "scripts/fix-payment-settings.sql" ]; then
    error "SQL script not found at scripts/fix-payment-settings.sql"
fi

# Get database connection details from .env.production
if [ ! -f ".env.production" ]; then
    error ".env.production file not found!"
fi

info "Reading database connection from .env.production..."
DATABASE_URL=$(grep "DATABASE_URL=" .env.production | cut -d'=' -f2 | tr -d '"' | tr -d "'")

if [ -z "$DATABASE_URL" ]; then
    error "DATABASE_URL not found in .env.production!"
fi

# Parse DATABASE_URL (format: postgresql://user:password@host:port/database)
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

info "Database connection details:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Execute SQL script
info "Executing SQL script to fix payment settings..."

export PGPASSWORD="$DB_PASS"

if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f scripts/fix-payment-settings.sql; then
    log "Payment settings updated successfully!"
else
    error "Failed to update payment settings. Please check database connection."
fi

unset PGPASSWORD

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Payment Settings Fix Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
info "Next steps:"
echo "  1. Restart PM2: pm2 restart hs6tools"
echo "  2. Test payment: Try to make a purchase on the website"
echo "  3. Check logs: pm2 logs hs6tools"
echo ""
log "🎉 Done!"

