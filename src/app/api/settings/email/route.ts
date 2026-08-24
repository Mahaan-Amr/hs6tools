import { SettingsAuditAction, SettingsGroup } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  configureSettings,
  createRestrictedSettingsHandlers,
  initializeSettings,
} from "@/lib/settings-api";
import {
  getSettingsPrincipal,
  recordSettingsInitialization,
} from "@/lib/settings-store";
import { sanitizeEmailSettings } from "@/lib/settings-redaction";

type EmailSettingsInput = {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword?: string;
  fromEmail: string;
  fromName: string;
  enableSSL: boolean;
  isActive: boolean;
};

const defaultEmailSettings: EmailSettingsInput = {
  smtpHost: "smtp.gmail.com",
  smtpPort: 587,
  smtpUser: "",
  smtpPassword: "",
  fromEmail: "noreply@hs6tools.com",
  fromName: "HS6Tools",
  enableSSL: true,
  isActive: false,
};

function validateEmailSettings(input: unknown) {
  if (!input || typeof input !== "object") {
    return { ok: false as const, error: "Invalid settings" };
  }
  const value = input as EmailSettingsInput;
  if (!value.smtpHost || !value.smtpPort || !value.fromEmail || !value.fromName) {
    return { ok: false as const, error: "Missing required fields" };
  }
  if (value.smtpPort < 1 || value.smtpPort > 65_535) {
    return { ok: false as const, error: "Invalid port number" };
  }
  return { ok: true as const, value };
}

const handlers = createRestrictedSettingsHandlers({
  getPrincipal: getSettingsPrincipal,
  read: () => prisma.emailSettings.findFirst(),
  initialize: (actorId) =>
    prisma.$transaction((transaction) =>
      initializeSettings({
        read: () =>
          transaction.emailSettings.findFirst(),
        create: async () => {
          const creation = await transaction.emailSettings.createMany({
            data: [{ id: "default", ...defaultEmailSettings }],
            skipDuplicates: true,
          });
          const settings = await transaction.emailSettings.findUniqueOrThrow({
            where: { id: "default" },
          });
          return { settings, created: creation.count === 1 };
        },
        audit: () =>
          recordSettingsInitialization(
            transaction,
            SettingsGroup.EMAIL,
            actorId,
          ),
      }),
    ),
  update: (input: EmailSettingsInput, actorId) =>
    prisma.$transaction((transaction) =>
      configureSettings({
        read: () => transaction.emailSettings.findFirst(),
        write: (existing) => {
          const smtpPassword = input.smtpPassword || existing?.smtpPassword || "";
          const data = { ...input, smtpPassword };
          return existing
            ? transaction.emailSettings.update({
                where: { id: existing.id },
                data,
              })
            : transaction.emailSettings.create({
                data: { id: "default", ...data },
              });
        },
        audit: () =>
          recordSettingsInitialization(
            transaction,
            SettingsGroup.EMAIL,
            actorId,
            SettingsAuditAction.CONFIGURED,
          ),
      }),
    ),
  sanitize: sanitizeEmailSettings,
  validate: validateEmailSettings,
});

export const { GET, POST, PUT } = handlers;
