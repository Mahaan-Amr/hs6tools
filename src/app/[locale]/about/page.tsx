import IconRenderer from "@/components/shared/IconRenderer";
import { getMessages } from "@/lib/i18n";
import { getPageContent } from "@/lib/page-cms";
import { AboutPageContentPayload } from "@/types/page-cms";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const messages = await getMessages(locale);
  const page = (await getPageContent("about", locale, messages)) as AboutPageContentPayload;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-20 dark:from-primary-black dark:via-gray-900 dark:to-primary-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center" data-scroll-reveal>
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
            {page.title}
          </h1>
          <p className="mx-auto max-w-3xl text-justify text-xl leading-relaxed text-gray-600 dark:text-gray-300">
            {page.subtitle}
          </p>
        </div>

        <div className="mb-16 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div data-scroll-reveal>
            <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
              {page.content.historyTitle}
            </h2>
            <p className="mb-6 text-justify text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              {page.content.historyParagraphs[0]}
            </p>
            <p className="text-justify text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              {page.content.historyParagraphs[1]}
            </p>
          </div>

          <div
            className="glass rounded-3xl p-8 text-center"
            data-scroll-reveal
            style={{ transitionDelay: "0.1s" }}
          >
            <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-r from-primary-orange to-orange-500">
              <IconRenderer
                name={page.content.mainStatCard.icon}
                className="h-16 w-16 text-white"
                fallback={
                  <svg className="h-16 w-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
              />
            </div>
            <h3 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
              {page.content.mainStatCard.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">{page.content.mainStatCard.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {page.content.featureCards.map((card, index) => (
            <div
              key={`${card.title}-${index}`}
              className="glass rounded-3xl p-8 text-center"
              data-scroll-reveal
              style={{ transitionDelay: `${0.2 + index * 0.1}s` }}
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-r from-primary-orange to-orange-500">
                <IconRenderer
                  name={card.icon}
                  className="h-10 w-10 text-white"
                  fallback={
                    <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">{card.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
