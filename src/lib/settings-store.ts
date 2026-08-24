import {
  Prisma,
  SettingsAuditAction,
  SettingsGroup,
  UserRole,
} from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveSettingsPrincipal } from "@/lib/settings-api";

export async function getSettingsPrincipal(): Promise<{
  id: string;
  role: UserRole;
} | null> {
  const session = await getServerSession(authOptions);
  return resolveSettingsPrincipal(session?.user, (id) =>
    prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, isActive: true },
    }),
  );
}

export async function recordSettingsInitialization(
  transaction: Prisma.TransactionClient,
  settingsGroup: SettingsGroup,
  actorId: string,
  action: SettingsAuditAction = SettingsAuditAction.INITIALIZED,
) {
  await transaction.settingsAuditLog.create({
    data: { actorId, settingsGroup, action },
  });
}
