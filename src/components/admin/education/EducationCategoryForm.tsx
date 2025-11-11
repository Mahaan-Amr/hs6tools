"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { EducationCategory } from "@/types/education";
import ImageUpload from "@/components/admin/common/ImageUpload";

interface ImageFile {
  id: string;
  name: string;
  originalName: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

interface EducationCategoryFormProps {
  category?: EducationCategory | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function EducationCategoryForm({ category, onClose, onSaved }: EducationCategoryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    icon: "",
    parentId: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    sortOrder: 0,
    isActive: true,
  });

  const [images, setImages] = useState<ImageFile[]>([]);
  const [categories, setCategories] = useState<EducationCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!category;

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/education/categories");
      if (response.ok) {
        const data = await response.json();
        const filteredCategories = isEditing 
          ? data.data.filter((cat: EducationCategory) => cat.id !== category!.id)
          : data.data;
        setCategories(filteredCategories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, [isEditing, category]);

  useEffect(() => {
    fetchCategories();
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        image: category.image || "",
        icon: category.icon || "",
        parentId: category.parentId || "",
        metaTitle: category.metaTitle || "",
        metaDescription: category.metaDescription || "",
        metaKeywords: category.metaKeywords || "",
        sortOrder: category.sortOrder,
        isActive: category.isActive,
      });
      
      if (category.image) {
        setImages([{
          id: 'existing',
          name: 'category-image',
          originalName: 'تصویر موجود',
          url: category.image,
          size: 0,
          type: 'image/jpeg',
          uploadedAt: new Date().toISOString()
        }]);
      }
    }
  }, [category, fetchCategories]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\u0600-\u06FF\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === "name" && typeof value === "string") {
      const slug = generateSlug(value);
      setFormData(prev => ({ ...prev, slug }));
    }
    
    if (field === "name" && typeof value === "string") {
      setFormData(prev => ({ ...prev, metaTitle: value }));
    }
    
    if (field === "description" && typeof value === "string") {
      setFormData(prev => ({ ...prev, metaDescription: value }));
    }

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "نام دسته‌بندی الزامی است";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug الزامی است";
    }

    if (formData.parentId === category?.id) {
      newErrors.parentId = "دسته‌بندی نمی‌تواند والد خودش باشد";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const imageUrl = images.length > 0 ? images[0].url : '';

      const url = isEditing 
        ? `/api/education/categories/${category!.id}`
        : "/api/education/categories";
      
      const method = isEditing ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
          parentId: formData.parentId || null,
        }),
      });

      if (response.ok) {
        onSaved();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "خطا در ذخیره دسته‌بندی");
      }
    } catch {
      alert("خطا در اتصال به سرور");
    } finally {
      setLoading(false);
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (true) { // Modal is always shown when component is rendered
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, []);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Use portal to render modal at document body level
  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleBackdropClick}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
      }}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxHeight: '90vh',
          margin: 'auto'
        }}
      >
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditing ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">اطلاعات پایه</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">نام دسته‌بندی *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                    errors.name ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="نام دسته‌بندی"
                />
                {errors.name && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                    errors.slug ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="category-slug"
                />
                {errors.slug && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{errors.slug}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">توضیحات</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all resize-none"
                placeholder="توضیحات دسته‌بندی"
              />
            </div>
          </div>

          {/* Additional Settings */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">تنظیمات اضافی</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">دسته‌بندی والد</label>
                <select
                  value={formData.parentId}
                  onChange={(e) => handleInputChange("parentId", e.target.value)}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                    errors.parentId ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <option value="">بدون والد</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.parentId && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{errors.parentId}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">آیکون (Emoji یا کد)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => handleInputChange("icon", e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                  placeholder="📚 یا کد آیکون"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">تصویر دسته‌بندی</label>
              <ImageUpload
                images={images}
                onImagesChange={setImages}
                maxImages={1}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">ترتیب نمایش</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => handleInputChange("sortOrder", parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center pt-8">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange("isActive", e.target.checked)}
                  className="w-5 h-5 text-primary-orange bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-orange focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="isActive" className="mr-3 text-gray-900 dark:text-white font-semibold cursor-pointer">
                  فعال
                </label>
              </div>
            </div>
          </div>

          {/* SEO Fields */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">تنظیمات SEO</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">Meta Title</label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => handleInputChange("metaTitle", e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                  placeholder="عنوان SEO"
                />
              </div>

              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">Meta Description</label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => handleInputChange("metaDescription", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all resize-none"
                  placeholder="توضیحات SEO"
                />
              </div>

              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">Meta Keywords</label>
                <input
                  type="text"
                  value={formData.metaKeywords}
                  onChange={(e) => handleInputChange("metaKeywords", e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                  placeholder="کلمات کلیدی (با کاما جدا کنید)"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-primary-orange text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-orange/30"
            >
              {loading ? "در حال ذخیره..." : isEditing ? "به‌روزرسانی" : "ایجاد"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Render modal using portal to document.body
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}

