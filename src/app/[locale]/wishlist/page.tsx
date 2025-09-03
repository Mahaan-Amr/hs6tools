import { getMessages } from "@/lib/i18n";
import WishlistContent from "@/components/ecommerce/WishlistContent";

interface WishlistPageProps {
  params: Promise<{ locale: string }>;
}

export default async function WishlistPage({ params }: WishlistPageProps) {
  const { locale } = await params;
  const t = await getMessages(locale);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-black via-gray-900 to-primary-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t.wishlist?.title || "لیست علاقه‌مندی"}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            محصولات مورد علاقه خود را مدیریت کنید
          </p>
        </div>

        {/* Wishlist Content */}
        <WishlistContent locale={locale} />
      </div>
    </div>
  );
}
