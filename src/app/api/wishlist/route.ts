import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        product: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            },
            images: {
              where: { isPrimary: true },
              take: 1,
              orderBy: { sortOrder: "asc" }
            },
            variants: {
              select: {
                id: true,
                price: true,
                stockQuantity: true,
                isInStock: true
              }
            },
            _count: {
              select: {
                reviews: true,
                variants: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json({
      success: true,
      data: wishlistItems
    });

  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch wishlist",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if already in wishlist
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId
        }
      }
    });

    if (existingItem) {
      return NextResponse.json(
        { success: false, error: "Product already in wishlist" },
        { status: 400 }
      );
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: session.user.id,
        productId: productId
      },
      include: {
        product: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            },
            images: {
              where: { isPrimary: true },
              take: 1,
              orderBy: { sortOrder: "asc" }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: wishlistItem,
      message: "Product added to wishlist"
    }, { status: 201 });

  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to add to wishlist",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Remove from wishlist
    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Product removed from wishlist"
    });

  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to remove from wishlist",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
