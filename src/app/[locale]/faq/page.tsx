import FAQView from "@/components/faq/FAQView";
import { getMessages } from "@/lib/i18n";
import { getPageContent } from "@/lib/page-cms";
import { FAQPageContentPayload } from "@/types/page-cms";

interface FAQPageProps {
  params: Promise<{ locale: string }>;
}

export default async function FAQPage({ params }: FAQPageProps) {
  const { locale } = await params;
  const messages = await getMessages(locale);
  const page = (await getPageContent("faq", locale, messages)) as FAQPageContentPayload;

  return <FAQView locale={locale} content={{ title: page.title, subtitle: page.subtitle, ...page.content }} />;
}

