"use client";

import { useEffect, useState } from "react";
import { FAQPageContentPayload, PageLocale } from "@/types/page-cms";

interface FAQPageTabProps {
  locale: string;
}

const supportedLocales: PageLocale[] = ["fa", "en", "ar"];

const emptyState = (locale: string): FAQPageContentPayload => ({
  slug: "faq",
  locale: locale as PageLocale,
  title: "",
  subtitle: "",
  content: {
    sections: [{ title: "", items: [{ question: "", answer: "" }] }],
    contactTitle: "",
    contactDescription: "",
    contactCta: "",
  },
});

export default function FAQPageTab({ locale }: FAQPageTabProps) {
  const [selectedLocale, setSelectedLocale] = useState<PageLocale>((locale as PageLocale) || "fa");
  const [data, setData] = useState<FAQPageContentPayload>(emptyState(locale || "fa"));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const response = await fetch(`/api/admin/pages?slug=faq&locale=${selectedLocale}`, { cache: "no-store" });
      const result = await response.json();
      if (result.success) setData(result.data);
      setIsLoading(false);
    };
    loadData();
  }, [selectedLocale]);

  const saveData = async () => {
    setIsSaving(true);
    setMessage(null);
    const response = await fetch(`/api/admin/pages?slug=faq&locale=${selectedLocale}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (result.success) {
      setData(result.data);
      setMessage("محتوای سوالات متداول ذخیره شد.");
    } else {
      setMessage(result.error || "ذخیره ناموفق بود.");
    }
    setIsSaving(false);
  };

  const addSection = () => {
    setData((current) => ({
      ...current,
      content: {
        ...current.content,
        sections: [...current.content.sections, { title: "", items: [{ question: "", answer: "" }] }],
      },
    }));
  };

  const removeSection = (sectionIndex: number) => {
    setData((current) => ({
      ...current,
      content: {
        ...current.content,
        sections: current.content.sections.filter((_, index) => index !== sectionIndex),
      },
    }));
  };

  const addItem = (sectionIndex: number) => {
    setData((current) => ({
      ...current,
      content: {
        ...current.content,
        sections: current.content.sections.map((section, index) =>
          index === sectionIndex
            ? { ...section, items: [...section.items, { question: "", answer: "" }] }
            : section
        ),
      },
    }));
  };

  if (isLoading) {
    return <div className="p-8 text-center text-white">در حال بارگذاری سوالات متداول...</div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">مدیریت سوالات متداول</h2>
          <p className="mt-2 text-sm text-gray-300">بخش‌ها، سوال‌ها و فراخوان پشتیبانی FAQ را مدیریت کنید.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {supportedLocales.map((localeOption) => (
            <button
              key={localeOption}
              type="button"
              onClick={() => setSelectedLocale(localeOption)}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                selectedLocale === localeOption ? "bg-primary-orange text-white" : "border border-white/20 text-gray-200 hover:bg-white/10"
              }`}
            >
              {localeOption.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {message && <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-sm text-white">{message}</div>}

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h3 className="mb-4 text-xl font-semibold text-white">اطلاعات اصلی</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={data.title}
            onChange={(event) => setData((current) => ({ ...current, title: event.target.value }))}
            className="rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none focus:border-primary-orange"
            placeholder="عنوان صفحه"
          />
          <input
            value={data.content.contactCta}
            onChange={(event) =>
              setData((current) => ({
                ...current,
                content: { ...current.content, contactCta: event.target.value },
              }))
            }
            className="rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none focus:border-primary-orange"
            placeholder="متن دکمه پشتیبانی"
          />
        </div>
        <textarea
          rows={3}
          value={data.subtitle}
          onChange={(event) => setData((current) => ({ ...current, subtitle: event.target.value }))}
          className="mt-4 w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none focus:border-primary-orange"
          placeholder="زیرعنوان صفحه"
        />
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">بخش‌ها و سوال‌ها</h3>
          <button type="button" onClick={addSection} className="rounded-xl bg-primary-orange px-4 py-2 text-sm text-white">
            افزودن بخش
          </button>
        </div>

        {data.content.sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-4 flex gap-3">
              <input
                value={section.title}
                onChange={(event) =>
                  setData((current) => ({
                    ...current,
                    content: {
                      ...current.content,
                      sections: current.content.sections.map((item, index) =>
                        index === sectionIndex ? { ...item, title: event.target.value } : item
                      ),
                    },
                  }))
                }
                className="flex-1 rounded-xl border border-white/15 bg-gray-950 px-4 py-3 text-white outline-none focus:border-primary-orange"
                placeholder="عنوان بخش"
              />
              <button type="button" onClick={() => removeSection(sectionIndex)} className="rounded-xl border border-red-500/30 px-3 py-2 text-red-300">
                حذف
              </button>
            </div>

            <div className="space-y-3">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="grid gap-3 md:grid-cols-2">
                  <input
                    value={item.question}
                    onChange={(event) =>
                      setData((current) => ({
                        ...current,
                        content: {
                          ...current.content,
                          sections: current.content.sections.map((sectionItem, index) =>
                            index === sectionIndex
                              ? {
                                  ...sectionItem,
                                  items: sectionItem.items.map((faqItem, faqIndex) =>
                                    faqIndex === itemIndex ? { ...faqItem, question: event.target.value } : faqItem
                                  ),
                                }
                              : sectionItem
                          ),
                        },
                      }))
                    }
                    className="rounded-xl border border-white/15 bg-gray-950 px-4 py-3 text-white outline-none focus:border-primary-orange"
                    placeholder="سوال"
                  />
                  <textarea
                    value={item.answer}
                    onChange={(event) =>
                      setData((current) => ({
                        ...current,
                        content: {
                          ...current.content,
                          sections: current.content.sections.map((sectionItem, index) =>
                            index === sectionIndex
                              ? {
                                  ...sectionItem,
                                  items: sectionItem.items.map((faqItem, faqIndex) =>
                                    faqIndex === itemIndex ? { ...faqItem, answer: event.target.value } : faqItem
                                  ),
                                }
                              : sectionItem
                          ),
                        },
                      }))
                    }
                    rows={2}
                    className="rounded-xl border border-white/15 bg-gray-950 px-4 py-3 text-white outline-none focus:border-primary-orange"
                    placeholder="پاسخ"
                  />
                </div>
              ))}
            </div>
            <button type="button" onClick={() => addItem(sectionIndex)} className="mt-3 rounded-xl border border-white/15 px-4 py-2 text-sm text-gray-200">
              افزودن سوال
            </button>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h3 className="mb-4 text-xl font-semibold text-white">فراخوان پشتیبانی</h3>
        <input
          value={data.content.contactTitle}
          onChange={(event) =>
            setData((current) => ({
              ...current,
              content: { ...current.content, contactTitle: event.target.value },
            }))
          }
          className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none focus:border-primary-orange"
          placeholder="عنوان فراخوان"
        />
        <textarea
          rows={3}
          value={data.content.contactDescription}
          onChange={(event) =>
            setData((current) => ({
              ...current,
              content: { ...current.content, contactDescription: event.target.value },
            }))
          }
          className="mt-4 w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none focus:border-primary-orange"
          placeholder="توضیح فراخوان"
        />
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={saveData}
          disabled={isSaving}
          className="rounded-2xl bg-primary-orange px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-70"
        >
          {isSaving ? "در حال ذخیره..." : "ذخیره سوالات متداول"}
        </button>
      </div>
    </div>
  );
}
