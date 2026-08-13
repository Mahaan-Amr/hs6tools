import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isValidLocale, getMessages } from "@/lib/i18n";
import Header from "@/components/layout/Header";
import ScrollEffects from "@/components/layout/ScrollEffects";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import SupportTicketWidget from "@/components/support/SupportTicketWidget";
import { getSeoForLocale, getSystemSettings } from "@/lib/site-settings";
import { SITE_URL } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  const settings = await getSystemSettings();
  const seo = getSeoForLocale(settings.siteSeo, locale);
  const siteUrl = SITE_URL;

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        fa: "/fa",
        en: "/en",
        ar: "/ar",
        "x-default": "/fa",
      },
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `${siteUrl}/${locale}`,
      siteName: settings.siteName,
      locale: locale === "fa" ? "fa_IR" : locale === "ar" ? "ar" : "en_US",
      type: "website",
      images: [{ url: seo.socialImage || "/favicon-512.png", width: 1200, height: 630, alt: settings.siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [seo.socialImage || "/favicon-512.png"],
    },
  };
}

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
      <SupportTicketWidget locale={locale} />
      {/* Use ConditionalFooter to avoid rendering Footer on admin pages */}
      <ConditionalFooter locale={locale} messages={messages} />
    </>
  );
}
