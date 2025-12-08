import { notFound } from "next/navigation";
import { isValidLocale, getMessages } from "@/lib/i18n";
import Header from "@/components/layout/Header";
import ScrollEffects from "@/components/layout/ScrollEffects";
import ConditionalFooter from "@/components/layout/ConditionalFooter";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Await the params object before accessing its properties
  const { locale } = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!isValidLocale(locale)) {
    notFound();
  }

  // Get messages for the current locale
  const messages = await getMessages(locale);

  return (
    <>
      <ScrollEffects />
      <Header locale={locale} messages={messages} />
      <main className="min-h-screen">
        {children}
      </main>
      {/* Use ConditionalFooter to avoid rendering Footer on admin pages */}
      <ConditionalFooter locale={locale} messages={messages} />
    </>
  );
}
