"use client";

import { useEffect, useState } from "react";
import IconPicker from "@/components/admin/common/IconPicker";
import { ContactPageContentPayload, PageLocale } from "@/types/page-cms";

interface ContactPageTabProps {
  locale: string;
}

const supportedLocales: PageLocale[] = ["fa", "en", "ar"];

const emptyState = (locale: string): ContactPageContentPayload => ({
  slug: "contact",
  locale: locale as PageLocale,
  title: "",
  subtitle: "",
  content: {
    form: {
      title: "",
      fields: {
        firstNameLabel: "",
        firstNamePlaceholder: "",
        lastNameLabel: "",
        lastNamePlaceholder: "",
        emailLabel: "",
        emailPlaceholder: "",
        subjectLabel: "",
        subjectPlaceholder: "",
        messageLabel: "",
        messagePlaceholder: "",
      },
      submitLabel: "",
    },
    contactInfoTitle: "",
    contactCards: [
      { title: "", value: "", icon: null },
      { title: "", value: "", icon: null },
      { title: "", value: "", icon: null },
    ],
    workingHours: {
      title: "",
      lines: ["", "", ""],
    },
  },
});

export default function ContactPageTab({ locale }: ContactPageTabProps) {
  const [selectedLocale, setSelectedLocale] = useState<PageLocale>((locale as PageLocale) || "fa");
  const [data, setData] = useState<ContactPageContentPayload>(emptyState(locale || "fa"));
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
        const response = await fetch(`/api/admin/pages?slug=contact&locale=${selectedLocale}`, {
          cache: "no-store",
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "دریافت محتوای صفحه تماس با ما ناموفق بود.");
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
      const response = await fetch(`/api/admin/pages?slug=contact&locale=${selectedLocale}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "ذخیره محتوای صفحه تماس با ما ناموفق بود.");
      }

      setData(result.data);
      setSuccess(`محتوای تماس با ما برای زبان ${selectedLocale.toUpperCase()} ذخیره شد.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "خطا در ذخیره محتوا");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-orange border-t-transparent" />
          <p className="text-white">در حال بارگذاری محتوای تماس با ما...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">مدیریت صفحه تماس با ما</h2>
          <p className="mt-2 text-sm text-gray-300">
            برچسب‌های فرم، کارت‌های اطلاعات تماس و ساعات کاری را برای هر زبان مدیریت کنید.
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
        <h3 className="mb-6 text-xl font-semibold text-white">اطلاعات اصلی صفحه</h3>
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
            <label className="mb-2 block text-sm font-medium text-white">عنوان فرم</label>
            <input
              value={data.content.form.title}
              onChange={(event) =>
                setData((current) => ({
                  ...current,
                  content: {
                    ...current.content,
                    form: { ...current.content.form, title: event.target.value },
                  },
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
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h3 className="mb-6 text-xl font-semibold text-white">فیلدهای فرم تماس</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["firstNameLabel", "برچسب نام"],
            ["firstNamePlaceholder", "جای‌نگهدار نام"],
            ["lastNameLabel", "برچسب نام خانوادگی"],
            ["lastNamePlaceholder", "جای‌نگهدار نام خانوادگی"],
            ["emailLabel", "برچسب ایمیل"],
            ["emailPlaceholder", "جای‌نگهدار ایمیل"],
            ["subjectLabel", "برچسب موضوع"],
            ["subjectPlaceholder", "جای‌نگهدار موضوع"],
            ["messageLabel", "برچسب پیام"],
            ["messagePlaceholder", "جای‌نگهدار پیام"],
          ].map(([field, label]) => (
            <div key={field}>
              <label className="mb-2 block text-sm font-medium text-white">{label}</label>
              <input
                value={data.content.form.fields[field as keyof typeof data.content.form.fields]}
                onChange={(event) =>
                  setData((current) => ({
                    ...current,
                    content: {
                      ...current.content,
                      form: {
                        ...current.content.form,
                        fields: {
                          ...current.content.form.fields,
                          [field]: event.target.value,
                        },
                      },
                    },
                  }))
                }
                className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-primary-orange"
              />
            </div>
          ))}
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-white">متن دکمه ارسال</label>
          <input
            value={data.content.form.submitLabel}
            onChange={(event) =>
              setData((current) => ({
                ...current,
                content: {
                  ...current.content,
                  form: { ...current.content.form, submitLabel: event.target.value },
                },
              }))
            }
            className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-primary-orange"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h3 className="mb-6 text-xl font-semibold text-white">کارت‌های اطلاعات تماس</h3>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-white">عنوان این بخش</label>
          <input
            value={data.content.contactInfoTitle}
            onChange={(event) =>
              setData((current) => ({
                ...current,
                content: { ...current.content, contactInfoTitle: event.target.value },
              }))
            }
            className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-primary-orange"
          />
        </div>

        <div className="space-y-6">
          {data.content.contactCards.map((card, index) => (
            <div key={index} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <h4 className="mb-4 text-sm font-semibold text-white">کارت تماس {index + 1}</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">عنوان کارت</label>
                  <input
                    value={card.title}
                    onChange={(event) =>
                      setData((current) => ({
                        ...current,
                        content: {
                          ...current.content,
                          contactCards: current.content.contactCards.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, title: event.target.value } : item
                          ) as ContactPageContentPayload["content"]["contactCards"],
                        },
                      }))
                    }
                    className="w-full rounded-2xl border border-white/15 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-primary-orange"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white">مقدار</label>
                  <input
                    value={card.value}
                    onChange={(event) =>
                      setData((current) => ({
                        ...current,
                        content: {
                          ...current.content,
                          contactCards: current.content.contactCards.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, value: event.target.value } : item
                          ) as ContactPageContentPayload["content"]["contactCards"],
                        },
                      }))
                    }
                    className="w-full rounded-2xl border border-white/15 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-primary-orange"
                  />
                </div>
              </div>

              <div className="mt-4">
                <IconPicker
                  value={card.icon}
                  onChange={(icon) =>
                    setData((current) => ({
                      ...current,
                      content: {
                        ...current.content,
                        contactCards: current.content.contactCards.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, icon } : item
                        ) as ContactPageContentPayload["content"]["contactCards"],
                      },
                    }))
                  }
                  label={`آیکون کارت تماس ${index + 1}`}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h3 className="mb-6 text-xl font-semibold text-white">ساعات کاری</h3>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-white">عنوان بخش ساعات کاری</label>
          <input
            value={data.content.workingHours.title}
            onChange={(event) =>
              setData((current) => ({
                ...current,
                content: {
                  ...current.content,
                  workingHours: { ...current.content.workingHours, title: event.target.value },
                },
              }))
            }
            className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-primary-orange"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {data.content.workingHours.lines.map((line, index) => (
            <div key={index}>
              <label className="mb-2 block text-sm font-medium text-white">خط {index + 1}</label>
              <input
                value={line}
                onChange={(event) =>
                  setData((current) => ({
                    ...current,
                    content: {
                      ...current.content,
                      workingHours: {
                        ...current.content.workingHours,
                        lines: current.content.workingHours.lines.map((item, itemIndex) =>
                          itemIndex === index ? event.target.value : item
                        ) as [string, string, string],
                      },
                    },
                  }))
                }
                className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-primary-orange"
              />
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
          {isSaving ? "در حال ذخیره..." : "ذخیره محتوای تماس با ما"}
        </button>
      </div>
    </div>
  );
}
