"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ImageUpload from "@/components/admin/common/ImageUpload";
import { HomepageSlideInput, HomepageSlideRecord } from "@/types/homepage";

interface ImageFile {
  id: string;
  name: string;
  originalName: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

interface HomepageSlideFormProps {
  locale: string;
  slide?: HomepageSlideRecord | null;
  onClose: () => void;
  onSave: (payload: HomepageSlideInput) => Promise<void>;
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

export default function HomepageSlideForm({
  locale,
  slide,
  onClose,
  onSave,
}: HomepageSlideFormProps) {
  const [formData, setFormData] = useState<HomepageSlideInput>({
    locale,
    title: "",
    subtitle: null,
    desktopImage: "",
    mobileImage: null,
    bannerHref: null,
    buttonLabel: null,
    buttonHref: null,
    isActive: true,
  });
  const [desktopImages, setDesktopImages] = useState<ImageFile[]>([]);
  const [mobileImages, setMobileImages] = useState<ImageFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData({
      locale,
      title: slide?.title || "",
      subtitle: slide?.subtitle || null,
      desktopImage: slide?.desktopImage || "",
      mobileImage: slide?.mobileImage || null,
      bannerHref: slide?.bannerHref || null,
      buttonLabel: slide?.buttonLabel || null,
      buttonHref: slide?.buttonHref || null,
      isActive: slide?.isActive ?? true,
      sortOrder: slide?.sortOrder,
    });
    setDesktopImages(slide?.desktopImage ? [buildImageFile(slide.desktopImage, "desktop-banner")] : []);
    setMobileImages(slide?.mobileImage ? [buildImageFile(slide.mobileImage, "mobile-banner")] : []);
  }, [slide, locale]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleInputChange = (field: keyof HomepageSlideInput, value: string | boolean | null) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: "" }));
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      nextErrors.title = "عنوان اسلاید الزامی است.";
    }

    if (!formData.desktopImage.trim()) {
      nextErrors.desktopImage = "تصویر دسکتاپ الزامی است.";
    }

    if (!!formData.buttonLabel !== !!formData.buttonHref) {
      nextErrors.button = "متن دکمه و لینک دکمه باید همزمان تکمیل شوند.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        locale,
        title: formData.title.trim(),
        subtitle: formData.subtitle?.trim() || null,
        desktopImage: formData.desktopImage.trim(),
        mobileImage: formData.mobileImage?.trim() || null,
        bannerHref: formData.bannerHref?.trim() || null,
        buttonLabel: formData.buttonLabel?.trim() || null,
        buttonHref: formData.buttonHref?.trim() || null,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {slide ? "ویرایش اسلاید صفحه اصلی" : "اسلاید جدید صفحه اصلی"}
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              عنوان، لینک‌ها و تصاویر واکنش‌گرا را برای زبان <span className="font-semibold">{locale}</span> مدیریت کنید.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            بستن
          </button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                عنوان اسلاید
              </label>
              <input
                value={formData.title}
                onChange={(event) => handleInputChange("title", event.target.value)}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-primary-orange dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                placeholder="ابزار دقیق برای کارگاه‌های مدرن"
              />
              {errors.title && <p className="mt-2 text-sm text-red-500">{errors.title}</p>}
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-950">
              <input
                id="slide-active"
                type="checkbox"
                checked={formData.isActive}
                onChange={(event) => handleInputChange("isActive", event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary-orange focus:ring-primary-orange"
              />
              <label htmlFor="slide-active" className="text-sm font-medium text-gray-900 dark:text-white">
                نمایش در ویترین سایت
              </label>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              زیرعنوان
            </label>
            <textarea
              value={formData.subtitle || ""}
              onChange={(event) => handleInputChange("subtitle", event.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-primary-orange dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              placeholder="متن تکمیلی اختیاری که زیر عنوان اسلاید نمایش داده می‌شود."
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div>
              <ImageUpload
                images={desktopImages}
                onImagesChange={(images) => {
                  setDesktopImages(images.slice(0, 1));
                  handleInputChange("desktopImage", images[0]?.url || "");
                }}
                multiple={false}
                maxImages={1}
                label="تصویر دسکتاپ"
                required
                category="homepage"
              />
              <p className="mt-2 text-xs leading-6 text-gray-500 dark:text-gray-400">
                پیشنهاد: 1600x800 پیکسل با نسبت 2:1. سوژه اصلی را نزدیک مرکز نگه دارید.
              </p>
              {errors.desktopImage && <p className="mt-2 text-sm text-red-500">{errors.desktopImage}</p>}
            </div>
            <div>
              <ImageUpload
                images={mobileImages}
                onImagesChange={(images) => {
                  setMobileImages(images.slice(0, 1));
                  handleInputChange("mobileImage", images[0]?.url || null);
                }}
                multiple={false}
                maxImages={1}
                label="تصویر موبایل"
                category="homepage"
              />
              <p className="mt-2 text-xs leading-6 text-gray-500 dark:text-gray-400">
                اختیاری. پیشنهاد: 900x1200 پیکسل با نسبت 3:4. اگر خالی باشد تصویر دسکتاپ نمایش داده می‌شود.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                لینک کامل بنر
              </label>
              <input
                value={formData.bannerHref || ""}
                onChange={(event) => handleInputChange("bannerHref", event.target.value)}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-primary-orange dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                placeholder="/fa/categories/diamond-discs"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                متن دکمه
              </label>
              <input
                value={formData.buttonLabel || ""}
                onChange={(event) => handleInputChange("buttonLabel", event.target.value)}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-primary-orange dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                placeholder="مشاهده مجموعه"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              لینک دکمه
            </label>
            <input
              value={formData.buttonHref || ""}
              onChange={(event) => handleInputChange("buttonHref", event.target.value)}
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-primary-orange dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              placeholder="/fa/shop"
            />
            {errors.button && <p className="mt-2 text-sm text-red-500">{errors.button}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl bg-primary-orange px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? "در حال ذخیره..." : slide ? "بروزرسانی اسلاید" : "ایجاد اسلاید"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
