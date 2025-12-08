import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      firstName: string;
      lastName: string;
      role: UserRole;
      isActive: boolean;
      emailVerified: boolean;
      phoneVerified: boolean;
      avatar?: string | null;
      company?: string | null;
      position?: string | null;
      lastLoginAt?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    avatar?: string | null;
    company?: string | null;
    position?: string | null;
    lastLoginAt?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    isActive: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    avatar?: string | null;
    company?: string | null;
    position?: string | null;
    lastLoginAt?: string | null;
  }
}
