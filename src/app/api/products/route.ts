import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const inStock = searchParams.get("inStock") || "";
    const featured = searchParams.get("featured") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      deletedAt: null
    };

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } }
      ];
    }

    // Category filter
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Price filters
    if (minPrice && maxPrice) {
      where.price = { 
        gte: parseFloat(minPrice), 
        lte: parseFloat(maxPrice) 
      };
    } else if (minPrice) {
      where.price = { gte: parseFloat(minPrice) };
    } else if (maxPrice) {
      where.price = { lte: parseFloat(maxPrice) };
    }

    // Stock filter
    if (inStock === "true") {
      where.isInStock = true;
    } else if (inStock === "false") {
      where.isInStock = false;
    }

    // Featured filter
    if (featured === "true") {
      where.isFeatured = true;
    }

    // Build order by
    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (sortBy === "price") {
      orderBy.price = sortOrder === "asc" ? "asc" : "desc";
    } else if (sortBy === "name") {
      orderBy.name = sortOrder === "asc" ? "asc" : "desc";
    } else if (sortBy === "sortOrder") {
      orderBy.sortOrder = sortOrder === "asc" ? "asc" : "desc";
    } else {
      orderBy.createdAt = sortOrder === "asc" ? "asc" : "desc";
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get products with pagination
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
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
          _count: {
            select: {
              reviews: true,
              variants: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch products",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.name || !body.sku || !body.slug || !body.price || !body.categoryId) {
      return NextResponse.json(
        { success: false, error: "Name, SKU, slug, price, and categoryId are required" },
        { status: 400 }
      );
    }

    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku: body.sku }
    });

    if (existingProduct) {
      return NextResponse.json(
        { success: false, error: "Product with this SKU already exists" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingSlug = await prisma.product.findUnique({
      where: { slug: body.slug }
    });

    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: "Product with this slug already exists" },
        { status: 400 }
      );
    }

    // Create product with images in a transaction
    const product = await prisma.$transaction(async (tx) => {
      // Create the product first
      const newProduct = await tx.product.create({
        data: {
          sku: body.sku,
          name: body.name,
          slug: body.slug,
          description: body.description,
          shortDescription: body.shortDescription,
          price: body.price,
          comparePrice: body.comparePrice,
          costPrice: body.costPrice,
          stockQuantity: body.stockQuantity || 0,
          lowStockThreshold: body.lowStockThreshold || 5,
          isInStock: body.isInStock !== undefined ? body.isInStock : true,
          allowBackorders: body.allowBackorders || false,
          weight: body.weight,
          dimensions: body.dimensions,
          material: body.material,
          warranty: body.warranty,
          brand: body.brand,
          categoryId: body.categoryId,
          metaTitle: body.metaTitle,
          metaDescription: body.metaDescription,
          metaKeywords: body.metaKeywords,
          isActive: body.isActive !== undefined ? body.isActive : true,
          isFeatured: body.isFeatured || false,
          sortOrder: body.sortOrder || 0,
          // Multilingual fields
          nameEn: body.nameEn,
          nameAr: body.nameAr,
          descriptionEn: body.descriptionEn,
          descriptionAr: body.descriptionAr,
          shortDescriptionEn: body.shortDescriptionEn,
          shortDescriptionAr: body.shortDescriptionAr
        }
      });

      // Create images if provided
      if (body.images && Array.isArray(body.images)) {
        for (const imageData of body.images) {
          await tx.productImage.create({
            data: {
              productId: newProduct.id,
              url: imageData.url,
              alt: imageData.alt || '',
              title: imageData.title || '',
              sortOrder: imageData.sortOrder || 0,
              isPrimary: imageData.isPrimary || false
            }
          });
        }
      }

      // Return the product with includes
      return await tx.product.findUnique({
        where: { id: newProduct.id },
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
      data: product,
      message: "Product created successfully"
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to create product",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
