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
import { sanitizePaymentSettings } from "@/lib/settings-redaction";

type PaymentSettingsInput = {
  zarinpalMerchantId: string;
  zarinpalApiKey?: string;
  zarinpalSandbox: boolean;
  allowBankTransfer: boolean;
  allowCashOnDelivery: boolean;
  minimumOrderAmount: number;
  maximumOrderAmount: number;
};

const defaultPaymentSettings: PaymentSettingsInput = {
  zarinpalMerchantId: "",
  zarinpalApiKey: "",
  zarinpalSandbox: true,
  allowBankTransfer: true,
  allowCashOnDelivery: true,
  minimumOrderAmount: 0,
  maximumOrderAmount: 1_000_000_000,
};

function validatePaymentSettings(input: unknown) {
  if (!input || typeof input !== "object") {
    return { ok: false as const, error: "Invalid settings" };
  }
  const value = input as PaymentSettingsInput;
  if (
    typeof value.minimumOrderAmount !== "number" ||
    typeof value.maximumOrderAmount !== "number" ||
    value.minimumOrderAmount < 0 ||
    value.maximumOrderAmount < value.minimumOrderAmount
  ) {
    return { ok: false as const, error: "Invalid order amount range" };
  }
  return { ok: true as const, value };
}

const handlers = createRestrictedSettingsHandlers({
  getPrincipal: getSettingsPrincipal,
  read: () => prisma.paymentSettings.findFirst(),
  initialize: (actorId) =>
    prisma.$transaction((transaction) =>
      initializeSettings({
        read: () =>
          transaction.paymentSettings.findFirst(),
        create: async () => {
          const creation = await transaction.paymentSettings.createMany({
            data: [{ id: "default", ...defaultPaymentSettings }],
            skipDuplicates: true,
          });
          const settings = await transaction.paymentSettings.findUniqueOrThrow({
            where: { id: "default" },
          });
          return { settings, created: creation.count === 1 };
        },
        audit: () =>
          recordSettingsInitialization(
            transaction,
            SettingsGroup.PAYMENT,
            actorId,
          ),
      }),
    ),
  update: (input: PaymentSettingsInput, actorId) =>
    prisma.$transaction((transaction) =>
      configureSettings({
        read: () => transaction.paymentSettings.findFirst(),
        write: (existing) => {
          const zarinpalApiKey =
            input.zarinpalApiKey || existing?.zarinpalApiKey || "";
          const data = { ...input, zarinpalApiKey };
          return existing
            ? transaction.paymentSettings.update({
                where: { id: existing.id },
                data,
              })
            : transaction.paymentSettings.create({
                data: { id: "default", ...data },
              });
        },
        audit: () =>
          recordSettingsInitialization(
            transaction,
            SettingsGroup.PAYMENT,
            actorId,
            SettingsAuditAction.CONFIGURED,
          ),
      }),
    ),
  sanitize: sanitizePaymentSettings,
  validate: validatePaymentSettings,
});

export const { GET, POST, PUT } = handlers;
