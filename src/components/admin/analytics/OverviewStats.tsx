"use client";

interface OverviewStatsProps {
  data: {
    totalProducts: number;
    totalCategories: number;
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    monthlyRevenue: number;
    pendingOrders: number;
    lowStockProducts: number;
    productsChange?: number;
    categoriesChange?: number;
    usersChange?: number;
    ordersChange?: number;
    revenueChange?: number;
    monthlyRevenueChange?: number;
    pendingOrdersChange?: number;
    lowStockChange?: number;
  };
  locale: string;
}

export default function OverviewStats({ data, locale }: OverviewStatsProps) {
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

  const stats = [
    {
      title: "کل محصولات",
      value: formatNumber(data.totalProducts),
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      change: data.productsChange ? `${data.productsChange >= 0 ? '+' : ''}${data.productsChange.toFixed(1)}%` : "0%"
    },
    {
      title: "کل دسته‌بندی‌ها",
      value: formatNumber(data.totalCategories),
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      color: "bg-gradient-to-r from-green-500 to-green-600",
      change: data.categoriesChange ? `${data.categoriesChange >= 0 ? '+' : ''}${data.categoriesChange.toFixed(1)}%` : "0%"
    },
    {
      title: "کل کاربران",
      value: formatNumber(data.totalUsers),
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      change: data.usersChange ? `${data.usersChange >= 0 ? '+' : ''}${data.usersChange.toFixed(1)}%` : "0%"
    },
    {
      title: "سفارشات این دوره",
      value: formatNumber(data.totalOrders),
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      color: "bg-gradient-to-r from-primary-orange to-orange-500",
      change: data.ordersChange ? `${data.ordersChange >= 0 ? '+' : ''}${data.ordersChange.toFixed(1)}%` : "0%"
    },
    {
      title: "درآمد کل دوره",
      value: formatCurrency(data.totalRevenue),
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      color: "bg-gradient-to-r from-emerald-500 to-emerald-600",
      change: data.revenueChange ? `${data.revenueChange >= 0 ? '+' : ''}${data.revenueChange.toFixed(1)}%` : "0%"
    },
    {
      title: "درآمد ماهانه",
      value: formatCurrency(data.monthlyRevenue),
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "bg-gradient-to-r from-indigo-500 to-indigo-600",
      change: data.monthlyRevenueChange ? `${data.monthlyRevenueChange >= 0 ? '+' : ''}${data.monthlyRevenueChange.toFixed(1)}%` : "0%"
    },
    {
      title: "سفارشات در انتظار",
      value: formatNumber(data.pendingOrders),
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-gradient-to-r from-yellow-500 to-yellow-600",
      change: data.pendingOrdersChange ? `${data.pendingOrdersChange >= 0 ? '+' : ''}${data.pendingOrdersChange.toFixed(1)}%` : "0%"
    },
    {
      title: "محصولات کم‌موجودی",
      value: formatNumber(data.lowStockProducts),
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      color: "bg-gradient-to-r from-red-500 to-red-600",
      change: data.lowStockChange ? `${data.lowStockChange >= 0 ? '+' : ''}${data.lowStockChange.toFixed(1)}%` : "0%"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="glass rounded-3xl p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div className={`text-right ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'} text-sm`}>
              <span className="font-medium">{stat.change}</span>
              <div className="text-gray-400">از دوره قبل</div>
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-3xl font-bold text-white mb-2">{stat.value}</h3>
            <p className="text-gray-300">{stat.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
