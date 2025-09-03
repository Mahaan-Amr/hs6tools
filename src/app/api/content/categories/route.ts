import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";

/**
 * GET /api/content/categories
 * Get all content categories with hierarchy
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");
    const search = searchParams.get("search");
    const includeInactive = searchParams.get("includeInactive") === "true";

    const where: {
      isActive?: boolean;
      parentId?: string | null;
      OR?: Array<{
        name?: { contains: string; mode: "insensitive" };
        description?: { contains: string; mode: "insensitive" };
      }>;
    } = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    if (parentId === "null") {
      where.parentId = null;
    } else if (parentId) {
      where.parentId = parentId;
    }

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
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
            _count: {
              select: {
                articles: true,
              },
            },
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error("Content Categories API Error:", error);
    return NextResponse.json(
      { error: "خطا در دریافت دسته‌بندی‌ها" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/content/categories
 * Create new content category
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
      name,
      slug,
      description,
      image,
      parentId,
      metaTitle,
      metaDescription,
      metaKeywords,
      sortOrder,
    } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: "نام و slug الزامی است" },
        { status: 400 }
      );
    }

    // Check if slug is unique
    const existingCategory = await prisma.contentCategory.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "این slug قبلاً استفاده شده است" },
        { status: 400 }
      );
    }

    // Check if parent exists (if parentId is provided)
    if (parentId) {
      const parentCategory = await prisma.contentCategory.findUnique({
        where: { id: parentId },
      });

      if (!parentCategory) {
        return NextResponse.json(
          { error: "دسته‌بندی والد یافت نشد" },
          { status: 400 }
        );
      }
    }

    const category = await prisma.contentCategory.create({
      data: {
        name,
        slug,
        description: description || null,
        image: image || null,
        parentId: parentId || null,
        metaTitle: metaTitle || name,
        metaDescription: metaDescription || description,
        metaKeywords: metaKeywords || null,
        sortOrder: sortOrder || 0,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            articles: true,
            children: true,
          },
        },
      },
    });

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error: unknown) {
    console.error("Content Category Creation Error:", error);
    
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "این slug قبلاً استفاده شده است" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "خطا در ایجاد دسته‌بندی" },
      { status: 500 }
    );
  }
}
