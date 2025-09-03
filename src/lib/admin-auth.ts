import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";

/**
 * Check if user has admin access
 */
export function isAdmin(role: UserRole | undefined): boolean {
  console.log("isAdmin function called with role:", role);
  const result = role === "ADMIN" || role === "SUPER_ADMIN";
  console.log("isAdmin result:", result);
  return result;
}

/**
 * Check if user has super admin access
 */
export function isSuperAdmin(role: UserRole | undefined): boolean {
  return role === "SUPER_ADMIN";
}

/**
 * Check if user has permission for specific role
 */
export function hasPermission(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  
  const roleHierarchy = {
    CUSTOMER: 1,
    ADMIN: 2,
    SUPER_ADMIN: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Require authentication for admin routes
 */
export async function requireAdminAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/auth/login");
  }

  if (!isAdmin(session.user.role)) {
    redirect("/");
  }

  return session.user;
}

/**
 * Require super admin access for sensitive operations
 */
export async function requireSuperAdminAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/auth/login");
  }

  if (!isSuperAdmin(session.user.role)) {
    redirect("/admin");
  }

  return session.user;
}

/**
 * Get current admin user with role validation
 */
export async function getCurrentAdminUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !isAdmin(session.user.role)) {
    return null;
  }

  return session.user;
}

/**
 * Check if user can access specific admin feature
 */
export function canAccessFeature(userRole: UserRole | undefined, feature: string): boolean {
  if (!userRole) return false;

  // Define feature permissions
  const featurePermissions: Record<string, UserRole[]> = {
    // Product management - Admin and Super Admin
    "products": ["ADMIN", "SUPER_ADMIN"],
    "categories": ["ADMIN", "SUPER_ADMIN"],
    
    // User management - Super Admin only
    "users": ["SUPER_ADMIN"],
    "roles": ["SUPER_ADMIN"],
    
    // Order management - Admin and Super Admin
    "orders": ["ADMIN", "SUPER_ADMIN"],
    
    // Content management - Admin and Super Admin
    "content": ["ADMIN", "SUPER_ADMIN"],
    "blog": ["ADMIN", "SUPER_ADMIN"],
    
    // Analytics and reports - Admin and Super Admin
    "analytics": ["ADMIN", "SUPER_ADMIN"],
    "reports": ["ADMIN", "SUPER_ADMIN"],
    
    // System settings - Super Admin only
    "settings": ["SUPER_ADMIN"],
    "system": ["SUPER_ADMIN"],
  };

  const allowedRoles = featurePermissions[feature];
  return allowedRoles ? allowedRoles.includes(userRole) : false;
}

/**
 * Get admin navigation items based on user role
 */
export function getAdminNavigationItems(userRole: UserRole | undefined) {
  const allItems = [
    {
      name: "داشبورد",
      href: "/admin",
      icon: "dashboard",
      roles: ["ADMIN", "SUPER_ADMIN"]
    },
    {
      name: "محصولات",
      href: "/admin/products",
      icon: "products",
      roles: ["ADMIN", "SUPER_ADMIN"]
    },
    {
      name: "دسته‌بندی‌ها",
      href: "/admin/categories",
      icon: "categories",
      roles: ["ADMIN", "SUPER_ADMIN"]
    },
    {
      name: "سفارشات",
      href: "/admin/orders",
      icon: "orders",
      roles: ["ADMIN", "SUPER_ADMIN"]
    },
    {
      name: "کاربران",
      href: "/admin/users",
      icon: "users",
      roles: ["SUPER_ADMIN"]
    },
    {
      name: "محتوا",
      href: "/admin/content",
      icon: "content",
      roles: ["ADMIN", "SUPER_ADMIN"]
    },
    {
      name: "گزارش‌ها",
      href: "/admin/analytics",
      icon: "analytics",
      roles: ["ADMIN", "SUPER_ADMIN"]
    },
    {
      name: "تنظیمات",
      href: "/admin/settings",
      icon: "settings",
      roles: ["SUPER_ADMIN"]
    }
  ];

  return allItems.filter(item => 
    item.roles.includes(userRole as UserRole)
  );
}

/**
 * Validate admin session and redirect if unauthorized
 */
export async function validateAdminSession() {
  try {
    const user = await requireAdminAuth();
    return user;
  } catch {
    // If there's an error, redirect to login
    redirect("/auth/login");
  }
}
