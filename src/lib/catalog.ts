import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeUploadUrl } from "@/utils/image-url";
import { getSlugCandidates } from "@/utils/slug";

const publicProductWhere: Prisma.ProductWhereInput = {
  isActive: true,
  deletedAt: null,
};

const publicCategoryWhere: Prisma.CategoryWhereInput = {
  isActive: true,
  deletedAt: null,
};

export interface PublicProduct {
  id: string;
  slug: string;
  name: string;
  description?: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stockQuantity: number;
  isInStock: boolean;
  allowBackorders: boolean;
  weight?: number;
  dimensions?: Record<string, number>;
  material?: string;
  warranty?: string;
  brand?: string;
  isFeatured: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  };
  images: Array<{
    id: string;
    url: string;
    alt?: string;
    title?: string;
    isPrimary: boolean;
    sortOrder: number;
  }>;
  variants: Array<{
    id: string;
    name: string;
    sku: string;
    price: number;
    comparePrice?: number;
    stockQuantity: number;
    isInStock: boolean;
    attributes: Record<string, string | number>;
  }>;
  _count: {
    reviews: number;
    variants: number;
  };
}

export interface ProductPagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PublicCategory {
  id: string;
  slug: string;
  name: string;
  nameEn?: string;
  nameAr?: string;
  description?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  image?: string;
  icon?: string;
  parentId?: string | null;
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  children?: Array<{
    id: string;
    name: string;
    slug: string;
    _count: { products: number };
  }>;
  _count: {
    products: number;
    children: number;
  };
}

export interface PublicProductDetail extends PublicProduct {
  reviews: Array<{
    id: string;
    title?: string;
    content: string;
    rating: number;
    createdAt: string;
    user: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  }>;
}

interface CatalogProductRecord {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  shortDescription: string | null;
  price: Prisma.Decimal;
  comparePrice: Prisma.Decimal | null;
  costPrice: Prisma.Decimal | null;
  stockQuantity: number;
  isInStock: boolean;
  allowBackorders: boolean;
  weight: Prisma.Decimal | null;
  dimensions: Prisma.JsonValue | null;
  material: string | null;
  warranty: string | null;
  brand: string | null;
  isFeatured: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  };
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
    title: string | null;
    isPrimary: boolean;
    sortOrder: number;
  }>;
  variants: Array<{
    id: string;
    name: string;
    sku: string;
    price: Prisma.Decimal | null;
    comparePrice: Prisma.Decimal | null;
    stockQuantity: number;
    isInStock: boolean;
    attributes: Prisma.JsonValue;
  }>;
  _count: {
    reviews: number;
    variants: number;
  };
}

interface CatalogCategoryRecord {
  id: string;
  slug: string;
  name: string;
  nameEn: string | null;
  nameAr: string | null;
  description: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  image: string | null;
  icon: string | null;
  parentId: string | null;
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  children?: Array<{
    id: string;
    name: string;
    slug: string;
    _count: { products: number };
  }>;
  _count: {
    products: number;
    children: number;
  };
}

function decimalToNumber(value: Prisma.Decimal | number | string | null | undefined) {
  if (value === null || value === undefined) return undefined;
  return Number(value);
}

function normalizeJsonRecord(value: Prisma.JsonValue | null | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value as Record<string, number>;
}

function normalizeAttributes(value: Prisma.JsonValue) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, string | number>;
}

function mapProduct(product: CatalogProductRecord): PublicProduct {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description ?? undefined,
    shortDescription: product.shortDescription ?? undefined,
    price: decimalToNumber(product.price) ?? 0,
    comparePrice: decimalToNumber(product.comparePrice),
    costPrice: decimalToNumber(product.costPrice),
    stockQuantity: product.stockQuantity,
    isInStock: product.isInStock,
    allowBackorders: product.allowBackorders,
    weight: decimalToNumber(product.weight),
    dimensions: normalizeJsonRecord(product.dimensions),
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
      price: decimalToNumber(variant.price) ?? decimalToNumber(product.price) ?? 0,
      comparePrice: decimalToNumber(variant.comparePrice),
      stockQuantity: variant.stockQuantity,
      isInStock: variant.isInStock,
      attributes: normalizeAttributes(variant.attributes),
    })),
    _count: product._count,
  };
}

