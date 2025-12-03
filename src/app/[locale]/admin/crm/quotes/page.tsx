import { Metadata } from "next";
import QuoteManagementClient from "@/app/[locale]/admin/crm/quotes/QuoteManagementClient";
import { getMessages } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages(locale);
  
  return {
    title: `${String(messages.admin.crm?.quotes?.title || "Quotes Management")} | ${String(messages.admin.crm?.adminLayout?.title || "Admin Panel")}`,
    description: String(messages.admin.crm?.quotesManagement || "Manage and track sales quotes in CRM system")
  };
}

interface QuoteManagementPageProps {
  params: Promise<{ locale: string }>;
}

export default async function QuoteManagementPage({ params }: QuoteManagementPageProps) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-black via-gray-900 to-primary-black">
      <div className="space-y-6 pt-20 p-6">
        <QuoteManagementClient locale={locale} />
      </div>
    </div>
  );
}
