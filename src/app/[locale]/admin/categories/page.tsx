import AdminLayoutWrapper from "@/components/layout/AdminLayoutWrapper";
import CategoriesTab from "@/components/admin/categories/CategoriesTab";

interface AdminCategoriesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminCategoriesPage({ params }: AdminCategoriesPageProps) {
  const { locale } = await params;

  return (
    <AdminLayoutWrapper locale={locale}>
      <CategoriesTab />
    </AdminLayoutWrapper>
  );
}
