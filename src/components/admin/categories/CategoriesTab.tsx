"use client";

import { useState, useEffect } from "react";
import { AdminCategory, CreateCategoryData, UpdateCategoryData } from "@/types/admin";
import CategoryList from "./CategoryList";
import CategoryForm from "./CategoryForm";

export default function CategoriesTab() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [viewingCategory, setViewingCategory] = useState<AdminCategory | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/categories?includeProducts=true");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      } else {
        console.error("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle create new category
  const handleCreateNew = () => {
    setEditingCategory(null);
    setViewingCategory(null);
    setShowForm(true);
  };

  // Handle edit category
  const handleEdit = (category: AdminCategory) => {
    setEditingCategory(category);
    setViewingCategory(null);
    setShowForm(true);
  };

  // Handle view category
  const handleView = (category: AdminCategory) => {
    setViewingCategory(category);
    setEditingCategory(null);
    setShowForm(false);
  };

  // Handle save category (create or update)
  const handleSave = async (data: CreateCategoryData | UpdateCategoryData) => {
    try {
      setIsSaving(true);
      
      const isEditing = 'id' in data;
      const url = isEditing ? `/api/categories/${data.id}` : "/api/categories";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (isEditing) {
          // Update existing category
          setCategories(prev => 
            prev.map(cat => 
              cat.id === data.id ? { ...cat, ...data } : cat
            )
          );
        } else {
          // Add new category
          setCategories(prev => [...prev, result.data]);
        }

        // Show success message
        alert(isEditing ? "دسته‌بندی با موفقیت بروزرسانی شد" : "دسته‌بندی با موفقیت ایجاد شد");
        
        // Close form and refresh list
        setShowForm(false);
        setEditingCategory(null);
        fetchCategories();
      } else {
        const errorData = await response.json();
        alert(`خطا: ${errorData.error || "عملیات ناموفق بود"}`);
      }
    } catch (error) {
      console.error("Error saving category:", error);
      alert("خطا در ذخیره‌سازی دسته‌بندی");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete category
  const handleDelete = async (categoryId: string) => {
    if (!confirm("آیا از حذف این دسته‌بندی اطمینان دارید؟")) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove from local state
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
        alert("دسته‌بندی با موفقیت حذف شد");
      } else {
        const errorData = await response.json();
        alert(`خطا: ${errorData.error || "عملیات حذف ناموفق بود"}`);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("خطا در حذف دسته‌بندی");
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    setViewingCategory(null);
  };

  // Handle back to list
  const handleBackToList = () => {
    setShowForm(false);
    setEditingCategory(null);
    setViewingCategory(null);
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={handleBackToList}
              className="p-2 text-white hover:text-primary-orange hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-white">
              {editingCategory ? 'ویرایش دسته‌بندی' : 'ایجاد دسته‌بندی جدید'}
            </h1>
          </div>
        </div>

        {/* Form */}
        <CategoryForm
          category={editingCategory || undefined}
          categories={categories}
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={isSaving}
        />
      </div>
    );
  }

  if (viewingCategory) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={handleBackToList}
              className="p-2 text-white hover:text-primary-orange hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-white">مشاهده دسته‌بندی</h1>
          </div>
          <button
            onClick={() => handleEdit(viewingCategory)}
            className="px-4 py-2 bg-primary-orange hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            ویرایش
          </button>
        </div>

        {/* Category Details */}
        <div className="glass rounded-2xl p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Info */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">اطلاعات اصلی</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">نام</label>
                <p className="text-white text-lg">{viewingCategory.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">نامک</label>
                <p className="text-white font-mono">{viewingCategory.slug}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">توضیحات</label>
                <p className="text-white">{viewingCategory.description || 'بدون توضیحات'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">وضعیت</label>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  viewingCategory.isActive 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {viewingCategory.isActive ? 'فعال' : 'غیرفعال'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">ترتیب نمایش</label>
                <p className="text-white">{viewingCategory.sortOrder}</p>
              </div>
            </div>

            {/* Multilingual Info */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">ترجمه‌ها</h3>
              
              {/* English */}
              <div className="border border-white/10 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2 space-x-reverse">
                  <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-sm font-bold">EN</span>
                  <span>انگلیسی</span>
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">نام</label>
                    <p className="text-white">{viewingCategory.nameEn || 'ترجمه نشده'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">توضیحات</label>
                    <p className="text-white">{viewingCategory.descriptionEn || 'ترجمه نشده'}</p>
                  </div>
                </div>
              </div>

              {/* Arabic */}
              <div className="border border-white/10 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2 space-x-reverse">
                  <span className="w-6 h-6 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-sm font-bold">AR</span>
                  <span>عربی</span>
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">نام</label>
                    <p className="text-white" dir="rtl">{viewingCategory.nameAr || 'ترجمه نشده'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">توضیحات</label>
                    <p className="text-white" dir="rtl">{viewingCategory.descriptionAr || 'ترجمه نشده'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">آمار</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-primary-orange">{viewingCategory._count.products}</div>
                <div className="text-sm text-gray-400">محصول</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{viewingCategory._count.children}</div>
                <div className="text-sm text-gray-400">زیرمجموعه</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-green-400">
                  {new Date(viewingCategory.createdAt).toLocaleDateString('fa-IR')}
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">مدیریت دسته‌بندی‌ها</h1>
          <p className="text-gray-400 mt-1">مدیریت دسته‌بندی‌های محصولات و ترجمه‌ها</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-6 py-3 bg-primary-orange hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center space-x-2 space-x-reverse"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>دسته‌بندی جدید</span>
        </button>
      </div>

      {/* Categories List */}
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
