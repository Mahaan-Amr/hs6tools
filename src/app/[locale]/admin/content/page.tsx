import AdminLayoutWrapper from "@/components/layout/AdminLayoutWrapper";
import ContentTabs from "@/components/admin/content/ContentTabs";

interface AdminContentPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminContentPage({ params }: AdminContentPageProps) {
  const { locale } = await params;

  return (
    <AdminLayoutWrapper locale={locale}>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            مدیریت محتوا
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            مدیریت مقالات، دسته‌بندی‌ها و محتوای آموزشی
          </p>
        </div>

        {/* Content Management Tabs */}
        <ContentTabs />
      </div>
    </AdminLayoutWrapper>
  );
}
