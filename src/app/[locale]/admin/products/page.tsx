import AdminLayoutWrapper from "@/components/layout/AdminLayoutWrapper";
import ProductsTab from "@/components/admin/products/ProductsTab";

interface AdminProductsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminProductsPage({ params }: AdminProductsPageProps) {
  const { locale } = await params;

  return (
    <AdminLayoutWrapper locale={locale}>
      <ProductsTab />
    </AdminLayoutWrapper>
  );
}
