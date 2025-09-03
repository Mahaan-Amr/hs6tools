import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

export const locales = ["fa", "en", "ar"] as const;
export const defaultLocale = "fa" as const;

export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) notFound();

  return {
    messages: (await import(`../../messages/${locale}.json`)).default,
    locale: locale as string,
  };
});
