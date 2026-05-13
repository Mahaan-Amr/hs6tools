"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import CategoryFallbackIcon from "@/components/shared/CategoryFallbackIcon";
import IconRenderer from "@/components/shared/IconRenderer";
import { AdminCategory, CreateCategoryData, UpdateCategoryData } from "@/types/admin";
import CategoryForm from "./CategoryForm";
import CategoryList from "./CategoryList";

export default function CategoriesTab() {
  const params = useParams();
  const locale = (params?.locale as string) || "fa";
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [viewingCategory, setViewingCategory] = useState<AdminCategory | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/categories?includeProducts=true");
      if (!response.ok) {
        console.error("Failed to fetch categories");
        return;
      }

      const data = await response.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateNew = () => {
    setEditingCategory(null);
    setViewingCategory(null);
    setShowForm(true);
  };

  const handleEdit = (category: AdminCategory) => {
    setEditingCategory(category);
    setViewingCategory(null);
    setShowForm(true);
  };

  const handleView = (category: AdminCategory) => {
    setViewingCategory(category);
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleSave = async (data: CreateCategoryData | UpdateCategoryData) => {
    try {
      setIsSaving(true);

      const isEditingItem = "id" in data;
      const url = isEditingItem ? `/api/categories/${data.id}` : "/api/categories";
      const method = isEditingItem ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`خطا: ${errorData.error || "عملیات ناموفق بود"}`);
        return;
      }

      const result = await response.json();

      if (isEditingItem) {
        setCategories((prev) =>
          prev.map((cat) => (cat.id === data.id ? { ...cat, ...result.data } : cat))
        );
      } else {
        setCategories((prev) => [...prev, result.data]);
      }

      alert(isEditingItem ? "دسته‌بندی با موفقیت بروزرسانی شد" : "دسته‌بندی با موفقیت ایجاد شد");
      setShowForm(false);
      setEditingCategory(null);
      await fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("خطا در ذخیره‌سازی دسته‌بندی");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("آیا از حذف این دسته‌بندی اطمینان دارید؟")) return;

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`خطا: ${errorData.error || "عملیات حذف ناموفق بود"}`);
        return;
      }

      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
      alert("دسته‌بندی با موفقیت حذف شد");
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("خطا در حذف دسته‌بندی");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    setViewingCategory(null);
  };

  const handleBackToList = () => {
    setShowForm(false);
    setEditingCategory(null);
    setViewingCategory(null);
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={handleBackToList}
              className="rounded-lg p-2 text-white transition-colors hover:bg-white/10 hover:text-primary-orange"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-white">
              {editingCategory ? "ویرایش دسته‌بندی" : "ایجاد دسته‌بندی جدید"}
            </h1>
          </div>
        </div>

        <CategoryForm
          category={editingCategory || undefined}
          categories={categories}
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={isSaving}
          locale={locale}
        />
      </div>
    );
  }

  if (viewingCategory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={handleBackToList}
              className="rounded-lg p-2 text-white transition-colors hover:bg-white/10 hover:text-primary-orange"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-white">مشاهده دسته‌بندی</h1>
          </div>
          <button
            onClick={() => handleEdit(viewingCategory)}
            className="rounded-lg bg-primary-orange px-4 py-2 text-white transition-colors hover:bg-orange-600"
          >
            ویرایش
          </button>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl bg-white/5">
                {viewingCategory.image ? (
                  <div className="relative h-full w-full">
                    <Image
                      src={viewingCategory.image}
                      alt={viewingCategory.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : viewingCategory.icon ? (
                  <IconRenderer
                    name={viewingCategory.icon}
                    className="h-14 w-14 text-white"
                    fallback={<CategoryFallbackIcon className="h-14 w-14 text-white/70" />}
                  />
                ) : (
                  <CategoryFallbackIcon className="h-14 w-14 text-white/70" />
                )}
              </div>

              <h3 className="text-xl font-bold text-white">اطلاعات اصلی</h3>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-400">نام</label>
                <p className="text-lg text-white">{viewingCategory.name}</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-400">نامک</label>
                <p className="font-mono text-white">{viewingCategory.slug}</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-400">توضیحات</label>
                <p className="text-white">{viewingCategory.description || "بدون توضیحات"}</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-400">آیکون ذخیره‌شده</label>
                <p className="text-white">{viewingCategory.icon || "بدون آیکون"}</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-400">وضعیت</label>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    viewingCategory.isActive
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {viewingCategory.isActive ? "فعال" : "غیرفعال"}
                </span>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-400">ترتیب نمایش</label>
                <p className="text-white">{viewingCategory.sortOrder}</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">ترجمه‌ها</h3>

              <div className="rounded-lg border border-white/10 p-4">
                <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-400">
                    EN
                  </span>
                  <span>انگلیسی</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-400">نام</label>
                    <p className="text-white">{viewingCategory.nameEn || "ترجمه نشده"}</p>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-400">توضیحات</label>
                    <p className="text-white">{viewingCategory.descriptionEn || "ترجمه نشده"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 p-4">
                <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-sm font-bold text-green-400">
                    AR
                  </span>
                  <span>عربی</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-400">نام</label>
                    <p className="text-white" dir="rtl">
                      {viewingCategory.nameAr || "ترجمه نشده"}
                    </p>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-400">توضیحات</label>
                    <p className="text-white" dir="rtl">
                      {viewingCategory.descriptionAr || "ترجمه نشده"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <h3 className="mb-4 text-lg font-semibold text-white">آمار</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-lg bg-white/5 p-4 text-center">
                <div className="text-2xl font-bold text-primary-orange">
                  {viewingCategory._count.products}
                </div>
                <div className="text-sm text-gray-400">محصول</div>
              </div>
              <div className="rounded-lg bg-white/5 p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {viewingCategory._count.children}
                </div>
                <div className="text-sm text-gray-400">زیرمجموعه</div>
              </div>
              <div className="rounded-lg bg-white/5 p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {new Date(viewingCategory.createdAt).toLocaleDateString("fa-IR")}
                </div>
                <div className="text-sm text-gray-400">تاریخ ایجاد</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">مدیریت دسته‌بندی‌ها</h1>
          <p className="mt-1 text-gray-400">مدیریت دسته‌بندی‌های محصولات و ترجمه‌ها</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 rounded-lg bg-primary-orange px-6 py-3 text-white transition-colors hover:bg-orange-600"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>دسته‌بندی جدید</span>
        </button>
      </div>

      <CategoryList
        categories={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        isLoading={isLoading}
      />
    </div>
  );
}
