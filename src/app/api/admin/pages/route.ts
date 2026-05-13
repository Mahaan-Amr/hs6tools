import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getMessages, defaultLocale, Locale, locales } from "@/lib/i18n";
import { getPageContent } from "@/lib/page-cms";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authz";
import {
  AboutPageContentPayload,
  ContactPageContentPayload,
  FAQPageContentPayload,
  PageContentPayload,
  PageLocale,
  PageSlug,
} from "@/types/page-cms";

function resolveLocale(value: string | null): PageLocale {
  return locales.includes(value as Locale) ? (value as PageLocale) : defaultLocale;
}

function resolveSlug(value: string | null): PageSlug | null {
  return value === "about" || value === "contact" || value === "faq" ? value : null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeIcon(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function validateAboutPayload(
  locale: PageLocale,
  body: Record<string, unknown>
): AboutPageContentPayload | null {
  const content =
    body.content && typeof body.content === "object"
      ? (body.content as Record<string, unknown>)
      : null;
  const historyParagraphs = Array.isArray(content?.historyParagraphs)
    ? content?.historyParagraphs
    : null;
  const mainStatCard =
    content?.mainStatCard && typeof content.mainStatCard === "object"
      ? (content.mainStatCard as Record<string, unknown>)
      : null;
  const featureCards = Array.isArray(content?.featureCards) ? content.featureCards : null;

  if (
    !isNonEmptyString(body.title) ||
    !isNonEmptyString(body.subtitle) ||
    !isNonEmptyString(content?.historyTitle) ||
    !historyParagraphs ||
    historyParagraphs.length !== 2 ||
    !historyParagraphs.every(isNonEmptyString) ||
    !mainStatCard ||
    !isNonEmptyString(mainStatCard.title) ||
    !isNonEmptyString(mainStatCard.description) ||
    !featureCards ||
    featureCards.length !== 3
  ) {
    return null;
  }

  const normalizedCards = featureCards.map((card) => {
    const item = card && typeof card === "object" ? (card as Record<string, unknown>) : null;
    if (!item || !isNonEmptyString(item.title) || !isNonEmptyString(item.description)) {
      return null;
    }

    return {
      title: item.title.trim(),
      description: item.description.trim(),
      icon: normalizeIcon(item.icon),
    };
  });

  if (normalizedCards.some((card) => !card)) return null;

  return {
    slug: "about",
    locale,
    title: body.title.trim(),
    subtitle: body.subtitle.trim(),
    content: {
      historyTitle: content.historyTitle.trim(),
      historyParagraphs: [historyParagraphs[0].trim(), historyParagraphs[1].trim()],
      mainStatCard: {
        title: mainStatCard.title.trim(),
        description: mainStatCard.description.trim(),
        icon: normalizeIcon(mainStatCard.icon),
      },
      featureCards: normalizedCards as AboutPageContentPayload["content"]["featureCards"],
    },
  };
}

function validateContactPayload(
  locale: PageLocale,
  body: Record<string, unknown>
): ContactPageContentPayload | null {
  const content =
    body.content && typeof body.content === "object"
      ? (body.content as Record<string, unknown>)
      : null;
  const form = content?.form && typeof content.form === "object"
    ? (content.form as Record<string, unknown>)
    : null;
  const fields = form?.fields && typeof form.fields === "object"
    ? (form.fields as Record<string, unknown>)
    : null;
  const contactCards = Array.isArray(content?.contactCards) ? content.contactCards : null;
  const workingHours = content?.workingHours && typeof content.workingHours === "object"
    ? (content.workingHours as Record<string, unknown>)
    : null;
  const lines = Array.isArray(workingHours?.lines) ? workingHours.lines : null;

  if (
    !isNonEmptyString(body.title) ||
    !isNonEmptyString(body.subtitle) ||
    !form ||
    !fields ||
    !isNonEmptyString(form.title) ||
    !isNonEmptyString(form.submitLabel) ||
    !isNonEmptyString(fields.firstNameLabel) ||
    !isNonEmptyString(fields.firstNamePlaceholder) ||
    !isNonEmptyString(fields.lastNameLabel) ||
    !isNonEmptyString(fields.lastNamePlaceholder) ||
    !isNonEmptyString(fields.emailLabel) ||
    !isNonEmptyString(fields.emailPlaceholder) ||
    !isNonEmptyString(fields.subjectLabel) ||
    !isNonEmptyString(fields.subjectPlaceholder) ||
    !isNonEmptyString(fields.messageLabel) ||
    !isNonEmptyString(fields.messagePlaceholder) ||
    !isNonEmptyString(content?.contactInfoTitle) ||
    !contactCards ||
    contactCards.length !== 3 ||
    !workingHours ||
    !isNonEmptyString(workingHours.title) ||
    !lines ||
    lines.length !== 3 ||
    !lines.every(isNonEmptyString)
  ) {
    return null;
  }

  const normalizedCards = contactCards.map((card) => {
    const item = card && typeof card === "object" ? (card as Record<string, unknown>) : null;
    if (!item || !isNonEmptyString(item.title) || !isNonEmptyString(item.value)) {
      return null;
    }

    return {
      title: item.title.trim(),
      value: item.value.trim(),
      icon: normalizeIcon(item.icon),
    };
  });

  if (normalizedCards.some((card) => !card)) return null;

  return {
    slug: "contact",
    locale,
    title: body.title.trim(),
    subtitle: body.subtitle.trim(),
    content: {
      form: {
        title: form.title.trim(),
        fields: {
          firstNameLabel: fields.firstNameLabel.trim(),
          firstNamePlaceholder: fields.firstNamePlaceholder.trim(),
          lastNameLabel: fields.lastNameLabel.trim(),
          lastNamePlaceholder: fields.lastNamePlaceholder.trim(),
          emailLabel: fields.emailLabel.trim(),
          emailPlaceholder: fields.emailPlaceholder.trim(),
          subjectLabel: fields.subjectLabel.trim(),
          subjectPlaceholder: fields.subjectPlaceholder.trim(),
          messageLabel: fields.messageLabel.trim(),
          messagePlaceholder: fields.messagePlaceholder.trim(),
        },
        submitLabel: form.submitLabel.trim(),
      },
      contactInfoTitle: content.contactInfoTitle.trim(),
      contactCards: normalizedCards as ContactPageContentPayload["content"]["contactCards"],
      workingHours: {
        title: workingHours.title.trim(),
        lines: [lines[0].trim(), lines[1].trim(), lines[2].trim()],
      },
    },
  };
}

function validateFAQPayload(
  locale: PageLocale,
  body: Record<string, unknown>
): FAQPageContentPayload | null {
  const content =
    body.content && typeof body.content === "object"
      ? (body.content as Record<string, unknown>)
      : null;
  const sections = Array.isArray(content?.sections) ? content.sections : null;

  if (
    !isNonEmptyString(body.title) ||
    !isNonEmptyString(body.subtitle) ||
    !sections ||
    sections.length === 0 ||
    !isNonEmptyString(content?.contactTitle) ||
    !isNonEmptyString(content?.contactDescription) ||
    !isNonEmptyString(content?.contactCta)
  ) {
    return null;
  }

  const normalizedSections = sections.map((section) => {
    const item = section && typeof section === "object" ? (section as Record<string, unknown>) : null;
    const items = Array.isArray(item?.items) ? item.items : null;
    if (!item || !isNonEmptyString(item.title) || !items || items.length === 0) return null;

    const normalizedItems = items.map((faqItem) => {
      const faq = faqItem && typeof faqItem === "object" ? (faqItem as Record<string, unknown>) : null;
      if (!faq || !isNonEmptyString(faq.question) || !isNonEmptyString(faq.answer)) return null;
      return {
        question: faq.question.trim(),
        answer: faq.answer.trim(),
      };
    });

    if (normalizedItems.some((faq) => !faq)) return null;
    return {
      title: item.title.trim(),
      items: normalizedItems as FAQPageContentPayload["content"]["sections"][number]["items"],
    };
  });

  if (normalizedSections.some((section) => !section)) return null;

  return {
    slug: "faq",
    locale,
    title: body.title.trim(),
    subtitle: body.subtitle.trim(),
    content: {
      sections: normalizedSections as FAQPageContentPayload["content"]["sections"],
      contactTitle: content.contactTitle.trim(),
      contactDescription: content.contactDescription.trim(),
      contactCta: content.contactCta.trim(),
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const slug = resolveSlug(searchParams.get("slug"));
    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Invalid page slug" },
        { status: 400 }
      );
    }

    const locale = resolveLocale(searchParams.get("locale"));
    const messages = await getMessages(locale);
    const data = await getPageContent(slug, locale, messages);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching admin page content:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch page content" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const slug = resolveSlug(searchParams.get("slug"));
    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Invalid page slug" },
        { status: 400 }
      );
    }

    const locale = resolveLocale(searchParams.get("locale"));
    const body = (await request.json()) as Record<string, unknown>;

    const payload: PageContentPayload | null =
      slug === "contact"
        ? validateContactPayload(locale, body)
        : slug === "faq"
          ? validateFAQPayload(locale, body)
          : validateAboutPayload(locale, body);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid page content payload" },
        { status: 400 }
      );
    }

    await prisma.pageContent.upsert({
      where: {
        slug_locale: {
          slug,
          locale,
        },
      },
      update: {
        title: payload.title,
        subtitle: payload.subtitle,
        content: payload.content as unknown as Prisma.InputJsonValue,
      },
      create: {
        slug,
        locale,
        title: payload.title,
        subtitle: payload.subtitle,
        content: payload.content as unknown as Prisma.InputJsonValue,
      },
    });

    const messages = await getMessages(locale);
    const data = await getPageContent(slug, locale, messages);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error updating admin page content:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update page content" },
      { status: 500 }
    );
  }
}
