import { Metadata } from "next";
import OpportunityManagementClient from "./OpportunityManagementClient";

export const metadata: Metadata = {
  title: "مدیریت فرصت‌های فروش | پنل مدیریت",
  description: "مدیریت و پیگیری فرصت‌های فروش در سیستم CRM"
};

interface OpportunityManagementPageProps {
  params: Promise<{ locale: string }>;
}

export default async function OpportunityManagementPage({ params }: OpportunityManagementPageProps) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-black via-gray-900 to-primary-black">
      <div className="space-y-6 pt-20 p-6">
        <OpportunityManagementClient locale={locale} />
      </div>
    </div>
  );
}
