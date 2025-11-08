"use client";

import { useState, useEffect } from "react";

interface ProductPerformance {
  id: string;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
  isInStock: boolean;
  category: string;
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  averageRating: number;
  reviewCount: number;
  wishlistCount: number;
  conversionRate: number;
  salesVelocity: number;
  stockStatus: string;
}

interface ProductPerformanceProps {
  locale: string;
  period: string;
}

export default function ProductPerformance({ locale, period }: ProductPerformanceProps) {
  const [products, setProducts] = useState<{
    products: ProductPerformance[];
    topSelling: ProductPerformance[];
    topRevenue: ProductPerformance[];
    topRated: ProductPerformance[];
    lowStock: ProductPerformance[];
    summary: {
      totalProducts: number;
      totalSales: number;
      totalRevenue: number;
      averageRating: number;
      lowStockCount: number;
    };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("top-selling");
  const [sortBy, setSortBy] = useState("totalSales");

  useEffect(() => {
    fetchProductData();
  }, [period]);

  const fetchProductData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/analytics?type=products&period=${period}`);
      const result = await response.json();

      if (result.success) {
        setProducts(result.data);
      } else {
        console.error("Error fetching product data:", result.error);
      }
    } catch (error) {
      console.error("Error fetching product data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fa-IR").format(amount) + " ریال";
  };

  const getActiveProducts = () => {
    if (!products) return [];
    
    switch (activeTab) {
      case "top-selling":
        return products.topSelling;
      case "top-revenue":
        return products.topRevenue;
      case "top-rated":
        return products.topRated;
      case "low-stock":
        return products.lowStock;
      default:
        return products.products;
    }
  };

  const getSortedProducts = () => {
    const activeProducts = getActiveProducts();
    return [...activeProducts].sort((a, b) => {
      switch (sortBy) {
        case "totalSales":
          return b.totalSales - a.totalSales;
        case "totalRevenue":
          return b.totalRevenue - a.totalRevenue;
        case "averageRating":
          return b.averageRating - a.averageRating;
        case "price":
          return b.price - a.price;
        case "stockQuantity":
          return a.stockQuantity - b.stockQuantity;
        default:
          return 0;
      }
    });
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case "low":
        return "text-red-400";
      case "normal":
        return "text-primary-orange";
      default:
        return "text-gray-400";
    }
  };

  const getStockStatusBg = (status: string) => {
    switch (status) {
      case "low":
        return "bg-red-500/20";
      case "normal":
        return "bg-primary-orange/20";
      default:
        return "bg-gray-500/20";
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">در حال بارگذاری تحلیل محصولات...</p>
      </div>
    );
  }

  if (!products) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">خطا در بارگذاری تحلیل محصولات</h3>
        <p className="text-gray-400">لطفاً دوباره تلاش کنید</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">کل محصولات</p>
              <p className="text-3xl font-bold text-white">{products.summary.totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-primary-orange/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">کل فروش</p>
              <p className="text-3xl font-bold text-emerald-400">{products.summary.totalSales}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">کل درآمد</p>
              <p className="text-3xl font-bold text-primary-orange">{formatCurrency(products.summary.totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">میانگین امتیاز</p>
              <p className="text-3xl font-bold text-yellow-400">{products.summary.averageRating.toFixed(1)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">موجودی کم</p>
              <p className="text-3xl font-bold text-red-400">{products.summary.lowStockCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Product Analytics Tabs */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">تحلیل عملکرد محصولات</h3>
          
          {/* Sort Options */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-orange"
            >
              <option value="totalSales">بر اساس فروش</option>
              <option value="totalRevenue">بر اساس درآمد</option>
              <option value="averageRating">بر اساس امتیاز</option>
              <option value="price">بر اساس قیمت</option>
              <option value="stockQuantity">بر اساس موجودی</option>
            </select>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: "top-selling", label: "پرفروش‌ترین", count: products.topSelling.length },
            { key: "top-revenue", label: "بیشترین درآمد", count: products.topRevenue.length },
            { key: "top-rated", label: "بهترین امتیاز", count: products.topRated.length },
            { key: "low-stock", label: "موجودی کم", count: products.lowStock.length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-primary-orange text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Product List */}
        <div className="space-y-4">
          {getSortedProducts().map((product) => (
            <div key={product.id} className="glass rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStockStatusBg(product.stockStatus)}`}>
                    <span className={`font-bold text-lg ${getStockStatusColor(product.stockStatus)}`}>
                      {product.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{product.name}</h4>
                    <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-400">
                      <span>SKU: {product.sku}</span>
                      <span>دسته: {product.category}</span>
                      <span className={`${getStockStatusColor(product.stockStatus)}`}>
                        موجودی: {product.stockQuantity}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6 space-x-reverse text-right">
                  <div>
                    <p className="text-gray-400 text-sm">قیمت</p>
                    <p className="text-white font-semibold">{formatCurrency(product.price)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">فروش</p>
                    <p className="text-white font-semibold">{product.totalSales}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">درآمد</p>
                    <p className="text-white font-semibold">{formatCurrency(product.totalRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">امتیاز</p>
                    <p className="text-white font-semibold">
                      {product.reviewCount > 0 ? product.averageRating.toFixed(1) : "بدون امتیاز"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">لیست علاقه</p>
                    <p className="text-white font-semibold">{product.wishlistCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">نرخ تبدیل</p>
                    <p className="text-white font-semibold">{product.conversionRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {getSortedProducts().length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-gray-400">هیچ محصولی در این بخش یافت نشد</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
