import AdminLayoutWrapper from "@/components/layout/AdminLayoutWrapper";
import AnalyticsTab from "@/components/admin/analytics/AnalyticsTab";

interface AdminAnalyticsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminAnalyticsPage({ params }: AdminAnalyticsPageProps) {
  const { locale } = await params;

  return (
    <AdminLayoutWrapper locale={locale}>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            گزارش‌ها و تحلیل
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            تحلیل عملکرد، فروش و رفتار کاربران
          </p>
        </div>

        {/* Analytics Content */}
        <AnalyticsTab locale={locale} />
      </div>
    </AdminLayoutWrapper>
  );
}
