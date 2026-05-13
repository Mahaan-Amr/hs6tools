export interface HomepageCategoryCard {
  id: string;
  slot: number;
  categoryId: string | null;
  title: string;
  description: string;
  slug: string | null;
  image: string | null;
  backgroundImage: string | null;
  sortOrder: number;
}

export interface HomepageContentRecord {
  id: string;
  locale: string;
  heroTagline: string;
  heroDescription: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaHref: string;
  categorySectionTitle: string;
  categorySectionSubtitle: string;
  categoryViewAllLabel: string;
  featuredCategory1Id: string | null;
  featuredCategory2Id: string | null;
  featuredCategory3Id: string | null;
  featuredCategory1Title: string | null;
  featuredCategory1Description: string | null;
  featuredCategory2Title: string | null;
  featuredCategory2Description: string | null;
  featuredCategory3Title: string | null;
  featuredCategory3Description: string | null;
}

export interface HomepageSlideRecord {
  id: string;
  locale: string;
  title: string;
  subtitle: string | null;
  desktopImage: string;
  mobileImage: string | null;
  bannerHref: string | null;
  buttonLabel: string | null;
  buttonHref: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface HomepageContentUpdatePayload {
  locale: string;
  heroTagline: string;
  heroDescription: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaHref: string;
  categorySectionTitle: string;
  categorySectionSubtitle: string;
  categoryViewAllLabel: string;
  featuredCategory1Id: string | null;
  featuredCategory2Id: string | null;
  featuredCategory3Id: string | null;
  featuredCategory1Title: string | null;
  featuredCategory1Description: string | null;
  featuredCategory2Title: string | null;
  featuredCategory2Description: string | null;
  featuredCategory3Title: string | null;
  featuredCategory3Description: string | null;
  featuredCategories: HomepageCategoryCardInput[];
}

export interface HomepageSlideInput {
  locale: string;
  title: string;
  subtitle: string | null;
  desktopImage: string;
  mobileImage: string | null;
  bannerHref: string | null;
  buttonLabel: string | null;
  buttonHref: string | null;
  isActive: boolean;
  sortOrder?: number;
}

export interface HomepageCategoryCardInput {
  id?: string;
  categoryId: string | null;
  title: string | null;
  description: string | null;
  backgroundImage: string | null;
  sortOrder: number;
}

export interface HomepageContentResponse extends HomepageContentRecord {
  categoryCards: HomepageCategoryCard[];
  slides: HomepageSlideRecord[];
}

export interface AdminCategoryOption {
  id: string;
  slug: string;
  name: string;
  nameEn: string | null;
  nameAr: string | null;
  description: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  image: string | null;
  isActive: boolean;
}
