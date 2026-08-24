CREATE TYPE "SettingsGroup" AS ENUM ('SYSTEM', 'PAYMENT', 'EMAIL');
CREATE TYPE "SettingsAuditAction" AS ENUM ('INITIALIZED', 'CONFIGURED');

CREATE TABLE "settings_audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "settingsGroup" "SettingsGroup" NOT NULL,
    "action" "SettingsAuditAction" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settings_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "settings_audit_logs_actorId_createdAt_idx"
ON "settings_audit_logs"("actorId", "createdAt");
