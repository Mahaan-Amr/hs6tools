import { getMessages } from "@/lib/i18n";
import ProductGrid from "@/components/ecommerce/ProductGrid";
import AdvancedSearch from "@/components/ecommerce/AdvancedSearch";

interface ShopPageProps {
  params: Promise<{ locale: string }>;
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

export default async function ShopPage({ params }: ShopPageProps) {
  const { locale } = await params;
  const t = await getMessages(locale);
  const products = await getProducts();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t.products.shopTitle || "فروشگاه ابزارهای صنعتی"}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t.products.shopSubtitle || "مجموعه کامل ابزارهای صنعتی و نجاری با کیفیت برتر"}
          </p>
        </div>

        {/* Featured Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="glass rounded-3xl p-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-primary-orange to-orange-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t.products.diamondDiscs || "دیسک‌های الماسه"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t.products.diamondDiscsDesc || "کیفیت برتر برای برش‌های دقیق"}
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-primary-orange to-orange-500 text-white font-semibold rounded-xl hover:scale-105 transition-transform duration-300">
              {t.products.viewProducts || "مشاهده محصولات"}
            </button>
          </div>
          
          <div className="glass rounded-3xl p-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-primary-orange to-orange-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t.products.cylindricalCutters || "کاترهای استوانه‌ای"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t.products.cylindricalCuttersDesc || "ابزارهای حرفه‌ای برای نجاری"}
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-primary-orange to-orange-500 text-white font-semibold rounded-xl hover:scale-105 transition-transform duration-300">
              {t.products.viewProducts || "مشاهده محصولات"}
            </button>
          </div>
          
          <div className="glass rounded-3xl p-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-primary-orange to-orange-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t.products.holdingClamps || "گیره‌های نگهدارنده"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t.products.holdingClampsDesc || "ایمنی و دقت در کار"}
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-primary-orange to-orange-500 text-white font-semibold rounded-xl hover:scale-105 transition-transform duration-300">
              {t.products.viewProducts || "مشاهده محصولات"}
            </button>
          </div>
        </div>

        {/* Advanced Search */}
        <div className="mb-12">
          <AdvancedSearch locale={locale} />
        </div>

        {/* Products Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              جدیدترین محصولات
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
          <div className="text-center">
            <button className="px-8 py-4 bg-gradient-to-r from-primary-orange to-orange-500 text-white font-semibold rounded-xl hover:shadow-glass-orange hover:scale-105 transition-all duration-300">
              مشاهده محصولات بیشتر
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
