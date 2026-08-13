import { LegalDocument } from "@/lib/legal-content";

export default function LegalDocumentPage({ document, locale }: { document: LegalDocument; locale: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-20 dark:from-primary-black dark:via-gray-900 dark:to-primary-black">
      <article
        className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8"
        dir={locale === "en" ? "ltr" : "rtl"}
      >
        <header className="mb-10 rounded-3xl border border-gray-200 bg-white/80 p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">{document.title}</h1>
          <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">{document.description}</p>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {document.updatedLabel}: {document.updatedAt}
          </p>
        </header>

        <div className="space-y-6">
          {document.sections.map((section) => (
            <section key={section.title} className="rounded-3xl border border-gray-200 bg-white/80 p-7 dark:border-white/10 dark:bg-white/5">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-4 text-base leading-8 text-gray-700 dark:text-gray-300">{paragraph}</p>
              ))}
              {section.items && (
                <ul className="mt-4 list-disc space-y-2 px-6 text-gray-700 marker:text-primary-orange dark:text-gray-300">
                  {section.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
