import type { Metadata } from "next";
import LegalDocumentPage from "@/components/legal/LegalDocumentPage";
import { getLegalDocument } from "@/lib/legal-content";
import { createPageMetadata } from "@/lib/seo";

interface TermsPageProps { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: TermsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const document = getLegalDocument(locale, "terms");
  return createPageMetadata({ locale, path: "/terms", title: document.title, description: document.description });
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;
  return <LegalDocumentPage locale={locale} document={getLegalDocument(locale, "terms")} />;
}
