import { getMessages } from "@/lib/i18n";
import Link from "next/link";
import Image from "next/image";
import ProductGrid from "@/components/ecommerce/ProductGrid";
import { notFound } from "next/navigation";

interface CategoryPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  nameEn?: string;
  nameAr?: string;
  description?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  image?: string;
  icon?: string;
  parentId?: string;
  parent?: {
    id: string;
    name: string;
    slug: string;
  };
  children: Array<{
    id: string;
    name: string;
    slug: string;
    _count: { products: number };
  }>;
  products: Array<{
    id: string;
    slug: string;
    name: string;
    description?: string;
    shortDescription?: string;
    price: number;
    comparePrice?: number;
    stockQuantity: number;
    isInStock: boolean;
    isFeatured: boolean;
    images: Array<{
      id: string;
      url: string;
      alt?: string;
      isPrimary: boolean;
      sortOrder: number;
    }>;
    category: {
      id: string;
      name: string;
      slug: string;
    };
    _count: {
      reviews: number;
      variants: number;
    };
  }>;
  _count: {
    products: number;
    children: number;
  };
}

async function getCategory(slug: string): Promise<Category | null> {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/categories/slug/${slug}`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch category');
    }
    
    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

async function getCategoryProducts(categoryId: string, limit: number = 24) {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/products?categoryId=${categoryId}&limit=${limit}&sortBy=sortOrder&sortOrder=asc`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching category products:', error);
    return [];
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, slug } = await params;
  const t = await getMessages(locale);
  
  const category = await getCategory(slug);
  
  if (!category) {
    notFound();
  }

  // Get all products for this category (including subcategories if needed)
  const products = await getCategoryProducts(category.id, 50);

  // Get localized category name
  const getCategoryName = () => {
    if (locale === 'en' && category.nameEn) return category.nameEn;
    if (locale === 'ar' && category.nameAr) return category.nameAr;
    return category.name;
  };

  const getCategoryDescription = () => {
    if (locale === 'en' && category.descriptionEn) return category.descriptionEn;
    if (locale === 'ar' && category.descriptionAr) return category.descriptionAr;
    return category.description;
  };

  const categoryName = getCategoryName();
  const categoryDescription = getCategoryDescription();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs */}
        <nav className="mb-8" data-scroll-reveal>
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li>
              <Link href={`/${locale}`} className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                {t.navigation?.home || "خانه"}
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li>
              <Link href={`/${locale}/categories`} className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                {t.products?.categories || "دسته‌بندی‌ها"}
              </Link>
            </li>
            {category.parent && (
              <>
                <li className="text-gray-500">/</li>
                <li>
                  <Link href={`/${locale}/categories/${category.parent.slug}`} className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                    {category.parent.name}
                  </Link>
                </li>
              </>
            )}
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 dark:text-white">{categoryName}</li>
          </ol>
        </nav>

        {/* Category Header */}
        <div className="mb-12" data-scroll-reveal>
          <div className="glass rounded-3xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Category Image/Icon */}
              <div className="flex-shrink-0">
                {category.image ? (
                  <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden">
                    <Image
                      src={category.image}
                      alt={categoryName}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : category.icon ? (
                  <div className="w-32 h-32 md:w-48 md:h-48 bg-gradient-to-r from-primary-orange to-orange-500 rounded-2xl flex items-center justify-center">
                    <div className="text-6xl md:text-8xl">{category.icon}</div>
                  </div>
                ) : (
                  <div className="w-32 h-32 md:w-48 md:h-48 bg-gradient-to-r from-primary-orange to-orange-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-16 h-16 md:w-24 md:h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Category Info */}
              <div className="flex-1 text-center md:text-right">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {categoryName}
                </h1>
                {categoryDescription && (
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 text-justify leading-relaxed">
                    {categoryDescription}
                  </p>
                )}
                <div className="flex items-center justify-center md:justify-start gap-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <span>{category._count.products} {t.categories.products}</span>
                  </div>
                  {category._count.children > 0 && (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span>{category._count.children} {t.categories.subcategoriesCount}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subcategories */}
        {category.children.length > 0 && (
          <div className="mb-12" data-scroll-reveal style={{ transitionDelay: "0.1s" }}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t.categories.subcategories}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {category.children.map((subcategory) => (
                <Link
                  key={subcategory.id}
                  href={`/${locale}/categories/${subcategory.slug}`}
                  className="glass rounded-2xl p-6 text-center hover:scale-105 hover:shadow-glass-orange transition-all duration-300"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {subcategory.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {subcategory._count.products} {t.categories.products}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Products Section */}
        <div data-scroll-reveal style={{ transitionDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t.categories.products} {categoryName}
            </h2>
          </div>

          {products.length > 0 ? (
            <ProductGrid 
              products={products} 
              locale={locale}
              loading={false}
            />
          ) : (
            <div className="text-center py-12">
              <div className="glass rounded-3xl p-8 max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t.categories.noProductsInCategory}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {t.categories.noProductsInCategoryMessage}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

