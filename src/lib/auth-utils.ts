import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";
import { UserRole } from "@prisma/client";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function getCurrentUserWithDetails() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      addresses: true,
      orders: {
        include: {
          orderItems: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
    },
  });

  return user;
}

export function isAdmin(userRole: UserRole | undefined): boolean {
  return userRole === "ADMIN" || userRole === "SUPER_ADMIN";
}

export function isSuperAdmin(userRole: UserRole | undefined): boolean {
  return userRole === "SUPER_ADMIN";
}

export function hasPermission(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  
  const roleHierarchy = {
    CUSTOMER: 1,
    ADMIN: 2,
    SUPER_ADMIN: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (!isAdmin(user.role)) {
    throw new Error("Admin access required");
  }
  return user;
}

export async function requireSuperAdmin() {
  const user = await requireAuth();
  if (!isSuperAdmin(user.role)) {
    throw new Error("Super admin access required");
  }
  return user;
}
