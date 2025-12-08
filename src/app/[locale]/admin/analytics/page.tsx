import AdminLayoutWrapper from "@/components/layout/AdminLayoutWrapper";
import AnalyticsTab from "@/components/admin/analytics/AnalyticsTab";
import { getMessages } from "@/lib/i18n";

interface AdminAnalyticsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminAnalyticsPage({ params }: AdminAnalyticsPageProps) {
  const { locale } = await params;
  
  // Load messages with error handling - don't block rendering
  let messages;
  try {
    messages = await getMessages(locale);
  } catch (error) {
    console.error('Error loading messages in analytics page:', error);
    messages = null;
  }
  
  // Use fallback if messages or analyticsPageHeader is missing
  const t = messages?.admin?.analyticsPageHeader || {
    title: "گزارش‌ها و تحلیل‌ها",
    subtitle: "مشاهده آمار و گزارش‌های جامع سیستم"
  };

  return (
    <AdminLayoutWrapper locale={locale}>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {String(t.title)}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto text-justify leading-relaxed">
            {String(t.subtitle)}
          </p>
        </div>

        {/* Analytics Content */}
        <AnalyticsTab locale={locale} />
      </div>
    </AdminLayoutWrapper>
  );
}
