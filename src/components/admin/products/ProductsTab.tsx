"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { AdminProduct, AdminCategory, CreateProductData, UpdateProductData } from "@/types/admin";
import { formatPrice } from "@/utils/format";
import ProductList from "./ProductList";
import ProductForm from "./ProductForm";

export default function ProductsTab() {
  const params = useParams();
  const locale = (params?.locale as string) || 'fa';
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [viewingProduct, setViewingProduct] = useState<AdminProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setViewingProduct(null);
    setShowForm(true);
    // Scroll to top to show the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    
    // Check if we should open the create form from URL params
    const action = searchParams.get("action");
    if (action === "create") {
      setEditingProduct(null);
      setViewingProduct(null);
      setShowForm(true);
      // Clean up the URL by removing the query parameter
      const url = new URL(window.location.href);
      url.searchParams.delete("action");
      router.replace(url.pathname + url.search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleEditProduct = (product: AdminProduct) => {
    setEditingProduct(product);
    setViewingProduct(null);
    setShowForm(true);
  };

  const handleViewProduct = (product: AdminProduct) => {
    setViewingProduct(product);
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
    setViewingProduct(null);
  };

  const handleProductSaved = async (data: CreateProductData | UpdateProductData) => {
    try {
      setIsSaving(true);
      
      if ('id' in data) {
        // Update existing product
        const response = await fetch(`/api/products/${data.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const updatedProduct = await response.json();
          setProducts(prev => 
            prev.map(p => p.id === data.id ? updatedProduct.data : p)
          );
        } else {
          const errorData = await response.json();
          alert(errorData.error || "خطا در بروزرسانی محصول");
          return;
        }
      } else {
        // Create new product
        const response = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const newProduct = await response.json();
          setProducts(prev => [newProduct.data, ...prev]);
        } else {
          const errorData = await response.json();
          alert(errorData.error || "خطا در ایجاد محصول");
          return;
        }
      }

      handleFormClose();
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error("Error saving product:", error);
      alert("خطا در ذخیره محصول");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("آیا از حذف این محصول اطمینان دارید؟")) return;
    
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        setProducts(prev => prev.filter(product => product.id !== id));
      } else {
        const errorData = await response.json();
        alert(errorData.error || "خطا در حذف محصول");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("خطا در اتصال به سرور");
    }
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && product.isActive) ||
                         (statusFilter === "inactive" && !product.isActive) ||
                         (statusFilter === "outOfStock" && product.stockQuantity <= 0) ||
                         (statusFilter === "lowStock" && product.stockQuantity <= product.lowStockThreshold && product.stockQuantity > 0);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (viewingProduct) {
    return (
      <div className="space-y-6">
        {/* Product View Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">مشاهده محصول</h2>
          <button
            onClick={handleFormClose}
            className="px-4 py-2 text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            بازگشت
          </button>
        </div>

        {/* Product Details */}
        <div className="glass rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Images */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">تصاویر محصول</h3>
              {viewingProduct.images.length > 0 ? (
                <div className="space-y-4">
                  {viewingProduct.images.map((image) => (
                    <div key={image.id} className="relative">
                      <Image
                        src={image.url}
                        alt={image.alt || viewingProduct.name}
                        width={256}
                        height={256}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      {image.isPrimary && (
                        <span className="absolute top-2 right-2 px-2 py-1 bg-primary-orange text-white text-xs rounded">
                          اصلی
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full h-64 bg-white/5 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">تصویری موجود نیست</span>
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{viewingProduct.name}</h3>
                <p className="text-gray-400">{viewingProduct.sku}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">قیمت</label>
                  <p className="text-2xl font-bold text-white">{formatPrice(viewingProduct.price)}</p>
                  {viewingProduct.comparePrice && viewingProduct.comparePrice > viewingProduct.price && (
                    <p className="text-lg text-gray-400 line-through">
                      {formatPrice(viewingProduct.comparePrice)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">دسته‌بندی</label>
                  <p className="text-white">{viewingProduct.category?.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">موجودی</label>
                  <p className="text-white">{viewingProduct.stockQuantity} عدد</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">وضعیت</label>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    {viewingProduct.isActive ? (
                      <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">
                        فعال
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">
                        غیرفعال
                      </span>
                    )}
                    {viewingProduct.isFeatured && (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded-full">
                        ویژه
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {viewingProduct.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">توضیحات</label>
                  <p className="text-white leading-relaxed">{viewingProduct.description}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 space-x-reverse pt-4">
                <button
                  onClick={() => handleEditProduct(viewingProduct)}
                  className="px-4 py-2 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded-lg transition-colors"
                >
                  ویرایش
                </button>
                <button
                  onClick={() => deleteProduct(viewingProduct.id)}
                  className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        {/* Form Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {editingProduct ? 'ویرایش محصول' : 'افزودن محصول جدید'}
          </h2>
          <button
            onClick={handleFormClose}
            className="px-4 py-2 text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            انصراف
          </button>
        </div>

        <ProductForm
          product={editingProduct || undefined}
          categories={categories}
          onSave={handleProductSaved}
          onCancel={handleFormClose}
          isLoading={isSaving}
          locale={locale}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">مدیریت محصولات</h2>
        <button
          onClick={handleCreateProduct}
          className="px-6 py-3 bg-primary-orange hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center space-x-2 space-x-reverse"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>افزودن محصول</span>
        </button>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">جستجو</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو در نام، SKU یا توضیحات..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">دسته‌بندی</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-4 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
            >
              <option value="">همه دسته‌بندی‌ها</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">وضعیت</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-4 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
            >
              <option value="all">همه</option>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
              <option value="outOfStock">ناموجود</option>
              <option value="lowStock">کم موجودی</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">لیست محصولات</h3>
          <div className="text-sm text-gray-400">
            {filteredProducts.length} محصول از {products.length}
          </div>
        </div>

        <ProductList
          products={filteredProducts}
          onEdit={handleEditProduct}
          onDelete={deleteProduct}
          onView={handleViewProduct}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
