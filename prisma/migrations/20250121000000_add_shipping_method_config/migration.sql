-- CreateTable (idempotent - only creates if doesn't exist)
CREATE TABLE IF NOT EXISTS "shipping_methods" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "estimatedDays" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_methods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (idempotent - only creates if doesn't exist)
CREATE INDEX IF NOT EXISTS "shipping_methods_isActive_sortOrder_idx" ON "shipping_methods"("isActive", "sortOrder");

