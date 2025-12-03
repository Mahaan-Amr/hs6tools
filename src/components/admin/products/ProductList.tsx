"use client";

import { useState } from "react";
import Image from "next/image";
import { AdminProduct } from "@/types/admin";
import { formatPrice } from "@/utils/format";

interface ProductListProps {
  products: AdminProduct[];
  onEdit: (product: AdminProduct) => void;
  onDelete: (id: string) => void;
  onView: (product: AdminProduct) => void;
  isLoading?: boolean;
}

export default function ProductList({ 
  products, 
  onEdit, 
  onDelete, 
  onView, 
  isLoading = false 
}: ProductListProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBulkAction = async (action: string) => {
    if (selectedProducts.length === 0) return;
    
    switch (action) {
      case "delete":
        if (confirm(`آیا از حذف ${selectedProducts.length} محصول اطمینان دارید؟`)) {
          selectedProducts.forEach(id => onDelete(id));
          setSelectedProducts([]);
        }
        break;
      case "activate":
        if (confirm(`آیا از فعال کردن ${selectedProducts.length} محصول اطمینان دارید؟`)) {
          try {
            const response = await fetch('/api/products/bulk', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids: selectedProducts, action: 'activate' })
            });
            const result = await response.json();
            if (result.success) {
              alert(result.message);
              setSelectedProducts([]);
              window.location.reload(); // Refresh to show updated status
            } else {
              alert(`خطا: ${result.error}`);
            }
          } catch (error) {
            console.error('Error activating products:', error);
            alert('خطا در فعال کردن محصولات');
          }
        }
        break;
      case "deactivate":
        if (confirm(`آیا از غیرفعال کردن ${selectedProducts.length} محصول اطمینان دارید؟`)) {
          try {
            const response = await fetch('/api/products/bulk', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids: selectedProducts, action: 'deactivate' })
            });
            const result = await response.json();
            if (result.success) {
              alert(result.message);
              setSelectedProducts([]);
              window.location.reload(); // Refresh to show updated status
            } else {
              alert(`خطا: ${result.error}`);
            }
          } catch (error) {
            console.error('Error deactivating products:', error);
            alert('خطا در غیرفعال کردن محصولات');
          }
        }
        break;
    }
  };

  const getStatusBadge = (product: AdminProduct) => {
    if (!product.isActive) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">
          غیرفعال
        </span>
      );
    }
    
    if (product.stockQuantity <= 0) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-orange-500/20 text-orange-400 rounded-full">
          ناموجود
        </span>
      );
    }
    
    if (product.stockQuantity <= product.lowStockThreshold) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded-full">
          کم موجودی
        </span>
      );
    }
    
    return (
      <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">
        موجود
      </span>
    );
  };

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

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">محصولی یافت نشد</h3>
        <p className="text-gray-400">هنوز محصولی به فروشگاه اضافه نشده است.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
          <span className="text-white">
            {selectedProducts.length} محصول انتخاب شده
          </span>
          <div className="flex items-center space-x-3 space-x-reverse">
            <button
              onClick={() => handleBulkAction("activate")}
              className="px-3 py-1 text-sm bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
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

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-right p-4">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === products.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-primary-orange bg-white/10 border-white/20 rounded focus:ring-primary-orange focus:ring-2"
                />
              </th>
              <th className="text-right p-4">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center space-x-2 space-x-reverse text-white/80 hover:text-white transition-colors"
                >
                  <span>نام محصول</span>
                  {sortBy === "name" && (
                    <svg className={`w-4 h-4 transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  )}
                </button>
              </th>
              <th className="text-right p-4">
                <button
                  onClick={() => handleSort("sku")}
                  className="flex items-center space-x-2 space-x-reverse text-white/80 hover:text-white transition-colors"
                >
                  <span>SKU</span>
                  {sortBy === "sku" && (
                    <svg className={`w-4 h-4 transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  )}
                </button>
              </th>
              <th className="text-right p-4">
                <button
                  onClick={() => handleSort("price")}
                  className="flex items-center space-x-2 space-x-reverse text-white/80 hover:text-white transition-colors"
                >
                  <span>قیمت</span>
                  {sortBy === "price" && (
                    <svg className={`w-4 h-4 transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  )}
                </button>
              </th>
              <th className="text-right p-4">موجودی</th>
              <th className="text-right p-4">وضعیت</th>
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
            {products.map((product) => (
              <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                    className="w-4 h-4 text-primary-orange bg-white/10 border-white/20 rounded focus:ring-primary-orange focus:ring-2"
                  />
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    {product.images.length > 0 && (
                      <Image
                        src={product.images.find(img => img.isPrimary)?.url || product.images[0].url}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <div className="font-medium text-white">{product.name}</div>
                      <div className="text-sm text-gray-400">{product.category?.name}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-300">{product.sku}</td>
                <td className="p-4">
                  <div className="text-white font-medium">{formatPrice(product.price)}</div>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <div className="text-sm text-gray-400 line-through">
                      {formatPrice(product.comparePrice)}
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <div className="text-white">{product.stockQuantity}</div>
                  {product.variants.length > 0 && (
                    <div className="text-xs text-gray-400">
                      +{product.variants.length} نوع
                    </div>
                  )}
                </td>
                <td className="p-4">
                  {getStatusBadge(product)}
                </td>
                <td className="p-4 text-sm text-gray-300">
                  {new Date(product.createdAt).toLocaleDateString('fa-IR')}
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <button
                      onClick={() => onView(product)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                      title="مشاهده"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onEdit(product)}
                      className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 rounded-lg transition-colors"
                      title="ویرایش"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(product.id)}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
