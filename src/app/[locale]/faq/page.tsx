import FAQView from "@/components/faq/FAQView";
import { FAQ_CONTENT, FAQContent } from "./content";

interface FAQPageProps {
  params: Promise<{ locale: string }>;
}

export default async function FAQPage({ params }: FAQPageProps) {
  const { locale } = await params;
  const localeKey = Object.prototype.hasOwnProperty.call(
    FAQ_CONTENT,
    locale
  )
    ? locale
    : "en";
  const content: FAQContent = FAQ_CONTENT[localeKey];

  return <FAQView locale={locale} content={content} />;
}

