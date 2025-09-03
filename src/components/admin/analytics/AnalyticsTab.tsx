"use client";

import { useState, useEffect, useCallback } from "react";
import OverviewStats from "./OverviewStats";
import SalesChart from "./SalesChart";
import TopProducts from "./TopProducts";
import TopCategories from "./TopCategories";
import RecentOrders from "./RecentOrders";
import LowStockAlert from "./LowStockAlert";
import CustomerSegmentation from "./CustomerSegmentation";
import ProductPerformance from "./ProductPerformance";
import GeographicAnalytics from "./GeographicAnalytics";

interface AnalyticsTabProps {
  locale: string;
}

export default function AnalyticsTab({ locale }: AnalyticsTabProps) {
  const [period, setPeriod] = useState("30");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [analyticsData, setAnalyticsData] = useState<{
    overview: {
      totalProducts: number;
      totalCategories: number;
      totalUsers: number;
      totalOrders: number;
      totalRevenue: number;
      monthlyRevenue: number;
      pendingOrders: number;
      lowStockProducts: number;
    };
    recentOrders: Array<{
      id: string;
      orderNumber: string;
      totalAmount: number;
      status: string;
      createdAt: string;
      customerName: string;
    }>;
    topProducts: Array<{
      id: string;
      name: string;
      sales: number;
      revenue: number;
    }>;
    topCategories: Array<{
      id: string;
      name: string;
      revenue: number;
    }>;
    dailySales: Array<{
      date: string;
      revenue: number;
      orders: number;
    }>;
  } | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/analytics?type=overview&period=${period}`);
      const result = await response.json();

      if (result.success) {
        setAnalyticsData(result.data);
      } else {
        console.error("Error fetching analytics:", result.error);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    if (activeTab === "overview") {
      fetchAnalytics();
    }
  }, [period, activeTab, fetchAnalytics]);

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "overview":
        if (isLoading) {
          return (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">در حال بارگذاری تحلیل‌ها...</p>
            </div>
          );
        }

        if (!analyticsData) {
          return (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">خطا در بارگذاری تحلیل‌ها</h3>
              <p className="text-gray-400">لطفاً دوباره تلاش کنید</p>
            </div>
          );
        }

        return (
          <div className="space-y-8">
            {/* Overview Statistics */}
            <OverviewStats data={analyticsData.overview} locale={locale} />

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sales Chart */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">نمودار فروش</h3>
                <SalesChart data={analyticsData.dailySales} period={period} />
              </div>

              {/* Top Products */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">محصولات پرفروش</h3>
                <TopProducts products={analyticsData.topProducts} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Categories */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">دسته‌بندی‌های پرفروش</h3>
                <TopCategories categories={analyticsData.topCategories} />
              </div>

              {/* Recent Orders */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">سفارشات اخیر</h3>
                <RecentOrders orders={analyticsData.recentOrders} />
              </div>
            </div>

            {/* Low Stock Alert */}
            <LowStockAlert count={analyticsData.overview.lowStockProducts} />
          </div>
        );

      case "customers":
        return <CustomerSegmentation locale={locale} period={period} />;

      case "products":
        return <ProductPerformance locale={locale} period={period} />;

      case "geographic":
        return <GeographicAnalytics locale={locale} period={period} />;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Period Selector */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">انتخاب دوره زمانی</h2>
          <div className="flex items-center space-x-4 space-x-reverse">
            <select
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="px-4 py-3 bg-white/10 text-white border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-orange"
            >
              <option value="7">7 روز گذشته</option>
              <option value="30">30 روز گذشته</option>
              <option value="90">90 روز گذشته</option>
              <option value="365">سال گذشته</option>
            </select>
          </div>
        </div>
      </div>

      {/* Analytics Tabs */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "overview", label: "نمای کلی", icon: "📊" },
            { key: "customers", label: "بخش‌بندی مشتریان", icon: "👥" },
            { key: "products", label: "عملکرد محصولات", icon: "📦" },
            { key: "geographic", label: "تحلیل جغرافیایی", icon: "🌍" }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 space-x-reverse ${
                activeTab === tab.key
                  ? "bg-primary-orange text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Tab Content */}
      {renderActiveTab()}
    </div>
  );
}
