import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { ArticleStatus } from "@prisma/client";

/**
 * GET /api/content
 * Get all content (articles and categories) with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "articles" or "categories"
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    if (type === "articles") {
      // Get articles
      const where: {
        deletedAt: null;
        categoryId?: string;
        status?: ArticleStatus;
        isFeatured?: boolean;
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
    } else if (type === "categories") {
      // Get content categories
      const where: {
        isActive: boolean;
        OR?: Array<{
          name?: { contains: string; mode: "insensitive" };
          description?: { contains: string; mode: "insensitive" };
        }>;
      } = {
        isActive: true,
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const categories = await prisma.contentCategory.findMany({
        where,
        include: {
          _count: {
            select: {
              articles: true,
              children: true,
            },
          },
          parent: true,
          children: true,
        },
        orderBy: { sortOrder: "asc" },
      });

      return NextResponse.json({ data: categories });
    } else {
      // Get both articles and categories
      const [articles, categories] = await Promise.all([
        prisma.article.findMany({
          where: { deletedAt: null, status: "PUBLISHED" },
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
          orderBy: { publishedAt: "desc" },
          take: 6,
        }),
        prisma.contentCategory.findMany({
          where: { isActive: true },
          include: {
            _count: {
              select: { articles: true },
            },
          },
          orderBy: { sortOrder: "asc" },
        }),
      ]);

      return NextResponse.json({
        articles,
        categories,
      });
    }
  } catch (error) {
    console.error("Content API Error:", error);
    return NextResponse.json(
      { error: "خطا در دریافت محتوا" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/content
 * Create new content (article or category)
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
    const { type, data } = body;

    if (type === "article") {
      // Create new article
      const article = await prisma.article.create({
        data: {
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          categoryId: data.categoryId || null,
          featuredImage: data.featuredImage || null,
          authorId: session.user.id,
          metaTitle: data.metaTitle || data.title,
          metaDescription: data.metaDescription || data.excerpt,
          metaKeywords: data.metaKeywords,
          status: data.status || "DRAFT",
          isFeatured: data.isFeatured || false,
          publishedAt: data.status === "PUBLISHED" ? new Date() : null,
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
    } else if (type === "category") {
      // Create new content category
      const category = await prisma.contentCategory.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          image: data.image || null,
          parentId: data.parentId || null,
          metaTitle: data.metaTitle || data.name,
          metaDescription: data.metaDescription || data.description,
          metaKeywords: data.metaKeywords,
          sortOrder: data.sortOrder || 0,
        },
        include: {
          parent: true,
          children: true,
        },
      });

      return NextResponse.json({ data: category }, { status: 201 });
    } else {
      return NextResponse.json(
        { error: "نوع محتوای نامعتبر" },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    console.error("Content Creation Error:", error);
    
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "این slug قبلاً استفاده شده است" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "خطا در ایجاد محتوا" },
      { status: 500 }
    );
  }
}
