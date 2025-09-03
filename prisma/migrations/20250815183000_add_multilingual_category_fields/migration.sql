-- Add multilingual fields to categories table
ALTER TABLE "public"."categories" ADD COLUMN "nameEn" TEXT;
ALTER TABLE "public"."categories" ADD COLUMN "nameAr" TEXT;
ALTER TABLE "public"."categories" ADD COLUMN "descriptionEn" TEXT;
ALTER TABLE "public"."categories" ADD COLUMN "descriptionAr" TEXT;
