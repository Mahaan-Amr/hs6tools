'use client';

import React, { useState, useEffect } from 'react';
import ResilientImage from '@/components/shared/ResilientImage';
import { useCustomer } from '@/contexts/CustomerContext';
import { useRouter } from 'next/navigation';
import { getMessages, Messages } from '@/lib/i18n';
import { formatPrice as formatPriceUtil } from '@/utils/format';

interface OrderDetailsProps {
  orderId: string;
  locale: string;
}

interface OrderItem {
  id: string;
  productId?: string;
  variantId?: string;
  sku: string;
  name: string;
  description?: string;
  image?: string;
  unitPrice: number;
  totalPrice: number;
  quantity: number;
  attributes?: Record<string, unknown>;
  product?: {
    id: string;
    name: string;
    slug: string;
    images?: { url: string; alt?: string }[];
  };
  variant?: {
    id: string;
    name: string;
    sku: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingMethod: string;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  customerNote?: string;
  trackingNumber?: string;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  items: OrderItem[];
}

export default function OrderDetails({ orderId, locale }: OrderDetailsProps) {
  const { fetchOrderDetails } = useCustomer();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Messages | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessages(locale);
      setMessages(msgs);
    };
    loadMessages();
  }, [locale]);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        const orderData = await fetchOrderDetails(orderId);
        if (orderData) {
          setOrder(orderData as Order);
        } else {
          setError(messages?.customer?.orderDetails?.orderNotFound || 'سفارش یافت نشد');
        }
      } catch {
        setError(messages?.customer?.orderDetails?.errorLoadingOrder || 'خطا در بارگذاری سفارش');
      } finally {
        setLoading(false);
      }
    };

    if (orderId && messages) {
      loadOrder();
    }
  }, [orderId, fetchOrderDetails, messages]);

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
    // Use centralized utility that converts Rials to Tomans
    return formatPriceUtil(price, 'fa');
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: string }> = {
      PENDING: { 
        label: messages?.customer?.orderDetails?.statusPending || 'در انتظار', 
        color: 'bg-yellow-500/20 text-yellow-400',
        icon: '⏳'
      },
      CONFIRMED: { 
        label: messages?.customer?.orderDetails?.statusConfirmed || 'تأیید شده', 
        color: 'bg-blue-500/20 text-blue-400',
        icon: '✅'
      },
      PROCESSING: { 
        label: messages?.customer?.orderDetails?.statusProcessing || 'در حال پردازش', 
        color: 'bg-purple-500/20 text-purple-400',
        icon: '⚙️'
      },
      SHIPPED: { 
        label: messages?.customer?.orderDetails?.statusShipped || 'ارسال شده', 
        color: 'bg-indigo-500/20 text-indigo-400',
        icon: '🚚'
      },
      DELIVERED: { 
        label: messages?.customer?.orderDetails?.statusDelivered || 'تحویل شده', 
        color: 'bg-green-500/20 text-green-400',
        icon: '🎉'
      },
      CANCELLED: { 
        label: messages?.customer?.orderDetails?.statusCancelled || 'لغو شده', 
        color: 'bg-red-500/20 text-red-400',
        icon: '❌'
      },
      REFUNDED: { 
        label: messages?.customer?.orderDetails?.statusRefunded || 'بازپرداخت شده', 
        color: 'bg-gray-500/20 text-gray-400',
        icon: '💰'
      }
    };
    
    return statusMap[status] || { label: status, color: 'bg-gray-500/20 text-gray-400', icon: '❓' };
  };

  const getPaymentStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: string }> = {
      PENDING: { 
        label: messages?.customer?.orderDetails?.paymentStatusPending || 'در انتظار', 
        color: 'bg-yellow-500/20 text-yellow-400',
        icon: '⏳'
      },
      PAID: { 
        label: messages?.customer?.orderDetails?.paymentStatusPaid || 'پرداخت شده', 
        color: 'bg-green-500/20 text-green-400',
        icon: '💳'
      },
      FAILED: { 
        label: messages?.customer?.orderDetails?.paymentStatusFailed || 'ناموفق', 
        color: 'bg-red-500/20 text-red-400',
        icon: '❌'
      },
      REFUNDED: { 
        label: messages?.customer?.orderDetails?.paymentStatusRefunded || 'بازپرداخت شده', 
        color: 'bg-gray-500/20 text-gray-400',
        icon: '💰'
      },
      PARTIALLY_REFUNDED: { 
        label: messages?.customer?.orderDetails?.paymentStatusPartiallyRefunded || 'بازپرداخت جزئی', 
        color: 'bg-orange-500/20 text-orange-400',
        icon: '💰'
      }
    };
    
    return statusMap[status] || { label: status, color: 'bg-gray-500/20 text-gray-400', icon: '❓' };
  };

  const getPaymentMethodLabel = (method: string) => {
    const methodMap: Record<string, string> = {
      ZARINPAL: messages?.customer?.orderDetails?.paymentMethodZarinpal || 'زرین‌پال',
      BANK_TRANSFER: messages?.customer?.orderDetails?.paymentMethodBankTransfer || 'انتقال بانکی',
      CASH_ON_DELIVERY: messages?.customer?.orderDetails?.paymentMethodCashOnDelivery || 'پرداخت در محل'
    };
    
    return methodMap[method] || method;
  };

  const getShippingMethodLabel = (method: string) => {
    const methodMap: Record<string, string> = {
      TIPAX: messages?.customer?.orderDetails?.shippingMethodTipax || 'تیپاکس',
      POST: messages?.customer?.orderDetails?.shippingMethodPost || 'پست',
      EXPRESS: messages?.customer?.orderDetails?.shippingMethodExpress || 'پست سریع'
    };
    
    return methodMap[method] || method;
  };

  const handleReorder = async () => {
    if (!order) return;
    
    try {
      // Import cart store dynamically to avoid SSR issues
      const { useCartStore } = await import('@/contexts/CartContext');
      const { addItem } = useCartStore.getState();
      
      // Add all items from the order back to the cart
      for (const item of order.items) {
        addItem({
          productId: item.productId || '',
          variantId: item.variantId || undefined,
          name: item.name,
          price: item.unitPrice,
          quantity: item.quantity,
          image: item.image || undefined,
          sku: item.sku,
          category: item.description || ''
        });
      }
      
      // Redirect to cart
      router.push(`/${locale}/cart`);
    } catch (error) {
      console.error('Error reordering:', error);
      const reorderError = (messages?.customer?.orderDetails as Record<string, unknown>)?.reorderError as string;
      alert(reorderError || 'خطا در افزودن محصولات به سبد خرید');
    }
  };

  const handleDownloadInvoice = () => {
    if (!order || !messages) return;
    
    const t = messages.customer?.orderDetails as Record<string, unknown>;
    const invoiceTitle = String(t?.invoiceTitle || 'فاکتور سفارش');
    const invoiceDate = String(t?.invoiceDate || 'تاریخ');
    const customerInfo = String(t?.customerInfo || 'اطلاعات مشتری');
    const product = String(t?.product || 'محصول');
    const quantity = String(t?.quantity || 'تعداد');
    const unitPrice = String(t?.unitPrice || 'قیمت واحد');
    const total = String(t?.total || 'جمع');
    const subtotal = String(t?.subtotal || 'جمع جزء');
    const shippingAmount = String(t?.shippingAmount || 'هزینه ارسال');
    const taxAmount = String(t?.taxAmount || 'مالیات');
    const discount = String(t?.discount || 'تخفیف');
    const totalAmount = String(t?.totalAmount || 'مجموع کل');
    
    // Generate HTML invoice
    const invoiceHTML = `
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="UTF-8">
        <title>${invoiceTitle} ${order.orderNumber}</title>
        <style>
          body { font-family: 'Vazirmatn', Arial, sans-serif; padding: 20px; direction: rtl; }
          .header { text-align: center; margin-bottom: 30px; }
          .info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: right; }
          th { background-color: #f2f2f2; }
          .total { text-align: left; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${window.location.origin}/logo.svg" alt="HS6Tools" style="max-width: 150px; height: auto; margin-bottom: 20px;" />
          <h1>HS6Tools</h1>
          <h2>${invoiceTitle} #${order.orderNumber}</h2>
          <p>${invoiceDate}: ${formatDate(order.createdAt)}</p>
        </div>
        <div class="info">
          <div>
            <h3>${customerInfo}</h3>
            <p>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</p>
            <p>${order.shippingAddress.phone}</p>
            <p>${order.shippingAddress.addressLine1}</p>
            <p>${order.shippingAddress.city}، ${order.shippingAddress.state}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>${product}</th>
              <th>${quantity}</th>
              <th>${unitPrice}</th>
              <th>${total}</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${formatPrice(item.unitPrice)}</td>
                <td>${formatPrice(item.totalPrice)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">
          <p>${subtotal}: ${formatPrice(order.subtotal)}</p>
          <p>${shippingAmount}: ${formatPrice(order.shippingAmount)}</p>
          <p>${taxAmount}: ${formatPrice(order.taxAmount)}</p>
          ${order.discountAmount > 0 ? `<p>${discount}: ${formatPrice(order.discountAmount)}</p>` : ''}
          <p style="font-size: 1.2em; margin-top: 10px;">${totalAmount}: ${formatPrice(order.totalAmount)}</p>
        </div>
      </body>
      </html>
    `;
    
    // Create blob and download
    const blob = new Blob([invoiceHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${order.orderNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleTrackOrder = () => {
    if (!order?.trackingNumber) return;
    
    // For TIPAX shipping
    if (order.shippingMethod === 'TIPAX') {
      window.open(`https://tipaxco.com/tracking/${order.trackingNumber}`, '_blank');
    } 
    // For POST shipping
    else if (order.shippingMethod === 'POST') {
      window.open(`https://tracking.post.ir/?code=${order.trackingNumber}`, '_blank');
    }
    // For other shipping methods, show tracking number
    else {
      alert(`${messages?.customer?.orderDetails?.trackingNumber || 'شماره پیگیری'}: ${order.trackingNumber}`);
    }
  };

  const handlePayOrder = async () => {
    if (!order) return;
    
    try {
      const t = messages?.customer?.orderDetails;
      
      // Request payment URL from Zarinpal
      const response = await fetch('/api/payment/zarinpal/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: order.id }),
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
      const t = messages?.customer?.orderDetails;
      alert(String((t as Record<string, unknown>)?.paymentError || 'خطا در درخواست پرداخت. لطفاً دوباره تلاش کنید.'));
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    
    const t = messages?.customer?.orderDetails;
    const confirmMessage = String((t as Record<string, unknown>)?.cancelOrderConfirm || `آیا از لغو سفارش ${order.orderNumber} اطمینان دارید؟`);
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch(`/api/customer/orders/${order.id}`, {
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
      
      // Reload order details
      const orderData = await fetchOrderDetails(order.id);
      if (orderData) {
        setOrder(orderData as Order);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      const t = messages?.customer?.orderDetails;
      alert(String((t as Record<string, unknown>)?.cancelOrderError || 'خطا در لغو سفارش. لطفاً دوباره تلاش کنید.'));
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-white/5 rounded-xl"></div>
            <div className="h-64 bg-white/5 rounded-xl"></div>
            <div className="h-48 bg-white/5 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{messages?.customer?.orderDetails?.errorLoadingOrder || 'خطا در بارگذاری سفارش'}</h3>
        <p className="text-gray-400 mb-4">{error || (messages?.customer?.orderDetails?.orderNotFound || 'سفارش یافت نشد')}</p>
        <button 
          onClick={() => router.back()}
          className="px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          {messages?.customer?.orderDetails?.backButton || 'بازگشت'}
        </button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const paymentStatusInfo = getPaymentStatusInfo(order.paymentStatus);

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="glass rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {messages?.customer?.orderDetails?.orderNumber || 'سفارش #'} {order.orderNumber}
            </h1>
            <p className="text-gray-300">
              {messages?.customer?.orderDetails?.orderCreatedAt || 'ثبت شده در'} {formatDate(order.createdAt)}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <span className={`px-4 py-2 text-sm rounded-full ${statusInfo.color} flex items-center gap-2`}>
              <span>{statusInfo.icon}</span>
              {statusInfo.label}
            </span>
            <span className={`px-4 py-2 text-sm rounded-full ${paymentStatusInfo.color} flex items-center gap-2`}>
              <span>{paymentStatusInfo.icon}</span>
              {paymentStatusInfo.label}
            </span>
          </div>
        </div>

        {/* Order Actions */}
        <div className="flex flex-wrap gap-3">
          {/* Pay Now button - show if payment is pending and order is not cancelled */}
          {order.paymentStatus === 'PENDING' && 
           order.status !== 'CANCELLED' && 
           order.status !== 'DELIVERED' && 
           order.status !== 'REFUNDED' && (
            <button
              onClick={handlePayOrder}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              {(messages?.customer?.orderDetails as Record<string, unknown>)?.payNowButton as string || 'پرداخت سفارش'}
            </button>
          )}
          
          {/* Cancel Order button - show if order can be cancelled */}
          {/* Orders cannot be cancelled if: paid, cancelled, delivered, or refunded */}
          {order.paymentStatus !== 'PAID' &&
           order.status !== 'CANCELLED' && 
           order.status !== 'DELIVERED' && 
           order.status !== 'REFUNDED' && (
            <button
              onClick={handleCancelOrder}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {(messages?.customer?.orderDetails as Record<string, unknown>)?.cancelOrderButton as string || 'لغو سفارش'}
            </button>
          )}
          
          {order.status === 'DELIVERED' && (
            <button
              onClick={handleReorder}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {messages?.customer?.orderDetails?.reorderButton || 'سفارش مجدد'}
            </button>
          )}
          
          <button
            onClick={handleDownloadInvoice}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {messages?.customer?.orderDetails?.downloadInvoiceButton || 'دانلود فاکتور'}
          </button>

          {order.trackingNumber && (
            <button
              onClick={handleTrackOrder}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              {messages?.customer?.orderDetails?.trackOrderButton || 'پیگیری سفارش'}
            </button>
          )}
        </div>
      </div>

      {/* Order Summary */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">{messages?.customer?.orderDetails?.orderSummary || 'خلاصه سفارش'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400 text-sm">{messages?.customer?.orderDetails?.totalAmount || 'مبلغ کل'}</p>
            <p className="text-2xl font-bold text-white">{formatPrice(order.totalAmount)}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400 text-sm">{messages?.customer?.orderDetails?.subtotal || 'مبلغ کالاها'}</p>
            <p className="text-lg font-semibold text-white">{formatPrice(order.subtotal)}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400 text-sm">{messages?.customer?.orderDetails?.shippingAmount || 'هزینه ارسال'}</p>
            <p className="text-lg font-semibold text-white">{formatPrice(order.shippingAmount)}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400 text-sm">{messages?.customer?.orderDetails?.taxAmount || 'مالیات'}</p>
            <p className="text-lg font-semibold text-white">{formatPrice(order.taxAmount)}</p>
          </div>
        </div>
        
        {order.discountAmount > 0 && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-400 font-medium">
              {messages?.customer?.orderDetails?.discountApplied || 'تخفیف اعمال شده:'} {formatPrice(order.discountAmount)}
            </p>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">{messages?.customer?.orderDetails?.orderItems || 'محصولات سفارش'}</h2>
        <div className="space-y-4">
          {order.items.map((item: OrderItem) => (
            <div key={item.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
              {item.image && (
                <ResilientImage
                  src={item.image} 
                  alt={item.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="text-white font-medium">{item.name}</h3>
                {item.description && (
                  <p className="text-gray-300 text-sm mt-1">{item.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-300">
                  <span>{messages?.customer?.orderDetails?.sku || 'SKU:'} {item.sku}</span>
                  <span>{messages?.customer?.orderDetails?.quantity || 'تعداد:'} {item.quantity}</span>
                  <span>{messages?.customer?.orderDetails?.unitPrice || 'قیمت واحد:'} {formatPrice(item.unitPrice)}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-white">{formatPrice(item.totalPrice)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Information */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">{messages?.customer?.orderDetails?.paymentInformation || 'اطلاعات پرداخت'}</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">{messages?.customer?.orderDetails?.paymentMethod || 'روش پرداخت:'}</span>
              <span className="text-white">{getPaymentMethodLabel(order.paymentMethod)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{messages?.customer?.orderDetails?.paymentStatus || 'وضعیت پرداخت:'}</span>
              <span className={`px-2 py-1 text-xs rounded-full ${paymentStatusInfo.color}`}>
                {paymentStatusInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">{messages?.customer?.orderDetails?.shippingInformation || 'اطلاعات ارسال'}</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">{messages?.customer?.orderDetails?.shippingMethod || 'روش ارسال:'}</span>
              <span className="text-white">{getShippingMethodLabel(order.shippingMethod)}</span>
            </div>
            {order.trackingNumber && (
              <div className="flex justify-between">
                <span className="text-gray-400">{messages?.customer?.orderDetails?.trackingNumber || 'شماره پیگیری:'}</span>
                <span className="text-white font-mono text-sm">{order.trackingNumber}</span>
              </div>
            )}
            {order.shippedAt && (
              <div className="flex justify-between">
                <span className="text-gray-400">{messages?.customer?.orderDetails?.shippedAt || 'تاریخ ارسال:'}</span>
                <span className="text-white">{formatDate(order.shippedAt)}</span>
              </div>
            )}
            {order.deliveredAt && (
              <div className="flex justify-between">
                <span className="text-gray-400">{messages?.customer?.orderDetails?.deliveredAt || 'تاریخ تحویل:'}</span>
                <span className="text-white">{formatDate(order.deliveredAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="grid grid-cols-1 gap-6">
        {/* Shipping Address */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">{messages?.customer?.orderDetails?.shippingAddress || 'آدرس ارسال'}</h2>
          <div className="space-y-2 text-gray-300">
            <p className="font-medium text-white">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            </p>
            {order.shippingAddress.company && (
              <p>{order.shippingAddress.company}</p>
            )}
            <p>{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && (
              <p>{order.shippingAddress.addressLine2}</p>
            )}
            <p>
              {order.shippingAddress.city}، {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
            <p>{messages?.customer?.orderDetails?.phone || 'تلفن:'} {order.shippingAddress.phone}</p>
          </div>
        </div>
      </div>

      {/* Customer Note */}
      {order.customerNote && (
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">{messages?.customer?.orderDetails?.customerNote || 'یادداشت سفارش'}</h2>
          <p className="text-gray-300 bg-white/5 p-4 rounded-lg">
            {order.customerNote}
          </p>
        </div>
      )}

      {/* Back Button */}
      <div className="text-center">
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          {messages?.customer?.orderDetails?.backToOrdersButton || 'بازگشت به لیست سفارشات'}
        </button>
      </div>
    </div>
  );
}
