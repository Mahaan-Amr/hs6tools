import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";

/**
 * GET /api/education/categories
 * Get all education categories
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");
    const active = searchParams.get("active");
    const includeLessons = searchParams.get("includeLessons") === "true";

    const where: {
      parentId?: string | null;
      isActive?: boolean;
    } = {};

    if (parentId === "null" || parentId === "") {
      where.parentId = null;
    } else if (parentId) {
      where.parentId = parentId;
    }

    if (active === "true") {
      where.isActive = true;
    }

    const categories = await prisma.educationCategory.findMany({
      where,
      include: {
        parent: true,
        children: true,
        lessons: includeLessons
          ? {
              where: {
                deletedAt: null,
                status: "PUBLISHED",
              },
              select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                thumbnail: true,
                contentType: true,
                difficulty: true,
                estimatedTime: true,
                viewCount: true,
              },
              orderBy: { sortOrder: "asc" },
            }
          : false,
        _count: {
          select: {
            lessons: {
              where: {
                deletedAt: null,
                status: "PUBLISHED",
              },
            },
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error("Education Categories API Error:", error);
    return NextResponse.json(
      { error: "خطا در دریافت دسته‌بندی‌های آموزشی" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/education/categories
 * Create new education category
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
      icon,
      parentId,
      metaTitle,
      metaDescription,
      metaKeywords,
      isActive,
      sortOrder,
    } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: "نام و slug الزامی است" },
        { status: 400 }
      );
    }

    const category = await prisma.educationCategory.create({
      data: {
        name,
        slug,
        description: description || null,
        image: image || null,
        icon: icon || null,
        parentId: parentId || null,
        metaTitle: metaTitle || name,
        metaDescription: metaDescription || description,
        metaKeywords: metaKeywords || null,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder || 0,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error: unknown) {
    console.error("Education Category Creation Error:", error);
    
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "این slug قبلاً استفاده شده است" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "خطا در ایجاد دسته‌بندی آموزشی" },
      { status: 500 }
    );
  }
}

