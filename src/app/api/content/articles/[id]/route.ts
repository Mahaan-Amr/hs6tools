import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { ArticleStatus } from "@prisma/client";

/**
 * GET /api/content/articles/[id]
 * Get a single article by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: "مقاله یافت نشد" },
        { status: 404 }
      );
    }

    // Increment view count for published articles
    if (article.status === "PUBLISHED") {
      await prisma.article.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });
    }

    return NextResponse.json({ data: article });
  } catch (error) {
    console.error("Article GET Error:", error);
    return NextResponse.json(
      { error: "خطا در دریافت مقاله" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/content/articles/[id]
 * Update an article
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      categoryId,
      featuredImage,
      metaTitle,
      metaDescription,
      metaKeywords,
      status,
      isFeatured,
    } = body;

    // Check if article exists
    const existingArticle = await prisma.article.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: "مقاله یافت نشد" },
        { status: 404 }
      );
    }

    // Check if slug is unique (excluding current article)
    if (slug && slug !== existingArticle.slug) {
      const slugExists = await prisma.article.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "این slug قبلاً استفاده شده است" },
          { status: 400 }
        );
      }
    }

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: {
        title: title || existingArticle.title,
        slug: slug || existingArticle.slug,
        excerpt: excerpt !== undefined ? excerpt : existingArticle.excerpt,
        content: content || existingArticle.content,
        categoryId: categoryId !== undefined ? categoryId : existingArticle.categoryId,
        featuredImage: featuredImage !== undefined ? featuredImage : existingArticle.featuredImage,
        metaTitle: metaTitle || existingArticle.metaTitle,
        metaDescription: metaDescription !== undefined ? metaDescription : existingArticle.metaDescription,
        metaKeywords: metaKeywords !== undefined ? metaKeywords : existingArticle.metaKeywords,
        status: (status as ArticleStatus) || existingArticle.status,
        isFeatured: isFeatured !== undefined ? isFeatured : existingArticle.isFeatured,
        publishedAt: status === "PUBLISHED" && existingArticle.status !== "PUBLISHED" 
          ? new Date() 
          : existingArticle.publishedAt,
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({ data: updatedArticle });
  } catch (error: unknown) {
    console.error("Article Update Error:", error);
    
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "این slug قبلاً استفاده شده است" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "خطا در بروزرسانی مقاله" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/content/articles/[id]
 * Soft delete an article
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if article exists
    const existingArticle = await prisma.article.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: "مقاله یافت نشد" },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.article.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: "مقاله با موفقیت حذف شد" });
  } catch (error) {
    console.error("Article Delete Error:", error);
    return NextResponse.json(
      { error: "خطا در حذف مقاله" },
      { status: 500 }
    );
  }
}
