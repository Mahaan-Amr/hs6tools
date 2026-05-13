"use client";

import { useEffect, useState } from "react";
import ImageUpload from "@/components/admin/common/ImageUpload";
import HomepageSlideForm from "./HomepageSlideForm";
import {
  AdminCategoryOption,
  HomepageCategoryCardInput,
  HomepageContentResponse,
  HomepageContentUpdatePayload,
  HomepageSlideInput,
  HomepageSlideRecord,
} from "@/types/homepage";

interface HomepageTabProps {
  locale: string;
}

const homepageLocales = ["fa", "en", "ar"] as const;
const categorySlots: Array<{
  slot: number;
  idKey: "featuredCategory1Id";
  titleKey: "featuredCategory1Title";
  descriptionKey: "featuredCategory1Description";
}> = [];
interface ImageFile {
  id: string;
  name: string;
  originalName: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

function buildImageFile(url: string, name: string): ImageFile {
  return {
    id: `${name}-${url}`,
    name,
    originalName: name,
    url,
    size: 0,
    type: "image/*",
    uploadedAt: new Date().toISOString(),
  };
}

const emptyContent = (locale: string): HomepageContentUpdatePayload => ({
  locale,
  heroTagline: "",
  heroDescription: "",
  heroPrimaryCtaLabel: "",
  heroPrimaryCtaHref: "",
  heroSecondaryCtaLabel: "",
  heroSecondaryCtaHref: "",
  categorySectionTitle: "",
  categorySectionSubtitle: "",
  categoryViewAllLabel: "",
  featuredCategory1Id: null,
  featuredCategory2Id: null,
  featuredCategory3Id: null,
  featuredCategory1Title: null,
  featuredCategory1Description: null,
  featuredCategory2Title: null,
  featuredCategory2Description: null,
  featuredCategory3Title: null,
  featuredCategory3Description: null,
  featuredCategories: [],
});

function getLocalizedCategoryName(category: AdminCategoryOption, locale: string) {
  if (locale === "en" && category.nameEn) return category.nameEn;
  if (locale === "ar" && category.nameAr) return category.nameAr;
  return category.name;
}

function getLocalizedCategoryDescription(category: AdminCategoryOption, locale: string) {
  if (locale === "en" && category.descriptionEn) return category.descriptionEn;
  if (locale === "ar" && category.descriptionAr) return category.descriptionAr;
  return category.description || "";
}

export default function HomepageTab({ locale }: HomepageTabProps) {
  const [selectedLocale, setSelectedLocale] = useState(locale || "fa");
  const [content, setContent] = useState<HomepageContentUpdatePayload>(emptyContent(locale || "fa"));
  const [slides, setSlides] = useState<HomepageSlideRecord[]>([]);
  const [categories, setCategories] = useState<AdminCategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [isSlideFormOpen, setIsSlideFormOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HomepageSlideRecord | null>(null);
  const [busySlideId, setBusySlideId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedLocale(locale || "fa");
  }, [locale]);

  useEffect(() => {
    const loadHomepageData = async () => {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const response = await fetch(`/api/admin/homepage?locale=${selectedLocale}`, {
          cache: "no-store",
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || "دریافت محتوای صفحه اصلی با خطا مواجه شد.");
        }

        const data = result.data as HomepageContentResponse;
        setContent({
          locale: data.locale,
          heroTagline: data.heroTagline,
          heroDescription: data.heroDescription,
          heroPrimaryCtaLabel: data.heroPrimaryCtaLabel,
          heroPrimaryCtaHref: data.heroPrimaryCtaHref,
          heroSecondaryCtaLabel: data.heroSecondaryCtaLabel,
          heroSecondaryCtaHref: data.heroSecondaryCtaHref,
          categorySectionTitle: data.categorySectionTitle,
          categorySectionSubtitle: data.categorySectionSubtitle,
          categoryViewAllLabel: data.categoryViewAllLabel,
          featuredCategory1Id: data.featuredCategory1Id,
          featuredCategory2Id: data.featuredCategory2Id,
          featuredCategory3Id: data.featuredCategory3Id,
          featuredCategory1Title: data.featuredCategory1Title,
          featuredCategory1Description: data.featuredCategory1Description,
          featuredCategory2Title: data.featuredCategory2Title,
          featuredCategory2Description: data.featuredCategory2Description,
          featuredCategory3Title: data.featuredCategory3Title,
          featuredCategory3Description: data.featuredCategory3Description,
          featuredCategories: (data.categoryCards || []).map((card, index) => ({
            id: card.id,
            categoryId: card.categoryId,
            title: card.title || null,
            description: card.description || null,
            backgroundImage: card.backgroundImage || null,
            sortOrder: index,
          })),
        });
        setSlides(data.slides || []);
        setCategories(result.categories || []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "دریافت محتوای صفحه اصلی با خطا مواجه شد.");
      } finally {
        setIsLoading(false);
      }
    };

    loadHomepageData();
  }, [selectedLocale]);

