"use client";

import { useState } from "react";
import { AdminCategory, CreateCategoryData, UpdateCategoryData } from "@/types/admin";

interface CategoryFormProps {
  category?: AdminCategory;
  categories: AdminCategory[];
  onSave: (data: CreateCategoryData | UpdateCategoryData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CategoryForm({ 
  category, 
  categories, 
  onSave, 
  onCancel, 
  isLoading = false 
}: CategoryFormProps) {
  const isEditing = !!category;
  
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    image: category?.image || '',
    icon: category?.icon || '',
    parentId: category?.parentId || '',
    metaTitle: category?.metaTitle || '',
    metaDescription: category?.metaDescription || '',
    metaKeywords: category?.metaKeywords || '',
    isActive: category?.isActive ?? true,
    sortOrder: category?.sortOrder || 0,
    nameEn: category?.nameEn || '',
    nameAr: category?.nameAr || '',
    descriptionEn: category?.descriptionEn || '',
    descriptionAr: category?.descriptionAr || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showMultilingual, setShowMultilingual] = useState(false);

  // Generate slug from Persian name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleInputChange = (field: keyof CreateCategoryData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-generate slug from Persian name
    if (field === 'name' && !isEditing && typeof value === 'string') {
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'نام دسته‌بندی الزامی است';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'نامک الزامی است';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const submitData = isEditing 
      ? { ...formData, id: category.id } as UpdateCategoryData
      : formData;

    onSave(submitData);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information - Persian (Admin) */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">اطلاعات اصلی (فارسی)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                نام دسته‌بندی <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange ${
                  errors.name ? 'border-red-500' : 'border-white/20'
                }`}
                placeholder="نام دسته‌بندی"
              />
              {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                نامک <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange ${
                  errors.slug ? 'border-red-500' : 'border-white/20'
                }`}
                placeholder="نامک دسته‌بندی"
              />
              {errors.slug && <p className="mt-1 text-sm text-red-400">{errors.slug}</p>}
            </div>

            {/* Parent Category */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                دسته‌بندی والد
              </label>
              <select
                value={formData.parentId}
                onChange={(e) => handleInputChange('parentId', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
              >
                <option value="">بدون والد (دسته‌بندی اصلی)</option>
                {categories
                  .filter(cat => cat.id !== category?.id) // Prevent self-reference
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                ترتیب نمایش
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-white mb-2">
              توضیحات
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
              placeholder="توضیحات دسته‌بندی"
            />
          </div>
        </div>

        {/* Multilingual Section */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">ترجمه‌ها (برای مشتریان)</h3>
            <button
              type="button"
              onClick={() => setShowMultilingual(!showMultilingual)}
              className="flex items-center space-x-2 space-x-reverse text-primary-orange hover:text-orange-400 transition-colors"
            >
              <span>{showMultilingual ? 'مخفی کردن' : 'نمایش'}</span>
              <svg 
                className={`w-5 h-5 transition-transform ${showMultilingual ? 'rotate-180' : ''}`} 
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
              {/* English */}
              <div className="border border-white/10 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2 space-x-reverse">
                  <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-sm font-bold">EN</span>
                  <span>انگلیسی</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      نام (انگلیسی)
                    </label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(e) => handleInputChange('nameEn', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
                      placeholder="Category name in English"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      توضیحات (انگلیسی)
                    </label>
                    <textarea
                      value={formData.descriptionEn}
                      onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
                      placeholder="Category description in English"
                    />
                  </div>
                </div>
              </div>

              {/* Arabic */}
              <div className="border border-white/10 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2 space-x-reverse">
                  <span className="w-6 h-6 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-sm font-bold">AR</span>
                  <span>عربی</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      نام (عربی)
                    </label>
                    <input
                      type="text"
                      value={formData.nameAr}
                      onChange={(e) => handleInputChange('nameAr', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
                      placeholder="اسم الفئة بالعربية"
                      dir="rtl"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      توضیحات (عربی)
                    </label>
                    <textarea
                      value={formData.descriptionAr}
                      onChange={(e) => handleInputChange('descriptionAr', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
                      placeholder="وصف الفئة بالعربية"
                      dir="rtl"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Media & SEO */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">رسانه و SEO</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                تصویر
              </label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
                placeholder="URL تصویر"
              />
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                آیکون
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => handleInputChange('icon', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
                placeholder="نام آیکون یا کلاس CSS"
              />
            </div>

            {/* Meta Title */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                عنوان متا
              </label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
                placeholder="عنوان برای موتورهای جستجو"
              />
            </div>

            {/* Meta Description */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                توضیحات متا
              </label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
                placeholder="توضیحات برای موتورهای جستجو"
              />
            </div>
          </div>

          {/* Meta Keywords */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-white mb-2">
              کلمات کلیدی
            </label>
            <input
              type="text"
              value={formData.metaKeywords}
              onChange={(e) => handleInputChange('metaKeywords', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
              placeholder="کلمات کلیدی با کاما جدا کنید"
            />
          </div>
        </div>

        {/* Status */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">وضعیت</h3>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-3 space-x-reverse">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="w-4 h-4 text-primary-orange bg-white/10 border-white/20 rounded focus:ring-primary-orange focus:ring-2"
              />
              <span className="text-white">فعال</span>
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 space-x-reverse">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            disabled={isLoading}
          >
            انصراف
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-primary-orange hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>در حال ذخیره...</span>
              </div>
            ) : (
              isEditing ? 'بروزرسانی دسته‌بندی' : 'ایجاد دسته‌بندی'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
