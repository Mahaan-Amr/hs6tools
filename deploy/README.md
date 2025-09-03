# 🚀 HS6Tools Server Deployment Guide

This guide provides comprehensive instructions for deploying the HS6Tools e-commerce platform to your Ubuntu server.

## 📋 Prerequisites

- Ubuntu 24.04 LTS Server
- Root access to the server
- Domain name (optional, for SSL)
- SSH access to the server

## 🖥️ Server Information

- **Server IP**: 87.107.73.10
- **OS**: Ubuntu 24.04 LTS
- **User**: root
- **Application Directory**: `/var/www/hs6tools`

## 🛠️ Quick Deployment

### Option 1: Automated Deployment (Recommended)

1. **Clone the repository locally**:
   ```bash
   git clone https://github.com/Mahaan-Amr/hs6tools.git
   cd hs6tools
   ```

2. **Run the complete deployment script**:
   ```bash
   chmod +x deploy/deploy.sh
   ./deploy/deploy.sh
   ```

This script will automatically:
- Set up the server with all required software
- Clone the repository
- Configure the database
- Build and deploy the application
- Set up monitoring and backups

### Option 2: Manual Deployment

If you prefer manual deployment, follow these steps:

#### Step 1: Server Setup

1. **Connect to your server**:
   ```bash
   ssh root@87.107.73.10
   ```

2. **Run the server setup script**:
   ```bash
   chmod +x /tmp/setup-server.sh
   /tmp/setup-server.sh
   ```

#### Step 2: Application Deployment

1. **Clone the repository**:
   ```bash
   cd /var/www/hs6tools
   git clone https://github.com/Mahaan-Amr/hs6tools.git .
   ```

2. **Set up environment**:
   ```bash
   cp .env.production .env
   ```

3. **Install dependencies**:
   ```bash
   npm ci --only=production
   ```

4. **Set up database**:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   npm run db:seed
   ```

5. **Build the application**:
   ```bash
   npm run build
   ```

6. **Start the application**:
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

## 🔧 Configuration

### Environment Variables

The application uses the following key environment variables:

```env
# Database
DATABASE_URL="postgresql://hs6tools:hs6tools_password@localhost:5432/hs6tools_prod"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key"

# Payment Gateway
ZARINPAL_MERCHANT_ID="your-merchant-id"
ZARINPAL_SANDBOX="false"

# File Upload
MAX_FILE_SIZE="10485760"
UPLOAD_DIR="/var/www/hs6tools/public/uploads"
```

### Database Configuration

The setup script creates:
- **Database**: `hs6tools_prod`
- **User**: `hs6tools`
- **Password**: `hs6tools_password`

### Nginx Configuration

Nginx is configured to:
- Proxy requests to the Next.js application
- Serve static files efficiently
- Handle file uploads up to 10MB
- Provide security headers
- Enable gzip compression

## 🔐 Security

### Firewall Configuration

The setup script configures UFW firewall to allow:
- SSH (port 22)
- HTTP (port 80)
- HTTPS (port 443)
- Application port (3000)

### SSL Certificate

To set up SSL with Let's Encrypt:

```bash
certbot --nginx -d your-domain.com
```

## 📊 Monitoring

### PM2 Process Manager

The application runs under PM2 with:
- **Process Name**: hs6tools
- **Logs**: `/var/log/pm2/`
- **Auto-restart**: On memory limit (1GB)
- **Cluster mode**: Multiple instances

### Useful PM2 Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs hs6tools

# Restart application
pm2 restart hs6tools

# Monitor resources
pm2 monit
```

### Nginx Logs

```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log
```

## 🔄 Updates and Maintenance

### Automatic Updates

The deployment script creates a cron job for daily backups at 2 AM.

### Manual Updates

To update the application:

```bash
cd /var/www/hs6tools
./deploy.sh
```

### Database Backups

Manual backup:
```bash
cd /var/www/hs6tools
./backup.sh
```

Backups are stored in `/var/backups/hs6tools/` and kept for 7 days.

## 🚨 Troubleshooting

### Common Issues

1. **Application not starting**:
   ```bash
   pm2 logs hs6tools
   systemctl status nginx
   ```

2. **Database connection issues**:
   ```bash
   sudo -u postgres psql -c "\l"
   sudo -u postgres psql -c "SELECT * FROM pg_user;"
   ```

3. **Permission issues**:
   ```bash
   chown -R hs6tools:hs6tools /var/www/hs6tools
   ```

4. **Port conflicts**:
   ```bash
   netstat -tulpn | grep :3000
   ```

### Log Locations

- **Application logs**: `/var/log/pm2/`
- **Nginx logs**: `/var/log/nginx/`
- **System logs**: `/var/log/syslog`

## 📱 Access Information

### URLs

- **Main Site**: http://87.107.73.10
- **Admin Panel**: http://87.107.73.10/fa/admin
- **API Endpoints**: http://87.107.73.10/api/*

### Admin Credentials

- **Email**: admin@hs6tools.com
- **Password**: Admin123!
- **Role**: SUPER_ADMIN

### Test User Credentials

- **Email**: user@hs6tools.com
- **Password**: User123!
- **Role**: CUSTOMER

## 🔧 Maintenance Commands

### System Maintenance

```bash
# Update system packages
apt update && apt upgrade -y

# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
htop
```

### Application Maintenance

```bash
# Restart application
pm2 restart hs6tools

# Restart Nginx
systemctl restart nginx

# Restart PostgreSQL
systemctl restart postgresql

# Restart Redis
systemctl restart redis-server
```

## 📞 Support

For deployment issues or questions:

1. Check the logs: `pm2 logs hs6tools`
2. Verify services: `systemctl status nginx postgresql redis-server`
3. Check firewall: `ufw status`

## 📚 Additional Resources

- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [PostgreSQL Administration](https://www.postgresql.org/docs/current/admin.html)
