import AdminLayoutWrapper from "@/components/layout/AdminLayoutWrapper";
import AdminTicketsTab from "@/components/admin/support/AdminTicketsTab";

interface AdminSupportPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminSupportPage({ params }: AdminSupportPageProps) {
  const { locale } = await params;

  return (
    <AdminLayoutWrapper locale={locale}>
      <AdminTicketsTab />
    </AdminLayoutWrapper>
  );
}
