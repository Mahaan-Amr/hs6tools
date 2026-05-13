CREATE TABLE IF NOT EXISTS "public"."homepage_featured_categories" (
    "id" TEXT NOT NULL,
    "homepageContentId" TEXT NOT NULL,
    "categoryId" TEXT,
    "title" TEXT,
    "description" TEXT,
    "backgroundImage" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "homepage_featured_categories_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "homepage_featured_categories_homepageContentId_sortOrder_idx"
ON "public"."homepage_featured_categories"("homepageContentId", "sortOrder");

CREATE INDEX IF NOT EXISTS "homepage_featured_categories_categoryId_idx"
ON "public"."homepage_featured_categories"("categoryId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'homepage_featured_categories_homepageContentId_fkey'
  ) THEN
    ALTER TABLE "public"."homepage_featured_categories"
    ADD CONSTRAINT "homepage_featured_categories_homepageContentId_fkey"
    FOREIGN KEY ("homepageContentId") REFERENCES "public"."homepage_contents"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'homepage_featured_categories_categoryId_fkey'
  ) THEN
    ALTER TABLE "public"."homepage_featured_categories"
    ADD CONSTRAINT "homepage_featured_categories_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
