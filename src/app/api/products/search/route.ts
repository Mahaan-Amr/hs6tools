import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const name = searchParams.get("name");
    const sku = searchParams.get("sku");

    if (!slug && !name && !sku) {
      return NextResponse.json(
        { success: false, error: "Search parameter required (slug, name, or sku)" },
        { status: 400 }
      );
    }

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      deletedAt: null
    };

    if (slug) {
      where.slug = slug;
    } else if (name) {
      where.name = { contains: name, mode: "insensitive" };
    } else if (sku) {
      where.sku = { contains: sku, mode: "insensitive" };
    }

    const product = await prisma.product.findFirst({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true
          }
        },
        images: {
          orderBy: { sortOrder: "asc" }
        },
        variants: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            comparePrice: true,
            stockQuantity: true,
            isInStock: true,
            attributes: true
          }
        },
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: "desc" },
          take: 10
        },
        _count: {
          select: {
            reviews: true,
            variants: true
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error("Error searching products:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to search products",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
