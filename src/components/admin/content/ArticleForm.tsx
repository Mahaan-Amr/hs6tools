"use client";

import { useState, useEffect } from "react";
import { ArticleStatus } from "@prisma/client";
import ImageUpload from "@/components/admin/common/ImageUpload";

import { Article, ContentCategory } from "@/types/content";

interface ImageFile {
  id: string;
  name: string;
  originalName: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

interface ArticleFormProps {
  article?: Article | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ArticleForm({ article, onClose, onSaved }: ArticleFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    categoryId: "",
    featuredImage: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    status: "DRAFT" as ArticleStatus,
    isFeatured: false,
  });

  const [images, setImages] = useState<ImageFile[]>([]);
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!article;

  useEffect(() => {
    fetchCategories();
    if (article) {
      setFormData({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || "",
        content: article.content,
        categoryId: article.categoryId || "",
        featuredImage: article.featuredImage || "",
        metaTitle: article.metaTitle || "",
        metaDescription: article.metaDescription || "",
        metaKeywords: article.metaKeywords || "",
        status: article.status,
        isFeatured: article.isFeatured,
      });
      
      // Convert featuredImage to images array if it exists
      if (article.featuredImage) {
        setImages([{
          id: 'existing',
          name: 'featured-image',
          originalName: 'تصویر موجود',
          url: article.featuredImage,
          size: 0,
          type: 'image/jpeg',
          uploadedAt: new Date().toISOString()
        }]);
      }
    }
  }, [article]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/content/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\u0600-\u06FF\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from title
    if (field === "title" && typeof value === "string") {
      const slug = generateSlug(value);
      setFormData(prev => ({ ...prev, slug }));
    }
    
    // Auto-generate meta title from title
    if (field === "title" && typeof value === "string") {
      setFormData(prev => ({ ...prev, metaTitle: value }));
    }
    
    // Auto-generate meta description from excerpt
    if (field === "excerpt" && typeof value === "string") {
      setFormData(prev => ({ ...prev, metaDescription: value }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "عنوان مقاله الزامی است";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug الزامی است";
    }

    if (!formData.content.trim()) {
      newErrors.content = "محتوای مقاله الزامی است";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Get the featured image URL from the images array
      const featuredImage = images.length > 0 ? images[0].url : '';

      const url = isEditing 
        ? `/api/content/articles/${article!.id}`
        : "/api/content/articles";
      
      const method = isEditing ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          featuredImage,
          type: "article",
        }),
      });

      if (response.ok) {
        onSaved();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "خطا در ذخیره مقاله");
      }
    } catch {
      alert("خطا در اتصال به سرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isEditing ? "ویرایش مقاله" : "مقاله جدید"}
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
              <label className="block text-white font-medium mb-2">عنوان مقاله *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent ${
                  errors.title ? "border-red-500" : "border-white/10"
                }`}
                placeholder="عنوان مقاله را وارد کنید"
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-1">{errors.title}</p>
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
                placeholder="slug-article"
              />
              {errors.slug && (
                <p className="text-red-400 text-sm mt-1">{errors.slug}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">خلاصه مقاله</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => handleInputChange("excerpt", e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
              placeholder="خلاصه کوتاهی از مقاله"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">محتوای مقاله *</label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              rows={8}
              className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent ${
                errors.content ? "border-red-500" : "border-white/10"
              }`}
              placeholder="محتوای کامل مقاله را وارد کنید"
            />
            {errors.content && (
              <p className="text-red-400 text-sm mt-1">{errors.content}</p>
            )}
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-white font-medium mb-2">تصویر شاخص</label>
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              multiple={false}
              maxImages={1}
              label="تصویر شاخص مقاله"
              required={false}
              category="articles"
            />
            <p className="text-sm text-gray-400 mt-2">
              تصویر شاخص برای نمایش در لیست مقالات و صفحات اصلی استفاده می‌شود.
            </p>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-white font-medium mb-2">دسته‌بندی</label>
              <select
                value={formData.categoryId}
                onChange={(e) => handleInputChange("categoryId", e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
              >
                <option value="">بدون دسته‌بندی</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">وضعیت</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
              >
                <option value="DRAFT">پیش‌نویس</option>
                <option value="PUBLISHED">منتشر شده</option>
                <option value="ARCHIVED">آرشیو شده</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 text-white">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => handleInputChange("isFeatured", e.target.checked)}
                  className="w-4 h-4 text-primary-orange bg-white/5 border-white/10 rounded focus:ring-primary-orange focus:ring-2"
                />
                <span className="text-sm">مقاله ویژه</span>
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
