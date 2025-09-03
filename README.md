# 🛠️ HS6Tools - Industrial E-Commerce Platform

A comprehensive, multi-language e-commerce platform for industrial and woodworking tools, built with Next.js 14+, TypeScript, and modern web technologies.

## ✨ Features

### 🎯 Core E-Commerce
- **Product Management**: Complete product catalog with categories, variants, and images
- **Shopping Cart**: Persistent cart with Zustand state management
- **Checkout Process**: Multi-step checkout with address and shipping management
- **User Authentication**: NextAuth.js v5 with role-based access control

### 🌍 Multi-Language Support
- **Languages**: Farsi (default), English, Arabic
- **RTL Support**: Full right-to-left layout for Arabic and Farsi
- **Localization**: Currency, date, and number formatting

### 🎨 Modern Design
- **Glassmorphism**: 2025 design trends with glass effects
- **Responsive**: Mobile-first design with industrial aesthetics
- **Accessibility**: WCAG 2.1 AA compliance

### 🔐 Admin Panel
- **Dashboard**: Comprehensive analytics and statistics
- **Role Management**: Admin and Super Admin access levels
- **Content Management**: Product, category, and user management
- **Security**: Protected admin routes with authentication

## 🚀 Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL 15+
- **Authentication**: NextAuth.js v5 with JWT
- **State Management**: Zustand
- **Styling**: Tailwind CSS with custom design system

## 📊 Project Status

### Current Progress: **90% Complete**

#### ✅ Completed Features
- **Multi-Language System**: 100% complete with RTL support
- **Database Foundation**: 100% complete with PostgreSQL and Prisma
- **Authentication System**: 100% complete with NextAuth.js v5
- **E-Commerce Foundation**: 100% complete with products and categories
- **Shopping Cart System**: 100% complete with checkout flow
- **Admin Panel Development**: 100% complete with dashboard and management
- **Content Management System**: 100% complete with blog and educational content

#### 🔄 In Progress
- **Advanced Features**: 0% complete

#### 📅 Upcoming
- **Payment Integration**: ZarinPal gateway
- **Testing & QA**: Comprehensive testing suite
- **Deployment**: Production deployment on Ubuntu server

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ LTS
- PostgreSQL 15+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hs6tools.git
   cd hs6tools
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your database credentials
   ```

4. **Set up database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Multi-language routes
│   │   ├── admin/         # Admin panel
│   │   ├── auth/          # Authentication pages
│   │   ├── shop/          # E-commerce pages
│   │   └── ...
│   └── api/               # API routes
├── components/             # React components
│   ├── admin/             # Admin components
│   ├── ecommerce/         # E-commerce components
│   ├── layout/            # Layout components
│   └── ui/                # UI components
├── lib/                   # Utility libraries
├── contexts/              # React contexts
└── types/                 # TypeScript types
```

## 🔐 Admin Access

To access the admin panel:

1. **Register a user account** through `/auth/register`
2. **Update user role** in the database to `ADMIN` or `SUPER_ADMIN`
3. **Navigate to** `/[locale]/admin`

### Admin Features
- **Dashboard**: Overview of sales, products, and users
- **Product Management**: Create, edit, and manage products
- **Category Management**: Organize product categories
- **User Management**: Manage customer and admin accounts
- **Order Management**: Process and track orders
- **Content Management**: Create and manage blog articles and educational content
- **Analytics**: Business insights and performance metrics

## 🌐 Multi-Language Support

The platform supports three languages with automatic detection:

- **Farsi (fa)**: Default language with RTL support
- **English (en)**: International market support
- **Arabic (ar)**: Middle East market with RTL support

### Language Switching
Users can switch languages using the language switcher in the header, and the system will remember their preference.

## 🎨 Design System

### Color Palette
- **Primary Orange**: #FF6B35 (Brand color)
- **Primary Black**: #1A1A1A (Background)
- **Glass Effects**: Backdrop blur with transparency

### Components
- **Glass Cards**: Modern glassmorphism design
- **Responsive Grid**: Mobile-first layout system
- **Interactive Elements**: Hover effects and animations

## 📱 Mobile-First Design

The platform is designed with mobile users in mind:
- **Touch-Friendly**: Optimized for mobile interactions
- **Responsive Layout**: Adapts to all screen sizes
- **Performance**: Fast loading on mobile networks

## 🔒 Security Features

- **Authentication**: Secure user authentication with NextAuth.js
- **Authorization**: Role-based access control
- **Data Protection**: Input validation and sanitization
- **HTTPS Ready**: SSL certificate support

## 🚀 Deployment

### Production Requirements
- **Server**: Ubuntu 22.04 LTS
- **Web Server**: Nginx
- **Process Manager**: PM2
- **SSL**: Let's Encrypt certificates

### Deployment Steps
1. **Server Setup**: Configure Ubuntu server
2. **Database**: Install and configure PostgreSQL
3. **Application**: Deploy with PM2
4. **Web Server**: Configure Nginx with SSL
5. **Domain**: Point domain to server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Email**: support@hs6tools.com
- **Documentation**: Check the `docs/` folder
- **Issues**: Use GitHub Issues for bug reports

## 🎯 Roadmap

### Phase 1: Foundation ✅ COMPLETED
- [x] Project setup and architecture
- [x] Multi-language system
- [x] Database and authentication
- [x] E-commerce foundation
- [x] Admin panel development

### Phase 2: Content & Admin 🔄 IN PROGRESS
- [ ] Content management system
- [ ] Blog and educational content
- [ ] Advanced admin features

### Phase 3: Advanced Features
- [ ] Payment integration (ZarinPal)
- [ ] Advanced search and filtering
- [ ] Performance optimization

### Phase 4: Launch
- [ ] Testing and quality assurance
- [ ] Production deployment
- [ ] Monitoring and maintenance

---

**Built with ❤️ for the industrial tools industry**
