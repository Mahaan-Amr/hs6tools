import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import CustomerLifecycleManager from "@/components/admin/crm/CustomerLifecycleManager";

interface LifecyclePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function LifecyclePage({ params }: LifecyclePageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/fa/auth/login");
  }

  const { locale } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-black via-gray-900 to-primary-black">
      <div className="pt-20 p-6">
        <CustomerLifecycleManager locale={locale} />
      </div>
    </div>
  );
}
