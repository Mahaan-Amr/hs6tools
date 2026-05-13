import { NextRequest, NextResponse } from "next/server";
import { getMessages, Locale, defaultLocale, locales } from "@/lib/i18n";
import { getHomepageCategoryOptions, getHomepageContentForAdmin } from "@/lib/homepage";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authz";
import { HomepageContentUpdatePayload } from "@/types/homepage";

function resolveLocale(value: string | null): Locale {
  return locales.includes(value as Locale) ? (value as Locale) : defaultLocale;
}

function normalizeOptionalText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const locale = resolveLocale(searchParams.get("locale"));
    const messages = await getMessages(locale);
    const [content, categories] = await Promise.all([
      getHomepageContentForAdmin(locale, messages),
      getHomepageCategoryOptions(),
    ]);

    return NextResponse.json({
      success: true,
      data: content,
      categories,
    });
  } catch (error) {
    console.error("Error fetching homepage admin content:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch homepage content" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const locale = resolveLocale(body.locale);

    const payload: HomepageContentUpdatePayload = {
      heroTagline: String(body.heroTagline || "").trim(),
      heroDescription: String(body.heroDescription || "").trim(),
      heroPrimaryCtaLabel: String(body.heroPrimaryCtaLabel || "").trim(),
      heroPrimaryCtaHref: String(body.heroPrimaryCtaHref || "").trim(),
      heroSecondaryCtaLabel: String(body.heroSecondaryCtaLabel || "").trim(),
      heroSecondaryCtaHref: String(body.heroSecondaryCtaHref || "").trim(),
      categorySectionTitle: String(body.categorySectionTitle || "").trim(),
      categorySectionSubtitle: String(body.categorySectionSubtitle || "").trim(),
      categoryViewAllLabel: String(body.categoryViewAllLabel || "").trim(),
      featuredCategory1Id: body.featuredCategory1Id || null,
      featuredCategory2Id: body.featuredCategory2Id || null,
      featuredCategory3Id: body.featuredCategory3Id || null,
      featuredCategory1Title: normalizeOptionalText(body.featuredCategory1Title),
      featuredCategory1Description: normalizeOptionalText(body.featuredCategory1Description),
      featuredCategory2Title: normalizeOptionalText(body.featuredCategory2Title),
      featuredCategory2Description: normalizeOptionalText(body.featuredCategory2Description),
      featuredCategory3Title: normalizeOptionalText(body.featuredCategory3Title),
      featuredCategory3Description: normalizeOptionalText(body.featuredCategory3Description),
      featuredCategories: Array.isArray(body.featuredCategories)
        ? body.featuredCategories.map((item: Record<string, unknown>, index: number) => ({
            categoryId: typeof item.categoryId === "string" && item.categoryId ? item.categoryId : null,
            title: normalizeOptionalText(item.title),
            description: normalizeOptionalText(item.description),
            backgroundImage: normalizeOptionalText(item.backgroundImage),
            sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : index,
          }))
        : [],
      locale,
    };

    if (
      !payload.heroTagline ||
      !payload.heroDescription ||
      !payload.heroPrimaryCtaLabel ||
      !payload.heroPrimaryCtaHref ||
      !payload.heroSecondaryCtaLabel ||
      !payload.heroSecondaryCtaHref ||
      !payload.categorySectionTitle ||
      !payload.categorySectionSubtitle ||
      !payload.categoryViewAllLabel
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required homepage fields" },
        { status: 400 }
      );
    }

    const dynamicCategoryIds = payload.featuredCategories
      .map((category) => category.categoryId)
      .filter(Boolean);
    const duplicateCategoryIds = dynamicCategoryIds.length > 0
      ? dynamicCategoryIds
      : [
          payload.featuredCategory1Id,
          payload.featuredCategory2Id,
          payload.featuredCategory3Id,
        ].filter(Boolean);

    if (new Set(duplicateCategoryIds).size !== duplicateCategoryIds.length) {
      return NextResponse.json(
        { success: false, error: "Featured categories must be unique" },
        { status: 400 }
      );
    }

    const { featuredCategories, ...contentPayload } = payload;

    const content = await prisma.homepageContent.upsert({
      where: { locale },
      update: {
        ...contentPayload,
        featuredCategory1Id: featuredCategories[0]?.categoryId || contentPayload.featuredCategory1Id,
        featuredCategory2Id: featuredCategories[1]?.categoryId || contentPayload.featuredCategory2Id,
        featuredCategory3Id: featuredCategories[2]?.categoryId || contentPayload.featuredCategory3Id,
        featuredCategory1Title: featuredCategories[0]?.title || contentPayload.featuredCategory1Title,
        featuredCategory1Description: featuredCategories[0]?.description || contentPayload.featuredCategory1Description,
        featuredCategory2Title: featuredCategories[1]?.title || contentPayload.featuredCategory2Title,
        featuredCategory2Description: featuredCategories[1]?.description || contentPayload.featuredCategory2Description,
        featuredCategory3Title: featuredCategories[2]?.title || contentPayload.featuredCategory3Title,
        featuredCategory3Description: featuredCategories[2]?.description || contentPayload.featuredCategory3Description,
      },
      create: {
        ...contentPayload,
        featuredCategory1Id: featuredCategories[0]?.categoryId || contentPayload.featuredCategory1Id,
        featuredCategory2Id: featuredCategories[1]?.categoryId || contentPayload.featuredCategory2Id,
        featuredCategory3Id: featuredCategories[2]?.categoryId || contentPayload.featuredCategory3Id,
        featuredCategory1Title: featuredCategories[0]?.title || contentPayload.featuredCategory1Title,
        featuredCategory1Description: featuredCategories[0]?.description || contentPayload.featuredCategory1Description,
        featuredCategory2Title: featuredCategories[1]?.title || contentPayload.featuredCategory2Title,
        featuredCategory2Description: featuredCategories[1]?.description || contentPayload.featuredCategory2Description,
        featuredCategory3Title: featuredCategories[2]?.title || contentPayload.featuredCategory3Title,
        featuredCategory3Description: featuredCategories[2]?.description || contentPayload.featuredCategory3Description,
      },
    });

    if (featuredCategories.length > 0) {
      await prisma.$transaction([
        prisma.homepageFeaturedCategory.deleteMany({
          where: { homepageContentId: content.id },
        }),
        prisma.homepageFeaturedCategory.createMany({
          data: featuredCategories.map((category, index) => ({
            homepageContentId: content.id,
            categoryId: category.categoryId,
            title: category.title,
            description: category.description,
            backgroundImage: category.backgroundImage,
            sortOrder: index,
          })),
        }),
      ]);
    }

    await prisma.homepageSlide.updateMany({
      where: { locale, homepageContentId: null },
      data: { homepageContentId: content.id },
    });

    return NextResponse.json({ success: true, data: content });
  } catch (error) {
    console.error("Error updating homepage content:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update homepage content" },
      { status: 500 }
    );
  }
}
