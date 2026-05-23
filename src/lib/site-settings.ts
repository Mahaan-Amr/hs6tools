import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { defaultLocale, Locale, locales } from "@/lib/i18n";

export interface LocaleSeoSettings {
  title: string;
  description: string;
  keywords: string;
  socialImage: string;
}

export type SiteSeoSettings = Record<Locale, LocaleSeoSettings>;

const defaultSeo: SiteSeoSettings = {
  fa: {
    title: "HS6Tools",
    description: "تولید کننده ابزارآلات صنعتی و نجاری با کیفیت بالا.",
    keywords: "ابزار صنعتی, ابزار نجاری, دیسک الماسه, کاتر, گیره",
    socialImage: "/logo.svg",
  },
  en: {
    title: "HS6Tools",
    description: "Premium industrial and woodworking tools manufacturer.",
    keywords: "industrial tools, woodworking tools, diamond discs, cutters, clamps",
    socialImage: "/logo.svg",
  },
  ar: {
    title: "HS6Tools",
    description: "مصنع أدوات صناعية وأدوات نجارة عالية الجودة.",
    keywords: "أدوات صناعية, أدوات نجارة, أقراص ألماسية, قواطع, مشابك",
    socialImage: "/logo.svg",
  },
};

export function normalizeSiteSeo(value: unknown): SiteSeoSettings {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return locales.reduce((result, locale) => {
    const entry =
      source[locale] && typeof source[locale] === "object"
        ? (source[locale] as Record<string, unknown>)
        : {};
    result[locale] = {
      title: typeof entry.title === "string" && entry.title.trim() ? entry.title.trim() : defaultSeo[locale].title,
      description:
        typeof entry.description === "string" && entry.description.trim()
          ? entry.description.trim()
          : defaultSeo[locale].description,
      keywords:
        typeof entry.keywords === "string" && entry.keywords.trim()
          ? entry.keywords.trim()
          : defaultSeo[locale].keywords,
      socialImage:
        typeof entry.socialImage === "string" && entry.socialImage.trim()
          ? entry.socialImage.trim()
          : defaultSeo[locale].socialImage,
    };
    return result;
  }, {} as SiteSeoSettings);
}

export function getSeoForLocale(siteSeo: unknown, locale: string): LocaleSeoSettings {
  const resolvedLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  return normalizeSiteSeo(siteSeo)[resolvedLocale];
}

export async function getSystemSettings() {
  const settings = await prisma.systemSettings.findFirst();

  if (settings) {
    return {
      ...settings,
      siteSeo: normalizeSiteSeo(settings.siteSeo),
    };
  }

  const created = await prisma.systemSettings.create({
    data: {
      id: "default",
      siteName: "HS6Tools",
      siteDescription: "Industrial E-Commerce Platform",
      siteUrl: "https://hs6tools.com",
      siteSeo: defaultSeo as unknown as Prisma.InputJsonValue,
      contactEmail: "support@hs6tools.com",
      contactPhone: "+98-21-12345678",
      businessAddress: "Tehran, Iran",
      currency: "IRR",
      language: "fa",
      timezone: "Asia/Tehran",
      maintenanceMode: false,
      allowRegistration: true,
      requireEmailVerification: false,
      requirePhoneVerification: false,
    },
  });

  return {
    ...created,
    siteSeo: normalizeSiteSeo(created.siteSeo),
  };
}
