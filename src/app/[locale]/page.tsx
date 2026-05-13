import Link from "next/link";
import { getMessages } from "@/lib/i18n";
import { getHomepageContent } from "@/lib/homepage";
import HomepageSlider from "@/components/homepage/HomepageSlider";
import HomepageFeaturedCategories from "@/components/homepage/HomepageFeaturedCategories";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  try {
    const messages = await getMessages(locale);
    const homepage = await getHomepageContent(locale, messages);

    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-16 dark:from-primary-black dark:via-gray-900 dark:to-primary-black">
        <section className="relative min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_35%)]" />
          <div className="pointer-events-none absolute bottom-0 inset-x-0 h-40 bg-gradient-to-b from-transparent to-gray-50/70 dark:to-black/70" />

          <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 text-center">
            <div className="relative z-10">
              <div className="mb-8">
                <div className="mb-4 flex flex-col items-center animate-fade-in">
                  <img
                    src="/logo.svg"
                    alt="HS6Tools"
                    width={240}
                    height={240}
                    className="mb-6 h-40 w-40 object-contain md:h-56 md:w-56 lg:h-64 lg:w-64"
                  />
                  <h1 className="bg-gradient-to-r from-primary-orange via-orange-400 to-yellow-400 bg-clip-text text-6xl font-bold text-transparent md:text-8xl">
                    HS6Tools
                  </h1>
                </div>
                <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-primary-orange to-yellow-400" />
              </div>

              <h2 className="animate-slide-up text-2xl font-semibold text-gray-900 dark:text-white md:text-4xl" data-scroll-reveal>
                {homepage.heroTagline}
              </h2>
              <p
                className="mx-auto mb-8 mt-6 max-w-3xl animate-slide-up text-lg leading-relaxed text-gray-600 dark:text-gray-300 md:text-xl"
                data-scroll-reveal
                style={{ transitionDelay: "0.1s" }}
              >
                {homepage.heroDescription}
              </p>

              <div
                className="animate-slide-up flex flex-col items-center justify-center gap-4 sm:flex-row"
                data-scroll-reveal
                style={{ transitionDelay: "0.2s" }}
              >
                <Link
                  href={homepage.heroPrimaryCtaHref}
                  className="rounded-2xl bg-gradient-to-r from-primary-orange to-orange-500 px-8 py-4 font-semibold text-white shadow-glass-orange transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  {homepage.heroPrimaryCtaLabel}
                </Link>
                <Link
                  href={homepage.heroSecondaryCtaHref}
                  className="glass rounded-2xl border border-gray-300 px-8 py-4 font-semibold text-gray-900 transition-all duration-300 hover:bg-gray-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
                >
                  {homepage.heroSecondaryCtaLabel}
                </Link>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-gentle">
            <div className="flex h-10 w-6 justify-center rounded-full border-2 border-gray-400 dark:border-white/30">
              <div className="mt-2 h-3 w-1 animate-pulse rounded-full bg-gray-600 dark:bg-white/60" />
            </div>
          </div>
        </section>

        <section className="relative z-10 -mt-12 rounded-t-3xl border-t border-gray-200 bg-white/85 px-4 py-24 shadow-2xl shadow-gray-200/50 backdrop-blur-sm dark:border-white/10 dark:bg-gray-900/80 dark:shadow-black/30">
          <div className="mx-auto max-w-6xl">
            <HomepageSlider
              slides={homepage.slides}
              placeholderTitle={messages.homepage.features.title}
              placeholderSubtitle={messages.homepage.features.subtitle}
            />
          </div>
        </section>

        <section className="bg-gradient-to-t from-gray-50 to-transparent px-4 py-24 dark:from-gray-900">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center" data-scroll-reveal>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
                {homepage.categorySectionTitle}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-300 md:text-xl">
                {homepage.categorySectionSubtitle}
              </p>
            </div>

            <HomepageFeaturedCategories locale={locale} cards={homepage.categoryCards} />

            <div className="mt-12 text-center" data-scroll-reveal style={{ transitionDelay: "0.3s" }}>
              <Link
                href={`/${locale}/shop`}
                className="inline-flex items-center rounded-2xl border border-gray-300 px-8 py-4 font-semibold text-gray-900 transition-all duration-300 hover:bg-gray-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
              >
                {homepage.categoryViewAllLabel}
                <svg className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  } catch (error) {
    console.error("Failed to load homepage:", error);

    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-16 dark:from-primary-black dark:via-gray-900 dark:to-primary-black">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center text-gray-900 dark:text-white">
            <h1 className="mb-4 text-4xl font-bold">HS6Tools</h1>
            <p className="text-xl">Loading...</p>
          </div>
        </div>
      </main>
    );
  }
}
