-- AlterTable
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shippingMethodId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "orders_shippingMethodId_idx" ON "orders"("shippingMethodId");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_shippingMethodId_fkey" FOREIGN KEY ("shippingMethodId") REFERENCES "shipping_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

