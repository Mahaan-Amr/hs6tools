import { Metadata } from "next";
import QuoteManagementClient from "@/app/[locale]/admin/crm/quotes/QuoteManagementClient";

export const metadata: Metadata = {
  title: "مدیریت پیشنهادات | پنل مدیریت",
  description: "مدیریت و پیگیری پیشنهادات فروش در سیستم CRM"
};

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
