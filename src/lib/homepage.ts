import { Category, HomepageContent, HomepageFeaturedCategory, HomepageSlide } from "@prisma/client";
import { defaultLocale, Locale, locales, Messages } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import {
  AdminCategoryOption,
  HomepageCategoryCard,
  HomepageContentRecord,
  HomepageContentResponse,
  HomepageSlideRecord,
} from "@/types/homepage";

type HomepageContentWithRelations = HomepageContent & {
  featuredCategory1: Category | null;
  featuredCategory2: Category | null;
  featuredCategory3: Category | null;
  featuredCategories: Array<HomepageFeaturedCategory & { category: Category | null }>;
};

function getLocalizedCategoryField(
  category: Category | null,
  locale: string,
  field: "name" | "description"
): string {
  if (!category) return "";

  if (field === "name") {
    if (locale === "en") return category.nameEn || category.name;
    if (locale === "ar") return category.nameAr || category.name;
    return category.name;
  }

  if (locale === "en") return category.descriptionEn || category.description || "";
  if (locale === "ar") return category.descriptionAr || category.description || "";
  return category.description || "";
}

function buildDefaultHomepageContent(locale: Locale, messages: Messages): HomepageContentResponse {
  return {
    id: `default-${locale}`,
    locale,
    heroTagline: messages.homepage.hero.tagline,
    heroDescription: messages.homepage.hero.description,
    heroPrimaryCtaLabel: messages.homepage.hero.viewProducts,
    heroPrimaryCtaHref: `/${locale}/shop`,
    heroSecondaryCtaLabel: messages.homepage.hero.aboutUs,
    heroSecondaryCtaHref: `/${locale}/about`,
    categorySectionTitle: messages.homepage.categories.title,
    categorySectionSubtitle: messages.homepage.categories.subtitle,
    categoryViewAllLabel: messages.homepage.categories.viewAllProducts,
    featuredCategory1Id: null,
    featuredCategory2Id: null,
    featuredCategory3Id: null,
    featuredCategory1Title: messages.homepage.categories.diamondDiscs.title,
    featuredCategory1Description: messages.homepage.categories.diamondDiscs.description,
    featuredCategory2Title: messages.homepage.categories.cylindricalCutters.title,
    featuredCategory2Description: messages.homepage.categories.cylindricalCutters.description,
    featuredCategory3Title: messages.homepage.categories.holdingClamps.title,
    featuredCategory3Description: messages.homepage.categories.holdingClamps.description,
    categoryCards: [
      {
        id: "default-1",
        slot: 1,
        categoryId: null,
        title: messages.homepage.categories.diamondDiscs.title,
        description: messages.homepage.categories.diamondDiscs.description,
        slug: null,
        image: null,
        backgroundImage: null,
        sortOrder: 0,
      },
      {
        id: "default-2",
        slot: 2,
        categoryId: null,
        title: messages.homepage.categories.cylindricalCutters.title,
        description: messages.homepage.categories.cylindricalCutters.description,
        slug: null,
        image: null,
        backgroundImage: null,
        sortOrder: 1,
      },
      {
        id: "default-3",
        slot: 3,
        categoryId: null,
        title: messages.homepage.categories.holdingClamps.title,
        description: messages.homepage.categories.holdingClamps.description,
        slug: null,
        image: null,
        backgroundImage: null,
        sortOrder: 2,
      },
    ],
    slides: [],
  };
}

function mapSlide(slide: HomepageSlide): HomepageSlideRecord {
  return {
    id: slide.id,
    locale: slide.locale,
    title: slide.title,
    subtitle: slide.subtitle,
    desktopImage: slide.desktopImage,
    mobileImage: slide.mobileImage,
    bannerHref: slide.bannerHref,
    buttonLabel: slide.buttonLabel,
    buttonHref: slide.buttonHref,
    isActive: slide.isActive,
    sortOrder: slide.sortOrder,
    createdAt: slide.createdAt.toISOString(),
    updatedAt: slide.updatedAt.toISOString(),
  };
}

function mapCategoryCards(content: HomepageContentWithRelations): HomepageCategoryCard[] {
  if (content.featuredCategories.length > 0) {
    return content.featuredCategories
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item, index) => ({
        id: item.id,
        slot: index + 1,
        categoryId: item.categoryId,
        title: item.title || getLocalizedCategoryField(item.category, content.locale, "name"),
        description:
          item.description || getLocalizedCategoryField(item.category, content.locale, "description"),
        slug: item.category?.slug || null,
        image: item.backgroundImage || item.category?.image || null,
        backgroundImage: item.backgroundImage || null,
        sortOrder: item.sortOrder,
      }));
  }

  const slots: Array<{
    slot: 1 | 2 | 3;
    category: Category | null;
    categoryId: string | null;
    title: string | null;
    description: string | null;
  }> = [
    {
      slot: 1,
      category: content.featuredCategory1,
      categoryId: content.featuredCategory1Id,
      title: content.featuredCategory1Title,
      description: content.featuredCategory1Description,
    },
    {
      slot: 2,
      category: content.featuredCategory2,
      categoryId: content.featuredCategory2Id,
      title: content.featuredCategory2Title,
      description: content.featuredCategory2Description,
    },
    {
      slot: 3,
      category: content.featuredCategory3,
      categoryId: content.featuredCategory3Id,
      title: content.featuredCategory3Title,
      description: content.featuredCategory3Description,
    },
  ];

  return slots.map((slot) => ({
    id: `legacy-${slot.slot}`,
    slot: slot.slot,
    categoryId: slot.categoryId,
    title: slot.title || getLocalizedCategoryField(slot.category, content.locale, "name"),
    description:
      slot.description || getLocalizedCategoryField(slot.category, content.locale, "description"),
    slug: slot.category?.slug || null,
    image: slot.category?.image || null,
    backgroundImage: null,
    sortOrder: slot.slot - 1,
  }));
}

