"use client";

import { useEffect, useState } from "react";
import IconPicker from "@/components/admin/common/IconPicker";
import { AboutPageContentPayload, PageLocale } from "@/types/page-cms";

interface AboutPageTabProps {
  locale: string;
}

const supportedLocales: PageLocale[] = ["fa", "en", "ar"];

const emptyState = (locale: string): AboutPageContentPayload => ({
  slug: "about",
  locale: locale as PageLocale,
  title: "",
  subtitle: "",
  content: {
    historyTitle: "",
    historyParagraphs: ["", ""],
    mainStatCard: { title: "", description: "", icon: null },
    featureCards: [
      { title: "", description: "", icon: null },
      { title: "", description: "", icon: null },
      { title: "", description: "", icon: null },
    ],
  },
});

export default function AboutPageTab({ locale }: AboutPageTabProps) {
  const [selectedLocale, setSelectedLocale] = useState<PageLocale>((locale as PageLocale) || "fa");
  const [data, setData] = useState<AboutPageContentPayload>(emptyState(locale || "fa"));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setSelectedLocale((locale as PageLocale) || "fa");
  }, [locale]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const response = await fetch(`/api/admin/pages?slug=about&locale=${selectedLocale}`, {
          cache: "no-store",
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "دریافت محتوای صفحه درباره ما ناموفق بود.");
        }

        setData(result.data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "خطا در دریافت محتوا");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedLocale]);

  const saveData = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/pages?slug=about&locale=${selectedLocale}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "ذخیره محتوای صفحه درباره ما ناموفق بود.");
      }

      setData(result.data);
      setSuccess(`محتوای درباره ما برای زبان ${selectedLocale.toUpperCase()} ذخیره شد.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "خطا در ذخیره محتوا");
    } finally {
      setIsSaving(false);
    }
  };

  const setFeatureCard = (
    index: 0 | 1 | 2,
    field: "title" | "description" | "icon",
    value: string | null
  ) => {
    setData((current) => ({
      ...current,
      content: {
        ...current.content,
        featureCards: current.content.featureCards.map((card, cardIndex) =>
          cardIndex === index ? { ...card, [field]: value } : card
        ) as AboutPageContentPayload["content"]["featureCards"],
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-orange border-t-transparent" />
          <p className="text-white">در حال بارگذاری محتوای درباره ما...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">مدیریت صفحه درباره ما</h2>
          <p className="mt-2 text-sm text-gray-300">
            متن‌ها و کارت‌های صفحه درباره ما را برای هر زبان مدیریت کنید.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {supportedLocales.map((localeOption) => (
            <button
              key={localeOption}
              type="button"
              onClick={() => setSelectedLocale(localeOption)}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                selectedLocale === localeOption
                  ? "bg-primary-orange text-white"
                  : "border border-white/20 text-gray-200 hover:bg-white/10"
              }`}
            >
              {localeOption.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/15 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100">
          {success}
        </div>
      )}

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h3 className="mb-6 text-xl font-semibold text-white">اطلاعات اصلی</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-white">عنوان صفحه</label>
            <input
              value={data.title}
              onChange={(event) => setData((current) => ({ ...current, title: event.target.value }))}
              className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-primary-orange"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-white">عنوان بخش تاریخچه</label>
            <input
              value={data.content.historyTitle}
              onChange={(event) =>
                setData((current) => ({
                  ...current,
                  content: { ...current.content, historyTitle: event.target.value },
                }))
              }
              className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-primary-orange"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-white">زیرعنوان صفحه</label>
          <textarea
            rows={3}
            value={data.subtitle}
            onChange={(event) => setData((current) => ({ ...current, subtitle: event.target.value }))}
            className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-primary-orange"
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {[0, 1].map((index) => (
            <div key={index}>
              <label className="mb-2 block text-sm font-medium text-white">
                پاراگراف {index + 1}
              </label>
              <textarea
                rows={6}
                value={data.content.historyParagraphs[index]}
                onChange={(event) =>
                  setData((current) => ({
                    ...current,
                    content: {
                      ...current.content,
                      historyParagraphs: current.content.historyParagraphs.map((item, itemIndex) =>
                        itemIndex === index ? event.target.value : item
                      ) as [string, string],
                    },
                  }))
                }
                className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-primary-orange"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h3 className="mb-6 text-xl font-semibold text-white">کارت آمار اصلی</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-white">عنوان کارت</label>
            <input
              value={data.content.mainStatCard.title}
              onChange={(event) =>
                setData((current) => ({
                  ...current,
                  content: {
                    ...current.content,
                    mainStatCard: { ...current.content.mainStatCard, title: event.target.value },
                  },
                }))
              }
              className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-primary-orange"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-white">توضیح کارت</label>
            <input
              value={data.content.mainStatCard.description}
              onChange={(event) =>
                setData((current) => ({
                  ...current,
                  content: {
                    ...current.content,
                    mainStatCard: {
                      ...current.content.mainStatCard,
                      description: event.target.value,
                    },
                  },
                }))
              }
              className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-primary-orange"
            />
          </div>
        </div>

        <div className="mt-4">
          <IconPicker
            value={data.content.mainStatCard.icon}
            onChange={(icon) =>
              setData((current) => ({
                ...current,
                content: {
                  ...current.content,
                  mainStatCard: { ...current.content.mainStatCard, icon },
                },
              }))
            }
            label="آیکون کارت اصلی"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h3 className="mb-6 text-xl font-semibold text-white">کارت‌های ویژگی</h3>
        <div className="space-y-6">
          {data.content.featureCards.map((card, index) => (
            <div key={index} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <h4 className="mb-4 text-sm font-semibold text-white">کارت ویژگی {index + 1}</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">عنوان</label>
                  <input
                    value={card.title}
                    onChange={(event) => setFeatureCard(index as 0 | 1 | 2, "title", event.target.value)}
                    className="w-full rounded-2xl border border-white/15 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-primary-orange"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">توضیح</label>
                  <input
                    value={card.description}
                    onChange={(event) =>
                      setFeatureCard(index as 0 | 1 | 2, "description", event.target.value)
                    }
                    className="w-full rounded-2xl border border-white/15 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-primary-orange"
                  />
                </div>
              </div>

              <div className="mt-4">
                <IconPicker
                  value={card.icon}
                  onChange={(icon) => setFeatureCard(index as 0 | 1 | 2, "icon", icon)}
                  label={`آیکون کارت ویژگی ${index + 1}`}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={saveData}
          disabled={isSaving}
          className="rounded-2xl bg-primary-orange px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "در حال ذخیره..." : "ذخیره محتوای درباره ما"}
        </button>
      </div>
    </div>
  );
}
