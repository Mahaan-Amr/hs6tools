import type { UserRole } from "@prisma/client";

export interface AccountAuthorityState {
  id: string;
  role: UserRole;
  isActive: boolean;
  deletedAt: Date | null;
}

const userRoles = new Set<UserRole>(["CUSTOMER", "ADMIN", "SUPER_ADMIN"]);

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && userRoles.has(value as UserRole);
}

type AccountAuthorityUpdate = Partial<
  Pick<AccountAuthorityState, "role" | "isActive" | "deletedAt">
> &
  Record<string, unknown>;

export function activeAccountAuthority(
  account: AccountAuthorityState | null,
): Pick<AccountAuthorityState, "id" | "role"> | null {
  if (!account?.isActive || account.deletedAt) return null;
  return { id: account.id, role: account.role };
}

export function canAssignAccountRole(
  actorRole: UserRole,
  assignedRole: UserRole,
): boolean {
  return assignedRole === "CUSTOMER" || actorRole === "SUPER_ADMIN";
}

export function canChangeAccountRole(
  actorRole: UserRole,
  currentRole: UserRole,
  assignedRole: UserRole,
): boolean {
  const changesStaffAuthority =
    currentRole !== "CUSTOMER" || assignedRole !== "CUSTOMER";
  return !changesStaffAuthority || actorRole === "SUPER_ADMIN";
}

export function canChangeStaffStatus(
  actorRole: UserRole,
  currentRole: UserRole,
): boolean {
  return currentRole === "CUSTOMER" || actorRole === "SUPER_ADMIN";
}

export function removesActiveSuperAdmin(
  existing: Pick<AccountAuthorityState, "role" | "isActive" | "deletedAt">,
  update: AccountAuthorityUpdate,
): boolean {
  const isCurrentlyActiveSuperAdmin =
    existing.role === "SUPER_ADMIN" &&
    existing.isActive &&
    existing.deletedAt === null;

  if (!isCurrentlyActiveSuperAdmin) return false;

  return (
    (update.role !== undefined && update.role !== "SUPER_ADMIN") ||
    update.isActive === false ||
    (update.deletedAt !== undefined && update.deletedAt !== null)
  );
}

export function canRemoveActiveSuperAdmin(
  activeSuperAdminCount: number,
): boolean {
  return activeSuperAdminCount > 1;
}
