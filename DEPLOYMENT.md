# 🚀 HS6Tools Complete Deployment Guide

## 📋 Project Overview

**HS6Tools** is a comprehensive, multilingual e-commerce platform built with Next.js 15, TypeScript, and PostgreSQL. This guide provides complete instructions for deploying the application to your Ubuntu server.

## 🎯 What We've Accomplished

### ✅ Phase 1: Project Preparation
- [x] **GitHub Repository**: Successfully pushed to https://github.com/Mahaan-Amr/hs6tools.git
- [x] **Production Configuration**: Created `.env.production` with server-specific settings
- [x] **Next.js Optimization**: Updated `next.config.ts` for production deployment
- [x] **Security Headers**: Added comprehensive security headers

### ✅ Phase 2: Server Setup Scripts
- [x] **Comprehensive Server Setup**: `deploy/setup-server.sh` - Installs all required software
- [x] **Automated Deployment**: `deploy/deploy.sh` - Complete deployment automation
- [x] **One-Click Deployment**: `deploy.sh` - Simple deployment from project root
- [x] **Documentation**: `deploy/README.md` - Complete deployment guide

### ✅ Phase 3: Production-Ready Features
- [x] **Nginx Configuration**: Optimized for Next.js with security headers
- [x] **PM2 Process Manager**: Cluster mode with auto-restart
- [x] **Database Setup**: PostgreSQL with proper user and permissions
- [x] **Redis Cache**: For session management and caching
- [x] **SSL Ready**: Certbot integration for Let's Encrypt certificates
- [x] **Backup System**: Automated daily backups with retention
- [x] **Monitoring**: Comprehensive logging and health checks

## 🖥️ Server Information

- **Server IP**: 87.107.73.10
- **OS**: Ubuntu 24.04 LTS
- **User**: root
- **Authentication**: Use an SSH key or your secret manager. Never store server passwords in this repository.
- **Application Directory**: `/var/www/hs6tools`

## 🚀 Quick Deployment (Recommended)

### Option 1: One-Click Deployment

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Mahaan-Amr/hs6tools.git
   cd hs6tools
   ```

2. **Run the deployment script**:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

This will automatically:
- Install all required software (Node.js, PostgreSQL, Redis, Nginx, PM2)
- Configure the server environment
- Clone the repository
- Set up the database
- Build and deploy the application
- Configure monitoring and backups

### Option 2: Manual Deployment

If you prefer manual deployment, follow the detailed steps in `deploy/README.md`.

## 🔧 What Gets Installed

### System Software
- **Node.js 20.x**: Latest LTS version
- **PostgreSQL 15**: Production database
- **Redis**: Caching and session storage
- **Nginx**: Reverse proxy and static file serving
- **PM2**: Process manager for Node.js applications
- **Certbot**: SSL certificate management
- **UFW**: Firewall configuration

### Application Configuration
- **Database**: `hs6tools_prod` with user `hs6tools`
- **Nginx**: Optimized configuration for Next.js
- **PM2**: Cluster mode with auto-restart
- **Logs**: Structured logging with rotation
- **Backups**: Daily automated backups

## 📊 Application Features

### E-commerce Capabilities
- **Product Catalog**: Multilingual products with variants
- **Shopping Cart**: Persistent cart with Zustand
- **Checkout Process**: Multi-step checkout flow
- **Payment Integration**: ZarinPal gateway ready
- **Order Management**: Complete order lifecycle

### Admin Panel
- **Dashboard**: Real-time analytics and statistics
- **Product Management**: CRUD operations with image upload
- **Order Management**: Order processing and tracking
- **User Management**: Customer and admin accounts
- **Content Management**: Blog system with multilingual support
- **Advanced Analytics**: Customer segmentation, product performance, geographic analysis

### Customer Features
- **User Accounts**: Profile management and order history
- **Address Management**: Multiple addresses with validation
- **Wishlist**: Save and manage favorite products
- **Security**: Password change and login history
- **Settings**: Language, currency, and notification preferences

### Technical Features
- **Multilingual**: Persian, English, Arabic with RTL support
- **Responsive Design**: Mobile-first with glassmorphism
- **Performance**: Optimized images and code splitting
- **Security**: NextAuth.js with role-based access
- **SEO**: Optimized meta tags and structured data

## 🔐 Security Features

### Server Security
- **Firewall**: UFW configured with minimal open ports
- **Security Headers**: Comprehensive HTTP security headers
- **SSL Ready**: Let's Encrypt integration
- **User Isolation**: Dedicated application user

### Application Security
- **Authentication**: NextAuth.js with JWT
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive data sanitization
- **CSRF Protection**: Built-in Next.js protection
- **Password Security**: bcrypt with salt rounds

## 📈 Performance Optimization

### Frontend
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Dynamic imports and lazy loading
- **Caching**: Browser and CDN caching strategies
- **Compression**: Gzip compression for all assets

### Backend
- **Database Indexing**: Optimized PostgreSQL queries
- **Connection Pooling**: Efficient database connections
- **Caching**: Redis for sessions and data
- **PM2 Clustering**: Multiple Node.js instances

## 🔄 Maintenance & Updates

### Automatic Features
- **Daily Backups**: Automated database and file backups
- **Log Rotation**: Automatic log management
- **PM2 Monitoring**: Process health monitoring
- **Auto-restart**: Application restart on failures
- **Update Script**: Automated update process with `update.sh`

### Quick Update Process
The `update.sh` script automates the entire update process:

1. **Pull latest changes** from GitHub
2. **Install dependencies** (npm install)
3. **Generate Prisma client** (npx prisma generate)
4. **Run database migrations** (npx prisma migrate deploy)
5. **Build application** (npm run build)
6. **Restart PM2** application
7. **Health check** and status verification
8. **Show logs** for troubleshooting

**Usage:**
```bash
# SSH into your server
ssh root@87.107.73.10

