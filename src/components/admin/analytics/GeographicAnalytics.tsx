"use client";

import { useState, useEffect, useCallback } from "react";

interface CityAnalytics {
  city: string;
  orderCount: number;
  totalRevenue: number;
  averageOrderValue: number;
  percentage: number;
}

interface StateAnalytics {
  state: string;
  orderCount: number;
  totalRevenue: number;
  averageOrderValue: number;
}

interface CountryAnalytics {
  country: string;
  orderCount: number;
  totalRevenue: number;
  averageOrderValue: number;
}

interface GeographicAnalyticsProps {
  locale: string;
  period: string;
}

export default function GeographicAnalytics({ period }: GeographicAnalyticsProps) {
  const [geographicData, setGeographicData] = useState<{
    cityAnalytics: CityAnalytics[];
    stateAnalytics: StateAnalytics[];
    countryAnalytics: CountryAnalytics[];
    summary: {
      totalCities: number;
      totalStates: number;
      totalCountries: number;
      totalRevenue: number;
      averageOrderValue: number;
    };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState("cities");

  const fetchGeographicData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/analytics?type=geographic&period=${period}`);
      const result = await response.json();

      if (result.success) {
        setGeographicData(result.data);
      } else {
        console.error("Error fetching geographic data:", result.error);
      }
    } catch (error) {
      console.error("Error fetching geographic data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchGeographicData();
  }, [fetchGeographicData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fa-IR").format(amount) + " ریال";
  };

  const getActiveData = () => {
    if (!geographicData) return [];
    
    switch (activeView) {
      case "cities":
        return geographicData.cityAnalytics;
      case "states":
        return geographicData.stateAnalytics;
      case "countries":
        return geographicData.countryAnalytics;
      default:
        return [];
    }
  };

  const getViewLabel = () => {
    switch (activeView) {
      case "cities":
        return "شهرها";
      case "states":
        return "استان‌ها";
      case "countries":
        return "کشورها";
      default:
        return "";
    }
  };

  const getViewIcon = () => {
    switch (activeView) {
      case "cities":
        return (
          <svg className="w-6 h-6 text-primary-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case "states":
        return (
          <svg className="w-6 h-6 text-primary-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        );
      case "countries":
        return (
          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">در حال بارگذاری تحلیل جغرافیایی...</p>
      </div>
    );
  }

  if (!geographicData) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">خطا در بارگذاری تحلیل جغرافیایی</h3>
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
              <p className="text-gray-400 text-sm">کل شهرها</p>
              <p className="text-3xl font-bold text-primary-orange">{geographicData.summary.totalCities}</p>
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
              <p className="text-gray-400 text-sm">کل استان‌ها</p>
              <p className="text-3xl font-bold text-primary-orange">{geographicData.summary.totalStates}</p>
            </div>
            <div className="w-12 h-12 bg-primary-orange/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">کل کشورها</p>
              <p className="text-3xl font-bold text-purple-400">{geographicData.summary.totalCountries}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">کل درآمد</p>
              <p className="text-3xl font-bold text-emerald-400">{formatCurrency(geographicData.summary.totalRevenue)}</p>
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
              <p className="text-gray-400 text-sm">میانگین سفارش</p>
              <p className="text-3xl font-bold text-orange-400">{formatCurrency(geographicData.summary.averageOrderValue)}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Geographic Analytics Tabs */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">تحلیل جغرافیایی فروش</h3>
        </div>
        
        {/* View Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: "cities", label: "شهرها", count: geographicData.summary.totalCities },
            { key: "states", label: "استان‌ها", count: geographicData.summary.totalStates },
            { key: "countries", label: "کشورها", count: geographicData.summary.totalCountries }
          ].map((view) => (
            <button
              key={view.key}
              onClick={() => setActiveView(view.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeView === view.key
                  ? "bg-primary-orange text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              {view.label} ({view.count})
            </button>
          ))}
        </div>

        {/* Geographic Data List */}
        <div className="space-y-4">
          {getActiveData().map((item, index) => (
            <div key={index} className="glass rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-orange to-primary-orange-dark rounded-full flex items-center justify-center">
                    {getViewIcon()}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">
                      {activeView === "cities" && (item as CityAnalytics).city}
                      {activeView === "states" && (item as StateAnalytics).state}
                      {activeView === "countries" && (item as CountryAnalytics).country}
                    </h4>
                    <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-400">
                      <span>رتبه: {index + 1}</span>
                      {activeView === "cities" && (
                        <span className="text-primary-orange">
                          {(item as CityAnalytics).percentage.toFixed(1)}% از کل فروش
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6 space-x-reverse text-right">
                  <div>
                    <p className="text-gray-400 text-sm">تعداد سفارش</p>
                    <p className="text-white font-semibold">{item.orderCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">کل درآمد</p>
                    <p className="text-white font-semibold">{formatCurrency(item.totalRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">میانگین سفارش</p>
                    <p className="text-white font-semibold">{formatCurrency(item.averageOrderValue)}</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar for Cities */}
              {activeView === "cities" && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                    <span>سهم از کل فروش</span>
                    <span>{(item as CityAnalytics).percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary-orange to-primary-orange-dark h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(item as CityAnalytics).percentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {getActiveData().length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                {getViewIcon()}
              </div>
              <p className="text-gray-400">هیچ داده‌ای برای {getViewLabel()} یافت نشد</p>
            </div>
          )}
        </div>
      </div>

      {/* Geographic Distribution Chart */}
      {activeView === "cities" && geographicData.cityAnalytics.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">توزیع جغرافیایی فروش</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {geographicData.cityAnalytics.slice(0, 9).map((city, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-semibold">{city.city}</h4>
                  <span className="text-primary-orange font-bold">{city.percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-primary-orange to-primary-orange-dark h-2 rounded-full transition-all duration-300"
                    style={{ width: `${city.percentage}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-400">
                  <div className="flex justify-between">
                    <span>{city.orderCount} سفارش</span>
                    <span>{formatCurrency(city.totalRevenue)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
