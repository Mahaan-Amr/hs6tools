import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const category = await prisma.category.findUnique({
      where: { slug },
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
              orderBy: { sortOrder: "asc" },
              take: 1
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            },
            _count: {
              select: {
                reviews: true,
                variants: true
              }
            }
          },
          orderBy: { sortOrder: "asc" }
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
    console.error("Error fetching category by slug:", error);
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

