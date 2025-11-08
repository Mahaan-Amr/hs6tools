"use client";

import { useState, useEffect, useCallback } from "react";

interface CustomerSegment {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  paidOrders: number;
  averageOrderValue: number;
  daysSinceLastOrder: number | null;
  daysSinceLastLogin: number | null;
  customerType: string;
}

interface CustomerSegmentationProps {
  locale: string;
  period: string;
}

export default function CustomerSegmentation({ period }: CustomerSegmentationProps) {
  const [customers, setCustomers] = useState<{
    customerSegments: {
      highValue: CustomerSegment[];
      frequent: CustomerSegment[];
      dormant: CustomerSegment[];
      regular: CustomerSegment[];
    };
    summary: {
      totalCustomers: number;
      highValueCount: number;
      frequentCount: number;
      dormantCount: number;
      regularCount: number;
    };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("high-value");

  const fetchCustomerData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/analytics?type=customers&period=${period}`);
      const result = await response.json();

      if (result.success) {
        setCustomers(result.data);
      } else {
        console.error("Error fetching customer data:", result.error);
      }
    } catch (error) {
      console.error("Error fetching customer data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchCustomerData();
  }, [fetchCustomerData]);

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case "high-value":
        return "bg-gradient-to-r from-emerald-500 to-teal-500";
      case "frequent":
        return "bg-gradient-to-r from-primary-orange to-primary-orange-dark";
      case "dormant":
        return "bg-gradient-to-r from-orange-500 to-red-500";
      case "regular":
        return "bg-gradient-to-r from-gray-500 to-slate-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fa-IR").format(amount) + " ریال";
  };

  const getActiveCustomers = () => {
    if (!customers) return [];
    
    switch (activeTab) {
      case "high-value":
        return customers.customerSegments.highValue;
      case "frequent":
        return customers.customerSegments.frequent;
      case "dormant":
        return customers.customerSegments.dormant;
      case "regular":
        return customers.customerSegments.regular;
      default:
        return [];
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">در حال بارگذاری تحلیل مشتریان...</p>
      </div>
    );
  }

  if (!customers) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">خطا در بارگذاری تحلیل مشتریان</h3>
        <p className="text-gray-400">لطفاً دوباره تلاش کنید</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">کل مشتریان</p>
              <p className="text-3xl font-bold text-white">{customers.summary.totalCustomers}</p>
            </div>
            <div className="w-12 h-12 bg-primary-orange/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">مشتریان با ارزش بالا</p>
              <p className="text-3xl font-bold text-emerald-400">{customers.summary.highValueCount}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">مشتریان پرتکرار</p>
              <p className="text-3xl font-bold text-primary-orange">{customers.summary.frequentCount}</p>
            </div>
            <div className="w-12 h-12 bg-primary-orange/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">مشتریان غیرفعال</p>
              <p className="text-3xl font-bold text-orange-400">{customers.summary.dormantCount}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Segments Tabs */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">بخش‌بندی مشتریان</h3>
        
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: "high-value", label: "مشتریان با ارزش بالا", count: customers.summary.highValueCount },
            { key: "frequent", label: "مشتریان پرتکرار", count: customers.summary.frequentCount },
            { key: "dormant", label: "مشتریان غیرفعال", count: customers.summary.dormantCount },
            { key: "regular", label: "مشتریان عادی", count: customers.summary.regularCount }
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

        {/* Customer List */}
        <div className="space-y-4">
          {getActiveCustomers().map((customer) => (
            <div key={customer.id} className="glass rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getCustomerTypeColor(customer.customerType)}`}>
                    <span className="text-white font-bold text-lg">
                      {customer.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{customer.name}</h4>
                    <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-400">
                      <span className="flex items-center space-x-1 space-x-reverse">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{customer.email}</span>
                      </span>
                      {customer.phone && (
                        <span className="flex items-center space-x-1 space-x-reverse">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{customer.phone}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6 space-x-reverse text-right">
                  <div>
                    <p className="text-gray-400 text-sm">کل سفارشات</p>
                    <p className="text-white font-semibold">{customer.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">کل خرید</p>
                    <p className="text-white font-semibold">{formatCurrency(customer.totalSpent)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">میانگین سفارش</p>
                    <p className="text-white font-semibold">{formatCurrency(customer.averageOrderValue)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">آخرین سفارش</p>
                    <p className="text-white font-semibold">
                      {customer.daysSinceLastOrder !== null 
                        ? `${customer.daysSinceLastOrder} روز پیش`
                        : "بدون سفارش"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {getActiveCustomers().length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-gray-400">هیچ مشتری در این بخش یافت نشد</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
