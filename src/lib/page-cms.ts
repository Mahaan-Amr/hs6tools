import { PageContent } from "@prisma/client";
import { defaultLocale, Locale, locales, Messages } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import {
  AboutPageContentData,
  AboutPageContentPayload,
  ContactPageContentData,
  ContactPageContentPayload,
  FAQPageContentPayload,
  PageContentPayload,
  PageLocale,
  PageSlug,
} from "@/types/page-cms";

const fallbackContactDetails = {
  address: "تهران، خیابان ولیعصر، پلاک ۱۲۳",
  phone: "۰۲۱-۱۲۳۴۵۶۷۸",
  email: "info@hs6tools.com",
} as const;

function resolveLocale(locale: string): PageLocale {
  return locales.includes(locale as Locale) ? (locale as PageLocale) : defaultLocale;
}

function normalizeText(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeNullableIcon(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function buildDefaultAboutContent(locale: PageLocale, messages: Messages): AboutPageContentPayload {
  return {
    slug: "about",
    locale,
    title: messages.about.pageTitle,
    subtitle: messages.about.pageSubtitle,
    content: {
      historyTitle: messages.about.companyHistory,
      historyParagraphs: [messages.about.historyText1, messages.about.historyText2],
      mainStatCard: {
        title: messages.about.yearsExperience,
        description: messages.about.inIndustrialTools,
        icon: "Building2",
      },
      featureCards: [
        {
          title: messages.about.guaranteedQuality,
          description: messages.about.qualityDescription,
          icon: "BadgeCheck",
        },
        {
          title: messages.about.advancedTechnology,
          description: messages.about.technologyDescription,
          icon: "Zap",
        },
        {
          title: messages.about.support247,
          description: messages.about.supportDescription,
          icon: "LifeBuoy",
        },
      ],
    },
  };
}

function buildDefaultContactContent(locale: PageLocale, messages: Messages): ContactPageContentPayload {
  return {
    slug: "contact",
    locale,
    title: messages.contact.pageTitle,
    subtitle: messages.contact.pageSubtitle,
    content: {
      form: {
        title: messages.contact.contactForm,
        fields: {
          firstNameLabel: messages.contact.firstName,
          firstNamePlaceholder: messages.contact.firstNamePlaceholder,
          lastNameLabel: messages.contact.lastName,
          lastNamePlaceholder: messages.contact.lastNamePlaceholder,
          emailLabel: messages.contact.email,
          emailPlaceholder: messages.contact.emailPlaceholder,
          subjectLabel: messages.contact.subject,
          subjectPlaceholder: messages.contact.subjectPlaceholder,
          messageLabel: messages.contact.message,
          messagePlaceholder: messages.contact.messagePlaceholder,
        },
        submitLabel: messages.contact.sendMessage,
      },
      contactInfoTitle: messages.contact.contactInfo,
      contactCards: [
        {
          title: messages.contact.address,
          value: fallbackContactDetails.address,
          icon: "MapPin",
        },
        {
          title: messages.contact.phone,
          value: fallbackContactDetails.phone,
          icon: "Phone",
        },
        {
          title: messages.contact.email,
          value: fallbackContactDetails.email,
          icon: "Mail",
        },
      ],
      workingHours: {
        title: messages.contact.workingHours,
        lines: [
          messages.contact.saturdayToWednesday,
          messages.contact.thursday,
          messages.contact.friday,
        ],
      },
    },
  };
}

function buildDefaultFAQContent(locale: PageLocale): FAQPageContentPayload {
  const defaults: Record<PageLocale, FAQPageContentPayload> = {
    fa: {
      slug: "faq",
      locale,
      title: "سوالات متداول",
      subtitle: "پاسخ به رایج‌ترین پرسش‌ها درباره محصولات، سفارش‌ها و خدمات پشتیبانی HS6Tools.",
      content: {
        sections: [
          {
            title: "محصولات و موجودی",
            items: [
              {
                question: "چطور از موجود بودن محصول مطمئن شوم؟",
                answer: "وضعیت موجودی هر محصول در صفحه همان محصول قابل مشاهده است. برای سفارش‌های فوری می‌توانید از پشتیبانی سوال کنید.",
              },
              {
                question: "آیا امکان سفارش محصول سفارشی وجود دارد؟",
                answer: "بله، تیم پشتیبانی می‌تواند درخواست محصولات سفارشی را ثبت و پیگیری کند.",
              },
            ],
          },
          {
            title: "پرداخت و ارسال",
            items: [
              {
                question: "چه روش‌های پرداختی پشتیبانی می‌شود؟",
                answer: "پرداخت آنلاین امن و روش‌های فعال‌شده در مرحله checkout در دسترس هستند.",
              },
              {
                question: "زمان پردازش سفارش چقدر است؟",
                answer: "سفارش‌ها معمولا طی ۲۴ ساعت کاری پردازش می‌شوند.",
              },
            ],
          },
          {
            title: "خدمات پس از فروش",
            items: [
              {
                question: "چطور درخواست گارانتی یا تعمیر ثبت کنم؟",
                answer: "از دکمه پشتیبانی یا بخش حساب کاربری یک تیکت با موضوع گارانتی ثبت کنید.",
              },
            ],
          },
        ],
        contactTitle: "سوالی دارید که اینجا پاسخ داده نشده است؟",
        contactDescription: "تیم پشتیبانی ما آماده پاسخ‌گویی و راهنمایی تخصصی است.",
        contactCta: "تماس با پشتیبانی",
      },
    },
    en: {
      slug: "faq",
      locale,
      title: "Frequently Asked Questions",
      subtitle: "Answers to common questions about products, orders, and HS6Tools support.",
      content: {
        sections: [
          {
            title: "Products & Availability",
            items: [
              { question: "How can I check availability?", answer: "Each product page shows current stock status." },
              { question: "Do you support custom products?", answer: "Yes, submit a support ticket with your requirements." },
            ],
          },
          {
            title: "Payments & Shipping",
            items: [
              { question: "What payment methods are available?", answer: "Active payment methods are shown during checkout." },
            ],
          },
        ],
        contactTitle: "Need more help?",
        contactDescription: "Our support team is ready to help.",
        contactCta: "Contact Support",
      },
    },
    ar: {
      slug: "faq",
      locale,
      title: "الأسئلة الشائعة",
      subtitle: "إجابات على الأسئلة الشائعة حول المنتجات والطلبات والدعم.",
      content: {
        sections: [
          {
            title: "المنتجات والتوفر",
            items: [
              { question: "كيف أتحقق من توفر المنتج؟", answer: "تعرض صفحة كل منتج حالة المخزون الحالية." },
            ],
          },
        ],
        contactTitle: "هل تحتاج إلى مساعدة إضافية؟",
        contactDescription: "فريق الدعم جاهز للمساعدة.",
        contactCta: "تواصل مع الدعم",
      },
    },
  };

  return defaults[locale];
}

function normalizeAboutContent(
  locale: PageLocale,
  base: { title: string; subtitle: string },
  raw: unknown,
  fallback: AboutPageContentPayload
): AboutPageContentPayload {
  const content = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const historyParagraphs = Array.isArray(content.historyParagraphs) ? content.historyParagraphs : [];
  const featureCards = Array.isArray(content.featureCards) ? content.featureCards : [];
  const mainStatCard =
    content.mainStatCard && typeof content.mainStatCard === "object"
      ? (content.mainStatCard as Record<string, unknown>)
      : {};

  return {
    slug: "about",
    locale,
    title: base.title || fallback.title,
    subtitle: base.subtitle || fallback.subtitle,
    content: {
      historyTitle: normalizeText(content.historyTitle, fallback.content.historyTitle),
      historyParagraphs: [
        normalizeText(historyParagraphs[0], fallback.content.historyParagraphs[0]),
        normalizeText(historyParagraphs[1], fallback.content.historyParagraphs[1]),
      ],
      mainStatCard: {
        title: normalizeText(mainStatCard.title, fallback.content.mainStatCard.title),
        description: normalizeText(
          mainStatCard.description,
          fallback.content.mainStatCard.description
        ),
        icon: normalizeNullableIcon(mainStatCard.icon) || fallback.content.mainStatCard.icon,
      },
      featureCards: [0, 1, 2].map((index) => {
        const card =
          featureCards[index] && typeof featureCards[index] === "object"
            ? (featureCards[index] as Record<string, unknown>)
            : {};

        return {
          title: normalizeText(card.title, fallback.content.featureCards[index].title),
          description: normalizeText(
            card.description,
            fallback.content.featureCards[index].description
          ),
          icon: normalizeNullableIcon(card.icon) || fallback.content.featureCards[index].icon,
        };
      }) as AboutPageContentData["featureCards"],
    },
  };
}

function normalizeContactContent(
  locale: PageLocale,
  base: { title: string; subtitle: string },
  raw: unknown,
  fallback: ContactPageContentPayload
): ContactPageContentPayload {
  const content = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const form =
    content.form && typeof content.form === "object"
      ? (content.form as Record<string, unknown>)
      : {};
  const fields =
    form.fields && typeof form.fields === "object"
      ? (form.fields as Record<string, unknown>)
      : {};
  const contactCards = Array.isArray(content.contactCards) ? content.contactCards : [];
  const workingHours =
    content.workingHours && typeof content.workingHours === "object"
      ? (content.workingHours as Record<string, unknown>)
      : {};
  const workingLines = Array.isArray(workingHours.lines) ? workingHours.lines : [];

  return {
    slug: "contact",
    locale,
    title: base.title || fallback.title,
    subtitle: base.subtitle || fallback.subtitle,
    content: {
      form: {
        title: normalizeText(form.title, fallback.content.form.title),
        fields: {
          firstNameLabel: normalizeText(
            fields.firstNameLabel,
            fallback.content.form.fields.firstNameLabel
          ),
          firstNamePlaceholder: normalizeText(
            fields.firstNamePlaceholder,
            fallback.content.form.fields.firstNamePlaceholder
          ),
          lastNameLabel: normalizeText(
            fields.lastNameLabel,
            fallback.content.form.fields.lastNameLabel
          ),
          lastNamePlaceholder: normalizeText(
            fields.lastNamePlaceholder,
            fallback.content.form.fields.lastNamePlaceholder
          ),
          emailLabel: normalizeText(fields.emailLabel, fallback.content.form.fields.emailLabel),
          emailPlaceholder: normalizeText(
            fields.emailPlaceholder,
            fallback.content.form.fields.emailPlaceholder
          ),
          subjectLabel: normalizeText(
            fields.subjectLabel,
            fallback.content.form.fields.subjectLabel
          ),
          subjectPlaceholder: normalizeText(
            fields.subjectPlaceholder,
            fallback.content.form.fields.subjectPlaceholder
          ),
          messageLabel: normalizeText(
            fields.messageLabel,
            fallback.content.form.fields.messageLabel
          ),
          messagePlaceholder: normalizeText(
            fields.messagePlaceholder,
            fallback.content.form.fields.messagePlaceholder
          ),
        },
        submitLabel: normalizeText(form.submitLabel, fallback.content.form.submitLabel),
      },
      contactInfoTitle: normalizeText(
        content.contactInfoTitle,
        fallback.content.contactInfoTitle
      ),
      contactCards: [0, 1, 2].map((index) => {
        const card =
          contactCards[index] && typeof contactCards[index] === "object"
            ? (contactCards[index] as Record<string, unknown>)
            : {};

        return {
          title: normalizeText(card.title, fallback.content.contactCards[index].title),
          value: normalizeText(card.value, fallback.content.contactCards[index].value),
          icon: normalizeNullableIcon(card.icon) || fallback.content.contactCards[index].icon,
        };
      }) as ContactPageContentData["contactCards"],
      workingHours: {
        title: normalizeText(workingHours.title, fallback.content.workingHours.title),
        lines: [
          normalizeText(workingLines[0], fallback.content.workingHours.lines[0]),
          normalizeText(workingLines[1], fallback.content.workingHours.lines[1]),
          normalizeText(workingLines[2], fallback.content.workingHours.lines[2]),
        ],
      },
    },
  };
}

function normalizeFAQContent(
  locale: PageLocale,
  base: { title: string; subtitle: string },
  raw: unknown,
  fallback: FAQPageContentPayload
): FAQPageContentPayload {
  const content = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const rawSections = Array.isArray(content.sections) ? content.sections : fallback.content.sections;
  const sections = rawSections
    .map((section) => {
      const item = section && typeof section === "object" ? (section as Record<string, unknown>) : {};
      const rawItems = Array.isArray(item.items) ? item.items : [];
      return {
        title: normalizeText(item.title, ""),
        items: rawItems
          .map((faqItem) => {
            const faq = faqItem && typeof faqItem === "object" ? (faqItem as Record<string, unknown>) : {};
            return {
              question: normalizeText(faq.question, ""),
              answer: normalizeText(faq.answer, ""),
            };
          })
          .filter((faq) => faq.question && faq.answer),
      };
    })
    .filter((section) => section.title && section.items.length > 0);

  return {
    slug: "faq",
    locale,
    title: base.title || fallback.title,
    subtitle: base.subtitle || fallback.subtitle,
    content: {
      sections: sections.length > 0 ? sections : fallback.content.sections,
      contactTitle: normalizeText(content.contactTitle, fallback.content.contactTitle),
      contactDescription: normalizeText(content.contactDescription, fallback.content.contactDescription),
      contactCta: normalizeText(content.contactCta, fallback.content.contactCta),
    },
  };
}

function normalizeStoredPageContent(
  record: PageContent,
  fallback: PageContentPayload
): PageContentPayload {
  const locale = resolveLocale(record.locale);
  const base = {
    title: normalizeText(record.title, fallback.title),
    subtitle: normalizeText(record.subtitle, fallback.subtitle),
  };

  if (record.slug === "contact") {
    return normalizeContactContent(
      locale,
      base,
      record.content,
      fallback as ContactPageContentPayload
    );
  }

  if (record.slug === "faq") {
    return normalizeFAQContent(
      locale,
      base,
      record.content,
      fallback as FAQPageContentPayload
    );
  }

  return normalizeAboutContent(
    locale,
    base,
    record.content,
    fallback as AboutPageContentPayload
  );
}

export async function getDefaultPageContent(
  slug: PageSlug,
  locale: string,
  messages: Messages
): Promise<PageContentPayload> {
  const resolvedLocale = resolveLocale(locale);
  if (slug === "contact") return buildDefaultContactContent(resolvedLocale, messages);
  if (slug === "faq") return buildDefaultFAQContent(resolvedLocale);
  return buildDefaultAboutContent(resolvedLocale, messages);
}

export async function getPageContent(
  slug: PageSlug,
  locale: string,
  messages: Messages
): Promise<PageContentPayload> {
  const resolvedLocale = resolveLocale(locale);
  const fallback = await getDefaultPageContent(slug, resolvedLocale, messages);

  const record = await prisma.pageContent.findUnique({
    where: {
      slug_locale: {
        slug,
        locale: resolvedLocale,
      },
    },
  });

  if (!record) return fallback;
  return normalizeStoredPageContent(record, fallback);
}
