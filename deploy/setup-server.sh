#!/bin/bash

# HS6Tools Server Setup Script
# Ubuntu 24.04 LTS Server Setup
# Server: 87.107.73.10

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root"
fi

log "Starting HS6Tools Server Setup..."

# Update system
log "Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
log "Installing essential packages..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Node.js 20.x
log "Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PostgreSQL 15
log "Installing PostgreSQL 15..."
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list
apt update
apt install -y postgresql-15 postgresql-contrib-15

# Install Redis
log "Installing Redis..."
apt install -y redis-server

# Install Nginx
log "Installing Nginx..."
apt install -y nginx

# Install PM2
log "Installing PM2..."
npm install -g pm2

# Install Certbot for SSL
log "Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Create application user
log "Creating application user..."
useradd -m -s /bin/bash hs6tools || true
usermod -aG sudo hs6tools

# Create application directory
log "Creating application directory..."
mkdir -p /var/www/hs6tools
chown hs6tools:hs6tools /var/www/hs6tools

# Configure PostgreSQL
log "Configuring PostgreSQL..."
sudo -u postgres psql -c "CREATE USER hs6tools WITH PASSWORD 'hs6tools_password';"
sudo -u postgres psql -c "CREATE DATABASE hs6tools_prod OWNER hs6tools;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE hs6tools_prod TO hs6tools;"

# Configure Redis
log "Configuring Redis..."
sed -i 's/bind 127.0.0.1/bind 127.0.0.1 ::1/' /etc/redis/redis.conf
systemctl enable redis-server
systemctl restart redis-server

# Configure Nginx
log "Configuring Nginx..."
cat > /etc/nginx/sites-available/hs6tools << 'EOF'
server {
    listen 80;
    server_name hs6tools.com www.hs6tools.com 87.107.73.10;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
    
    # Client max body size for file uploads
    client_max_body_size 10M;
    
    # Proxy to Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Static files
    location /_next/static {
        alias /var/www/hs6tools/.next/static;
        expires 365d;
        access_log off;
    }
    
    # Uploads
    location /uploads {
        alias /var/www/hs6tools/public/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Fonts
    location /fonts {
        alias /var/www/hs6tools/public/fonts;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/hs6tools /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Start services
log "Starting services..."
systemctl enable nginx
systemctl restart nginx
systemctl enable postgresql
systemctl restart postgresql

# Configure firewall
log "Configuring firewall..."
ufw --force enable
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 3000

# Create PM2 ecosystem file
log "Creating PM2 configuration..."
cat > /var/www/hs6tools/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'hs6tools',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/hs6tools',
    instances: 'max',
    exec_mode: 'cluster',
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
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

# Create log directory
mkdir -p /var/log/pm2
chown hs6tools:hs6tools /var/log/pm2

# Set up log rotation
log "Setting up log rotation..."
cat > /etc/logrotate.d/hs6tools << 'EOF'
/var/log/pm2/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 hs6tools hs6tools
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Create deployment script
log "Creating deployment script..."
cat > /var/www/hs6tools/deploy.sh << 'EOF'
#!/bin/bash

# HS6Tools Deployment Script

set -e

cd /var/www/hs6tools

# Pull latest changes
git pull origin master

# Install dependencies
npm ci --only=production

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build the application
npm run build

# Restart PM2
pm2 restart hs6tools

echo "Deployment completed successfully!"
EOF

chmod +x /var/www/hs6tools/deploy.sh
chown hs6tools:hs6tools /var/www/hs6tools/deploy.sh

# Create backup script
log "Creating backup script..."
cat > /var/www/hs6tools/backup.sh << 'EOF'
#!/bin/bash

# HS6Tools Backup Script

BACKUP_DIR="/var/backups/hs6tools"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
sudo -u postgres pg_dump hs6tools_prod > $BACKUP_DIR/db_backup_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz -C /var/www/hs6tools/public uploads

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR"
EOF

chmod +x /var/www/hs6tools/backup.sh
chown hs6tools:hs6tools /var/www/hs6tools/backup.sh

# Set up cron jobs
log "Setting up cron jobs..."
(crontab -u hs6tools -l 2>/dev/null; echo "0 2 * * * /var/www/hs6tools/backup.sh") | crontab -u hs6tools -

# Final permissions
log "Setting final permissions..."
chown -R hs6tools:hs6tools /var/www/hs6tools

log "Server setup completed successfully!"
log "Next steps:"
log "1. Clone the repository: git clone https://github.com/Mahaan-Amr/hs6tools.git"
log "2. Copy .env.production to .env"
log "3. Run: npm install && npm run build"
log "4. Start with PM2: pm2 start ecosystem.config.js"
log "5. Set up SSL with: certbot --nginx -d hs6tools.com"
