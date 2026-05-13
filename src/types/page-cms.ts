export type PageSlug = "about" | "contact" | "faq";
export type PageLocale = "fa" | "en" | "ar";

export interface PageCardItem {
  title: string;
  description: string;
  icon: string | null;
}

export interface ContactCardItem {
  title: string;
  value: string;
  icon: string | null;
}

export interface AboutPageContentData {
  historyTitle: string;
  historyParagraphs: [string, string];
  mainStatCard: PageCardItem;
  featureCards: [PageCardItem, PageCardItem, PageCardItem];
}

export interface ContactPageContentData {
  form: {
    title: string;
    fields: {
      firstNameLabel: string;
      firstNamePlaceholder: string;
      lastNameLabel: string;
      lastNamePlaceholder: string;
      emailLabel: string;
      emailPlaceholder: string;
      subjectLabel: string;
      subjectPlaceholder: string;
      messageLabel: string;
      messagePlaceholder: string;
    };
    submitLabel: string;
  };
  contactInfoTitle: string;
  contactCards: [ContactCardItem, ContactCardItem, ContactCardItem];
  workingHours: {
    title: string;
    lines: [string, string, string];
  };
}

export interface FAQItemData {
  question: string;
  answer: string;
}

export interface FAQSectionData {
  title: string;
  items: FAQItemData[];
}

export interface FAQPageContentData {
  sections: FAQSectionData[];
  contactTitle: string;
  contactDescription: string;
  contactCta: string;
}

export interface BasePageContentPayload<TContent> {
  slug: PageSlug;
  locale: PageLocale;
  title: string;
  subtitle: string;
  content: TContent;
}

export type AboutPageContentPayload = BasePageContentPayload<AboutPageContentData>;
export type ContactPageContentPayload = BasePageContentPayload<ContactPageContentData>;
export type FAQPageContentPayload = BasePageContentPayload<FAQPageContentData>;
export type PageContentPayload =
  | AboutPageContentPayload
  | ContactPageContentPayload
  | FAQPageContentPayload;
