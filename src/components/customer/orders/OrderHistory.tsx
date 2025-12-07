'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCustomer } from '@/contexts/CustomerContext';
import { useRouter } from 'next/navigation';
import { getMessages, Messages } from '@/lib/i18n';

interface OrderHistoryProps {
  locale: string;
}

export default function OrderHistory({ locale }: OrderHistoryProps) {
  const { 
    orders, 
    ordersLoading, 
    ordersError, 
    ordersPagination, 
    fetchOrders 
  } = useCustomer();
  const router = useRouter();
  const [messages, setMessages] = useState<Messages | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    dateRange: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessages(locale);
      setMessages(msgs);
    };
    loadMessages();
  }, [locale]);

  useEffect(() => {
    // Fetch orders when filters or page changes
    fetchOrders(currentPage, 10, filters);
  }, [currentPage, filters, fetchOrders]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSortChange = (sortBy: string) => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    setFilters(prev => ({ ...prev, sortBy, sortOrder: newSortOrder }));
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatPrice = (price: number) => {
    const currency = messages?.customer?.orders?.currency || 'USD';
    return new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US').format(price) + ` ${currency}`;
  };

  const getStatusInfo = (status: string) => {
    const t = messages?.customer?.orders?.orderStatuses;
    const statusMap: Record<string, { label: string; color: string }> = {
      PENDING: { 
        label: String(t?.pending || 'در انتظار'), 
        color: 'bg-yellow-500/20 text-yellow-400' 
      },
      CONFIRMED: { 
        label: String(t?.confirmed || 'تأیید شده'), 
        color: 'bg-blue-500/20 text-blue-400' 
      },
      PROCESSING: { 
        label: String(t?.processing || 'در حال پردازش'), 
        color: 'bg-purple-500/20 text-purple-400' 
      },
      SHIPPED: { 
        label: String(t?.shipped || 'ارسال شده'), 
        color: 'bg-indigo-500/20 text-indigo-400' 
      },
      DELIVERED: { 
        label: String(t?.delivered || 'تحویل شده'), 
        color: 'bg-green-500/20 text-green-400' 
      },
      CANCELLED: { 
        label: String(t?.cancelled || 'لغو شده'), 
        color: 'bg-red-500/20 text-red-400' 
      },
      REFUNDED: { 
        label: String(t?.refunded || 'بازپرداخت شده'), 
        color: 'bg-gray-500/20 text-gray-400' 
      }
    };
    return statusMap[status] || { label: status, color: 'bg-gray-500/20 text-gray-400' };
  };

  const getPaymentStatusInfo = (status: string) => {
    const t = messages?.customer?.orders?.paymentStatuses;
    const statusMap: Record<string, { label: string; color: string }> = {
      PENDING: { 
        label: String(t?.pending || 'در انتظار پرداخت'), 
        color: 'bg-yellow-500/20 text-yellow-400' 
      },
      PAID: { 
        label: String(t?.paid || 'پرداخت شده'), 
        color: 'bg-green-500/20 text-green-400' 
      },
      FAILED: { 
        label: String(t?.failed || 'پرداخت ناموفق'), 
        color: 'bg-red-500/20 text-red-400' 
      },
      REFUNDED: { 
        label: String(t?.refunded || 'بازپرداخت شده'), 
        color: 'bg-gray-500/20 text-gray-400' 
      },
      PARTIALLY_REFUNDED: { 
        label: String(t?.partiallyRefunded || 'بازپرداخت جزئی'), 
        color: 'bg-orange-500/20 text-orange-400' 
      }
    };
    return statusMap[status] || { label: status, color: 'bg-gray-500/20 text-gray-400' };
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/${locale}/account/orders/${orderId}`);
  };

  const handlePayOrder = async (orderId: string) => {
    try {
      const t = messages?.customer?.orders;
      
      // Request payment URL from Zarinpal
      const response = await fetch('/api/payment/zarinpal/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.paymentUrl) {
        const errorMessage = result.error || String((t as Record<string, unknown>)?.paymentRequestFailed || 'Failed to create payment request');
        alert(errorMessage);
        return;
      }

      // Redirect to payment gateway
      window.location.href = result.paymentUrl;
    } catch (error) {
      console.error('Error requesting payment:', error);
      const t = messages?.customer?.orders;
      alert(String((t as Record<string, unknown>)?.paymentError || 'خطا در درخواست پرداخت. لطفاً دوباره تلاش کنید.'));
    }
  };

  const handleCancelOrder = async (orderId: string, orderNumber: string) => {
    const t = messages?.customer?.orders;
    const confirmMessage = String((t as Record<string, unknown>)?.cancelOrderConfirm || `آیا از لغو سفارش ${orderNumber} اطمینان دارید؟`);
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch(`/api/customer/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const errorMessage = result.error || String((t as Record<string, unknown>)?.cancelOrderError || 'خطا در لغو سفارش');
        alert(errorMessage);
        return;
      }

      // Show success message
      alert(String((t as Record<string, unknown>)?.cancelOrderSuccess || 'سفارش با موفقیت لغو شد'));
      
      // Refresh orders list
      fetchOrders(currentPage, 10, filters);
    } catch (error) {
      console.error('Error cancelling order:', error);
      const t = messages?.customer?.orders;
      alert(String((t as Record<string, unknown>)?.cancelOrderError || 'خطا در لغو سفارش. لطفاً دوباره تلاش کنید.'));
    }
  };

  if (!messages) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (ordersLoading && orders.length === 0) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (ordersError) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          {messages?.customer?.orders?.errorLoadingOrders || 'خطا در بارگذاری سفارشات'}
        </h3>
        <p className="text-gray-400 mb-4">{ordersError}</p>
        <button 
          onClick={() => fetchOrders(currentPage, 10, filters)}
          className="px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          {messages?.customer?.orders?.retry || 'تلاش مجدد'}
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
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

  // Only render the main content when we have both messages and orders
  if (!messages) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Sorting */}
      <div className="glass rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {messages?.customer?.orders?.filters?.filterStatus || 'وضعیت سفارش'}
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
            >
              <option value="">
                {messages?.customer?.orders?.filters?.allStatuses || 'همه وضعیت‌ها'}
              </option>
              <option value="PENDING">
                {messages?.customer?.orders?.orderStatuses?.pending || 'در انتظار'}
              </option>
              <option value="CONFIRMED">
                {messages?.customer?.orders?.orderStatuses?.confirmed || 'تأیید شده'}
              </option>
              <option value="PROCESSING">
                {messages?.customer?.orders?.orderStatuses?.processing || 'در حال پردازش'}
              </option>
              <option value="SHIPPED">
                {messages?.customer?.orders?.orderStatuses?.shipped || 'ارسال شده'}
              </option>
              <option value="DELIVERED">
                {messages?.customer?.orders?.orderStatuses?.delivered || 'تحویل شده'}
              </option>
              <option value="CANCELLED">
                {messages?.customer?.orders?.orderStatuses?.cancelled || 'لغو شده'}
              </option>
              <option value="REFUNDED">
                {messages?.customer?.orders?.orderStatuses?.refunded || 'بازپرداخت شده'}
              </option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {messages?.customer?.orders?.filters?.dateRange || 'بازه زمانی'}
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
            >
              <option value="">
                {messages?.customer?.orders?.filters?.allTimes || 'همه زمان‌ها'}
              </option>
              <option value="7">
                {messages?.customer?.orders?.filters?.last7Days || '7 روز گذشته'}
              </option>
              <option value="30">
                {messages?.customer?.orders?.filters?.last30Days || '30 روز گذشته'}
              </option>
              <option value="90">
                {messages?.customer?.orders?.filters?.last90Days || '90 روز گذشته'}
              </option>
              <option value="365">
                {messages?.customer?.orders?.filters?.lastYear || '1 سال گذشته'}
              </option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {messages?.customer?.orders?.filters?.sortBy || 'مرتب‌سازی بر اساس'}
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
            >
              <option value="createdAt">
                {messages?.customer?.orders?.filters?.orderDate || 'تاریخ سفارش'}
              </option>
              <option value="orderNumber">
                {messages?.customer?.orders?.filters?.orderNumber || 'شماره سفارش'}
              </option>
              <option value="totalAmount">
                {messages?.customer?.orders?.filters?.totalAmount || 'مبلغ کل'}
              </option>
              <option value="status">
                {messages?.customer?.orders?.filters?.sortStatus || 'وضعیت'}
              </option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {messages?.customer?.orders?.filters?.sortOrder || 'ترتیب'}
            </label>
            <button
              onClick={() => handleSortChange(filters.sortBy)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
            >
              {filters.sortOrder === 'asc' 
                ? (messages?.customer?.orders?.filters?.ascending || 'صعودی')
                : (messages?.customer?.orders?.filters?.descending || 'نزولی')
              }
              <svg className={`w-4 h-4 transition-transform ${filters.sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const statusInfo = getStatusInfo(order.status);
          const paymentStatusInfo = getPaymentStatusInfo(order.paymentStatus);
          
          return (
            <div key={order.id} className="glass rounded-xl p-6 hover:bg-white/5 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-lg font-semibold text-white">
                      {messages?.customer?.orders?.orderNumber || 'سفارش شماره'} {order.orderNumber}
                    </h3>
                    <span className={`px-3 py-1 text-xs rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    <span className={`px-3 py-1 text-xs rounded-full ${paymentStatusInfo.color}`}>
                      {paymentStatusInfo.label}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
                    <div>
                      <span className="text-gray-400">
                        {messages?.customer?.orders?.orderDate || 'تاریخ سفارش'}:
                      </span>
                      <br />
                      {formatDate(order.createdAt)}
                    </div>
                    <div>
                      <span className="text-gray-400">
                        {messages?.customer?.orders?.itemCount || 'تعداد محصولات'}:
                      </span>
                      <br />
                      {order.items.length} {messages?.customer?.orders?.itemCount || 'محصول'}
                    </div>
                    <div>
                      <span className="text-gray-400">روش ارسال:</span>
                      <br />
                      {order.shippingMethod === 'TIPAX' ? 'تیپاکس' : 
                       order.shippingMethod === 'POST' ? 'پست' : 
                       order.shippingMethod === 'EXPRESS' ? 'پست سریع' : order.shippingMethod}
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                          {item.image && (
                            <Image 
                              src={item.image} 
                              alt={item.name}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded object-cover"
                            />
                          )}
                          <span className="text-sm text-white">{item.name}</span>
                          <span className="text-xs text-gray-400">×{item.quantity}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-sm text-gray-400">
                          و {order.items.length - 3} {messages?.customer?.orders?.itemCount || 'محصول'} دیگر...
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Actions and Total */}
                <div className="flex flex-col items-end gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{formatPrice(order.totalAmount)}</p>
                    {order.discountAmount > 0 && (
                      <p className="text-sm text-green-400">
                        تخفیف: {formatPrice(order.discountAmount)}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleViewOrder(order.id)}
                      className="px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      {messages?.customer?.orders?.viewDetails || 'مشاهده جزئیات'}
                    </button>
                    
                    {/* Pay Now button - show if payment is pending and order is not cancelled */}
                    {order.paymentStatus === 'PENDING' && 
                     order.status !== 'CANCELLED' && 
                     order.status !== 'DELIVERED' && 
                     order.status !== 'REFUNDED' && (
                      <button
                        onClick={() => handlePayOrder(order.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        {(messages?.customer?.orders as Record<string, unknown>)?.payNow as string || 'پرداخت'}
                      </button>
                    )}
                    
                    {/* Cancel Order button - show if order can be cancelled */}
                    {/* Orders cannot be cancelled if: paid, cancelled, delivered, or refunded */}
                    {order.paymentStatus !== 'PAID' &&
                     order.status !== 'CANCELLED' && 
                     order.status !== 'DELIVERED' && 
                     order.status !== 'REFUNDED' && (
                      <button
                        onClick={() => handleCancelOrder(order.id, order.orderNumber)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {(messages?.customer?.orders as Record<string, unknown>)?.cancelOrder as string || 'لغو سفارش'}
                      </button>
                    )}
                    
                    {order.status === 'DELIVERED' && (
                      <button className="px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-orange-600 transition-colors">
                        {messages?.customer?.orders?.reorder || 'سفارش مجدد'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {ordersPagination && ordersPagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!ordersPagination.hasPrev}
            className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {messages?.customer?.orders?.pagination?.previous || 'قبلی'}
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: ordersPagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  page === currentPage
                    ? 'bg-primary-orange text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!ordersPagination.hasNext}
            className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {messages?.customer?.orders?.pagination?.next || 'بعدی'}
          </button>
        </div>
      )}
    </div>
  );
}
