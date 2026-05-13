import IconRenderer from "@/components/shared/IconRenderer";
import { getMessages } from "@/lib/i18n";
import { getPageContent } from "@/lib/page-cms";
import { ContactPageContentPayload } from "@/types/page-cms";
import ContactTicketForm from "@/components/support/ContactTicketForm";

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  const messages = await getMessages(locale);
  const page = (await getPageContent("contact", locale, messages)) as ContactPageContentPayload;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-20 dark:from-primary-black dark:via-gray-900 dark:to-primary-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center" data-scroll-reveal>
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
            {page.title}
          </h1>
          <p className="mx-auto max-w-2xl text-justify text-xl leading-relaxed text-gray-600 dark:text-gray-300">
            {page.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="glass rounded-3xl p-8" data-scroll-reveal>
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              {page.content.form.title}
            </h2>
            <ContactTicketForm locale={locale} form={page.content.form} />
          </div>

          <div className="space-y-8">
            <div className="glass rounded-3xl p-8" data-scroll-reveal style={{ transitionDelay: "0.1s" }}>
              <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                {page.content.contactInfoTitle}
              </h2>
              <div className="space-y-4">
                {page.content.contactCards.map((card, index) => (
                  <div key={`${card.title}-${index}`} className="flex items-center gap-4 gap-x-6">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-primary-orange to-orange-500 shadow-lg shadow-primary-orange/20">
                      <IconRenderer
                        name={card.icon}
                        className="h-6 w-6 text-white"
                        fallback={
                          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{card.title}</h3>
                      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 md:text-base">
                        {card.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-3xl p-8" data-scroll-reveal style={{ transitionDelay: "0.2s" }}>
              <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                {page.content.workingHours.title}
              </h2>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                {page.content.workingHours.lines.map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
