import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";

/**
 * GET /api/content/categories/[id]
 * Get a single content category by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await prisma.contentCategory.findUnique({
      where: { id },
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
            isActive: true,
            _count: {
              select: {
                articles: true,
              },
            },
          },
        },
        articles: {
          where: { deletedAt: null },
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            publishedAt: true,
            viewCount: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            articles: true,
            children: true,
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
    console.error("Content Category GET Error:", error);
    return NextResponse.json(
      { error: "خطا در دریافت دسته‌بندی" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/content/categories/[id]
 * Update a content category
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
      parentId,
      metaTitle,
      metaDescription,
      metaKeywords,
      sortOrder,
      isActive,
    } = body;

    // Check if category exists
    const existingCategory = await prisma.contentCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "دسته‌بندی یافت نشد" },
        { status: 404 }
      );
    }

    // Check if slug is unique (excluding current category)
    if (slug && slug !== existingCategory.slug) {
      const slugExists = await prisma.contentCategory.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "این slug قبلاً استفاده شده است" },
          { status: 400 }
        );
      }
    }

    // Check if parent exists and prevent circular references
    if (parentId && parentId !== existingCategory.parentId) {
      if (parentId === id) {
        return NextResponse.json(
          { error: "دسته‌بندی نمی‌تواند والد خودش باشد" },
          { status: 400 }
        );
      }

      const parentCategory = await prisma.contentCategory.findUnique({
        where: { id: parentId },
      });

      if (!parentCategory) {
        return NextResponse.json(
          { error: "دسته‌بندی والد یافت نشد" },
          { status: 400 }
        );
      }

      // Check if the new parent is a descendant of current category
      const isDescendant = await checkIfDescendant(id, parentId);
      if (isDescendant) {
        return NextResponse.json(
          { error: "نمی‌توانید دسته‌بندی را زیرمجموعه فرزند خود قرار دهید" },
          { status: 400 }
        );
      }
    }

    const updatedCategory = await prisma.contentCategory.update({
      where: { id },
      data: {
        name: name || existingCategory.name,
        slug: slug || existingCategory.slug,
        description: description !== undefined ? description : existingCategory.description,
        image: image !== undefined ? image : existingCategory.image,
        parentId: parentId !== undefined ? parentId : existingCategory.parentId,
        metaTitle: metaTitle || existingCategory.metaTitle,
        metaDescription: metaDescription !== undefined ? metaDescription : existingCategory.metaDescription,
        metaKeywords: metaKeywords !== undefined ? metaKeywords : existingCategory.metaKeywords,
        sortOrder: sortOrder !== undefined ? sortOrder : existingCategory.sortOrder,
        isActive: isActive !== undefined ? isActive : existingCategory.isActive,
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

    return NextResponse.json({ data: updatedCategory });
  } catch (error: unknown) {
    console.error("Content Category Update Error:", error);
    
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "این slug قبلاً استفاده شده است" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "خطا در بروزرسانی دسته‌بندی" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/content/categories/[id]
 * Soft delete a content category
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

    // Check if category exists
    const existingCategory = await prisma.contentCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            articles: true,
            children: true,
          },
        },
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "دسته‌بندی یافت نشد" },
        { status: 404 }
      );
    }

    // Check if category has articles or children
    if (existingCategory._count.articles > 0) {
      return NextResponse.json(
        { error: "نمی‌توانید دسته‌بندی حاوی مقاله را حذف کنید" },
        { status: 400 }
      );
    }

    if (existingCategory._count.children > 0) {
      return NextResponse.json(
        { error: "نمی‌توانید دسته‌بندی حاوی زیرمجموعه را حذف کنید" },
        { status: 400 }
      );
    }

    // Soft delete
    await prisma.contentCategory.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "دسته‌بندی با موفقیت حذف شد" });
  } catch (error) {
    console.error("Content Category Delete Error:", error);
    return NextResponse.json(
      { error: "خطا در حذف دسته‌بندی" },
      { status: 500 }
    );
  }
}

/**
 * Helper function to check if a category is a descendant of another
 */
async function checkIfDescendant(categoryId: string, potentialParentId: string): Promise<boolean> {
  const parent = await prisma.contentCategory.findUnique({
    where: { id: potentialParentId },
    select: { parentId: true },
  });

  if (!parent || !parent.parentId) {
    return false;
  }

  if (parent.parentId === categoryId) {
    return true;
  }

  return checkIfDescendant(categoryId, parent.parentId);
}
