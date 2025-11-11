-- CreateEnum
CREATE TYPE "public"."LessonContentType" AS ENUM ('TEXT', 'VIDEO', 'MIXED');

-- CreateEnum
CREATE TYPE "public"."LessonDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateTable
CREATE TABLE "public"."education_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "icon" TEXT,
    "parentId" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."education_lessons" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT,
    "videoUrl" TEXT,
    "videoDuration" INTEGER,
    "thumbnail" TEXT,
    "contentType" "public"."LessonContentType" NOT NULL DEFAULT 'TEXT',
    "categoryId" TEXT,
    "authorId" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT,
    "status" "public"."ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "difficulty" "public"."LessonDifficulty" NOT NULL DEFAULT 'BEGINNER',
    "estimatedTime" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "education_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "education_categories_slug_key" ON "public"."education_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "education_lessons_slug_key" ON "public"."education_lessons"("slug");

-- AddForeignKey
ALTER TABLE "public"."education_categories" ADD CONSTRAINT "education_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."education_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."education_lessons" ADD CONSTRAINT "education_lessons_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."education_lessons" ADD CONSTRAINT "education_lessons_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."education_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
