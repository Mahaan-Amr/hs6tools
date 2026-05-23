import { getMessages } from "@/lib/i18n";
import ShopProductsSection from "@/components/ecommerce/ShopProductsSection";
import { getCurrentWishlistProductIds, getPublicCategories, getPublicProducts, PublicCategory } from "@/lib/catalog";

interface ShopPageProps {
  params: Promise<{ locale: string }>;
}

async function getShopCategories(): Promise<PublicCategory[]> {
  const categories = await getPublicCategories();
  return categories
    .filter((category) => category._count.products > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export default async function ShopPage({ params }: ShopPageProps) {
  const { locale } = await params;
  const t = await getMessages(locale);
  const [{ products, pagination }, shopCategories, wishlistProductIds] = await Promise.all([
    getPublicProducts({ limit: 24, sortBy: "createdAt", sortOrder: "desc" }),
    getShopCategories(),
    getCurrentWishlistProductIds(),
  ]);
  
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

        {/* Products Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t.products.latestProducts}
            </h2>
          </div>

          <ShopProductsSection
            initialProducts={products}
            initialPagination={pagination}
            initialWishlistProductIds={wishlistProductIds}
            locale={locale}
            messages={t}
            categories={shopCategories}
          />
        </div>
      </div>
    </div>
  );
}
