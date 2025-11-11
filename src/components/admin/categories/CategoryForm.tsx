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
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">اطلاعات اصلی (فارسی)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                نام دسته‌بندی <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                  errors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="نام دسته‌بندی"
              />
              {errors.name && <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{errors.name}</p>}
            </div>

            {/* Slug */}
            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                نامک <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                  errors.slug ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="نامک دسته‌بندی"
              />
              {errors.slug && <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{errors.slug}</p>}
            </div>

            {/* Parent Category */}
            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                دسته‌بندی والد
              </label>
              <select
                value={formData.parentId}
                onChange={(e) => handleInputChange('parentId', e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
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
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                ترتیب نمایش
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
              توضیحات
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all resize-none"
              placeholder="توضیحات دسته‌بندی"
            />
          </div>
        </div>

        {/* Multilingual Section */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ترجمه‌ها (برای مشتریان)</h3>
            <button
              type="button"
              onClick={() => setShowMultilingual(!showMultilingual)}
              className="flex items-center space-x-2 space-x-reverse text-primary-orange hover:text-orange-600 transition-colors font-semibold"
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
              <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2 space-x-reverse">
                  <span className="w-6 h-6 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-bold">EN</span>
                  <span>انگلیسی</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                      نام (انگلیسی)
                    </label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(e) => handleInputChange('nameEn', e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                      placeholder="Category name in English"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                      توضیحات (انگلیسی)
                    </label>
                    <textarea
                      value={formData.descriptionEn}
                      onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all resize-none"
                      placeholder="Category description in English"
                    />
                  </div>
                </div>
              </div>

              {/* Arabic */}
              <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2 space-x-reverse">
                  <span className="w-6 h-6 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-sm font-bold">AR</span>
                  <span>عربی</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                      نام (عربی)
                    </label>
                    <input
                      type="text"
                      value={formData.nameAr}
                      onChange={(e) => handleInputChange('nameAr', e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                      placeholder="اسم الفئة بالعربية"
                      dir="rtl"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                      توضیحات (عربی)
                    </label>
                    <textarea
                      value={formData.descriptionAr}
                      onChange={(e) => handleInputChange('descriptionAr', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all resize-none"
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
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">رسانه و SEO</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image */}
            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                تصویر
              </label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                placeholder="URL تصویر"
              />
            </div>

            {/* Icon */}
            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                آیکون
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => handleInputChange('icon', e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                placeholder="نام آیکون یا کلاس CSS"
              />
            </div>

            {/* Meta Title */}
            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                عنوان متا
              </label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                placeholder="عنوان برای موتورهای جستجو"
              />
            </div>

            {/* Meta Description */}
            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                توضیحات متا
              </label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all resize-none"
                placeholder="توضیحات برای موتورهای جستجو"
              />
            </div>
          </div>

          {/* Meta Keywords */}
          <div className="mt-6">
            <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
              کلمات کلیدی
            </label>
            <input
              type="text"
              value={formData.metaKeywords}
              onChange={(e) => handleInputChange('metaKeywords', e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
              placeholder="کلمات کلیدی با کاما جدا کنید"
            />
          </div>
        </div>

        {/* Status */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">وضعیت</h3>
          
          <div className="space-y-4">
            <div className="flex items-center pt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="w-5 h-5 text-primary-orange bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-orange focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="isActive" className="mr-3 text-gray-900 dark:text-white font-semibold cursor-pointer">
                فعال
              </label>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            disabled={isLoading}
          >
            انصراف
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-primary-orange text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-orange/30"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>در حال ذخیره...</span>
              </div>
            ) : (
              isEditing ? 'به‌روزرسانی' : 'ایجاد'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
