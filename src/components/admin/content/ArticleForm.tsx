"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ArticleStatus } from "@prisma/client";
import ImageUpload from "@/components/admin/common/ImageUpload";
import { getMessages, Messages } from "@/lib/i18n";

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
  locale: string;
}

export default function ArticleForm({ article, onClose, onSaved, locale }: ArticleFormProps) {
  const [messages, setMessages] = useState<Messages | null>(null);
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
    const loadMessages = async () => {
      const msgs = await getMessages(locale);
      setMessages(msgs);
    };
    loadMessages();
  }, [locale]);

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

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

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
    const validation = (messages?.admin as Record<string, unknown> | undefined)?.articleForm as Record<string, string> | undefined;

    if (!formData.title.trim()) {
      newErrors.title = validation?.titleRequired 
        ? String(validation.titleRequired) 
        : "Article title is required";
    } else if (formData.title.trim().length > 200) {
      newErrors.title = validation?.titleMaxLength 
        ? String(validation.titleMaxLength) 
        : "Article title must be at most 200 characters";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = validation?.slugRequired 
        ? String(validation.slugRequired) 
        : "Slug is required";
    } else if (formData.slug.trim().length > 100) {
      newErrors.slug = validation?.slugMaxLength 
        ? String(validation.slugMaxLength) 
        : "Slug must be at most 100 characters";
    }

    if (!formData.content.trim()) {
      newErrors.content = validation?.contentRequired 
        ? String(validation.contentRequired) 
        : "Article content is required";
    } else if (formData.content.trim().length < 50) {
      newErrors.content = validation?.contentMinLength 
        ? String(validation.contentMinLength) 
        : "Article content must be at least 50 characters";
    }

    if (formData.excerpt && formData.excerpt.trim().length > 500) {
      newErrors.excerpt = validation?.excerptMaxLength 
        ? String(validation.excerptMaxLength) 
        : "Excerpt must be at most 500 characters";
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

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxHeight: '90vh',
          margin: 'auto'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditing ? "ویرایش مقاله" : "مقاله جدید"}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">اطلاعات پایه</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">عنوان مقاله *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  maxLength={200}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                    errors.title ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder={((messages?.admin as Record<string, unknown> | undefined)?.articleForm as Record<string, string> | undefined)?.titleRequired || "Article Title"}
                />
                {errors.title && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  maxLength={100}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                    errors.slug ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="slug-article"
                />
                {errors.slug && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{errors.slug}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">خلاصه مقاله</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => handleInputChange("excerpt", e.target.value)}
                rows={3}
                maxLength={500}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all resize-none ${
                  errors.excerpt ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder={((messages?.admin as Record<string, unknown> | undefined)?.articleForm as Record<string, string> | undefined)?.excerptMaxLength || "Article Excerpt"}
              />
              {errors.excerpt && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{errors.excerpt}</p>
              )}
            </div>
          </div>

          {/* Article Content */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">محتوای مقاله</h3>
            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">محتوای مقاله *</label>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                rows={12}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all resize-none font-mono text-sm ${
                  errors.content ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="محتوای کامل مقاله را وارد کنید..."
              />
              {errors.content && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{errors.content}</p>
              )}
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">تصویر شاخص</h3>
            <div>
              <ImageUpload
                images={images}
                onImagesChange={setImages}
                multiple={false}
                maxImages={1}
                label="تصویر شاخص مقاله"
                required={false}
                category="articles"
              />
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-3">
                تصویر شاخص برای نمایش در لیست مقالات و صفحات اصلی استفاده می‌شود.
              </p>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">تنظیمات اضافی</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">دسته‌بندی</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange("categoryId", e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                >
                  <option value="">بدون دسته‌بندی</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">وضعیت</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                >
                  <option value="DRAFT">پیش‌نویس</option>
                  <option value="PUBLISHED">منتشر شده</option>
                  <option value="ARCHIVED">آرشیو شده</option>
                </select>
              </div>

              <div className="flex items-center pt-8">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => handleInputChange("isFeatured", e.target.checked)}
                  className="w-5 h-5 text-primary-orange bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-orange focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="isFeatured" className="mr-3 text-gray-900 dark:text-white font-semibold cursor-pointer">
                  مقاله ویژه
                </label>
              </div>
            </div>
          </div>

          {/* SEO Settings */}
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

  if (typeof window === 'undefined') {
    return null;
  }

  return createPortal(modalContent, document.body);
}
