"use client";

import { useState } from "react";
import Image from "next/image";
import { AdminCategory } from "@/types/admin";
import { formatDate } from "@/utils/format";

interface CategoryListProps {
  categories: AdminCategory[];
  onEdit: (category: AdminCategory) => void;
  onDelete: (id: string) => void;
  onView: (category: AdminCategory) => void;
  isLoading?: boolean;
}

export default function CategoryList({ 
  categories, 
  onEdit, 
  onDelete, 
  onView, 
  isLoading = false 
}: CategoryListProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("sortOrder");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showInactive, setShowInactive] = useState(false);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map(c => c.id));
    }
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleBulkAction = (action: string) => {
    if (selectedCategories.length === 0) return;
    
    switch (action) {
      case "delete":
        if (confirm(`آیا از حذف ${selectedCategories.length} دسته‌بندی اطمینان دارید؟`)) {
          selectedCategories.forEach(id => onDelete(id));
          setSelectedCategories([]);
        }
        break;
      case "activate":
        // TODO: Implement bulk activate
        break;
      case "deactivate":
        // TODO: Implement bulk deactivate
        break;
    }
  };

  const getStatusBadge = (category: AdminCategory) => {
    if (!category.isActive) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">
          غیرفعال
        </span>
      );
    }
    
    return (
      <span className="px-2 py-1 text-xs font-medium bg-primary-orange/20 text-primary-orange rounded-full">
        فعال
      </span>
    );
  };

  const getHierarchyLevel = (category: AdminCategory): number => {
    let level = 0;
    let current = category;
    while (current.parentId) {
      level++;
      current = categories.find(c => c.id === current.parentId)!;
      if (!current) break;
    }
    return level;
  };

  const getMultilingualInfo = (category: AdminCategory) => {
    const hasTranslations = category.nameEn || category.nameAr || category.descriptionEn || category.descriptionAr;
    
    if (!hasTranslations) {
      return (
        <span className="text-xs text-gray-400">فقط فارسی</span>
      );
    }

    const translations = [];
    if (category.nameEn) translations.push("EN");
    if (category.nameAr) translations.push("AR");
    
    return (
      <div className="flex items-center space-x-1 space-x-reverse">
        {translations.map(lang => (
          <span key={lang} className="px-1 py-0.5 text-xs bg-primary-orange/20 text-primary-orange rounded">
            {lang}
          </span>
        ))}
      </div>
    );
  };

  // Filter categories based on active status
  const filteredCategories = showInactive 
    ? categories 
    : categories.filter(cat => cat.isActive);

  // Sort categories
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (sortBy === "name") {
      return sortOrder === "asc" 
        ? a.name.localeCompare(b.name, 'fa')
        : b.name.localeCompare(a.name, 'fa');
    }
    if (sortBy === "slug") {
      return sortOrder === "asc" 
        ? a.slug.localeCompare(b.slug)
        : b.slug.localeCompare(a.slug);
    }
    if (sortBy === "sortOrder") {
      return sortOrder === "asc" ? a.sortOrder - b.sortOrder : b.sortOrder - a.sortOrder;
    }
    if (sortBy === "createdAt") {
      return sortOrder === "asc" 
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-white/5 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">دسته‌بندی‌ای یافت نشد</h3>
        <p className="text-gray-400">هنوز دسته‌بندی‌ای به فروشگاه اضافه نشده است.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 space-x-reverse">
          <label className="flex items-center space-x-2 text-white">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="w-4 h-4 text-primary-orange bg-white/10 border-white/20 rounded focus:ring-primary-orange focus:ring-2"
            />
            <span className="text-sm">نمایش غیرفعال‌ها</span>
          </label>
        </div>
        <div className="text-sm text-gray-400">
          {filteredCategories.length} دسته‌بندی از {categories.length}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCategories.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
          <span className="text-white">
            {selectedCategories.length} دسته‌بندی انتخاب شده
          </span>
          <div className="flex items-center space-x-3 space-x-reverse">
            <button
              onClick={() => handleBulkAction("activate")}
              className="px-3 py-1 text-sm bg-primary-orange/20 text-primary-orange rounded hover:bg-primary-orange/30 transition-colors"
            >
              فعال‌سازی
            </button>
            <button
              onClick={() => handleBulkAction("deactivate")}
              className="px-3 py-1 text-sm bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30 transition-colors"
            >
              غیرفعال‌سازی
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              className="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
            >
              حذف
            </button>
          </div>
        </div>
      )}

      {/* Categories Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-right p-4">
                <input
                  type="checkbox"
                  checked={selectedCategories.length === filteredCategories.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-primary-orange bg-white/10 border-white/20 rounded focus:ring-primary-orange focus:ring-2"
                />
              </th>
              <th className="text-right p-4">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center space-x-2 space-x-reverse text-white/80 hover:text-white transition-colors"
                >
                  <span>نام دسته‌بندی</span>
                  {sortBy === "name" && (
                    <svg className={`w-4 h-4 transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  )}
                </button>
              </th>
              <th className="text-right p-4">
                <button
                  onClick={() => handleSort("slug")}
                  className="flex items-center space-x-2 space-x-reverse text-white/80 hover:text-white transition-colors"
                >
                  <span>نامک</span>
                  {sortBy === "slug" && (
                    <svg className={`w-4 h-4 transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  )}
                </button>
              </th>
              <th className="text-right p-4">سطح</th>
              <th className="text-right p-4">زبان‌ها</th>
              <th className="text-right p-4">محصولات</th>
              <th className="text-right p-4">وضعیت</th>
              <th className="text-right p-4">
                <button
                  onClick={() => handleSort("sortOrder")}
                  className="flex items-center space-x-2 space-x-reverse text-white/80 hover:text-white transition-colors"
                >
                  <span>ترتیب</span>
                  {sortBy === "sortOrder" && (
                    <svg className={`w-4 h-4 transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  )}
                </button>
              </th>
              <th className="text-right p-4">
                <button
                  onClick={() => handleSort("createdAt")}
                  className="flex items-center space-x-2 space-x-reverse text-white/80 hover:text-white transition-colors"
                >
                  <span>تاریخ ایجاد</span>
                  {sortBy === "createdAt" && (
                    <svg className={`w-4 h-4 transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  )}
                </button>
              </th>
              <th className="text-right p-4">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {sortedCategories.map((category) => {
              const hierarchyLevel = getHierarchyLevel(category);
              return (
                <tr key={category.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleSelectCategory(category.id)}
                      className="w-4 h-4 text-primary-orange bg-white/10 border-white/20 rounded focus:ring-primary-orange focus:ring-2"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      {category.image && (
                        <Image
                          src={category.image}
                          alt={category.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <div className="font-medium text-white" style={{ paddingRight: `${hierarchyLevel * 20}px` }}>
                          {hierarchyLevel > 0 && (
                            <span className="text-gray-400 mr-2">└─</span>
                          )}
                          {category.name}
                        </div>
                        {category.description && (
                          <div className="text-sm text-gray-400 line-clamp-1">
                            {category.description}
                          </div>
                        )}
                        {category.parent && (
                          <div className="text-xs text-gray-500">
                            والد: {category.parent.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-300 font-mono">{category.slug}</td>
                  <td className="p-4">
                    <span className="text-white">{hierarchyLevel}</span>
                  </td>
                  <td className="p-4">
                    {getMultilingualInfo(category)}
                  </td>
                  <td className="p-4">
                    <div className="text-white">{category._count.products}</div>
                    {category._count.children > 0 && (
                      <div className="text-xs text-gray-400">
                        +{category._count.children} زیرمجموعه
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(category)}
                  </td>
                  <td className="p-4 text-white">{category.sortOrder}</td>
                  <td className="p-4 text-sm text-gray-300">
                    {formatDate(category.createdAt)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => onView(category)}
                        className="p-2 text-primary-orange hover:text-orange-300 hover:bg-primary-orange/20 rounded-lg transition-colors"
                        title="مشاهده"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onEdit(category)}
                        className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 rounded-lg transition-colors"
                        title="ویرایش"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(category.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
