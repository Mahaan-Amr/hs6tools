import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Customer360View from "@/components/admin/crm/Customer360View";
import Link from "next/link";
import { getMessages } from "@/lib/i18n";

interface CustomerDetailPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/fa/auth/login");
  }

  const { locale, id } = await params;
  const messages = await getMessages(locale);
  
  if (!messages.admin.customer360Page) {
    return <div className="min-h-screen bg-gradient-to-br from-primary-black via-gray-900 to-primary-black"><div className="text-white p-4">Loading...</div></div>;
  }
  
  const t = messages.admin.customer360Page;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-black via-gray-900 to-primary-black">
      <div className="space-y-6 pt-20 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{String(t.title)}</h1>
          <p className="text-gray-300 mt-2 text-sm sm:text-base">
            {String(t.subtitle)}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
          <button className="px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-primary-orange-dark transition-colors text-sm sm:text-base">
            {String(t.editCustomer)}
          </button>
          <Link
            href={`/${locale}/admin/crm/customers`}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm sm:text-base"
          >
            {String(t.backToCustomers)}
          </Link>
        </div>
      </div>

      <Customer360View customerId={id} locale={locale} />
      </div>
    </div>
  );
}
