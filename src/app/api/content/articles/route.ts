import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { ArticleStatus } from "@prisma/client";

/**
 * GET /api/content/articles
 * Get all articles with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const authorId = searchParams.get("authorId");

    const skip = (page - 1) * limit;

    const where: {
      deletedAt: null;
      categoryId?: string;
      status?: ArticleStatus;
      isFeatured?: boolean;
      authorId?: string;
      OR?: Array<{
        title?: { contains: string; mode: "insensitive" };
        excerpt?: { contains: string; mode: "insensitive" };
        content?: { contains: string; mode: "insensitive" };
      }>;
    } = {
      deletedAt: null,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status as ArticleStatus;
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({
      data: articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Articles API Error:", error);
    return NextResponse.json(
      { error: "خطا در دریافت مقالات" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/content/articles
 * Create new article
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

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

    // Validate required fields
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "عنوان، slug و محتوا الزامی است" },
        { status: 400 }
      );
    }

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        categoryId: categoryId || null,
        featuredImage: featuredImage || null,
        authorId: session.user.id,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        metaKeywords: metaKeywords || null,
        status: (status as ArticleStatus) || "DRAFT",
        isFeatured: isFeatured || false,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
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

    return NextResponse.json({ data: article }, { status: 201 });
  } catch (error: unknown) {
    console.error("Article Creation Error:", error);
    
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "این slug قبلاً استفاده شده است" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "خطا در ایجاد مقاله" },
      { status: 500 }
    );
  }
}
