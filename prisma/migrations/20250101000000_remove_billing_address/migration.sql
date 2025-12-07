-- Migration: Remove Billing Address
-- This migration removes the billing address concept from the platform
-- Only shipping addresses will be used going forward
-- 
-- IMPORTANT: This migration is safe and handles:
-- 1. Converting existing BILLING/BOTH addresses to SHIPPING
-- 2. Updating the AddressType enum
-- 3. Removing billingAddressId column from orders table

-- Step 1: Update AddressType enum - remove BILLING and BOTH, keep only SHIPPING
-- First, update any existing addresses with BILLING or BOTH type to SHIPPING
UPDATE "public"."addresses" 
SET "type" = 'SHIPPING'
WHERE "type" IN ('BILLING', 'BOTH');

-- Step 2: Alter the AddressType enum
-- Drop the old enum and create a new one with only SHIPPING
-- Check if enum exists before altering
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AddressType') THEN
    ALTER TYPE "public"."AddressType" RENAME TO "AddressType_old";
    CREATE TYPE "public"."AddressType" AS ENUM ('SHIPPING');
    ALTER TABLE "public"."addresses" ALTER COLUMN "type" TYPE "public"."AddressType" USING ("type"::text::"public"."AddressType");
    DROP TYPE "public"."AddressType_old";
  END IF;
END $$;

-- Step 3: Remove billingAddressId from orders table
-- First, drop the foreign key constraint if it exists (using DO block for better error handling)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'orders_billingAddressId_fkey' 
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE "public"."orders" DROP CONSTRAINT "orders_billingAddressId_fkey";
    RAISE NOTICE 'Dropped constraint orders_billingAddressId_fkey';
  END IF;
END $$;

-- Then drop the column if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'billingAddressId'
  ) THEN
    ALTER TABLE "public"."orders" DROP COLUMN "billingAddressId";
    RAISE NOTICE 'Dropped column billingAddressId';
  END IF;
END $$;
