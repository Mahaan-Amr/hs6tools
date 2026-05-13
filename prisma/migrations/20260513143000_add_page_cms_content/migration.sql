-- CreateTable
CREATE TABLE "public"."page_contents" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_contents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "page_contents_slug_locale_key" ON "public"."page_contents"("slug", "locale");

-- CreateIndex
CREATE INDEX "page_contents_slug_locale_idx" ON "public"."page_contents"("slug", "locale");