function mapCategory(category: CatalogCategoryRecord): PublicCategory {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    nameEn: category.nameEn ?? undefined,
    nameAr: category.nameAr ?? undefined,
    description: category.description ?? undefined,
    descriptionEn: category.descriptionEn ?? undefined,
    descriptionAr: category.descriptionAr ?? undefined,
    image: normalizeUploadUrl(category.image),
    icon: category.icon ?? undefined,
    parentId: category.parentId,
    parent: category.parent
      ? {
          id: category.parent.id,
          name: category.parent.name,
          slug: category.parent.slug,
        }
      : null,
    children: category.children,
    _count: category._count,
  };
}

function productOrderBy(sortBy = "createdAt", sortOrder = "desc"): Prisma.ProductOrderByWithRelationInput {
  const direction = sortOrder === "asc" ? "asc" : "desc";

  if (sortBy === "price") return { price: direction };
  if (sortBy === "name") return { name: direction };
  if (sortBy === "sortOrder") return { sortOrder: direction };

  return { createdAt: direction };
}

export async function getPublicProducts({
  page = 1,
  limit = 24,
  categoryId,
  includeChildren = false,
  excludeProductId,
  sortBy = "createdAt",
  sortOrder = "desc",
}: {
  page?: number;
  limit?: number;
  categoryId?: string;
  includeChildren?: boolean;
  excludeProductId?: string;
  sortBy?: string;
  sortOrder?: string;
} = {}): Promise<{ products: PublicProduct[]; pagination: ProductPagination }> {
  const where: Prisma.ProductWhereInput = { ...publicProductWhere };

  if (categoryId) {
    if (includeChildren) {
      const children = await prisma.category.findMany({
        where: { parentId: categoryId, ...publicCategoryWhere },
        select: { id: true },
      });
      where.categoryId = { in: [categoryId, ...children.map((child) => child.id)] };
    } else {
      where.categoryId = categoryId;
    }
  }

  if (excludeProductId) {
    where.id = { not: excludeProductId };
  }

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 200);
  const skip = (safePage - 1) * safeLimit;

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
        images: {
          orderBy: { sortOrder: "asc" },
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
            attributes: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            variants: true,
          },
        },
      },
      orderBy: productOrderBy(sortBy, sortOrder),
      skip,
      take: safeLimit,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / safeLimit);

  return {
    products: products.map(mapProduct),
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalCount,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    },
  };
}

export async function getPublicCategories(): Promise<PublicCategory[]> {
  const categories = await prisma.category.findMany({
    where: publicCategoryWhere,
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      children: {
        where: publicCategoryWhere,
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: { products: true },
          },
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
      _count: {
        select: {
          products: true,
          children: true,
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return categories.map(mapCategory);
}

export async function getPublicCategoryBySlug(slug: string): Promise<PublicCategory | null> {
  const category = await prisma.category.findFirst({
    where: {
      slug: { in: getSlugCandidates(slug) },
      ...publicCategoryWhere,
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
        where: publicCategoryWhere,
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: { products: true },
          },
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
      _count: {
        select: {
          products: true,
          children: true,
        },
      },
    },
  });

  return category ? mapCategory(category) : null;
}

export async function getPublicProductBySlug(slug: string): Promise<PublicProductDetail | null> {
  const product = await prisma.product.findFirst({
    where: {
      slug: { in: getSlugCandidates(slug) },
      ...publicProductWhere,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
        },
      },
      images: {
        orderBy: { sortOrder: "asc" },
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
          attributes: true,
        },
      },
      reviews: {
        where: { isApproved: true },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          reviews: true,
          variants: true,
        },
      },
    },
  });

  if (!product) return null;

  return {
    ...mapProduct(product),
    reviews: product.reviews.map((review) => ({
      id: review.id,
      title: review.title ?? undefined,
      content: review.content,
      rating: review.rating,
      createdAt: review.createdAt.toISOString(),
      user: {
        firstName: review.user.firstName,
        lastName: review.user.lastName,
        avatar: review.user.avatar ?? undefined,
      },
    })),
  };
}

export async function getCurrentWishlistProductIds(): Promise<string[]> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return [];
  }

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  });

  return items.map((item) => item.productId);
}
