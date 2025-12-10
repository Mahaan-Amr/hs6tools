import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export function hasRole(userRole: UserRole | undefined | null, allowed: UserRole[]): boolean {
  if (!userRole) return false;
  return allowed.includes(userRole);
}

export function requireRole(userRole: UserRole | undefined | null, allowed: UserRole[]): { ok: true } | { ok: false; error: string; status: number } {
  if (!userRole) {
    return { ok: false, error: "Unauthorized", status: 401 };
  }
  if (!allowed.includes(userRole)) {
    return { ok: false, error: "Forbidden", status: 403 };
  }
  return { ok: true };
}

/**
 * Centralized authz check for API routes
 * Returns session and user if authorized, or error response
 */
export async function requireAuth(
  allowedRoles: UserRole[] = ["ADMIN", "SUPER_ADMIN"]
): Promise<
  | { ok: true; session: Awaited<ReturnType<typeof getServerSession>>; user: { id: string; role: UserRole; email?: string; firstName?: string; lastName?: string; [key: string]: unknown } }
  | { ok: false; response: NextResponse }
> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  if (!hasRole(session.user.role, allowedRoles)) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      ),
    };
  }

  return { ok: true, session, user: session.user };
}

