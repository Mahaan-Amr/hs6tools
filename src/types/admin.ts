import { 
  UserRole, 
  OrderStatus, 
  PaymentStatus, 
  PaymentMethod, 
  ShippingMethod
} from "@prisma/client";

// ============================================================================
// PRODUCT MANAGEMENT TYPES
// ============================================================================

export interface AdminProduct {
  id: string;
  sku: string;
  name: string;                    // Persian name (for admin)
  slug: string;
  description?: string;            // Persian description (for admin)
  shortDescription?: string;       // Persian short description (for admin)
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  isInStock: boolean;
  allowBackorders: boolean;
  weight?: number;
  dimensions?: Record<string, unknown>;
  material?: string;
  warranty?: string;
  brand?: string;
  categoryId: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  
  // Multilingual fields for customer-facing website
  nameEn?: string;                 // English name
  nameAr?: string;                 // Arabic name
  descriptionEn?: string;          // English description
  descriptionAr?: string;          // Arabic description
  shortDescriptionEn?: string;     // English short description
  shortDescriptionAr?: string;     // Arabic short description
  
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  images: AdminProductImage[];
  variants: AdminProductVariant[];
  _count: {
    reviews: number;
    orderItems: number;
  };
}

export interface AdminProductImage {
  id: string;
  productId: string;
  url: string;
  alt?: string;
  title?: string;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface AdminProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  attributes: Record<string, unknown>;
  price?: number;
  comparePrice?: number;
  stockQuantity: number;
  isInStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  sku: string;
  name: string;                    // Persian name (for admin)
  slug: string;
  description?: string;            // Persian description (for admin)
  shortDescription?: string;       // Persian short description (for admin)
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  isInStock: boolean;
  allowBackorders: boolean;
  weight?: number;
  dimensions?: Record<string, unknown>;
  material?: string;
  warranty?: string;
  brand?: string;
  categoryId: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  
  // Multilingual fields for customer-facing website
  nameEn?: string;                 // English name
  nameAr?: string;                 // Arabic name
  descriptionEn?: string;          // English description
  descriptionAr?: string;          // Arabic description
  shortDescriptionEn?: string;     // English short description
  shortDescriptionAr?: string;     // Arabic short description
  
  // Product images
  images?: AdminProductImage[];
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

// ============================================================================
// CATEGORY MANAGEMENT TYPES
// ============================================================================

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  
  // Multilingual fields for customer-facing website
  nameEn?: string;
  nameAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  
  parent?: {
    id: string;
    name: string;
    slug: string;
  };
  children: AdminCategory[];
  _count: {
    products: number;
    children: number;
  };
}

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isActive: boolean;
  sortOrder: number;
  
  // Multilingual fields
  nameEn?: string;
  nameAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string;
}

// ============================================================================
// ORDER MANAGEMENT TYPES
// ============================================================================

export interface AdminOrder {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  customerEmail: string;
  customerPhone?: string;
  customerNote?: string;
  shippingAddressId: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  paymentDate?: string;
  shippingMethod: ShippingMethod;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  shippingAddress: AdminAddress;
  orderItems: AdminOrderItem[];
  _count: {
    orderItems: number;
  };
}

export interface AdminOrderItem {
  id: string;
  orderId: string;
  productId?: string;
  variantId?: string;
  sku: string;
  name: string;
  description?: string;
  image?: string;
  unitPrice: number;
  totalPrice: number;
  quantity: number;
  attributes?: Record<string, unknown>;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    slug: string;
  };
  variant?: {
    id: string;
    name: string;
    sku: string;
  };
}

export interface AdminAddress {
  id: string;
  userId: string;
  type: string;
  title: string;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrderData {
  id: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

// ============================================================================
// USER MANAGEMENT TYPES
// ============================================================================

export interface AdminUser {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  avatar?: string;
  dateOfBirth?: string;
  gender?: string;
  company?: string;
  position?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  deletedAt?: string;
  _count: {
    orders: number;
    addresses: number;
    reviews: number;
    articles: number;
  };
}

export interface CreateUserData {
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
  company?: string;
  position?: string;
}

export interface UpdateUserData {
  id: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
  company?: string;
  position?: string;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
}

export interface SalesAnalytics {
  dailySales: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  monthlySales: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  topCategories: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
}

export interface UserAnalytics {
  newUsers: Array<{
    date: string;
    count: number;
  }>;
  userRoles: Array<{
    role: UserRole;
    count: number;
  }>;
  userActivity: Array<{
    date: string;
    activeUsers: number;
    totalUsers: number;
  }>;
}

// ============================================================================
// SYSTEM SETTINGS TYPES
// ============================================================================

export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;
  contactPhone: string;
  businessAddress: string;
  currency: string;
  language: string;
  timezone: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  requirePhoneVerification: boolean;
}

export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  enableSSL: boolean;
  isActive: boolean;
}

export interface PaymentSettings {
  zarinpalMerchantId: string;
  zarinpalApiKey: string;
  zarinpalSandbox: boolean;
  allowBankTransfer: boolean;
  allowCashOnDelivery: boolean;
  minimumOrderAmount: number;
  maximumOrderAmount: number;
}

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: Record<string, unknown>;
}

export interface BulkActionData {
  ids: string[];
  action: string;
  data?: Record<string, unknown>;
}

export interface FilterOptions {
  status?: string;
  category?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  inStock?: boolean;
  isActive?: boolean;
}
