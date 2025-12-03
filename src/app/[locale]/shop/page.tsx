import { getMessages } from "@/lib/i18n";
import Link from "next/link";
import ProductGrid from "@/components/ecommerce/ProductGrid";
import AdvancedSearch from "@/components/ecommerce/AdvancedSearch";

interface ShopPageProps {
  params: Promise<{ locale: string }>;
}

interface Category {
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
  _count: {
    products: number;
  };
}

async function getProducts() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/products?limit=12&sortBy=createdAt&sortOrder=desc`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function getFeaturedCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/categories?onlyActive=true&includeProducts=true`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    const data = await response.json();
    // Get parent categories with products, sorted by product count
    const categories = (data.data || []).filter((cat: Category) => !cat.parentId && cat._count.products > 0);
    // Sort by product count and take top 3
    return categories.sort((a: Category, b: Category) => b._count.products - a._count.products).slice(0, 3);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function ShopPage({ params }: ShopPageProps) {
  const { locale } = await params;
  const t = await getMessages(locale);
  const products = await getProducts();
  const featuredCategories = await getFeaturedCategories();

  // Helper to get localized category name
  const getCategoryName = (category: Category) => {
    if (locale === 'en' && category.nameEn) return category.nameEn;
    if (locale === 'ar' && category.nameAr) return category.nameAr;
    return category.name;
  };

  const getCategoryDescription = (category: Category) => {
    if (locale === 'en' && category.descriptionEn) return category.descriptionEn;
    if (locale === 'ar' && category.descriptionAr) return category.descriptionAr;
    return category.description || '';
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12" data-scroll-reveal>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t.products.shopTitle}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-justify leading-relaxed">
            {t.products.shopSubtitle}
          </p>
        </div>

        {/* Featured Categories Grid */}
        {featuredCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {featuredCategories.map((category, index) => (
              <div key={category.id} className="glass rounded-3xl p-8 text-center" data-scroll-reveal style={{ transitionDelay: `${index * 0.1}s` }}>
                <div className="w-24 h-24 bg-gradient-to-r from-primary-orange to-orange-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  {category.icon ? (
                    <div className="text-5xl">{category.icon}</div>
                  ) : (
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {getCategoryName(category)}
                </h3>
                {getCategoryDescription(category) && (
                  <p className="text-gray-600 dark:text-gray-300 mb-6 text-justify leading-relaxed">
                    {getCategoryDescription(category)}
                  </p>
                )}
                <Link 
                  href={`/${locale}/categories/${category.slug}`}
                  className="inline-block px-6 py-3 bg-gradient-to-r from-primary-orange to-orange-500 text-white font-semibold rounded-xl hover:scale-105 transition-transform duration-300"
                >
                  {t.products.viewProducts}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          // Fallback to hardcoded categories if no categories found
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="glass rounded-3xl p-8 text-center" data-scroll-reveal style={{ transitionDelay: "0.05s" }}>
              <div className="w-24 h-24 bg-gradient-to-r from-primary-orange to-orange-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t.products.diamondDiscs}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-justify leading-relaxed">
                {t.products.diamondDiscsDesc}
              </p>
              <Link 
                href={`/${locale}/categories`}
                className="inline-block px-6 py-3 bg-gradient-to-r from-primary-orange to-orange-500 text-white font-semibold rounded-xl hover:scale-105 transition-transform duration-300"
              >
                {t.products.viewProducts}
              </Link>
            </div>
            
            <div className="glass rounded-3xl p-8 text-center" data-scroll-reveal style={{ transitionDelay: "0.15s" }}>
              <div className="w-24 h-24 bg-gradient-to-r from-primary-orange to-orange-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t.products.cylindricalCutters}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-justify leading-relaxed">
                {t.products.cylindricalCuttersDesc}
              </p>
              <Link 
                href={`/${locale}/categories`}
                className="inline-block px-6 py-3 bg-gradient-to-r from-primary-orange to-orange-500 text-white font-semibold rounded-xl hover:scale-105 transition-transform duration-300"
              >
                {t.products.viewProducts}
              </Link>
            </div>
            
            <div className="glass rounded-3xl p-8 text-center" data-scroll-reveal style={{ transitionDelay: "0.25s" }}>
              <div className="w-24 h-24 bg-gradient-to-r from-primary-orange to-orange-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t.products.holdingClamps}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-justify leading-relaxed">
                {t.products.holdingClampsDesc}
              </p>
              <Link 
                href={`/${locale}/categories`}
                className="inline-block px-6 py-3 bg-gradient-to-r from-primary-orange to-orange-500 text-white font-semibold rounded-xl hover:scale-105 transition-transform duration-300"
              >
                {t.products.viewProducts}
              </Link>
            </div>
          </div>
        )}

        {/* Advanced Search */}
        <div className="mb-12">
          <AdvancedSearch locale={locale} />
        </div>

        {/* Products Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t.products.latestProducts}
            </h2>
          </div>

          {/* Product Grid */}
          <ProductGrid 
            products={products} 
            locale={locale}
            loading={false}
          />
        </div>

        {/* Load More Button */}
        {products.length >= 12 && (
          <div className="text-center" data-scroll-reveal style={{ transitionDelay: "0.2s" }}>
            <button className="px-8 py-4 bg-gradient-to-r from-primary-orange to-orange-500 text-white font-semibold rounded-xl hover:shadow-glass-orange hover:scale-105 transition-all duration-300">
              {t.products.loadMoreProducts}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
