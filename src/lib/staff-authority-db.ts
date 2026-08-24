import type { Prisma } from "@prisma/client";
import { activeAccountAuthority } from "@/lib/staff-authority";

const staffAuthorityLockId = 2_140_010;

export class StaffAuthorityForbiddenError extends Error {}

export async function requireCurrentStaffActorUnderLock(
  tx: Prisma.TransactionClient,
  actorId: string,
) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(${staffAuthorityLockId})`;
  const currentActor = activeAccountAuthority(
    await tx.user.findUnique({ where: { id: actorId } }),
  );

  if (
    !currentActor ||
    (currentActor.role !== "ADMIN" && currentActor.role !== "SUPER_ADMIN")
  ) {
    throw new StaffAuthorityForbiddenError();
  }

  return currentActor;
}
