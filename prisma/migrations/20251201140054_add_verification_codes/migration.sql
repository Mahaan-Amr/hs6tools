-- CreateEnum
CREATE TYPE "public"."VerificationType" AS ENUM ('PHONE_VERIFICATION', 'PASSWORD_RESET', 'EMAIL_VERIFICATION');

-- CreateTable
CREATE TABLE "public"."verification_codes" (
    "id" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "code" TEXT NOT NULL,
    "type" "public"."VerificationType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "verification_codes_phone_type_used_idx" ON "public"."verification_codes"("phone", "type", "used");

-- CreateIndex
CREATE INDEX "verification_codes_email_type_used_idx" ON "public"."verification_codes"("email", "type", "used");
