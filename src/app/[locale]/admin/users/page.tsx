import AdminLayoutWrapper from "@/components/layout/AdminLayoutWrapper";
import UsersTab from "@/components/admin/users/UsersTab";

interface AdminUsersPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminUsersPage({ params }: AdminUsersPageProps) {
  const { locale } = await params;

  return (
    <AdminLayoutWrapper locale={locale}>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            مدیریت کاربران
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            مدیریت کاربران، نقش‌ها و دسترسی‌ها
          </p>
        </div>

        {/* Users Management Content */}
        <UsersTab />
      </div>
    </AdminLayoutWrapper>
  );
}
