# Database Schema & Data Models

## Database Overview

### Technology Stack
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 5+
- **Connection Pooling**: PgBouncer
- **Backup Strategy**: Automated daily backups
- **Version Control**: Database migrations with Prisma

### Design Principles
- **Normalization**: 3NF design for data integrity
- **Performance**: Strategic indexing and query optimization
- **Scalability**: Efficient schema for growth
- **Security**: Encrypted sensitive data
- **Audit Trail**: Comprehensive change tracking

## Core Entity Models

### User Management

#### Users Table
```sql
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  phone         String?  @unique
  firstName     String
  lastName      String
  passwordHash  String
  role          UserRole @default(CUSTOMER)
  isActive      Boolean  @default(true)
  emailVerified Boolean  @default(false)
  phoneVerified Boolean  @default(false)
  
  // Profile Information
  avatar        String?
  dateOfBirth   DateTime?
  gender        Gender?
  company       String?
  position      String?
  
  // Addresses
  addresses     Address[]
  
  // Orders
  orders        Order[]
  
  // Wishlist
  wishlistItems WishlistItem[]
  
  // Reviews
  reviews       Review[]
  
  // Timestamps
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  lastLoginAt   DateTime?
  
  // Soft Delete
  deletedAt     DateTime?
  
  @@map("users")
}

enum UserRole {
  CUSTOMER
  ADMIN
  SUPER_ADMIN
}

enum Gender {
  MALE
  FEMALE
  OTHER
  PREFER_NOT_TO_SAY
}
```

#### Addresses Table
```sql
model Address {
  id          String   @id @default(cuid())
  userId      String
  type        AddressType
  title       String
  firstName   String
  lastName    String
  company     String?
  addressLine1 String
  addressLine2 String?
  city        String
  state       String
  postalCode  String
  country     String
  phone       String
  isDefault   Boolean  @default(false)
  
  // Relationships
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  orders      Order[]
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("addresses")
}

enum AddressType {
  BILLING
  SHIPPING
  BOTH
}
```

### Product Management

#### Categories Table
```sql
model Category {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  image       String?
  icon        String?
  
  // Hierarchy
  parentId    String?
  parent      Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryHierarchy")
  
  // Products
  products    Product[]
  
  // SEO
  metaTitle       String?
  metaDescription String?
  metaKeywords    String?
  
  // Status
  isActive    Boolean  @default(true)
  sortOrder   Int     @default(0)
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Soft Delete
  deletedAt   DateTime?
  
  @@map("categories")
}
```

#### Products Table
```sql
model Product {
  id          String   @id @default(cuid())
  sku         String   @unique
  name        String
  slug        String   @unique
  description String?
  shortDescription String?
  
  // Pricing
  price       Decimal  @db.Decimal(10, 2)
  comparePrice Decimal? @db.Decimal(10, 2)
  costPrice   Decimal? @db.Decimal(10, 2)
  
  // Inventory
  stockQuantity Int     @default(0)
  lowStockThreshold Int @default(5)
  isInStock   Boolean  @default(true)
  allowBackorders Boolean @default(false)
  
  // Product Details
  weight      Decimal? @db.Decimal(8, 3)
  dimensions  Json?    // {length, width, height}
  material    String?
  warranty    String?
  brand       String?
  
  // Categories
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
  
  // Images
  images      ProductImage[]
  
  // Variants
  variants    ProductVariant[]
  
  // Reviews
  reviews     Review[]
  
  // Wishlist
  wishlistItems WishlistItem[]
  
  // Order Items
  orderItems  OrderItem[]
  
  // SEO
  metaTitle       String?
  metaDescription String?
  metaKeywords    String?
  
  // Status
  isActive    Boolean  @default(true)
  isFeatured  Boolean  @default(false)
  sortOrder   Int     @default(0)
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Soft Delete
  deletedAt   DateTime?
  
  @@map("products")
}
```

#### Product Images Table
```sql
model ProductImage {
  id          String   @id @default(cuid())
  productId   String
  url         String
  alt         String?
  title       String?
  sortOrder   Int     @default(0)
  isPrimary   Boolean  @default(false)
  
  // Relationships
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  // Timestamps
  createdAt   DateTime @default(now())
  
  @@map("product_images")
}
```

#### Product Variants Table
```sql
model ProductVariant {
  id          String   @id @default(cuid())
  productId   String
  sku         String   @unique
  name        String
  
  // Attributes
  attributes  Json     // {color: "red", size: "large"}
  
  // Pricing
  price       Decimal? @db.Decimal(10, 2)
  comparePrice Decimal? @db.Decimal(10, 2)
  
  // Inventory
  stockQuantity Int     @default(0)
  isInStock   Boolean  @default(true)
  
  // Images
  images      ProductVariantImage[]
  
  // Order Items
  orderItems  OrderItem[]
  
  // Relationships
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("product_variants")
}
```

### Order Management

