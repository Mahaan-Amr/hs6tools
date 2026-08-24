ALTER TABLE "public"."verification_codes"
  ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "proofDigest" TEXT,
  ADD COLUMN "verifiedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "verification_codes_proofDigest_key"
  ON "public"."verification_codes"("proofDigest");

CREATE TABLE "public"."verification_rate_limits" (
  "key" TEXT NOT NULL,
  "count" INTEGER NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "verification_rate_limits_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "verification_rate_limits_expiresAt_idx"
  ON "public"."verification_rate_limits"("expiresAt");
