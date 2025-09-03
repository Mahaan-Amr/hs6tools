"use client";

import { useState, useEffect } from "react";
import { ContentCategory } from "@/types/content";
import CategoryForm from "./CategoryForm";
import CategoryList from "./CategoryList";

export default function CategoriesTab() {
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ContentCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/content/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch {
      console.error("Failed to fetch categories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEditCategory = (category: ContentCategory) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleCategorySaved = () => {
    fetchCategories();
    handleFormClose();
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("آیا از حذف این دسته‌بندی اطمینان دارید؟")) return;
    
    try {
      const response = await fetch(`/api/content/categories/${id}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        setCategories(categories.filter(category => category.id !== id));
      } else {
        const errorData = await response.json();
        alert(errorData.error || "خطا در حذف دسته‌بندی");
      }
    } catch {
      alert("خطا در اتصال به سرور");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">دسته‌بندی‌ها</h2>
          <p className="text-gray-300">
            {categories.length} دسته‌بندی موجود است
          </p>
        </div>
        <button
          onClick={handleCreateCategory}
          className="px-6 py-3 bg-primary-orange text-white rounded-xl hover:bg-orange-600 transition-colors duration-200 flex items-center space-x-2"
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
        onEdit={handleEditCategory}
        onDelete={deleteCategory}
      />

      {/* Category Form Modal */}
      {showForm && (
        <CategoryForm
          category={editingCategory}
          onClose={handleFormClose}
          onSaved={handleCategorySaved}
        />
      )}
    </div>
  );
}
