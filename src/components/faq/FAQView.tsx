import Link from "next/link";
import type { FAQContent } from "@/app/[locale]/faq/content";

interface FAQViewProps {
  locale: string;
  content: FAQContent;
}

export default function FAQView({ locale, content }: FAQViewProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-orange-50/40 to-white dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-24">
      {/* Floating background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float-soft absolute -top-24 -left-24 h-64 w-64 rounded-full bg-gradient-to-br from-primary-orange/40 to-orange-500/10 blur-3xl" />
        <div className="animate-float-soft animate-float-soft-delayed absolute -bottom-20 -right-24 h-72 w-72 rounded-full bg-gradient-to-tr from-orange-500/20 to-primary-orange/40 blur-3xl" />
        <div className="animate-float-soft-alt absolute top-1/3 right-12 hidden h-32 w-32 rounded-2xl border border-orange-400/30 bg-orange-500/10 backdrop-blur-lg md:block" />
        <div className="animate-float-soft-alt absolute bottom-1/3 left-16 hidden h-28 w-28 rounded-full border border-orange-400/30 bg-orange-500/10 backdrop-blur-lg md:block" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
        {/* Hero */}
        <section
          className="faq-hero glass-light relative overflow-hidden rounded-4xl border border-orange-400/20 bg-white/80 px-6 py-16 text-center shadow-[0_25px_60px_-30px_rgba(255,107,53,0.45)] dark:border-white/10 dark:bg-gray-900/80 md:px-12 md:py-20"
          data-scroll-reveal
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-orange/20 via-transparent to-orange-500/10 opacity-60" />
          <div className="animate-float-soft absolute -top-12 right-10 hidden h-28 w-28 rounded-full bg-gradient-to-br from-white/60 to-orange-200/40 blur-xl md:block" />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/40 bg-white/70 px-4 py-2 text-sm font-semibold text-primary-orange dark:border-white/20 dark:bg-white/10 dark:text-orange-200">
              <span className="accent-dot" />
              HS6Tools Support Knowledge Base
            </span>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white md:text-5xl">
              {content.title}
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 text-justify leading-relaxed">
              {content.subtitle}
            </p>
            <div className="grid w-full gap-4 md:grid-cols-3">
              {[
                {
                  label: "پوشش کامل",
                  value: "۳ بخش اصلی",
                },
                {
                  label: "پاسخ‌های به‌روز",
                  value: "۱۲ ماه ضمانت",
                },
                {
                  label: "پشتیبانی سریع",
                  value: "پاسخ زیر ۲۴ ساعت",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="floating-stat-card rounded-2xl border border-orange-200/60 bg-white/80 px-4 py-5 text-center shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-gray-800/80"
                  data-scroll-reveal
                >
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-primary-orange dark:text-orange-300">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Sections */}
        <div className="mt-16 space-y-16">
          {content.sections.map((section, sectionIndex) => (
            <section
              key={section.title}
              className="rounded-4xl border border-gray-200/60 bg-white/90 p-8 shadow-[0_20px_50px_-35px_rgba(17,24,39,0.4)] backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/80"
              data-scroll-reveal
              style={{ transitionDelay: `${sectionIndex * 0.1}s` }}
            >
              <header className="mb-10 flex flex-col gap-4 border-b border-gray-200/60 pb-6 dark:border-white/10 md:flex-row md:items-center md:justify-between">
                <div>
                  <span className="inline-flex items-center justify-center rounded-full bg-primary-orange/15 px-4 py-1 text-sm font-medium text-primary-orange dark:bg-orange-500/10 dark:text-orange-200">
                    {String(sectionIndex + 1).padStart(2, "0")}
                  </span>
                  <h2 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
                    {section.title}
                  </h2>
                </div>
                <div className="max-w-lg text-right text-sm text-gray-500 dark:text-gray-400">
                  {locale === "fa"
                    ? "تمام پرسش‌های این بخش با تجربه کاربران واقعی به‌روزرسانی شده‌اند."
                    : locale === "ar"
                    ? "تم تحديث هذه الإجابات بناءً على تجارب العملاء الفعلية."
                    : "Answers in this block reflect real customer conversations and the latest product updates."}
                </div>
              </header>

              <div className="space-y-6">
                {section.items.map((item, itemIndex) => (
                  <article
                    key={item.question}
                    className="group relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white/90 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-gray-900/70"
                    data-scroll-reveal
                    style={{ transitionDelay: `${sectionIndex * 0.1 + itemIndex * 0.07}s` }}
                  >
                    <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-primary-orange/0 via-primary-orange/40 to-primary-orange/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <h3 className="text-lg font-semibold text-primary-orange dark:text-orange-300">
                      {item.question}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-gray-700 dark:text-gray-300">
                      {item.answer}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <section
          className="mt-20 overflow-hidden rounded-4xl border border-orange-300/40 bg-gradient-to-br from-primary-orange to-orange-500 p-12 text-center text-white shadow-[0_30px_60px_-40px_rgba(255,107,53,0.65)]"
          data-scroll-reveal
          style={{ transitionDelay: "0.35s" }}
        >
          <div className="animate-float-soft absolute -top-8 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full bg-white/30 blur-2xl" />
          <div className="relative mx-auto max-w-3xl space-y-6">
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">
              {content.contactTitle}
            </h2>
            <p className="text-base leading-relaxed text-orange-50/90 md:text-lg">
              {content.contactDescription}
            </p>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 rounded-full bg-white/95 px-7 py-3 text-base font-semibold text-primary-orange shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-white"
            >
              <span className="accent-dot-alt" />
              {content.contactCta}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

