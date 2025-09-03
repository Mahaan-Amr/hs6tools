"use client";

import { useState, useEffect, useCallback } from "react";
import { ContentCategory } from "@/types/content";
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

interface CategoryFormProps {
  category?: ContentCategory | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function CategoryForm({ category, onClose, onSaved }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    parentId: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    sortOrder: 0,
    isActive: true,
  });

  const [images, setImages] = useState<ImageFile[]>([]);
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!category;

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/content/categories?includeInactive=true");
      if (response.ok) {
        const data = await response.json();
        // Filter out the current category when editing to prevent self-reference
        const filteredCategories = isEditing 
          ? data.data.filter((cat: ContentCategory) => cat.id !== category!.id)
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
        parentId: category.parentId || "",
        metaTitle: category.metaTitle || "",
        metaDescription: category.metaDescription || "",
        metaKeywords: category.metaKeywords || "",
        sortOrder: category.sortOrder,
        isActive: category.isActive,
      });
      
      // Convert image to images array if it exists
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
    
    // Auto-generate slug from name
    if (field === "name" && typeof value === "string") {
      const slug = generateSlug(value);
      setFormData(prev => ({ ...prev, slug }));
    }
    
    // Auto-generate meta title from name
    if (field === "name" && typeof value === "string") {
      setFormData(prev => ({ ...prev, metaTitle: value }));
    }
    
    // Auto-generate meta description from description
    if (field === "description" && typeof value === "string") {
      setFormData(prev => ({ ...prev, metaDescription: value }));
    }

    // Clear error when user starts typing
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Get the category image URL from the images array
      const image = images.length > 0 ? images[0].url : '';

      const url = isEditing 
        ? `/api/content/categories/${category!.id}`
        : "/api/content/categories";
      
      const method = isEditing ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          image,
          type: "category",
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isEditing ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-medium mb-2">نام دسته‌بندی *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent ${
                  errors.name ? "border-red-500" : "border-white/10"
                }`}
                placeholder="نام دسته‌بندی را وارد کنید"
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Slug *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleInputChange("slug", e.target.value)}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent ${
                  errors.slug ? "border-red-500" : "border-white/10"
                }`}
                placeholder="category-slug"
              />
              {errors.slug && (
                <p className="text-red-400 text-sm mt-1">{errors.slug}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">توضیحات</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
              placeholder="توضیحات دسته‌بندی"
            />
          </div>

          {/* Category Image */}
          <div>
            <label className="block text-white font-medium mb-2">تصویر دسته‌بندی</label>
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              multiple={false}
              maxImages={1}
              label="تصویر دسته‌بندی"
              required={false}
              category="categories"
            />
            <p className="text-sm text-gray-400 mt-2">
              تصویر دسته‌بندی برای نمایش در صفحات دسته‌بندی و ناوبری استفاده می‌شود.
            </p>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-white font-medium mb-2">دسته‌بندی والد</label>
              <select
                value={formData.parentId}
                onChange={(e) => handleInputChange("parentId", e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
              >
                <option value="">بدون والد (دسته‌بندی اصلی)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">ترتیب</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => handleInputChange("sortOrder", parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 text-white">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange("isActive", e.target.checked)}
                  className="w-4 h-4 text-primary-orange bg-white/5 border-white/10 rounded focus:ring-primary-orange focus:ring-2"
                />
                <span className="text-sm">فعال</span>
              </label>
            </div>
          </div>

          {/* SEO Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-medium mb-2">عنوان SEO</label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => handleInputChange("metaTitle", e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                placeholder="عنوان برای موتورهای جستجو"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">توضیحات SEO</label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) => handleInputChange("metaDescription", e.target.value)}
                rows={2}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                placeholder="توضیحات برای موتورهای جستجو"
              />
            </div>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">کلمات کلیدی SEO</label>
            <input
              type="text"
              value={formData.metaKeywords}
              onChange={(e) => handleInputChange("metaKeywords", e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
              placeholder="کلمات کلیدی با کاما جدا کنید"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-white/80 hover:text-white transition-colors duration-200"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-primary-orange text-white rounded-xl hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{isEditing ? "بروزرسانی" : "ایجاد"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
