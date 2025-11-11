import AdminLayoutWrapper from "@/components/layout/AdminLayoutWrapper";
import SettingsTab from "@/components/admin/settings/SettingsTab";

interface AdminSettingsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminSettingsPage({ params }: AdminSettingsPageProps) {
  const { locale } = await params;

  return (
    <AdminLayoutWrapper locale={locale}>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            تنظیمات سیستم
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto text-justify leading-relaxed">
            تنظیمات عمومی، امنیت و پیکربندی سیستم
          </p>
        </div>

        {/* Settings Content */}
        <SettingsTab />
      </div>
    </AdminLayoutWrapper>
  );
}
