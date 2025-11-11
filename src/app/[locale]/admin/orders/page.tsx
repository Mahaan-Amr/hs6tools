import AdminLayoutWrapper from "@/components/layout/AdminLayoutWrapper";
import OrdersTab from "@/components/admin/orders/OrdersTab";

interface AdminOrdersPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminOrdersPage({ params }: AdminOrdersPageProps) {
  const { locale } = await params;

  return (
    <AdminLayoutWrapper locale={locale}>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            مدیریت سفارشات
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto text-justify leading-relaxed">
            مدیریت سفارشات، پرداخت‌ها و تحویل
          </p>
        </div>

        {/* Orders Management Content */}
        <OrdersTab />
      </div>
    </AdminLayoutWrapper>
  );
}
