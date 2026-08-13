import type { Metadata } from "next";
import { defaultLocale, Locale, locales } from "@/lib/i18n";

export const SITE_URL = "https://hs6tools.com";

function resolveLocale(locale: string): Locale {
  return locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
}

function normalizePath(path: string) {
  if (!path || path === "/") return "";
  return path.startsWith("/") ? path : `/${path}`;
}

export function createPageMetadata({
  locale,
  path,
  title,
  description,
  keywords,
  image = "/favicon-512.png",
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
  keywords?: string;
  image?: string;
}): Metadata {
  const resolvedLocale = resolveLocale(locale);
  const localizedPath = normalizePath(path);
  const pageTitle = title.includes("HS6Tools") ? title : `${title} | HS6Tools`;
  const canonicalPath = `/${resolvedLocale}${localizedPath}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: pageTitle,
    description,
    keywords,
    alternates: {
      canonical: canonicalPath,
      languages: {
        fa: `/fa${localizedPath}`,
        en: `/en${localizedPath}`,
        ar: `/ar${localizedPath}`,
        "x-default": `/fa${localizedPath}`,
      },
    },
    openGraph: {
      title: pageTitle,
      description,
      url: canonicalPath,
      siteName: "HS6Tools",
      locale: resolvedLocale === "fa" ? "fa_IR" : resolvedLocale === "ar" ? "ar" : "en_US",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [image],
    },
  };
}
