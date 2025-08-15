# Technical Requirements & Architecture

## Technology Stack

### Frontend & Backend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand or Redux Toolkit
- **Form Handling**: React Hook Form + Zod validation

### Database & ORM
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 5+
- **Database Hosting**: Self-hosted on Ubuntu server
- **Connection Pooling**: PgBouncer for performance

### Authentication & Security
- **Authentication**: NextAuth.js v5
- **Session Management**: JWT with secure cookies
- **Password Security**: bcrypt with salt rounds
- **CSRF Protection**: Built-in Next.js protection
- **Rate Limiting**: Upstash Rate Limiter

### Payment Integration
- **Primary Gateway**: ZarinPal
- **Payment Methods**: Online payment, bank transfer
- **Order Management**: Custom order tracking system
- **Invoice Generation**: PDF generation with jsPDF

### File Management
- **Image Storage**: Local storage with optimization
- **Video Storage**: Local storage with compression
- **File Upload**: Multer with size and type validation
- **Image Processing**: Sharp for optimization

### Performance & Optimization
- **Caching**: Redis for session and data caching
- **CDN**: Local asset optimization
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Dynamic imports and lazy loading

## System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend     │    │   Backend API   │    │   Database      │
│   (Next.js)    │◄──►│   (Next.js)     │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│   File Storage  │◄─────────────┘
                        └─────────────────┘
```

### Component Architecture
- **Atomic Design**: Components, templates, and pages
- **Server Components**: Next.js 14 App Router
- **Client Components**: Interactive UI elements
- **API Routes**: RESTful API endpoints
- **Middleware**: Authentication and validation

## Database Design

### Core Entities
- **Users**: Customer and admin accounts
- **Products**: Product catalog with variants
- **Categories**: Product classification
- **Orders**: Purchase transactions
- **Content**: Educational articles and media
- **Inventory**: Stock management
- **Payments**: Transaction records

### Database Schema Highlights
- **Normalized Design**: Efficient data storage
- **Indexing Strategy**: Performance optimization
- **Foreign Key Constraints**: Data integrity
- **Soft Deletes**: Data preservation
- **Audit Trails**: Change tracking

## Security Requirements

### Data Protection
- **Encryption**: AES-256 for sensitive data
- **HTTPS**: SSL/TLS encryption
- **Input Validation**: XSS and SQL injection prevention
- **Output Encoding**: Safe data rendering
- **Session Security**: Secure cookie settings

### Access Control
- **Role-Based Access**: Customer, Admin, Super Admin
- **Permission System**: Granular access control
- **API Security**: Rate limiting and authentication
- **Admin Panel**: Secure administrative access

## Performance Requirements

### Loading Times
- **First Contentful Paint**: < 1.5 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **Time to Interactive**: < 3.5 seconds
- **Cumulative Layout Shift**: < 0.1

### Scalability
- **Concurrent Users**: Support for 1000+ users
- **Database Connections**: Connection pooling
- **Caching Strategy**: Multi-level caching
- **CDN Integration**: Asset delivery optimization

## Mobile Requirements

### Mobile-First Design
- **Responsive Design**: All screen sizes supported
- **Touch Optimization**: Touch-friendly interfaces
- **Performance**: Optimized for mobile networks
- **PWA Features**: Offline capabilities

### Mobile-Specific Features
- **Touch Gestures**: Swipe, pinch, tap
- **Mobile Navigation**: Bottom navigation bar
- **Mobile Forms**: Optimized input fields
- **Mobile Payments**: Mobile-optimized checkout

## Multi-Language Support

### Internationalization
- **Framework**: next-intl or react-i18next
- **Language Detection**: Automatic and manual
- **RTL Support**: Arabic language support
- **Localization**: Date, number, and currency formats

### Content Management
- **Translation System**: Admin-managed translations
- **Dynamic Content**: Language-specific content
- **SEO Optimization**: Multi-language SEO
- **URL Structure**: Language-specific routing

## Deployment & Hosting

### Server Requirements
- **Operating System**: Ubuntu 22.04 LTS
- **Web Server**: Nginx
- **Process Manager**: PM2
- **SSL Certificate**: Let's Encrypt
- **Domain**: Custom domain configuration

### Environment Setup
- **Node.js**: Version 18+ LTS
- **PostgreSQL**: Version 15+
- **Redis**: For caching and sessions
- **Environment Variables**: Secure configuration
- **Backup Strategy**: Automated database backups

## Monitoring & Analytics

### Performance Monitoring
- **Error Tracking**: Sentry integration
- **Performance Metrics**: Web Vitals tracking
- **Uptime Monitoring**: Server health checks
- **Log Management**: Structured logging

### Business Analytics
- **User Behavior**: Google Analytics 4
- **E-commerce Tracking**: Conversion funnel analysis
- **SEO Monitoring**: Search performance tracking
- **Custom Dashboards**: Business metrics visualization

---

*This document outlines all technical requirements and architectural decisions for the hs6tools platform.*
