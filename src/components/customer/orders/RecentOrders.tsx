'use client';

import React, { useState, useEffect } from 'react';
import { useCustomer } from '@/contexts/CustomerContext';
import { useRouter } from 'next/navigation';
import { getMessages, Messages } from '@/lib/i18n';

interface RecentOrdersProps {
  locale: string;
}

export default function RecentOrders({ locale }: RecentOrdersProps) {
  const { orders, loading, ordersLoading } = useCustomer();
  const router = useRouter();
  const [messages, setMessages] = useState<Messages | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessages(locale);
      setMessages(msgs);
    };
    loadMessages();
  }, [locale]);

  const handleViewAllOrders = () => {
    router.push(`/${locale}/account?tab=orders`);
  };

  // Show loading state if either profile or orders are loading
  if (loading || ordersLoading || !messages) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 bg-white/5 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Use orders from context instead of profile.recentOrders
  const recentOrders = orders.slice(0, 3); // Show only first 3 orders

  if (!recentOrders || recentOrders.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          {messages?.customer?.orders?.noOrders || 'هنوز سفارشی ندارید'}
        </h3>
        <p className="text-gray-400">
          {messages?.customer?.orders?.noOrdersMessage || 'اولین سفارش خود را ثبت کنید'}
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'دیروز';
    if (diffDays < 7) return `${diffDays} روز پیش`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} هفته پیش`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} ماه پیش`;
    return `${Math.floor(diffDays / 365)} سال پیش`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-primary-orange/20 text-primary-orange';
      case 'SHIPPED':
        return 'bg-primary-orange/20 text-primary-orange';
      case 'PROCESSING':
        return 'bg-primary-orange/20 text-primary-orange';
      case 'PENDING':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    if (!messages?.customer?.orders?.orderStatuses) {
      // Fallback to hardcoded Persian text if messages not loaded
      const fallbackMap: Record<string, string> = {
        'DELIVERED': 'تحویل شده',
        'SHIPPED': 'در حال ارسال',
        'PROCESSING': 'در حال پردازش',
        'PENDING': 'در انتظار',
        'CONFIRMED': 'تأیید شده',
        'CANCELLED': 'لغو شده',
        'REFUNDED': 'بازپرداخت شده'
      };
      return fallbackMap[status] || status;
    }
    
    const statusMap: Record<string, string> = {
      'DELIVERED': messages.customer.orders.orderStatuses.delivered,
      'SHIPPED': messages.customer.orders.orderStatuses.shipped,
      'PROCESSING': messages.customer.orders.orderStatuses.processing,
      'PENDING': messages.customer.orders.orderStatuses.pending,
      'CONFIRMED': messages.customer.orders.orderStatuses.confirmed,
      'CANCELLED': messages.customer.orders.orderStatuses.cancelled,
      'REFUNDED': messages.customer.orders.orderStatuses.refunded
    };
    return statusMap[status] || status;
  };

  return (
    <div className="space-y-4">
      {recentOrders.map((order) => (
        <div key={order.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
          <div>
            <h3 className="text-white font-medium">
              {messages?.customer?.orders?.orderNumber || 'سفارش شماره'} {order.orderNumber}
            </h3>
            <p className="text-gray-400 text-sm">{formatDate(order.createdAt)}</p>
            <p className="text-gray-300 text-xs mt-1">
              {order.items.length} {messages?.customer?.orders?.itemCount || 'محصول'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white font-medium">{formatPrice(order.totalAmount)}</p>
            <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>
        </div>
      ))}
      
      <div className="text-center mt-6">
        <button 
          onClick={handleViewAllOrders}
          className="text-primary-orange hover:text-orange-400 font-medium text-sm transition-colors duration-200"
        >
          {messages?.customer?.orders?.viewAllOrders || 'مشاهده همه سفارشات'} →
        </button>
      </div>
    </div>
  );
}