#### Orders Table
```sql
model Order {
  id          String   @id @default(cuid())
  orderNumber String   @unique
  userId      String
  
  // Order Details
  status      OrderStatus @default(PENDING)
  totalAmount Decimal  @db.Decimal(10, 2)
  subtotal    Decimal  @db.Decimal(10, 2)
  taxAmount   Decimal  @db.Decimal(10, 2)
  shippingAmount Decimal @db.Decimal(10, 2)
  discountAmount Decimal @db.Decimal(10, 2)
  
  // Customer Information
  customerEmail String
  customerPhone String?
  customerNote  String?
  
  // Addresses
  billingAddressId  String
  shippingAddressId String
  billingAddress    Address @relation("BillingAddress", fields: [billingAddressId], references: [id])
  shippingAddress   Address @relation("ShippingAddress", fields: [shippingAddressId], references: [id])
  
  // Payment
  paymentMethod    PaymentMethod
  paymentStatus    PaymentStatus @default(PENDING)
  paymentId        String?
  paymentDate      DateTime?
  
  // Shipping
  shippingMethod   ShippingMethod
  trackingNumber   String?
  shippedAt        DateTime?
  deliveredAt      DateTime?
  
  // Relationships
  user            User        @relation(fields: [userId], references: [id])
  orderItems      OrderItem[]
  orderHistory    OrderHistory[]
  
  // Timestamps
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@map("orders")
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
}

enum PaymentMethod {
  ZARINPAL
  BANK_TRANSFER
  CASH_ON_DELIVERY
}

enum ShippingMethod {
  TIPAX
  POST
  EXPRESS
}
```

#### Order Items Table
```sql
model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  productId   String?
  variantId   String?
  
  // Product Information
  sku         String
  name        String
  description String?
  image       String?
  
  // Pricing
  unitPrice   Decimal  @db.Decimal(10, 2)
  totalPrice  Decimal  @db.Decimal(10, 2)
  quantity    Int
  
  // Attributes
  attributes  Json?    // Product variant attributes
  
  // Relationships
  order       Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product     Product?        @relation(fields: [productId], references: [id])
  variant     ProductVariant? @relation(fields: [variantId], references: [id])
  
  // Timestamps
  createdAt   DateTime @default(now())
  
  @@map("order_items")
}
```

### Content Management

#### Content Categories Table
```sql
model ContentCategory {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  image       String?
  
  // Hierarchy
  parentId    String?
  parent      ContentCategory? @relation("ContentCategoryHierarchy", fields: [parentId], references: [id])
  children    ContentCategory[] @relation("ContentCategoryHierarchy")
  
  // Content
  articles    Article[]
  
  // SEO
  metaTitle       String?
  metaDescription String?
  metaKeywords    String?
  
  // Status
  isActive    Boolean  @default(true)
  sortOrder   Int     @default(0)
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("content_categories")
}
```

#### Articles Table
```sql
model Article {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  excerpt     String?
  content     String
  
  // Categories
  categoryId  String?
  category    ContentCategory? @relation(fields: [categoryId], references: [id])
  
  // Media
  featuredImage String?
  images      ArticleImage[]
  videos      ArticleVideo[]
  
  // Author
  authorId    String?
  author      User?    @relation(fields: [authorId], references: [id])
  
  // SEO
  metaTitle       String?
  metaDescription String?
  metaKeywords    String?
  
  // Publishing
  status      ArticleStatus @default(DRAFT)
  publishedAt DateTime?
  isFeatured  Boolean  @default(false)
  
  // Engagement
  viewCount   Int     @default(0)
  likeCount   Int     @default(0)
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Soft Delete
  deletedAt   DateTime?
  
  @@map("articles")
}

enum ArticleStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

### Reviews & Ratings

#### Reviews Table
```sql
model Review {
  id          String   @id @default(cuid())
  productId   String
  userId      String
  
  // Review Content
  title       String?
  content     String
  rating      Int      // 1-5 stars
  
  // Status
  isApproved  Boolean  @default(false)
  isVerified  Boolean  @default(false)
  
  // Relationships
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("reviews")
}
```

### Wishlist

#### Wishlist Items Table
```sql
model WishlistItem {
  id          String   @id @default(cuid())
  userId      String
  productId   String
  
  // Relationships
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  // Timestamps
  createdAt   DateTime @default(now())
  
  @@unique([userId, productId])
  @@map("wishlist_items")
}
```

## Database Indexes

### Performance Indexes
```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

-- Products
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_is_active ON products(is_active);

-- Orders
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- Reviews
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
```

## Data Relationships

### Entity Relationship Diagram
```
Users (1) ──── (N) Addresses
Users (1) ──── (N) Orders
Users (1) ──── (N) Reviews
Users (1) ──── (N) WishlistItems
Users (1) ──── (N) Articles

Categories (1) ──── (N) Products
Categories (1) ──── (N) Categories (self-referencing)

Products (1) ──── (N) ProductImages
Products (1) ──── (N) ProductVariants
Products (1) ──── (N) Reviews
Products (1) ──── (N) OrderItems
Products (1) ──── (N) WishlistItems

Orders (1) ──── (N) OrderItems
Orders (1) ──── (1) Addresses (billing)
Orders (1) ──── (1) Addresses (shipping)

ContentCategories (1) ──── (N) Articles
ContentCategories (1) ──── (N) ContentCategories (self-referencing)

Articles (1) ──── (N) ArticleImages
Articles (1) ──── (N) ArticleVideos
```

## Data Migration Strategy

### Migration Phases
1. **Initial Schema**: Core tables and relationships
2. **Data Seeding**: Initial categories, products, and content
3. **User Migration**: Existing user data import
4. **Content Migration**: Existing content and media import
5. **Performance Optimization**: Indexes and query optimization

### Backup Strategy
- **Daily Backups**: Automated database backups
- **Point-in-Time Recovery**: WAL archiving
- **Offsite Storage**: Secure backup storage
- **Testing**: Regular backup restoration testing

---

*This document defines the complete database schema and data models for the hs6tools platform.*
