-- CreateEnum
CREATE TYPE "public"."DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "public"."CouponApplicableTo" AS ENUM ('ALL', 'CATEGORIES', 'PRODUCTS');

-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "couponCode" TEXT,
ADD COLUMN     "couponId" TEXT;

-- CreateTable
CREATE TABLE "public"."coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountType" "public"."DiscountType" NOT NULL,
    "discountValue" DECIMAL(10,2) NOT NULL,
    "minimumAmount" DECIMAL(10,2),
    "maximumDiscount" DECIMAL(10,2),
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "userUsageLimit" INTEGER NOT NULL DEFAULT 1,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "applicableTo" "public"."CouponApplicableTo" NOT NULL DEFAULT 'ALL',
    "categoryIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "productIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "public"."coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_code_idx" ON "public"."coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_isActive_validFrom_validUntil_idx" ON "public"."coupons"("isActive", "validFrom", "validUntil");

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "public"."coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
