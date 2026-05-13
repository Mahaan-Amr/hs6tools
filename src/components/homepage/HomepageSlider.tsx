"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HomepageSlideRecord } from "@/types/homepage";

interface HomepageSliderProps {
  slides: HomepageSlideRecord[];
  placeholderTitle: string;
  placeholderSubtitle: string;
}

export default function HomepageSlider({
  slides,
  placeholderTitle,
  placeholderSubtitle,
}: HomepageSliderProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    if (activeIndex >= slides.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, slides.length]);

  if (slides.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-[2rem] border border-gray-200 bg-gradient-to-br from-orange-100 via-white to-amber-50 px-6 py-16 shadow-xl shadow-orange-100/60 dark:border-white/10 dark:from-gray-900 dark:via-gray-950 dark:to-black dark:shadow-black/20 md:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.18),transparent_35%)]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-primary-orange/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary-orange">
            Homepage Highlights
          </span>
          <h3 className="mt-5 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
            {placeholderTitle}
          </h3>
          <p className="mt-4 text-base leading-8 text-gray-600 dark:text-gray-300 md:text-lg">
            {placeholderSubtitle}
          </p>
        </div>
      </div>
    );
  }

  const activeSlide = slides[activeIndex];

  return (
    <div className="space-y-5">
      <div
        className={`group relative overflow-hidden rounded-[2rem] border border-gray-200 bg-black shadow-2xl shadow-orange-200/20 dark:border-white/10 dark:shadow-black/30 ${
          activeSlide.bannerHref ? "cursor-pointer" : ""
        }`}
        onClick={() => {
          if (activeSlide.bannerHref) router.push(activeSlide.bannerHref);
        }}
        role={activeSlide.bannerHref ? "button" : undefined}
        tabIndex={activeSlide.bannerHref ? 0 : undefined}
        onKeyDown={(event) => {
          if (activeSlide.bannerHref && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            router.push(activeSlide.bannerHref);
          }
        }}
      >
        <div className="relative aspect-[16/8] min-h-[320px] md:min-h-[420px]">
          {activeSlide.mobileImage ? (
            <>
              <div className="absolute inset-0 md:hidden">
                <Image
                  src={activeSlide.mobileImage}
                  alt={activeSlide.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
              <div className="absolute inset-0 hidden md:block">
                <Image
                  src={activeSlide.desktopImage}
                  alt={activeSlide.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
            </>
          ) : (
            <Image
              src={activeSlide.desktopImage}
              alt={activeSlide.title}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          )}

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.82)_0%,rgba(10,10,10,0.6)_42%,rgba(10,10,10,0.3)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.25),transparent_30%)]" />

          <div className="relative z-10 flex h-full items-end p-6 md:p-10">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-orange-200 backdrop-blur-sm">
                Featured Banner
              </span>
              <h3 className="mt-4 text-3xl font-bold leading-tight text-white md:text-5xl">
                {activeSlide.title}
              </h3>
              {activeSlide.subtitle && (
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/80 md:text-lg">
                  {activeSlide.subtitle}
                </p>
              )}
              {activeSlide.buttonLabel && activeSlide.buttonHref && (
                <div className="mt-7">
                  <Link
                    href={activeSlide.buttonHref}
                    onClick={(event) => event.stopPropagation()}
                    className="inline-flex items-center rounded-2xl bg-primary-orange px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                  >
                    {activeSlide.buttonLabel}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
              }}
              className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/55"
              aria-label="Previous slide"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setActiveIndex((current) => (current + 1) % slides.length);
              }}
              className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/55"
              aria-label="Next slide"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === activeIndex ? "w-8 bg-primary-orange" : "w-2.5 bg-gray-300 dark:bg-white/20"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
