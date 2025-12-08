"use client";

import { useState, useEffect } from "react";
import { getMessages, Messages } from "@/lib/i18n";

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
  const [messages, setMessages] = useState<Messages | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const msgs = await getMessages(locale);
        setMessages(msgs);
      } catch (error) {
        console.error('Error loading messages in DashboardStats:', error);
        // Don't block rendering - components will use fallbacks
      }
    };
    loadMessages();
  }, [locale]);

  useEffect(() => {
    // Fetch real stats from API with timeout
    // Don't wait for messages - fetch data independently
    const fetchStats = async () => {
      setIsLoading(true);
      
      try {
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch('/api/analytics?type=overview&period=30', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data && result.data.overview) {
          const data = result.data.overview;
          console.log('DashboardStats - Received data:', data);
          console.log('DashboardStats - Setting stats with values:', {
            orders: Number(data.totalOrders) || 0,
            products: Number(data.totalProducts) || 0,
            users: Number(data.totalUsers) || 0,
            revenue: Number(data.totalRevenue) || 0
          });
          const newStats = {
            orders: { 
              value: Number(data.totalOrders) || 0, 
              change: Number(data.ordersChange) || 0 
            },
            products: { 
              value: Number(data.totalProducts) || 0, 
              change: Number(data.productsChange) || 0 
            },
            users: { 
              value: Number(data.totalUsers) || 0, 
              change: Number(data.usersChange) || 0 
            },
            revenue: { 
              value: Number(data.totalRevenue) || 0, 
              change: Number(data.revenueChange) || 0 
            }
          };
          console.log('DashboardStats - Setting stats:', newStats);
          setStats(newStats);
        } else {
          console.error('Error fetching dashboard stats:', result.error || 'Unknown error', result);
          console.log('DashboardStats - Using fallback zero values');
          // Fallback to zero values - still render the cards
          setStats({
            orders: { value: 0, change: 0 },
            products: { value: 0, change: 0 },
            users: { value: 0, change: 0 },
            revenue: { value: 0, change: 0 }
          });
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.error('Dashboard stats fetch timeout');
        } else {
          console.error('Error fetching dashboard stats:', error);
        }
        // Fallback to zero values - don't block rendering
        setStats({
          orders: { value: 0, change: 0 },
          products: { value: 0, change: 0 },
          users: { value: 0, change: 0 },
          revenue: { value: 0, change: 0 }
        });
      } finally {
        setIsLoading(false);
      }
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
    const localeCode = locale === "fa" ? "fa-IR" : locale === "ar" ? "ar-SA" : "en-US";
    return new Intl.NumberFormat(localeCode, {
      style: "currency",
      currency: locale === "fa" ? "IRR" : "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  // Don't block rendering - use fallbacks if messages aren't loaded
  const t = messages?.admin?.dashboardStats || {
    todayOrders: "سفارشات امروز",
    activeProducts: "محصولات فعال",
    registeredUsers: "کاربران ثبت‌نام شده",
    monthlyRevenue: "درآمد ماهانه",
    fromLastMonth: "از ماه گذشته"
  };

  // Show skeleton ONLY while loading messages AND data hasn't loaded yet
  // Once data is loaded (isLoading is false), always render content even if messages aren't loaded
  if ((!messages || !messages.admin?.dashboardStats) && isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass rounded-3xl p-4 sm:p-6 animate-pulse">
            <div className="w-12 h-12 bg-white/10 rounded-2xl mb-4"></div>
            <div className="w-20 h-8 bg-white/10 rounded mb-2"></div>
            <div className="w-32 h-4 bg-white/10 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  // Always render content - even if data is loading or zero
  // The StatCard component handles isLoading state internally

  const StatCard = ({ title, value, change, icon, color }: StatCardProps) => (
    <div className="glass rounded-3xl p-4 sm:p-6 hover:scale-105 transition-transform duration-300">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${color} rounded-2xl flex items-center justify-center`}>
          {icon}
        </div>
          <div className={`text-right ${change >= 0 ? 'text-green-400' : 'text-red-400'} text-xs sm:text-sm`}>
          <span className="font-medium">
            {change >= 0 ? '+' : ''}{change}%
          </span>
          <div className="text-gray-400 text-xs">{String(t.fromLastMonth)}</div>
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
          {isLoading ? (
            <div className="w-16 sm:w-20 h-6 sm:h-8 bg-white/10 rounded animate-pulse mx-auto"></div>
          ) : (
            title === String(t.monthlyRevenue) ? formatCurrency(value as number) : formatNumber(value as number)
          )}
        </h3>
        <p className="text-gray-300 text-sm sm:text-base">{title}</p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title={String(t.todayOrders)}
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
        title={String(t.activeProducts)}
        value={stats.products.value}
        change={stats.products.change}
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        }
        color="bg-gradient-to-r from-primary-orange to-orange-500"
      />
      
      <StatCard
        title={String(t.registeredUsers)}
        value={stats.users.value}
        change={stats.users.change}
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
        color="bg-gradient-to-r from-primary-orange to-orange-500"
      />
      
      <StatCard
        title={String(t.monthlyRevenue)}
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
