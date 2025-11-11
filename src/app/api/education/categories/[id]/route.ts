import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";

/**
 * GET /api/education/categories/[id]
 * Get single category by ID or slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeLessons = searchParams.get("includeLessons") === "true";

    const category = await prisma.educationCategory.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
      include: {
        parent: true,
        children: true,
        lessons: includeLessons
          ? {
              where: {
                deletedAt: null,
                status: "PUBLISHED",
              },
              include: {
                author: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
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
    });

    if (!category) {
      return NextResponse.json(
        { error: "دسته‌بندی یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: category });
  } catch (error) {
    console.error("Education Category API Error:", error);
    return NextResponse.json(
      { error: "خطا در دریافت دسته‌بندی" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/education/categories/[id]
 * Update category
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

    // Check if category exists
    const existingCategory = await prisma.educationCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "دسته‌بندی یافت نشد" },
        { status: 404 }
      );
    }

    // Prevent circular reference
    if (parentId === id) {
      return NextResponse.json(
        { error: "دسته‌بندی نمی‌تواند والد خودش باشد" },
        { status: 400 }
      );
    }

    const updateData: {
      name?: string;
      slug?: string;
      description?: string | null;
      image?: string | null;
      icon?: string | null;
      parentId?: string | null;
      metaTitle?: string | null;
      metaDescription?: string | null;
      metaKeywords?: string | null;
      isActive?: boolean;
      sortOrder?: number;
    } = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (icon !== undefined) updateData.icon = icon;
    if (parentId !== undefined) updateData.parentId = parentId || null;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (metaKeywords !== undefined) updateData.metaKeywords = metaKeywords;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const category = await prisma.educationCategory.update({
      where: { id },
      data: updateData,
      include: {
        parent: true,
        children: true,
      },
    });

    return NextResponse.json({ data: category });
  } catch (error: unknown) {
    console.error("Education Category Update Error:", error);
    
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "این slug قبلاً استفاده شده است" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "خطا در به‌روزرسانی دسته‌بندی" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/education/categories/[id]
 * Delete category (only if no lessons exist)
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

    // Check if category has lessons
    const lessonCount = await prisma.educationLesson.count({
      where: {
        categoryId: id,
        deletedAt: null,
      },
    });

    if (lessonCount > 0) {
      return NextResponse.json(
        { error: "نمی‌توان دسته‌بندی دارای درس را حذف کرد" },
        { status: 400 }
      );
    }

    // Check if category has children
    const childrenCount = await prisma.educationCategory.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      return NextResponse.json(
        { error: "نمی‌توان دسته‌بندی دارای زیردسته را حذف کرد" },
        { status: 400 }
      );
    }

    await prisma.educationCategory.delete({
      where: { id },
    });

    return NextResponse.json({ message: "دسته‌بندی با موفقیت حذف شد" });
  } catch (error) {
    console.error("Education Category Delete Error:", error);
    return NextResponse.json(
      { error: "خطا در حذف دسته‌بندی" },
      { status: 500 }
    );
  }
}

