-- CreateTable
CREATE TABLE "public"."homepage_contents" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "heroTagline" TEXT NOT NULL,
    "heroDescription" TEXT NOT NULL,
    "heroPrimaryCtaLabel" TEXT NOT NULL,
    "heroPrimaryCtaHref" TEXT NOT NULL,
    "heroSecondaryCtaLabel" TEXT NOT NULL,
    "heroSecondaryCtaHref" TEXT NOT NULL,
    "categorySectionTitle" TEXT NOT NULL,
    "categorySectionSubtitle" TEXT NOT NULL,
    "categoryViewAllLabel" TEXT NOT NULL,
    "featuredCategory1Id" TEXT,
    "featuredCategory2Id" TEXT,
    "featuredCategory3Id" TEXT,
    "featuredCategory1Title" TEXT,
    "featuredCategory1Description" TEXT,
    "featuredCategory2Title" TEXT,
    "featuredCategory2Description" TEXT,
    "featuredCategory3Title" TEXT,
    "featuredCategory3Description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."homepage_slides" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "desktopImage" TEXT NOT NULL,
    "mobileImage" TEXT,
    "bannerHref" TEXT,
    "buttonLabel" TEXT,
    "buttonHref" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "homepageContentId" TEXT,

    CONSTRAINT "homepage_slides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."homepage_featured_categories" (
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

-- CreateIndex
CREATE UNIQUE INDEX "homepage_contents_locale_key" ON "public"."homepage_contents"("locale");

-- CreateIndex
CREATE INDEX "homepage_contents_featuredCategory1Id_idx" ON "public"."homepage_contents"("featuredCategory1Id");

-- CreateIndex
CREATE INDEX "homepage_contents_featuredCategory2Id_idx" ON "public"."homepage_contents"("featuredCategory2Id");

-- CreateIndex
CREATE INDEX "homepage_contents_featuredCategory3Id_idx" ON "public"."homepage_contents"("featuredCategory3Id");

-- CreateIndex
CREATE INDEX "homepage_slides_locale_isActive_sortOrder_idx" ON "public"."homepage_slides"("locale", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "homepage_featured_categories_homepageContentId_sortOrder_idx" ON "public"."homepage_featured_categories"("homepageContentId", "sortOrder");

-- CreateIndex
CREATE INDEX "homepage_featured_categories_categoryId_idx" ON "public"."homepage_featured_categories"("categoryId");

-- AddForeignKey
ALTER TABLE "public"."homepage_contents" ADD CONSTRAINT "homepage_contents_featuredCategory1Id_fkey" FOREIGN KEY ("featuredCategory1Id") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."homepage_contents" ADD CONSTRAINT "homepage_contents_featuredCategory2Id_fkey" FOREIGN KEY ("featuredCategory2Id") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."homepage_contents" ADD CONSTRAINT "homepage_contents_featuredCategory3Id_fkey" FOREIGN KEY ("featuredCategory3Id") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."homepage_slides" ADD CONSTRAINT "homepage_slides_homepageContentId_fkey" FOREIGN KEY ("homepageContentId") REFERENCES "public"."homepage_contents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."homepage_featured_categories" ADD CONSTRAINT "homepage_featured_categories_homepageContentId_fkey" FOREIGN KEY ("homepageContentId") REFERENCES "public"."homepage_contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."homepage_featured_categories" ADD CONSTRAINT "homepage_featured_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
