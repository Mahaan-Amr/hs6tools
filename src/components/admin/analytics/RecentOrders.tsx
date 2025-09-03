"use client";

interface RecentOrdersProps {
  orders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    customerName: string;
  }>;
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <p className="text-gray-400">سفارشی برای نمایش وجود ندارد</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M';
    }
    if (amount >= 1000) {
      return (amount / 1000).toFixed(1) + 'K';
    }
    return amount.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING":
        return { label: "در انتظار", color: "bg-yellow-500/20 text-yellow-400" };
      case "CONFIRMED":
        return { label: "تأیید شده", color: "bg-blue-500/20 text-blue-400" };
      case "PROCESSING":
        return { label: "در حال پردازش", color: "bg-purple-500/20 text-purple-400" };
      case "SHIPPED":
        return { label: "ارسال شده", color: "bg-indigo-500/20 text-indigo-400" };
      case "DELIVERED":
        return { label: "تحویل شده", color: "bg-green-500/20 text-green-400" };
      case "CANCELLED":
        return { label: "لغو شده", color: "bg-red-500/20 text-red-400" };
      case "REFUNDED":
        return { label: "بازپرداخت", color: "bg-gray-500/20 text-gray-400" };
      default:
        return { label: "نامشخص", color: "bg-gray-500/20 text-gray-400" };
    }
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const statusInfo = getStatusInfo(order.status);
        
        return (
          <div key={order.id} className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3 space-x-reverse">
                {/* Order Icon */}
                <div className="w-10 h-10 bg-primary-orange/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>

                {/* Order Info */}
                <div>
                  <h4 className="font-medium text-white">{order.orderNumber}</h4>
                  <p className="text-sm text-gray-400">{order.customerName}</p>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right">
                <div className="text-lg font-bold text-primary-orange">
                  {formatCurrency(order.totalAmount)}
                </div>
                <div className="text-xs text-gray-400">
                  {formatDate(order.createdAt)}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-lg text-xs font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
              
              {/* Time ago */}
              <span className="text-xs text-gray-500">
                {getTimeAgo(order.createdAt)}
              </span>
            </div>
          </div>
        );
      })}

      {/* Summary */}
      <div className="pt-4 border-t border-white/10">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary-orange">
              {orders.length}
            </div>
            <div className="text-sm text-gray-400">کل سفارشات</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-500">
              {formatCurrency(orders.reduce((sum, order) => sum + order.totalAmount, 0))}
            </div>
            <div className="text-sm text-gray-400">کل درآمد</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "همین الان";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} دقیقه پیش`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ساعت پیش`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} روز پیش`;
  } else {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} ماه پیش`;
  }
}
