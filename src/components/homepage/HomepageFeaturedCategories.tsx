"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HomepageCategoryCard } from "@/types/homepage";

interface HomepageFeaturedCategoriesProps {
  locale: string;
  cards: HomepageCategoryCard[];
}

function CategoryCard({ locale, card }: { locale: string; card: HomepageCategoryCard }) {
  const content = (
    <div className="group relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white/80 shadow-lg shadow-orange-100/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-200/40 dark:border-white/10 dark:bg-white/5 dark:shadow-black/20">
      <div className="relative aspect-[4/4.6] overflow-hidden">
        {card.image ? (
          <>
            <Image
              src={card.image}
              alt={card.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,15,15,0.08)_0%,rgba(15,15,15,0.72)_100%)]" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(249,115,22,0.18),rgba(245,158,11,0.22))]" />
        )}

        <div className="absolute inset-x-0 bottom-0 p-6">
          <h3 className="text-xl font-semibold text-white md:text-2xl">{card.title}</h3>
          {card.description && (
            <p className="mt-2 text-sm leading-7 text-white/80 md:text-base">{card.description}</p>
          )}
        </div>
      </div>
    </div>
  );

  if (!card.slug) return content;
  return <Link href={`/${locale}/categories/${card.slug}`}>{content}</Link>;
}

export default function HomepageFeaturedCategories({ locale, cards }: HomepageFeaturedCategoriesProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldSlide = cards.length > 3;

  useEffect(() => {
    if (!shouldSlide) return;
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % cards.length);
    }, 4500);
    return () => window.clearInterval(interval);
  }, [cards.length, shouldSlide]);

  if (!shouldSlide) {
    return (
      <div className={`grid grid-cols-1 gap-8 ${cards.length === 1 ? "lg:grid-cols-1" : cards.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"}`}>
        {cards.map((card) => (
          <CategoryCard key={card.id} locale={locale} card={card} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-hidden">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {cards.map((card) => (
            <div key={card.id} className="w-full shrink-0 px-1">
              <CategoryCard locale={locale} card={card} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        {cards.map((card, index) => (
          <button
            key={card.id}
            type="button"
            aria-label={`Go to category ${index + 1}`}
            onClick={() => setActiveIndex(index)}
            className={`h-2.5 rounded-full transition-all ${
              index === activeIndex ? "w-8 bg-primary-orange" : "w-2.5 bg-gray-300 dark:bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