function mapHomepageContent(
  content: HomepageContentWithRelations,
  slides: HomepageSlide[]
): HomepageContentResponse {
  return {
    id: content.id,
    locale: content.locale,
    heroTagline: content.heroTagline,
    heroDescription: content.heroDescription,
    heroPrimaryCtaLabel: content.heroPrimaryCtaLabel,
    heroPrimaryCtaHref: content.heroPrimaryCtaHref,
    heroSecondaryCtaLabel: content.heroSecondaryCtaLabel,
    heroSecondaryCtaHref: content.heroSecondaryCtaHref,
    categorySectionTitle: content.categorySectionTitle,
    categorySectionSubtitle: content.categorySectionSubtitle,
    categoryViewAllLabel: content.categoryViewAllLabel,
    featuredCategory1Id: content.featuredCategory1Id,
    featuredCategory2Id: content.featuredCategory2Id,
    featuredCategory3Id: content.featuredCategory3Id,
    featuredCategory1Title: content.featuredCategory1Title,
    featuredCategory1Description: content.featuredCategory1Description,
    featuredCategory2Title: content.featuredCategory2Title,
    featuredCategory2Description: content.featuredCategory2Description,
    featuredCategory3Title: content.featuredCategory3Title,
    featuredCategory3Description: content.featuredCategory3Description,
    categoryCards: mapCategoryCards(content),
    slides: slides.sort((a, b) => a.sortOrder - b.sortOrder).map(mapSlide),
  };
}

export async function getHomepageContent(locale: string, messages: Messages): Promise<HomepageContentResponse> {
  const resolvedLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;

  const [content, slides] = await Promise.all([
    prisma.homepageContent.findUnique({
      where: { locale: resolvedLocale },
      include: {
        featuredCategory1: true,
        featuredCategory2: true,
        featuredCategory3: true,
        featuredCategories: { include: { category: true }, orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.homepageSlide.findMany({
      where: { locale: resolvedLocale, isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  if (!content) {
    return buildDefaultHomepageContent(resolvedLocale, messages);
  }

  const mapped = mapHomepageContent(content, slides);
  const fallback = buildDefaultHomepageContent(resolvedLocale, messages);

  return {
    ...mapped,
    heroTagline: mapped.heroTagline || fallback.heroTagline,
    heroDescription: mapped.heroDescription || fallback.heroDescription,
    heroPrimaryCtaLabel: mapped.heroPrimaryCtaLabel || fallback.heroPrimaryCtaLabel,
    heroPrimaryCtaHref: mapped.heroPrimaryCtaHref || fallback.heroPrimaryCtaHref,
    heroSecondaryCtaLabel: mapped.heroSecondaryCtaLabel || fallback.heroSecondaryCtaLabel,
    heroSecondaryCtaHref: mapped.heroSecondaryCtaHref || fallback.heroSecondaryCtaHref,
    categorySectionTitle: mapped.categorySectionTitle || fallback.categorySectionTitle,
    categorySectionSubtitle: mapped.categorySectionSubtitle || fallback.categorySectionSubtitle,
    categoryViewAllLabel: mapped.categoryViewAllLabel || fallback.categoryViewAllLabel,
    categoryCards: mapped.categoryCards.map((card, index) => ({
      ...card,
      title: card.title || fallback.categoryCards[index]?.title || "",
      description: card.description || fallback.categoryCards[index]?.description || "",
    })),
  };
}

export async function getHomepageContentForAdmin(locale: string, messages: Messages): Promise<HomepageContentResponse> {
  const resolvedLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;

  const [content, slides] = await Promise.all([
    prisma.homepageContent.findUnique({
      where: { locale: resolvedLocale },
      include: {
        featuredCategory1: true,
        featuredCategory2: true,
        featuredCategory3: true,
        featuredCategories: { include: { category: true }, orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.homepageSlide.findMany({
      where: { locale: resolvedLocale },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  if (!content) {
    return buildDefaultHomepageContent(resolvedLocale, messages);
  }

  return mapHomepageContent(content, slides);
}

export async function getHomepageCategoryOptions(): Promise<AdminCategoryOption[]> {
  const categories = await prisma.category.findMany({
    where: { isActive: true, deletedAt: null },
    select: {
      id: true,
      slug: true,
      name: true,
      nameEn: true,
      nameAr: true,
      description: true,
      descriptionEn: true,
      descriptionAr: true,
      image: true,
      isActive: true,
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return categories;
}

export type HomepageContentUpsertInput = Omit<
  HomepageContentRecord,
  "id"
>;
