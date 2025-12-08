-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN "expiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "orders_expiresAt_paymentStatus_idx" ON "public"."orders"("expiresAt", "paymentStatus");

-- Add comment
COMMENT ON COLUMN "public"."orders"."expiresAt" IS 'Order expiry time for auto-cancellation of unpaid orders (typically 30 minutes from creation)';

