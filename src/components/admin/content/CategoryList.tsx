"use client";

import { useState } from "react";

import { ContentCategory } from "@/types/content";

interface CategoryListProps {
  categories: ContentCategory[];
  onEdit: (category: ContentCategory) => void;
  onDelete: (categoryId: string) => void;
}

export default function CategoryList({ categories, onEdit, onDelete }: CategoryListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesActive = showInactive || category.isActive;
    return matchesSearch && matchesActive;
  });

  const parentCategories = filteredCategories.filter(cat => !cat.parentId);
  const childCategories = filteredCategories.filter(cat => cat.parentId);

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">هیچ دسته‌بندی‌ای یافت نشد</h3>
        <p className="text-gray-300">برای شروع، دسته‌بندی جدیدی ایجاد کنید</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="جستجو در دسته‌بندی‌ها..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-white">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="w-4 h-4 text-primary-orange bg-white/5 border-white/10 rounded focus:ring-primary-orange focus:ring-2"
            />
            <span className="text-sm">نمایش غیرفعال‌ها</span>
          </label>
        </div>
      </div>

      {/* Parent Categories */}
      {parentCategories.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">دسته‌بندی‌های اصلی</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {parentCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={onEdit}
                onDelete={onDelete}
                isParent={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Child Categories */}
      {childCategories.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">زیرمجموعه‌ها</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {childCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={onEdit}
                onDelete={onDelete}
                isParent={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredCategories.length === 0 && categories.length > 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">نتیجه‌ای یافت نشد</h3>
          <p className="text-gray-300">لطفاً فیلترهای جستجو را تغییر دهید</p>
        </div>
      )}
    </div>
  );
}

interface CategoryCardProps {
  category: ContentCategory;
  onEdit: (category: ContentCategory) => void;
  onDelete: (categoryId: string) => void;
  isParent: boolean;
}

function CategoryCard({ category, onEdit, onDelete, isParent }: CategoryCardProps) {
  return (
    <div className={`glass rounded-2xl p-6 hover:bg-white/5 transition-all duration-200 ${
      !category.isActive ? 'opacity-60' : ''
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-gray-300 text-sm line-clamp-2 mb-3">
              {category.description}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end space-y-2">
          {!category.isActive && (
            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
              غیرفعال
            </span>
          )}
          {isParent && (
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
              اصلی
            </span>
          )}
        </div>
      </div>

      {/* Meta Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Slug:</span>
          <span className="text-white font-mono text-xs">{category.slug}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">ترتیب:</span>
          <span className="text-white">{category.sortOrder}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">مقالات:</span>
          <span className="text-white">{category._count.articles}</span>
        </div>
        
        {isParent && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">زیرمجموعه‌ها:</span>
            <span className="text-white">{category._count.children}</span>
          </div>
        )}
        
        {!isParent && category.parent && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">دسته‌بندی والد:</span>
            <span className="text-white">{category.parent.name}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(category)}
            className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors duration-200 text-sm"
          >
            ویرایش
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-200 text-sm"
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}