# Navigate to project directory
cd /var/www/hs6tools

# Make script executable (first time only)
chmod +x update.sh

# Run update script
./update.sh
```

The script includes:
- ✅ Pre-flight checks (Git, Node.js, PM2)
- ✅ Optional backup before update
- ✅ Error handling and rollback support
- ✅ Colored output for better readability
- ✅ Health checks after update
- ✅ Automatic log display

### Manual Commands
```bash
# Check application status
ssh root@87.107.73.10 'pm2 status'

# View application logs
ssh root@87.107.73.10 'pm2 logs hs6tools'

# Restart application
ssh root@87.107.73.10 'pm2 restart hs6tools'

# Update application (Recommended - Automated)
ssh root@87.107.73.10 'cd /var/www/hs6tools && chmod +x update.sh && ./update.sh'

# Update application (Manual)
ssh root@87.107.73.10 'cd /var/www/hs6tools && git pull && npm install && npx prisma generate && npx prisma migrate deploy && npm run build && pm2 restart hs6tools'

# Full deployment (First time or complete rebuild)
ssh root@87.107.73.10 'cd /var/www/hs6tools && ./deploy.sh'

# Manual backup
ssh root@87.107.73.10 'cd /var/www/hs6tools && ./backup.sh'
```

## 🌐 Access Information

### URLs
- **Main Site**: http://87.107.73.10
- **Admin Panel**: http://87.107.73.10/fa/admin
- **API Endpoints**: http://87.107.73.10/api/*

### Test Credentials

Create environment-specific QA accounts and store their credentials in the deployment platform's secret manager. Never reuse seed or production credentials.

## 🚨 Troubleshooting

### Common Issues

1. **Application not starting**:
   ```bash
   ssh root@87.107.73.10 'pm2 logs hs6tools'
   ```

2. **Database connection issues**:
   ```bash
   ssh root@87.107.73.10 'sudo -u postgres psql -c "\l"'
   ```

3. **Nginx issues**:
   ```bash
   ssh root@87.107.73.10 'systemctl status nginx'
   ssh root@87.107.73.10 'tail -f /var/log/nginx/error.log'
   ```

### Log Locations
- **Application**: `/var/log/pm2/`
- **Nginx**: `/var/log/nginx/`
- **System**: `/var/log/syslog`
- **PostgreSQL**: `/var/log/postgresql/`

## 🌍 Next Steps

### Domain Configuration
1. Point your domain to `87.107.73.10`
2. Set up SSL: `certbot --nginx -d your-domain.com`
3. Update environment variables with your domain

### Production Configuration
1. Update payment gateway credentials
2. Configure email settings
3. Set up monitoring and alerts
4. Configure CDN for static assets

### Business Setup
1. Add your products and categories
2. Configure shipping and payment methods
3. Set up customer support
4. Configure analytics and tracking

## 📞 Support

For deployment issues:
1. Check the logs: `pm2 logs hs6tools`
2. Verify services: `systemctl status nginx postgresql redis-server`
3. Check firewall: `ufw status`
4. Review the comprehensive guide in `deploy/README.md`

## 🎉 Success!

Your HS6Tools e-commerce platform is now deployed and ready for production use. The application includes:

- ✅ Complete e-commerce functionality
- ✅ Advanced admin panel with analytics
- ✅ Multilingual support (Persian, English, Arabic)
- ✅ Mobile-responsive design
- ✅ Production-ready security
- ✅ Automated backups and monitoring
- ✅ Scalable architecture

The platform is ready to serve customers and grow your business!
