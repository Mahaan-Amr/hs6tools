"use client";

import { useState, useEffect } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

interface DashboardStatsProps {
  locale: string;
}

export default function DashboardStats({ locale }: DashboardStatsProps) {
  const [stats, setStats] = useState({
    orders: { value: 0, change: 0 },
    products: { value: 0, change: 0 },
    users: { value: 0, change: 0 },
    revenue: { value: 0, change: 0 }
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch stats
    const fetchStats = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual API call
      setStats({
        orders: { value: 125, change: 12.5 },
        products: { value: 2450, change: 8.2 },
        users: { value: 8720, change: 15.3 },
        revenue: { value: 125450000, change: 22.1 }
      });
      
      setIsLoading(false);
    };

    fetchStats();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
      style: "currency",
      currency: locale === "fa" ? "IRR" : "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const StatCard = ({ title, value, change, icon, color }: StatCardProps) => (
    <div className="glass rounded-3xl p-6 hover:scale-105 transition-transform duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center`}>
          {icon}
        </div>
        <div className={`text-right ${change >= 0 ? 'text-green-400' : 'text-red-400'} text-sm`}>
          <span className="font-medium">
            {change >= 0 ? '+' : ''}{change}%
          </span>
          <div className="text-gray-400">از ماه گذشته</div>
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="text-3xl font-bold text-white mb-2">
          {isLoading ? (
            <div className="w-20 h-8 bg-white/10 rounded animate-pulse mx-auto"></div>
          ) : (
            title === 'درآمد ماهانه' ? formatCurrency(value as number) : formatNumber(value as number)
          )}
        </h3>
        <p className="text-gray-300">{title}</p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="سفارشات امروز"
        value={stats.orders.value}
        change={stats.orders.change}
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        }
        color="bg-gradient-to-r from-primary-orange to-orange-500"
      />
      
      <StatCard
        title="محصولات فعال"
        value={stats.products.value}
        change={stats.products.change}
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        }
        color="bg-gradient-to-r from-blue-500 to-blue-600"
      />
      
      <StatCard
        title="کاربران ثبت‌نام شده"
        value={stats.users.value}
        change={stats.users.change}
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
        color="bg-gradient-to-r from-green-500 to-green-600"
      />
      
      <StatCard
        title="درآمد ماهانه"
        value={stats.revenue.value}
        change={stats.revenue.change}
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        }
        color="bg-gradient-to-r from-purple-500 to-purple-600"
      />
    </div>
  );
}
