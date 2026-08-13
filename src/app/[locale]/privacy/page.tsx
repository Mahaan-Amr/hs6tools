import type { Metadata } from "next";
import LegalDocumentPage from "@/components/legal/LegalDocumentPage";
import { getLegalDocument } from "@/lib/legal-content";
import { createPageMetadata } from "@/lib/seo";

interface PrivacyPageProps { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PrivacyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const document = getLegalDocument(locale, "privacy");
  return createPageMetadata({ locale, path: "/privacy", title: document.title, description: document.description });
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  return <LegalDocumentPage locale={locale} document={getLegalDocument(locale, "privacy")} />;
}
