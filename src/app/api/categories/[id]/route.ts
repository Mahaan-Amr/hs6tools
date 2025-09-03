import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        children: {
          where: { isActive: true },
          include: {
            _count: {
              select: { products: true }
            }
          },
          orderBy: { sortOrder: "asc" }
        },
        products: {
          where: { isActive: true, deletedAt: null },
          include: {
            images: {
              where: { isPrimary: true },
              take: 1
            },
            _count: {
              select: { reviews: true }
            }
          },
          orderBy: { sortOrder: "asc" },
          take: 10
        },
        _count: {
          select: { products: true, children: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    if (!category.isActive) {
      return NextResponse.json(
        { success: false, error: "Category is not available" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch category",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if slug is being changed and if it already exists
    if (body.slug && body.slug !== existingCategory.slug) {
      const existingSlug = await prisma.category.findUnique({
        where: { slug: body.slug }
      });

      if (existingSlug) {
        return NextResponse.json(
          { success: false, error: "Category with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Check if parentId is being set to itself (circular reference)
    if (body.parentId === id) {
      return NextResponse.json(
        { success: false, error: "Category cannot be its own parent" },
        { status: 400 }
      );
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        image: body.image,
        icon: body.icon,
        parentId: body.parentId,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        metaKeywords: body.metaKeywords,
        isActive: body.isActive,
        sortOrder: body.sortOrder,
        // Multilingual fields
        nameEn: body.nameEn,
        nameAr: body.nameAr,
        descriptionEn: body.descriptionEn,
        descriptionAr: body.descriptionAr
      },
      include: {
        parent: true,
        children: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedCategory,
      message: "Category updated successfully"
    });

  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to update category",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true, children: true }
        }
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category has products or children
    if (existingCategory._count.products > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete category with products" },
        { status: 400 }
      );
    }

    if (existingCategory._count.children > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete category with subcategories" },
        { status: 400 }
      );
    }

    // Soft delete - set deletedAt timestamp
    await prisma.category.update({
      where: { id },
      data: { 
        deletedAt: new Date(),
        isActive: false
      }
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to delete category",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
