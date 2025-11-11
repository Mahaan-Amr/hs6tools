import { Suspense } from "react";
import EducationContent from "./EducationContent";

interface EducationPageProps {
  params: Promise<{ locale: string }>;
}

export default async function EducationPage({ params }: EducationPageProps) {
  const { locale } = await params;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            آموزش
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            آموزش‌های تخصصی و کاربردی برای استفاده از ابزارهای صنعتی
          </p>
        </div>

        {/* Education Content */}
        <Suspense fallback={
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-900 dark:text-white">در حال بارگذاری...</p>
          </div>
        }>
          <EducationContent locale={locale} />
        </Suspense>
      </div>
    </div>
  );
}

