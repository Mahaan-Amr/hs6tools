import Link from "next/link";
import { getMessages } from "@/lib/i18n";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  
  // Get messages for the current locale
  try {
    const t = await getMessages(locale);
    
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-16">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* bottom fade into next section */}
          <div className="pointer-events-none absolute bottom-0 inset-x-0 h-40 bg-gradient-to-b from-transparent to-gray-50/70 dark:to-black/70" />

          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-orange/20 rounded-full blur-3xl animate-pulse animate-float-soft" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-orange/10 rounded-full blur-3xl animate-pulse delay-1000 animate-float-soft-delayed" />
          
          {/* Hero Content */}
          <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
            {/* Logo/Brand */}
            <div className="mb-8">
              <div className="flex flex-col items-center mb-4 animate-fade-in">
                <img
                  src="/logo.svg"
                  alt="HS6Tools"
                  width={960}
                  height={960}
                  className="w-[640px] h-[640px] md:w-[896px] md:h-[896px] lg:w-[1024px] lg:h-[1024px] object-contain mb-6"
                />
                <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-orange via-orange-400 to-yellow-400">
                  HS6Tools
                </h1>
              </div>
              <div className="w-24 h-1 bg-gradient-to-r from-primary-orange to-yellow-400 mx-auto rounded-full" />
            </div>
            
            {/* Main Tagline */}
            <h2 className="text-2xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6 animate-slide-up" data-scroll-reveal>
              {t.homepage.hero.tagline}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto text-justify leading-relaxed animate-slide-up delay-200" data-scroll-reveal style={{ transitionDelay: "0.1s" }}>
              {t.homepage.hero.description}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up delay-300" data-scroll-reveal style={{ transitionDelay: "0.2s" }}>
              <Link 
                href={`/${locale}/shop`}
                className="px-8 py-4 bg-gradient-to-r from-primary-orange to-orange-500 text-white font-semibold rounded-2xl shadow-glass-orange hover:shadow-2xl transition-all duration-300 hover:scale-105 transform"
              >
                {t.homepage.hero.viewProducts}
              </Link>
              <Link 
                href={`/${locale}/about`}
                className="px-8 py-4 glass text-gray-900 dark:text-white font-semibold rounded-2xl border border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300"
              >
                {t.homepage.hero.aboutUs}
              </Link>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-gentle">
            <div className="w-6 h-10 border-2 border-gray-400 dark:border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-gray-600 dark:bg-white/60 rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative z-10 -mt-12 rounded-t-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-white/10 py-24 px-4 shadow-2xl shadow-gray-200/50 dark:shadow-black/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16" data-scroll-reveal>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {t.homepage.features.title}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-justify leading-relaxed">
                {t.homepage.features.subtitle}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="glass rounded-3xl p-8 text-center hover:scale-105 transition-transform duration-300" data-scroll-reveal style={{ transitionDelay: "0.05s" }}>
                <div className="w-16 h-16 bg-gradient-to-r from-primary-orange to-orange-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t.homepage.features.quality.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{t.homepage.features.quality.description}</p>
              </div>
              
              {/* Feature 2 */}
              <div className="glass rounded-3xl p-8 text-center hover:scale-105 transition-transform duration-300" data-scroll-reveal style={{ transitionDelay: "0.15s" }}>
                <div className="w-16 h-16 bg-gradient-to-r from-primary-orange to-primary-orange-dark rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t.homepage.features.technology.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{t.homepage.features.technology.description}</p>
              </div>
              
              {/* Feature 3 */}
              <div className="glass rounded-3xl p-8 text-center hover:scale-105 transition-transform duration-300" data-scroll-reveal style={{ transitionDelay: "0.25s" }}>
                <div className="w-16 h-16 bg-gradient-to-r from-primary-orange to-primary-orange-dark rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t.homepage.features.support.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{t.homepage.features.support.description}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Product Categories Preview */}
        <section className="py-24 px-4 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16" data-scroll-reveal>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {t.homepage.categories.title}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-justify leading-relaxed">
                {t.homepage.categories.subtitle}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Category 1 */}
              <div className="group relative overflow-hidden rounded-3xl glass hover:scale-105 transition-all duration-300" data-scroll-reveal style={{ transitionDelay: "0.05s" }}>
                <div className="aspect-square bg-gradient-to-br from-primary-orange/15 to-primary-orange/25 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-primary-orange to-primary-orange-dark rounded-2xl mx-auto mb-4 flex items-center justify-center ring-2 ring-gray-300 dark:ring-white/30 shadow-glass-orange group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t.homepage.categories.diamondDiscs.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{t.homepage.categories.diamondDiscs.description}</p>
                  </div>
                </div>
              </div>
              
              {/* Category 2 */}
              <div className="group relative overflow-hidden rounded-3xl glass hover:scale-105 transition-all duration-300" data-scroll-reveal style={{ transitionDelay: "0.15s" }}>
                <div className="aspect-square bg-gradient-to-br from-primary-orange/15 to-primary-orange/25 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-primary-orange to-primary-orange-dark rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t.homepage.categories.cylindricalCutters.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{t.homepage.categories.cylindricalCutters.description}</p>
                  </div>
                </div>
              </div>
              
              {/* Category 3 */}
              <div className="group relative overflow-hidden rounded-3xl glass hover:scale-105 transition-all duration-300" data-scroll-reveal style={{ transitionDelay: "0.25s" }}>
                <div className="aspect-square bg-gradient-to-br from-primary-orange/15 to-primary-orange/25 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-primary-orange to-primary-orange-dark rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t.homepage.categories.holdingClamps.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{t.homepage.categories.holdingClamps.description}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-12" data-scroll-reveal style={{ transitionDelay: "0.35s" }}>
              <Link 
                href={`/${locale}/shop`}
                className="inline-flex items-center px-8 py-4 glass text-gray-900 dark:text-white font-semibold rounded-2xl border border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300 group"
              >
                {t.homepage.categories.viewAllProducts}
                <svg className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  } catch (error) {
    console.error('Failed to load messages:', error);
    // Fallback to default content
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-16">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-gray-900 dark:text-white">
            <h1 className="text-4xl font-bold mb-4">HS6Tools</h1>
            <p className="text-xl">Loading...</p>
          </div>
        </div>
      </main>
    );
  }
}
