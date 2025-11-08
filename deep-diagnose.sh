#!/bin/bash

# Deep Diagnostic Script for HS6Tools Server Issues
# This script collects comprehensive information for troubleshooting

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
OUTPUT_FILE="/tmp/hs6tools-diagnostic-$(date +%Y%m%d-%H%M%S).txt"

# Start collecting information
{
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔍 HS6Tools Deep Diagnostic Report"
    echo "Generated: $(date)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # ============================================================================
    section "1. SYSTEM INFORMATION"
    # ============================================================================
    echo "Hostname: $(hostname)"
    echo "Uptime: $(uptime)"
    echo "Date: $(date)"
    echo ""
    echo "--- OS Information ---"
    cat /etc/os-release 2>/dev/null || echo "OS info not available"
    echo ""
    echo "--- Kernel ---"
    uname -a
    echo ""
    
    # ============================================================================
    section "2. NETWORK CONFIGURATION"
    # ============================================================================
    echo "--- Network Interfaces ---"
    ip addr show | grep -E "^[0-9]+:|inet " || ifconfig 2>/dev/null | grep -E "inet |inet6 "
    echo ""
    echo "--- Listening Ports ---"
    netstat -tuln | grep -E ":(80|443|3000|22)" || ss -tuln | grep -E ":(80|443|3000|22)"
    echo ""
    echo "--- DNS Resolution ---"
    echo "hs6tools.com:"
    nslookup hs6tools.com 2>/dev/null || dig hs6tools.com +short 2>/dev/null || echo "DNS lookup failed"
    echo ""
    echo "www.hs6tools.com:"
    nslookup www.hs6tools.com 2>/dev/null || dig www.hs6tools.com +short 2>/dev/null || echo "DNS lookup failed"
    echo ""
    
    # ============================================================================
    section "3. FIREWALL STATUS"
    # ============================================================================
    if command -v ufw &> /dev/null; then
        echo "--- UFW Status ---"
        ufw status verbose
    else
        echo "UFW not installed"
    fi
    echo ""
    echo "--- iptables Rules (if applicable) ---"
    iptables -L -n -v 2>/dev/null | head -30 || echo "iptables not accessible"
    echo ""
    
    # ============================================================================
    section "4. PM2 STATUS"
    # ============================================================================
    echo "--- PM2 Process List ---"
    pm2 list
    echo ""
    echo "--- PM2 Detailed Info ---"
    pm2 describe hs6tools 2>/dev/null || echo "hs6tools not found in PM2"
    echo ""
    echo "--- PM2 Restart History ---"
    pm2 jlist | jq -r '.[] | "\(.name): restarts=\(.pm2_env.restart_time), status=\(.pm2_env.status)"' 2>/dev/null || pm2 jlist
    echo ""
    
    # ============================================================================
    section "5. APPLICATION STATUS"
    # ============================================================================
    cd "${APP_DIR}" || exit 1
    
    echo "--- Current Directory ---"
    pwd
    echo ""
    echo "--- Application Files ---"
    ls -la | head -20
    echo ""
    echo "--- Package.json ---"
    cat package.json | grep -E '"name"|"version"|"scripts"' | head -10
    echo ""
    echo "--- Environment File Check ---"
    if [ -f ".env" ]; then
        echo ".env exists"
        echo "Size: $(wc -l < .env) lines"
        echo "Critical vars present:"
        grep -E "DATABASE_URL|NEXTAUTH|NODE_ENV" .env | sed 's/=.*/=***HIDDEN***/' || echo "No critical vars found"
    else
        echo ".env file MISSING!"
    fi
    echo ""
    
    # ============================================================================
    section "6. BUILD STATUS"
    # ============================================================================
    echo "--- .next Directory ---"
    if [ -d ".next" ]; then
        echo ".next exists"
        ls -la .next/ | head -10
        echo ""
        echo "--- Build ID ---"
        cat .next/BUILD_ID 2>/dev/null || echo "BUILD_ID not found"
        echo ""
        echo "--- Static Files ---"
        if [ -d ".next/static" ]; then
            echo ".next/static exists"
            find .next/static -type f | wc -l | xargs echo "Total static files:"
            echo ""
            echo "Sample files:"
            find .next/static -type f | head -10
        else
            echo ".next/static MISSING!"
        fi
    else
        echo ".next directory MISSING!"
    fi
    echo ""
    
    # ============================================================================
    section "7. NEXT.JS APPLICATION TEST"
    # ============================================================================
    echo "--- Testing localhost:3000 ---"
    echo "HTTP Status Code:"
    curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>&1 || echo "Connection failed"
    echo ""
    echo ""
    echo "--- Full Response Headers ---"
    curl -I http://localhost:3000 2>&1 | head -20
    echo ""
    echo "--- Testing /fa route ---"
    curl -s -o /dev/null -w "%{http_code}" -L http://localhost:3000/fa 2>&1 || echo "Connection failed"
    echo ""
    echo "--- Response Body (first 500 chars) ---"
    curl -s http://localhost:3000/fa 2>&1 | head -c 500
    echo ""
    echo ""
    
    # ============================================================================
    section "8. NGINX CONFIGURATION"
    # ============================================================================
    echo "--- Nginx Status ---"
    systemctl status nginx --no-pager -l 2>&1 | head -15
    echo ""
    echo "--- Nginx Configuration Test ---"
    nginx -t 2>&1
    echo ""
    echo "--- Full Nginx Config for hs6tools ---"
    cat /etc/nginx/sites-available/hs6tools 2>/dev/null || echo "Config file not found"
    echo ""
    echo "--- Enabled Sites ---"
    ls -la /etc/nginx/sites-enabled/
    echo ""
    
    # ============================================================================
    section "9. NGINX LOGS"
    # ============================================================================
    echo "--- Recent Error Logs (last 30 lines) ---"
    tail -30 /var/log/nginx/error.log 2>/dev/null || echo "Error log not accessible"
    echo ""
    echo "--- Recent Access Logs (last 20 lines) ---"
    tail -20 /var/log/nginx/access.log 2>/dev/null || echo "Access log not accessible"
    echo ""
    
    # ============================================================================
    section "10. PM2 LOGS"
    # ============================================================================
    echo "--- PM2 Error Logs (last 50 lines) ---"
    pm2 logs hs6tools --err --lines 50 --nostream 2>&1 | tail -50
    echo ""
    echo "--- PM2 Output Logs (last 50 lines) ---"
    pm2 logs hs6tools --out --lines 50 --nostream 2>&1 | tail -50
    echo ""
    
    # ============================================================================
    section "11. DATABASE CONNECTION"
    # ============================================================================
    if command -v psql &> /dev/null; then
        echo "--- PostgreSQL Status ---"
        systemctl status postgresql --no-pager -l 2>&1 | head -10
        echo ""
        echo "--- Database Connection Test ---"
        if [ -f "${APP_DIR}/.env" ]; then
            DB_URL=$(grep DATABASE_URL "${APP_DIR}/.env" | cut -d'=' -f2- | tr -d '"' | tr -d "'")
            if [ -n "$DB_URL" ]; then
                echo "Testing connection..."
                PGPASSWORD=$(echo "$DB_URL" | grep -oP 'password=\K[^@]+' || echo "") 
                # Try to connect
                psql "$DB_URL" -c "SELECT 1;" 2>&1 | head -5 || echo "Connection test failed"
            else
                echo "DATABASE_URL not found in .env"
            fi
        else
            echo ".env file not found"
        fi
    else
        echo "PostgreSQL client not installed"
    fi
    echo ""
    
    # ============================================================================
    section "12. PROCESS INFORMATION"
    # ============================================================================
    echo "--- Node.js Processes ---"
    ps aux | grep -E "node|next" | grep -v grep
    echo ""
    echo "--- Nginx Processes ---"
    ps aux | grep nginx | grep -v grep
    echo ""
    echo "--- Port 3000 Usage ---"
    lsof -i:3000 2>/dev/null || netstat -tuln | grep :3000 || ss -tuln | grep :3000
    echo ""
    echo "--- Port 80 Usage ---"
    lsof -i:80 2>/dev/null || netstat -tuln | grep :80 || ss -tuln | grep :80
    echo ""
    
    # ============================================================================
    section "13. RESOURCE USAGE"
    # ============================================================================
    echo "--- Memory Usage ---"
    free -h
    echo ""
    echo "--- Disk Usage ---"
    df -h
    echo ""
    echo "--- CPU Load ---"
    uptime
    echo ""
    echo "--- Top Processes ---"
    top -bn1 | head -20
    echo ""
    
    # ============================================================================
    section "14. EXTERNAL CONNECTIVITY TEST"
    # ============================================================================
    echo "--- Testing from Server to External ---"
    echo "Testing http://87.107.73.10:"
    curl -s -o /dev/null -w "HTTP Code: %{http_code}\nTime: %{time_total}s\n" http://87.107.73.10 2>&1
    echo ""
    echo "--- Testing with Host Header ---"
    curl -s -o /dev/null -w "HTTP Code: %{http_code}\n" -H "Host: hs6tools.com" http://87.107.73.10 2>&1
    echo ""
    echo "--- Full Response Headers (External) ---"
    curl -I http://87.107.73.10 2>&1 | head -20
    echo ""
    
    # ============================================================================
    section "15. NODE.JS ENVIRONMENT"
    # ============================================================================
    echo "--- Node.js Version ---"
    node -v
    echo ""
    echo "--- npm Version ---"
    npm -v
    echo ""
    echo "--- Node.js Path ---"
    which node
    echo ""
    echo "--- npm Path ---"
    which npm
    echo ""
    
    # ============================================================================
    section "16. FILE PERMISSIONS"
    # ============================================================================
    echo "--- Application Directory Permissions ---"
    ls -la "${APP_DIR}" | head -10
    echo ""
    echo "--- .next Directory Permissions ---"
    if [ -d "${APP_DIR}/.next" ]; then
        ls -la "${APP_DIR}/.next" | head -10
    fi
    echo ""
    echo "--- Owner Information ---"
    stat -c "%U:%G %a %n" "${APP_DIR}" 2>/dev/null || ls -ld "${APP_DIR}"
    echo ""
    
    # ============================================================================
    section "17. RECENT SYSTEM LOGS"
    # ============================================================================
    echo "--- System Journal (last 20 lines related to hs6tools/nginx) ---"
    journalctl -u nginx --no-pager -n 20 2>/dev/null || echo "Journal not accessible"
    echo ""
    
    # ============================================================================
    section "18. SUMMARY"
    # ============================================================================
    echo "--- Quick Status Check ---"
    echo "PM2 Status:"
    pm2 list | grep hs6tools || echo "Not running"
    echo ""
    echo "Nginx Status:"
    systemctl is-active nginx && echo "Active" || echo "Inactive"
    echo ""
    echo "Next.js Response:"
    curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>&1 && echo " (localhost:3000)" || echo "Failed"
    echo ""
    echo "External Response:"
    curl -s -o /dev/null -w "%{http_code}" http://87.107.73.10 2>&1 && echo " (87.107.73.10)" || echo "Failed"
    echo ""
    
} | tee "$OUTPUT_FILE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Diagnostic complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
info "Full diagnostic report saved to:"
echo "  $OUTPUT_FILE"
echo ""
info "To view the report:"
echo "  cat $OUTPUT_FILE"
echo ""
info "To copy the report:"
echo "  cat $OUTPUT_FILE | pbcopy  # macOS"
echo "  cat $OUTPUT_FILE | xclip -selection clipboard  # Linux"
echo ""
info "Key sections to check:"
echo "  1. PM2 Status (Section 4)"
echo "  2. Next.js Application Test (Section 7)"
echo "  3. Nginx Configuration (Section 8)"
echo "  4. Nginx Logs (Section 9)"
echo "  5. External Connectivity Test (Section 14)"
echo ""

