-- Script to fix billing address constraint issue
-- This script manually drops the billingAddressId foreign key constraint if it still exists
-- Run this if the migration didn't fully apply

-- Drop the foreign key constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'orders_billingAddressId_fkey' 
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE "public"."orders" DROP CONSTRAINT "orders_billingAddressId_fkey";
    RAISE NOTICE 'Dropped constraint orders_billingAddressId_fkey';
  ELSE
    RAISE NOTICE 'Constraint orders_billingAddressId_fkey does not exist';
  END IF;
END $$;

-- Also check and drop the column if it exists
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
  ELSE
    RAISE NOTICE 'Column billingAddressId does not exist';
  END IF;
END $$;
