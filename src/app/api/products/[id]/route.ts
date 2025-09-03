import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
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
            price: true,
            stockQuantity: true,
            isInStock: true
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

    if (!product.isActive) {
      return NextResponse.json(
        { success: false, error: "Product is not available" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch product",
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

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if SKU is being changed and if it already exists
    if (body.sku && body.sku !== existingProduct.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: body.sku }
      });

      if (existingSku) {
        return NextResponse.json(
          { success: false, error: "Product with this SKU already exists" },
          { status: 400 }
        );
      }
    }

    // Check if slug is being changed and if it already exists
    if (body.slug && body.slug !== existingProduct.slug) {
      const existingSlug = await prisma.product.findUnique({
        where: { slug: body.slug }
      });

      if (existingSlug) {
        return NextResponse.json(
          { success: false, error: "Product with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Handle image updates in a transaction
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Update the product
      await tx.product.update({
        where: { id },
        data: {
          sku: body.sku,
          name: body.name,
          slug: body.slug,
          description: body.description,
          shortDescription: body.shortDescription,
          price: body.price,
          comparePrice: body.comparePrice,
          costPrice: body.costPrice,
          stockQuantity: body.stockQuantity,
          lowStockThreshold: body.lowStockThreshold,
          isInStock: body.isInStock,
          allowBackorders: body.allowBackorders,
          weight: body.weight,
          dimensions: body.dimensions,
          material: body.material,
          warranty: body.warranty,
          brand: body.brand,
          categoryId: body.categoryId,
          metaTitle: body.metaTitle,
          metaDescription: body.metaDescription,
          metaKeywords: body.metaKeywords,
          isActive: body.isActive,
          isFeatured: body.isFeatured,
          sortOrder: body.sortOrder,
          // Multilingual fields
          nameEn: body.nameEn,
          nameAr: body.nameAr,
          descriptionEn: body.descriptionEn,
          descriptionAr: body.descriptionAr,
          shortDescriptionEn: body.shortDescriptionEn,
          shortDescriptionAr: body.shortDescriptionAr
        }
      });

      // Handle images if provided
      if (body.images && Array.isArray(body.images)) {
        // Delete existing images
        await tx.productImage.deleteMany({
          where: { productId: id }
        });

        // Create new images
        for (const imageData of body.images) {
          await tx.productImage.create({
            data: {
              productId: id,
              url: imageData.url,
              alt: imageData.alt || '',
              title: imageData.title || '',
              sortOrder: imageData.sortOrder || 0,
              isPrimary: imageData.isPrimary || false
            }
          });
        }
      }

      // Return the updated product with includes
      return await tx.product.findUnique({
        where: { id },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          images: true,
          variants: true
        }
      });
    });

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: "Product updated successfully"
    });

  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to update product",
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

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Soft delete - set deletedAt timestamp
    await prisma.product.update({
      where: { id },
      data: { 
        deletedAt: new Date(),
        isActive: false
      }
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to delete product",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
