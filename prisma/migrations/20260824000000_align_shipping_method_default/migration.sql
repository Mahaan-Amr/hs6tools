-- Align the existing Production path with the current schema and fresh baseline.
ALTER TABLE "public"."orders"
  ALTER COLUMN "shippingMethod" SET DEFAULT 'POST';
