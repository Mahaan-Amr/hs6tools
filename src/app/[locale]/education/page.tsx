import { Suspense } from "react";
import EducationContent from "./EducationContent";
import { getMessages } from "@/lib/i18n";

interface EducationPageProps {
  params: Promise<{ locale: string }>;
}

export default async function EducationPage({ params }: EducationPageProps) {
  const { locale } = await params;
  const messages = await getMessages(locale);
  
  if (!messages.education) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-900 dark:text-white">{messages?.common?.loading || "Loading..."}</p>
          </div>
        </div>
      </div>
    );
  }
  
  const t = messages.education;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12" data-scroll-reveal>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {String(t.title)}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-justify leading-relaxed">
            {String(t.subtitle)}
          </p>
        </div>

        {/* Education Content */}
        <Suspense fallback={
          <div className="text-center py-12" data-scroll-reveal>
            <div className="w-12 h-12 border-4 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-900 dark:text-white">{String(t.loading)}</p>
          </div>
        }>
          <EducationContent locale={locale} />
        </Suspense>
      </div>
    </div>
  );
}

