import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { normalizeUploadUrl } from "@/utils/image-url";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const query = searchParams.get("q") || "";
    const suggestions = searchParams.get("suggestions") === "true";
    const limit = parseInt(searchParams.get("limit") || "10");
    
    if (suggestions) {
      // Return search suggestions
      const suggestions = await getSearchSuggestions(query, limit);
      const filterOptions = await getFilterOptions();
      
      return NextResponse.json({
        success: true,
        suggestions,
        filterOptions
      });
    }
    
    // Return search results
    const results = await performAdvancedSearch(searchParams);
    
    return NextResponse.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error("Error in advanced search:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to perform advanced search",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

async function getSearchSuggestions(query: string, limit: number) {
  if (!query.trim()) return [];

  try {
    // Get product name suggestions
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } }
        ]
      },
      select: {
        name: true,
        sku: true
      },
      take: limit,
      orderBy: {
        createdAt: "desc"
      }
    });

    // Get category suggestions
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } }
        ]
      },
      select: {
        name: true
      },
      take: Math.floor(limit / 2)
    });

    // Combine and format suggestions
    const suggestions = [
      ...products.map(p => p.name),
      ...categories.map(c => c.name),
      ...products.map(p => p.sku)
    ];

    // Remove duplicates and limit results
    return [...new Set(suggestions)].slice(0, limit);

  } catch (error) {
    console.error("Error getting search suggestions:", error);
    return [];
  }
}

async function getFilterOptions() {
  try {
    // Get brand options
    const brands = await prisma.product.groupBy({
      by: ["brand"],
      where: {
        isActive: true,
        deletedAt: null,
        brand: { not: null }
      },
      _count: {
        brand: true
      }
    });

    // Get material options
    const materials = await prisma.product.groupBy({
      by: ["material"],
      where: {
        isActive: true,
        deletedAt: null,
        material: { not: null }
      },
      _count: {
        material: true
      }
    });

    // Get price range
    const priceStats = await prisma.product.aggregate({
      where: {
        isActive: true,
        deletedAt: null
      },
      _min: { price: true },
      _max: { price: true }
    });

    return {
      brands: brands.map(b => ({
        value: b.brand!,
        count: b._count.brand
      })),
      materials: materials.map(m => ({
        value: m.material!,
        count: m._count.material
      })),
      priceRange: {
        min: Number(priceStats._min.price) || 0,
        max: Number(priceStats._max.price) || 1000000
      }
    };

  } catch (error) {
    console.error("Error getting filter options:", error);
    return {
      brands: [],
      materials: [],
      priceRange: { min: 0, max: 1000000 }
    };
  }
}

async function performAdvancedSearch(searchParams: URLSearchParams) {
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const query = searchParams.get("q") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const brand = searchParams.get("brand") || "";
  const material = searchParams.get("material") || "";
  const inStock = searchParams.get("inStock") || "";
  const featured = searchParams.get("featured") || "";
  const rating = searchParams.get("rating") || "";
  const sortBy = searchParams.get("sortBy") || "relevance";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  // Build where clause
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    deletedAt: null
  };

  // Search query
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { shortDescription: { contains: query, mode: "insensitive" } },
      { sku: { contains: query, mode: "insensitive" } },
      { brand: { contains: query, mode: "insensitive" } },
      { material: { contains: query, mode: "insensitive" } }
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

  // Brand filter
  if (brand) {
    where.brand = brand;
  }

  // Material filter
  if (material) {
    where.material = material;
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

  // Rating filter (if implemented)
  if (rating) {
    // This would require a more complex query with reviews aggregation
    // For now, we'll skip this filter
  }

  // Build order by
  const orderBy: Prisma.ProductOrderByWithRelationInput = {};
  if (sortBy === "price") {
    orderBy.price = sortOrder === "asc" ? "asc" : "desc";
  } else if (sortBy === "name") {
    orderBy.name = sortOrder === "asc" ? "asc" : "desc";
  } else if (sortBy === "createdAt") {
    orderBy.createdAt = sortOrder === "asc" ? "asc" : "desc";
  } else if (sortBy === "relevance" && query) {
    // For relevance, we'll order by exact matches first, then partial matches
    // This is a simplified approach - in production you might want to use full-text search
    orderBy.name = "asc";
  } else {
    orderBy.createdAt = "desc";
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

  return {
    products: products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description ?? undefined,
      shortDescription: product.shortDescription ?? undefined,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : undefined,
      costPrice: product.costPrice ? Number(product.costPrice) : undefined,
      stockQuantity: product.stockQuantity,
      isInStock: product.isInStock,
      allowBackorders: product.allowBackorders,
      weight: product.weight ? Number(product.weight) : undefined,
      dimensions: product.dimensions && typeof product.dimensions === "object" && !Array.isArray(product.dimensions)
        ? product.dimensions
        : undefined,
      material: product.material ?? undefined,
      warranty: product.warranty ?? undefined,
      brand: product.brand ?? undefined,
      isFeatured: product.isFeatured,
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
        description: product.category.description ?? undefined,
      },
      images: product.images.map((image) => ({
        id: image.id,
        url: normalizeUploadUrl(image.url),
        alt: image.alt ?? undefined,
        title: image.title ?? undefined,
        isPrimary: image.isPrimary,
        sortOrder: image.sortOrder,
      })),
      variants: product.variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        sku: variant.sku,
        price: variant.price ? Number(variant.price) : Number(product.price),
        comparePrice: variant.comparePrice ? Number(variant.comparePrice) : undefined,
        stockQuantity: variant.stockQuantity,
        isInStock: variant.isInStock,
        attributes: variant.attributes && typeof variant.attributes === "object" && !Array.isArray(variant.attributes)
          ? variant.attributes
          : {},
      })),
      _count: product._count,
    })),
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage,
      hasPrevPage
    }
  };
}
