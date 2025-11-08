import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin-auth";
import LeadManagementClient from "./LeadManagementClient";

interface LeadManagementPageProps {
  params: Promise<{ locale: string }>;
}

export default async function LeadManagementPage({ params }: LeadManagementPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !isAdmin(session.user.role)) {
    redirect("/fa/auth/login");
  }

  const { locale } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-black via-gray-900 to-primary-black">
      <div className="pt-20 p-6">
        <LeadManagementClient locale={locale} />
      </div>
    </div>
  );
}
