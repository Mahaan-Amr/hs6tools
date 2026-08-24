import { Prisma, SettingsAuditAction, SettingsGroup } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  defaultSystemSettings,
  normalizeSiteSeo,
} from "@/lib/site-settings";
import {
  configureSettings,
  createRestrictedSettingsHandlers,
  initializeSettings,
} from "@/lib/settings-api";
import {
  getSettingsPrincipal,
  recordSettingsInitialization,
} from "@/lib/settings-store";

type SystemSettingsInput = Omit<
  typeof defaultSystemSettings,
  "id" | "siteSeo"
> & { siteSeo: unknown };

function validateSystemSettings(input: unknown) {
  if (!input || typeof input !== "object") {
    return { ok: false as const, error: "Invalid settings" };
  }

  const value = input as SystemSettingsInput;
  if (!value.siteName || !value.siteUrl || !value.contactEmail) {
    return { ok: false as const, error: "Missing required fields" };
  }

  return { ok: true as const, value };
}

const handlers = createRestrictedSettingsHandlers({
  getPrincipal: getSettingsPrincipal,
  read: () => prisma.systemSettings.findFirst(),
  initialize: (actorId) =>
    prisma.$transaction((transaction) =>
      initializeSettings({
        read: () =>
          transaction.systemSettings.findFirst(),
        create: async () => {
          const creation = await transaction.systemSettings.createMany({
            data: [{
              ...defaultSystemSettings,
              siteSeo:
                defaultSystemSettings.siteSeo as unknown as Prisma.InputJsonValue,
            }],
            skipDuplicates: true,
          });
          const settings = await transaction.systemSettings.findUniqueOrThrow({
            where: { id: "default" },
          });
          return { settings, created: creation.count === 1 };
        },
        audit: () =>
          recordSettingsInitialization(
            transaction,
            SettingsGroup.SYSTEM,
            actorId,
          ),
      }),
    ),
  update: (input: SystemSettingsInput, actorId) =>
    prisma.$transaction((transaction) => {
      const data = {
        ...input,
        siteSeo: normalizeSiteSeo(
          input.siteSeo,
        ) as unknown as Prisma.InputJsonValue,
      };
      return configureSettings({
        read: () => transaction.systemSettings.findFirst(),
        write: (existing) =>
          existing
            ? transaction.systemSettings.update({
                where: { id: existing.id },
                data,
              })
            : transaction.systemSettings.create({
                data: { id: "default", ...data },
              }),
        audit: () =>
          recordSettingsInitialization(
            transaction,
            SettingsGroup.SYSTEM,
            actorId,
            SettingsAuditAction.CONFIGURED,
          ),
      });
    }),
  sanitize: (settings) => ({
    ...settings,
    siteSeo: normalizeSiteSeo(settings.siteSeo),
  }),
  validate: validateSystemSettings,
});

export const { GET, POST, PUT } = handlers;
