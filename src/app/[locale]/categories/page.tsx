import CategoryCard from "@/components/ecommerce/CategoryCard";
import { getMessages } from "@/lib/i18n";

interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: string;
  _count: {
    products: number;
    children: number;
  };
}

interface CategoriesPageProps {
  params: Promise<{ locale: string }>;
}

async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/categories?includeProducts=true&onlyActive=true`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function CategoriesPage({ params }: CategoriesPageProps) {
  const { locale } = await params;
  const t = await getMessages(locale);
  const categories = await getCategories();
  
  // Separate parent and child categories
  const parentCategories = categories.filter((cat: Category) => !cat.parentId);
  const childCategories = categories.filter((cat: Category) => cat.parentId);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12" data-scroll-reveal>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t.categories.pageTitle}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-justify leading-relaxed">
            {t.categories.pageSubtitle}
          </p>
        </div>

        {/* Parent Categories */}
        {parentCategories.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              {t.categories.parentCategories}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {parentCategories.map((category: Category, index: number) => (
                <div key={category.id} data-scroll-reveal style={{ transitionDelay: `${index * 0.07}s` }}>
                  <CategoryCard
                    id={category.id}
                    slug={category.slug}
                    name={category.name}
                    description={category.description}
                    image={category.image}
                    icon={category.icon}
                    productCount={category._count.products}
                    subcategoryCount={category._count.children}
                    locale={locale}
                    isParent={true}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Child Categories */}
        {childCategories.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              {t.categories.subcategories}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {childCategories.map((category: Category, index: number) => (
                <div key={category.id} data-scroll-reveal style={{ transitionDelay: `${index * 0.05}s` }}>
                  <CategoryCard
                    id={category.id}
                    slug={category.slug}
                    name={category.name}
                    description={category.description}
                    image={category.image}
                    icon={category.icon}
                    productCount={category._count.products}
                    subcategoryCount={0}
                    locale={locale}
                    isParent={false}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {categories.length === 0 && (
          <div className="text-center py-12" data-scroll-reveal>
            <div className="glass rounded-3xl p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.categories.noCategoriesFound}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {t.categories.noCategoriesMessage}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
