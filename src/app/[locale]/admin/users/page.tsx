import AdminLayoutWrapper from "@/components/layout/AdminLayoutWrapper";
import UsersTab from "@/components/admin/users/UsersTab";
import { getMessages } from "@/lib/i18n";

interface AdminUsersPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminUsersPage({ params }: AdminUsersPageProps) {
  const { locale } = await params;
  
  // Load messages with error handling - don't block rendering
  let messages;
  try {
    messages = await getMessages(locale);
  } catch (error) {
    console.error('Error loading messages in users page:', error);
    messages = null;
  }
  
  // Use fallback if messages or usersPage is missing
  const t = messages?.admin?.usersPage || {
    title: "مدیریت کاربران",
    subtitle: "مدیریت حساب‌های کاربری و دسترسی‌ها"
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

        {/* Users Management Content */}
        <UsersTab />
      </div>
    </AdminLayoutWrapper>
  );
}
