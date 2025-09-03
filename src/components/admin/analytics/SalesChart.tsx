"use client";

interface SalesChartProps {
  data: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  period: string;
}

export default function SalesChart({ data, period }: SalesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-gray-400">داده‌ای برای نمایش وجود ندارد</p>
      </div>
    );
  }

  // Find max revenue for scaling
  const maxRevenue = Math.max(...data.map(item => item.revenue));
  const maxOrders = Math.max(...data.map(item => item.orders));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (period === "7") {
      return date.toLocaleDateString("fa-IR", { weekday: "short" });
    } else if (period === "30") {
      return date.toLocaleDateString("fa-IR", { day: "numeric", month: "short" });
    } else {
      return date.toLocaleDateString("fa-IR", { month: "short" });
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M';
    }
    if (amount >= 1000) {
      return (amount / 1000).toFixed(1) + 'K';
    }
    return amount.toString();
  };

  return (
    <div className="space-y-6">
      {/* Chart Legend */}
      <div className="flex items-center justify-center space-x-6 space-x-reverse">
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-4 h-4 bg-primary-orange rounded"></div>
          <span className="text-sm text-gray-300">درآمد</span>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-300">تعداد سفارشات</span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative h-64">
        <div className="absolute inset-0 flex items-end justify-between space-x-1 space-x-reverse">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center space-y-2 space-y-reverse">
              {/* Revenue Bar */}
              <div className="relative">
                <div
                  className="w-8 bg-primary-orange rounded-t transition-all duration-300 hover:bg-orange-400"
                  style={{
                    height: `${(item.revenue / maxRevenue) * 200}px`
                  }}
                ></div>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap">
                  {formatCurrency(item.revenue)}
                </div>
              </div>

              {/* Orders Bar */}
              <div className="relative">
                <div
                  className="w-6 bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-400"
                  style={{
                    height: `${(item.orders / maxOrders) * 150}px`
                  }}
                ></div>
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
                  {item.orders}
                </div>
              </div>

              {/* Date Label */}
              <div className="text-xs text-gray-500 text-center w-16">
                {formatDate(item.date)}
              </div>
            </div>
          ))}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
          <span>{formatCurrency(maxRevenue)}</span>
          <span>{formatCurrency(maxRevenue / 2)}</span>
          <span>0</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-orange">
            {formatCurrency(data.reduce((sum, item) => sum + item.revenue, 0))}
          </div>
          <div className="text-sm text-gray-400">کل درآمد</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">
            {data.reduce((sum, item) => sum + item.orders, 0)}
          </div>
          <div className="text-sm text-gray-400">کل سفارشات</div>
        </div>
      </div>
    </div>
  );
}
