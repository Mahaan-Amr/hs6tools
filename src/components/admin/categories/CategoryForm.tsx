"use client";

import { useEffect, useState } from "react";
import ImageUpload from "@/components/admin/common/ImageUpload";
import IconPicker from "@/components/admin/common/IconPicker";
import { getMessages, Messages } from "@/lib/i18n";
import { AdminCategory, CreateCategoryData, UpdateCategoryData } from "@/types/admin";

interface CategoryFormProps {
  category?: AdminCategory;
  categories: AdminCategory[];
  onSave: (data: CreateCategoryData | UpdateCategoryData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  locale: string;
}

interface ImageFile {
  id: string;
  name: string;
  originalName: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

function buildImageFile(url: string): ImageFile {
  return {
    id: `category-image-${url}`,
    name: "category-image",
    originalName: "category-image",
    url,
    size: 0,
    type: "image/*",
    uploadedAt: new Date().toISOString(),
  };
}

export default function CategoryForm({
  category,
  categories,
  onSave,
  onCancel,
  isLoading = false,
  locale,
}: CategoryFormProps) {
  const isEditing = !!category;
  const [messages, setMessages] = useState<Messages | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showMultilingual, setShowMultilingual] = useState(false);
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || "",
    image: category?.image || "",
    icon: category?.icon || "",
    parentId: category?.parentId || "",
    metaTitle: category?.metaTitle || "",
    metaDescription: category?.metaDescription || "",
    metaKeywords: category?.metaKeywords || "",
    isActive: category?.isActive ?? true,
    sortOrder: category?.sortOrder || 0,
    nameEn: category?.nameEn || "",
    nameAr: category?.nameAr || "",
    descriptionEn: category?.descriptionEn || "",
    descriptionAr: category?.descriptionAr || "",
  });

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessages(locale);
      setMessages(msgs);
    };

    loadMessages();
  }, [locale]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleInputChange = (
    field: keyof CreateCategoryData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "name" && !isEditing && typeof value === "string") {
        next.slug = generateSlug(value);
      }
      return next;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const adminLabels = messages?.admin || {};
  const t = {
    nameRequired: "نام دسته‌بندی الزامی است",
    slugRequired: "نامک دسته‌بندی الزامی است",
    basicInfo: "اطلاعات پایه",
    categoryName: "نام دسته‌بندی",
    slug: "نامک",
    parentCategory: "دسته‌بندی والد",
    noParent: "بدون والد",
    sortOrder: "ترتیب نمایش",
    description: "توضیحات",
    translations: "ترجمه‌ها",
    show: "نمایش",
    hide: "مخفی کردن",
    english: "انگلیسی",
    arabic: "عربی",
    nameEn: "نام انگلیسی",
    descriptionEn: "توضیحات انگلیسی",
    nameAr: "نام عربی",
    descriptionAr: "توضیحات عربی",
    mediaSeo: "رسانه و سئو",
    image: "تصویر",
    icon: "آیکون",
    metaTitle: "عنوان متا",
    metaDescription: "توضیحات متا",
    metaKeywords: "کلمات کلیدی",
    status: "وضعیت",
    active: "فعال",
    cancel: "انصراف",
    saving: "در حال ذخیره...",
    update: "بروزرسانی",
    create: "ایجاد",
    ...adminLabels,
    ...(messages?.admin?.categoriesForm || {}),
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      nextErrors.name = String(t.nameRequired);
    }

    if (!formData.slug.trim()) {
      nextErrors.slug = String(t.slugRequired);
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    const submitData = isEditing
      ? ({ ...formData, id: category.id } as UpdateCategoryData)
      : formData;

    onSave(submitData);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
          <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
            {String(t.basicInfo)}
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-3 block text-sm font-semibold text-gray-900 dark:text-white">
                {String(t.categoryName)} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(event) => handleInputChange("name", event.target.value)}
                className={`w-full rounded-lg border-2 bg-white px-4 py-3 text-gray-900 transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 ${
                  errors.name
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-primary-orange focus:ring-primary-orange dark:border-gray-600"
                }`}
                placeholder={String(t.categoryName)}
              />
              {errors.name && (
                <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-gray-900 dark:text-white">
                {String(t.slug)} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(event) => handleInputChange("slug", event.target.value)}
                className={`w-full rounded-lg border-2 bg-white px-4 py-3 text-gray-900 transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 ${
                  errors.slug
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-primary-orange focus:ring-primary-orange dark:border-gray-600"
                }`}
                placeholder={String(t.slug)}
              />
              {errors.slug && (
                <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
                  {errors.slug}
                </p>
              )}
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-gray-900 dark:text-white">
                {String(t.parentCategory)}
              </label>
              <select
                value={formData.parentId}
                onChange={(event) => handleInputChange("parentId", event.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all focus:border-primary-orange focus:outline-none focus:ring-2 focus:ring-primary-orange dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="">{String(t.noParent)}</option>
                {categories
                  .filter((cat) => cat.id !== category?.id)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-gray-900 dark:text-white">
                {String(t.sortOrder)}
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(event) =>
                  handleInputChange("sortOrder", parseInt(event.target.value, 10) || 0)
                }
                min="0"
                placeholder="0"
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all placeholder:text-gray-400 focus:border-primary-orange focus:outline-none focus:ring-2 focus:ring-primary-orange dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-3 block text-sm font-semibold text-gray-900 dark:text-white">
              {String(t.description)}
            </label>
            <textarea
              value={formData.description}
              onChange={(event) => handleInputChange("description", event.target.value)}
              rows={4}
              className="w-full resize-none rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all placeholder:text-gray-400 focus:border-primary-orange focus:outline-none focus:ring-2 focus:ring-primary-orange dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
              placeholder={String(t.description)}
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {String(t.translations)}
            </h3>
            <button
              type="button"
              onClick={() => setShowMultilingual((prev) => !prev)}
              className="flex items-center gap-2 font-semibold text-primary-orange transition-colors hover:text-orange-600"
            >
              <span>{showMultilingual ? String(t.hide) : String(t.show)}</span>
              <svg
                className={`h-5 w-5 transition-transform ${showMultilingual ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {showMultilingual && (
            <div className="space-y-6">
              <div className="rounded-lg border-2 border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <h4 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-600 dark:text-blue-400">
                    EN
                  </span>
                  <span>{String(t.english)}</span>
                </h4>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-3 block text-sm font-semibold text-gray-900 dark:text-white">
                      {String(t.nameEn)}
                    </label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(event) => handleInputChange("nameEn", event.target.value)}
                      className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all placeholder:text-gray-400 focus:border-primary-orange focus:outline-none focus:ring-2 focus:ring-primary-orange dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                      placeholder="Category name in English"
                    />
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-semibold text-gray-900 dark:text-white">
                      {String(t.descriptionEn)}
                    </label>
                    <textarea
                      value={formData.descriptionEn}
                      onChange={(event) => handleInputChange("descriptionEn", event.target.value)}
                      rows={3}
                      className="w-full resize-none rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all placeholder:text-gray-400 focus:border-primary-orange focus:outline-none focus:ring-2 focus:ring-primary-orange dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                      placeholder="Category description in English"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border-2 border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <h4 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-sm font-bold text-green-600 dark:text-green-400">
                    AR
                  </span>
                  <span>{String(t.arabic)}</span>
                </h4>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-3 block text-sm font-semibold text-gray-900 dark:text-white">
                      {String(t.nameAr)}
                    </label>
                    <input
                      type="text"
                      value={formData.nameAr}
                      onChange={(event) => handleInputChange("nameAr", event.target.value)}
                      dir="rtl"
                      className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all placeholder:text-gray-400 focus:border-primary-orange focus:outline-none focus:ring-2 focus:ring-primary-orange dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                      placeholder="اسم الفئة بالعربية"
                    />
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-semibold text-gray-900 dark:text-white">
                      {String(t.descriptionAr)}
                    </label>
                    <textarea
                      value={formData.descriptionAr}
                      onChange={(event) => handleInputChange("descriptionAr", event.target.value)}
                      rows={3}
                      dir="rtl"
                      className="w-full resize-none rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all placeholder:text-gray-400 focus:border-primary-orange focus:outline-none focus:ring-2 focus:ring-primary-orange dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                      placeholder="وصف الفئة بالعربية"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
          <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
            {String(t.mediaSeo)}
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <ImageUpload
                images={formData.image ? [buildImageFile(formData.image)] : []}
                onImagesChange={(images) => handleInputChange("image", images[0]?.url || "")}
                multiple={false}
                maxImages={1}
                category="categories"
                label={String(t.image)}
              />
            </div>

            <div>
              <IconPicker
                value={formData.icon || null}
                onChange={(icon) => handleInputChange("icon", icon || "")}
                label={String(t.icon)}
              />
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-gray-900 dark:text-white">
                {String(t.metaTitle)}
              </label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(event) => handleInputChange("metaTitle", event.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all placeholder:text-gray-400 focus:border-primary-orange focus:outline-none focus:ring-2 focus:ring-primary-orange dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                placeholder="عنوان برای موتورهای جستجو"
              />
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-gray-900 dark:text-white">
                {String(t.metaDescription)}
              </label>
              <textarea
                value={formData.metaDescription}
                onChange={(event) => handleInputChange("metaDescription", event.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all placeholder:text-gray-400 focus:border-primary-orange focus:outline-none focus:ring-2 focus:ring-primary-orange dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                placeholder="توضیحات برای موتورهای جستجو"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-3 block text-sm font-semibold text-gray-900 dark:text-white">
              {String(t.metaKeywords)}
            </label>
            <input
              type="text"
              value={formData.metaKeywords}
              onChange={(event) => handleInputChange("metaKeywords", event.target.value)}
              className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all placeholder:text-gray-400 focus:border-primary-orange focus:outline-none focus:ring-2 focus:ring-primary-orange dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
              placeholder="کلمات کلیدی را با کاما جدا کنید"
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
          <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
            {String(t.status)}
          </h3>

          <div className="flex items-center pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(event) => handleInputChange("isActive", event.target.checked)}
              className="h-5 w-5 cursor-pointer rounded border-2 border-gray-300 bg-white text-primary-orange focus:ring-2 focus:ring-primary-orange focus:ring-offset-0 dark:border-gray-600 dark:bg-gray-800"
            />
            <label
              htmlFor="isActive"
              className="mr-3 cursor-pointer font-semibold text-gray-900 dark:text-white"
            >
              {String(t.active)}
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 border-t-2 border-gray-200 pt-6 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg bg-gray-200 px-8 py-3 font-semibold text-gray-900 transition-colors duration-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            {String(t.cancel)}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-primary-orange px-8 py-3 font-semibold text-white shadow-lg shadow-primary-orange/30 transition-colors duration-200 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>{String(t.saving)}</span>
              </div>
            ) : isEditing ? (
              String(t.update)
            ) : (
              String(t.create)
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