  const setField = (field: keyof HomepageContentUpdatePayload, value: string | null) => {
    setContent((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const setFeaturedCategories = (featuredCategories: HomepageCategoryCardInput[]) => {
    setContent((current) => ({
      ...current,
      featuredCategories: featuredCategories.map((category, index) => ({
        ...category,
        sortOrder: index,
      })),
    }));
  };

  const updateFeaturedCategory = (
    index: number,
    field: keyof HomepageCategoryCardInput,
    value: string | null
  ) => {
    setFeaturedCategories(
      content.featuredCategories.map((category, categoryIndex) =>
        categoryIndex === index ? { ...category, [field]: value } : category
      )
    );
  };

  const addFeaturedCategory = () => {
    setFeaturedCategories([
      ...content.featuredCategories,
      {
        categoryId: null,
        title: null,
        description: null,
        backgroundImage: null,
        sortOrder: content.featuredCategories.length,
      },
    ]);
  };

  const removeFeaturedCategory = (index: number) => {
    setFeaturedCategories(content.featuredCategories.filter((_, categoryIndex) => categoryIndex !== index));
  };

  const moveFeaturedCategory = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= content.featuredCategories.length) return;

    const nextCategories = [...content.featuredCategories];
    const [category] = nextCategories.splice(index, 1);
    nextCategories.splice(nextIndex, 0, category);
    setFeaturedCategories(nextCategories);
  };

  const saveContent = async () => {
    setIsSavingContent(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/admin/homepage", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...content,
          locale: selectedLocale,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "ذخیره محتوای صفحه اصلی با خطا مواجه شد.");
      }

      setSuccessMessage(`محتوای صفحه اصلی برای زبان ${selectedLocale} ذخیره شد.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "ذخیره محتوای صفحه اصلی با خطا مواجه شد.");
    } finally {
      setIsSavingContent(false);
    }
  };

  const refreshSlides = async () => {
    const response = await fetch(`/api/admin/homepage/slides?locale=${selectedLocale}`, {
      cache: "no-store",
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "بروزرسانی فهرست اسلایدها با خطا مواجه شد.");
    }

    setSlides(result.data || []);
  };

  const handleSaveSlide = async (payload: HomepageSlideInput) => {
    setError(null);
    setSuccessMessage(null);

    const url = editingSlide
      ? `/api/admin/homepage/slides/${editingSlide.id}`
      : "/api/admin/homepage/slides";
    const method = editingSlide ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        locale: selectedLocale,
      }),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || "ذخیره اسلاید با خطا مواجه شد.");
    }

    await refreshSlides();
    setSuccessMessage(editingSlide ? "اسلاید بروزرسانی شد." : "اسلاید ایجاد شد.");
    setEditingSlide(null);
    setIsSlideFormOpen(false);
  };

  const handleDeleteSlide = async (slideId: string) => {
    if (!confirm("آیا از حذف این اسلاید اطمینان دارید؟")) return;

    setBusySlideId(slideId);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/admin/homepage/slides/${slideId}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "حذف اسلاید با خطا مواجه شد.");
      }

      await refreshSlides();
      setSuccessMessage("اسلاید حذف شد.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "حذف اسلاید با خطا مواجه شد.");
    } finally {
      setBusySlideId(null);
    }
  };

  const handleSlideUpdate = async (slideId: string, payload: Partial<HomepageSlideInput>) => {
    setBusySlideId(slideId);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/admin/homepage/slides/${slideId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "بروزرسانی اسلاید با خطا مواجه شد.");
      }

      await refreshSlides();
      setSuccessMessage("اسلاید بروزرسانی شد.");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "بروزرسانی اسلاید با خطا مواجه شد.");
    } finally {
      setBusySlideId(null);
    }
  };

  const moveSlide = async (index: number, direction: -1 | 1) => {
    const otherIndex = index + direction;
    if (otherIndex < 0 || otherIndex >= slides.length) return;

    const currentSlide = slides[index];
    const otherSlide = slides[otherIndex];

    setBusySlideId(currentSlide.id);
    setError(null);
    setSuccessMessage(null);

    try {
      const responses = await Promise.all([
        fetch(`/api/admin/homepage/slides/${currentSlide.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: otherSlide.sortOrder }),
        }),
        fetch(`/api/admin/homepage/slides/${otherSlide.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: currentSlide.sortOrder }),
        }),
      ]);

      const results = await Promise.all(responses.map((response) => response.json()));
      const failed = responses.findIndex((response) => !response.ok);

      if (failed !== -1) {
        throw new Error(results[failed]?.error || "تغییر ترتیب اسلایدها با خطا مواجه شد.");
      }

      await refreshSlides();
      setSuccessMessage("ترتیب اسلایدها بروزرسانی شد.");
    } catch (moveError) {
      setError(moveError instanceof Error ? moveError.message : "تغییر ترتیب اسلایدها با خطا مواجه شد.");
    } finally {
      setBusySlideId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
          <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-orange border-t-transparent"></div>
          <p className="text-white">در حال بارگذاری مدیریت صفحه اصلی...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">مدیریت صفحه اصلی</h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-300">
            متن هیرو، اسلایدهای تبلیغاتی و دسته‌بندی‌های منتخب صفحه اصلی را برای هر زبان مدیریت کنید.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {homepageLocales.map((localeOption) => (
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

      {successMessage && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100">
          {successMessage}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">ویرایش بخش هیرو</h3>
              <p className="mt-1 text-sm text-gray-300">پیام اصلی و لینک‌های دکمه‌های هیرو را برای صفحه اصلی ویرایش کنید.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-white">تیتر / شعار اصلی</label>
              <input
                value={content.heroTagline}
                onChange={(event) => setField("heroTagline", event.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-primary-orange"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white">توضیحات</label>
              <textarea
                rows={4}
                value={content.heroDescription}
                onChange={(event) => setField("heroDescription", event.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-primary-orange"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">متن دکمه اصلی</label>
                <input
                  value={content.heroPrimaryCtaLabel}
                  onChange={(event) => setField("heroPrimaryCtaLabel", event.target.value)}
                  className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-primary-orange"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">لینک دکمه اصلی</label>
                <input
                  value={content.heroPrimaryCtaHref}
                  onChange={(event) => setField("heroPrimaryCtaHref", event.target.value)}
                  className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-primary-orange"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">متن دکمه ثانویه</label>
                <input
                  value={content.heroSecondaryCtaLabel}
                  onChange={(event) => setField("heroSecondaryCtaLabel", event.target.value)}
                  className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-primary-orange"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">لینک دکمه ثانویه</label>
                <input
                  value={content.heroSecondaryCtaHref}
                  onChange={(event) => setField("heroSecondaryCtaHref", event.target.value)}
                  className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-primary-orange"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">ویرایش پیش‌نمایش دسته‌بندی‌ها</h3>
              <p className="mt-1 text-sm text-gray-300">
                سه دسته‌بندی صفحه اصلی را انتخاب کنید و در صورت نیاز متن تبلیغاتی هر کدام را تغییر دهید.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-white">عنوان بخش</label>
              <input
                value={content.categorySectionTitle}
                onChange={(event) => setField("categorySectionTitle", event.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-primary-orange"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white">زیرعنوان بخش</label>
              <textarea
                rows={3}
                value={content.categorySectionSubtitle}
                onChange={(event) => setField("categorySectionSubtitle", event.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-primary-orange"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white">متن دکمه مشاهده همه</label>
              <input
                value={content.categoryViewAllLabel}
                onChange={(event) => setField("categoryViewAllLabel", event.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-primary-orange"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={addFeaturedCategory}
                className="rounded-xl bg-primary-orange px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                افزودن دسته‌بندی
              </button>
            </div>

            {content.featuredCategories.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-gray-300">
                هنوز دسته‌بندی منتخب ثبت نشده است. برای نمایش این بخش حداقل یک دسته‌بندی اضافه کنید.
              </div>
            )}

            {content.featuredCategories.map((featuredCategory, index) => {
              const selectedCategory = categories.find((category) => category.id === featuredCategory.categoryId);

              return (
                <div key={featuredCategory.id || index} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold text-white">دسته‌بندی منتخب {index + 1}</h4>
                    {selectedCategory && (
                      <span className="text-xs text-gray-300">
                        متن پیش‌فرض: {getLocalizedCategoryName(selectedCategory, selectedLocale)}
                      </span>
                    )}
                    <div className="flex gap-2">
                      <button type="button" disabled={index === 0} onClick={() => moveFeaturedCategory(index, -1)} className="rounded-lg border border-white/15 px-3 py-1 text-xs text-white disabled:cursor-not-allowed disabled:opacity-40">
                        بالا
                      </button>
                      <button type="button" disabled={index === content.featuredCategories.length - 1} onClick={() => moveFeaturedCategory(index, 1)} className="rounded-lg border border-white/15 px-3 py-1 text-xs text-white disabled:cursor-not-allowed disabled:opacity-40">
                        پایین
                      </button>
                      <button type="button" onClick={() => removeFeaturedCategory(index)} className="rounded-lg border border-red-500/40 px-3 py-1 text-xs text-red-200">
                        حذف
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <select value={featuredCategory.categoryId || ""} onChange={(event) => updateFeaturedCategory(index, "categoryId", event.target.value || null)} className="w-full rounded-2xl border border-white/15 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-primary-orange">
                      <option value="">هیچ دسته‌بندی‌ای انتخاب نشده است</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {getLocalizedCategoryName(category, selectedLocale)}
                        </option>
                      ))}
                    </select>

                    <input value={featuredCategory.title || ""} onChange={(event) => updateFeaturedCategory(index, "title", event.target.value || null)} className="w-full rounded-2xl border border-white/15 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-primary-orange" placeholder={selectedCategory ? getLocalizedCategoryName(selectedCategory, selectedLocale) : "عنوان جایگزین اختیاری"} />

                    <textarea rows={2} value={featuredCategory.description || ""} onChange={(event) => updateFeaturedCategory(index, "description", event.target.value || null)} className="w-full rounded-2xl border border-white/15 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-primary-orange" placeholder={selectedCategory ? getLocalizedCategoryDescription(selectedCategory, selectedLocale) || "توضیح جایگزین اختیاری" : "توضیح جایگزین اختیاری"} />

                    <ImageUpload
                      images={featuredCategory.backgroundImage ? [buildImageFile(featuredCategory.backgroundImage, `homepage-category-${index + 1}`)] : []}
                      onImagesChange={(images) => updateFeaturedCategory(index, "backgroundImage", images[0]?.url || null)}
                      multiple={false}
                      maxImages={1}
                      label="تصویر پس‌زمینه کارت"
                      category="homepage"
                    />
                  </div>
                </div>
              );
            })}

            {categorySlots.map(({ slot, idKey, titleKey, descriptionKey }) => {
              const selectedCategory = categories.find((category) => category.id === content[idKey]);

              return (
                <div key={slot} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">جایگاه دسته‌بندی {slot}</h4>
                    {selectedCategory && (
                      <span className="text-xs text-gray-300">
                        متن پیش‌فرض: {getLocalizedCategoryName(selectedCategory, selectedLocale)}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <select
                      value={content[idKey] || ""}
                      onChange={(event) => setField(idKey, event.target.value || null)}
                      className="w-full rounded-2xl border border-white/15 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-primary-orange"
                    >
                      <option value="">هیچ دسته‌بندی‌ای انتخاب نشده است</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {getLocalizedCategoryName(category, selectedLocale)}
                        </option>
                      ))}
                    </select>

                    <input
                      value={content[titleKey] || ""}
                      onChange={(event) => setField(titleKey, event.target.value || null)}
                      className="w-full rounded-2xl border border-white/15 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-primary-orange"
                      placeholder={
                        selectedCategory
                          ? getLocalizedCategoryName(selectedCategory, selectedLocale)
                          : "عنوان جایگزین اختیاری"
                      }
                    />

                    <textarea
                      rows={2}
                      value={content[descriptionKey] || ""}
                      onChange={(event) => setField(descriptionKey, event.target.value || null)}
                      className="w-full rounded-2xl border border-white/15 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-primary-orange"
                      placeholder={
                        selectedCategory
                          ? getLocalizedCategoryDescription(selectedCategory, selectedLocale) || "توضیح جایگزین اختیاری"
                          : "توضیح جایگزین اختیاری"
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={saveContent}
          disabled={isSavingContent}
          className="rounded-2xl bg-primary-orange px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSavingContent ? "در حال ذخیره محتوای صفحه اصلی..." : "ذخیره محتوای هیرو و دسته‌بندی‌ها"}
        </button>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">مدیریت اسلایدر</h3>
            <p className="mt-1 text-sm text-gray-300">
              اسلاید تبلیغاتی بسازید، تصاویر واکنش‌گرا آپلود کنید و ترتیب اسلایدها را مدیریت کنید.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingSlide(null);
              setIsSlideFormOpen(true);
            }}
            className="rounded-2xl bg-primary-orange px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            افزودن اسلاید
          </button>
        </div>

        {slides.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 px-6 py-10 text-center text-sm text-gray-300">
            هنوز اسلایدی برای زبان {selectedLocale} ثبت نشده است. اولین بنر تبلیغاتی را ایجاد کنید تا جایگزین بخش قبلی شود.
          </div>
        ) : (
          <div className="space-y-4">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 xl:flex-row xl:items-center xl:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-lg font-semibold text-white">{slide.title}</h4>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-gray-200">
                      #{slide.sortOrder}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        slide.isActive
                          ? "bg-emerald-500/20 text-emerald-200"
                          : "bg-gray-500/20 text-gray-300"
                      }`}
                    >
                      {slide.isActive ? "فعال" : "غیرفعال"}
                    </span>
                  </div>
                  {slide.subtitle && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-300">{slide.subtitle}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-400">
                    <span>تصویر دسکتاپ: {slide.desktopImage ? "دارد" : "ندارد"}</span>
                    <span>تصویر موبایل: {slide.mobileImage ? "دارد" : "ندارد"}</span>
                    <span>لینک بنر: {slide.bannerHref ? "دارد" : "ندارد"}</span>
                    <span>دکمه: {slide.buttonLabel && slide.buttonHref ? "دارد" : "ندارد"}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={index === 0 || busySlideId === slide.id}
                    onClick={() => moveSlide(index, -1)}
                    className="rounded-xl border border-white/15 px-3 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    انتقال به بالا
                  </button>
                  <button
                    type="button"
                    disabled={index === slides.length - 1 || busySlideId === slide.id}
                    onClick={() => moveSlide(index, 1)}
                    className="rounded-xl border border-white/15 px-3 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    انتقال به پایین
                  </button>
                  <button
                    type="button"
                    disabled={busySlideId === slide.id}
                    onClick={() =>
                      handleSlideUpdate(slide.id, {
                        isActive: !slide.isActive,
                      })
                    }
                    className="rounded-xl border border-white/15 px-3 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {slide.isActive ? "غیرفعال کردن" : "فعال کردن"}
                  </button>
                  <button
                    type="button"
                    disabled={busySlideId === slide.id}
                    onClick={() => {
                      setEditingSlide(slide);
                      setIsSlideFormOpen(true);
                    }}
                    className="rounded-xl border border-white/15 px-3 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    ویرایش
                  </button>
                  <button
                    type="button"
                    disabled={busySlideId === slide.id}
                    onClick={() => handleDeleteSlide(slide.id)}
                    className="rounded-xl border border-red-500/40 px-3 py-2 text-sm text-red-200 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {isSlideFormOpen && (
        <HomepageSlideForm
          locale={selectedLocale}
          slide={editingSlide}
          onClose={() => {
            setEditingSlide(null);
            setIsSlideFormOpen(false);
          }}
          onSave={handleSaveSlide}
        />
      )}
    </div>
  );
}
