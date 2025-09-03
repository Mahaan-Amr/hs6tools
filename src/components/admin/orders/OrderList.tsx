"use client";

import { useState } from "react";
import { AdminOrder } from "@/types/admin";
import { OrderStatus, PaymentStatus, PaymentMethod, ShippingMethod } from "@prisma/client";
import { formatPrice } from "@/utils/format";

interface OrderListProps {
  orders: AdminOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  onPageChange: (page: number) => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onPaymentStatusChange: (orderId: string, paymentStatus: PaymentStatus) => void;
  onTrackingNumberUpdate: (orderId: string, trackingNumber: string) => void;
  onViewOrder: (order: AdminOrder) => void;
}

export default function OrderList({
  orders,
  pagination,
  onPageChange,
  onStatusChange,
  onPaymentStatusChange,
  onTrackingNumberUpdate,
  onViewOrder
}: OrderListProps) {
  const [editingTracking, setEditingTracking] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState("");

  const getStatusInfo = (status: OrderStatus) => {
    const statusMap = {
      PENDING: { label: "در انتظار", color: "bg-yellow-500/20 text-yellow-400" },
      CONFIRMED: { label: "تأیید شده", color: "bg-blue-500/20 text-blue-400" },
      PROCESSING: { label: "در حال پردازش", color: "bg-purple-500/20 text-purple-400" },
      SHIPPED: { label: "ارسال شده", color: "bg-indigo-500/20 text-indigo-400" },
      DELIVERED: { label: "تحویل شده", color: "bg-green-500/20 text-green-400" },
      CANCELLED: { label: "لغو شده", color: "bg-red-500/20 text-red-400" },
      REFUNDED: { label: "بازپرداخت شده", color: "bg-gray-500/20 text-gray-400" }
    };
    
    return statusMap[status] || statusMap.PENDING;
  };

  const getPaymentStatusInfo = (status: PaymentStatus) => {
    const statusMap = {
      PENDING: { label: "در انتظار", color: "bg-yellow-500/20 text-yellow-400" },
      PAID: { label: "پرداخت شده", color: "bg-green-500/20 text-green-400" },
      FAILED: { label: "ناموفق", color: "bg-red-500/20 text-red-400" },
      REFUNDED: { label: "بازپرداخت شده", color: "bg-gray-500/20 text-gray-400" },
      PARTIALLY_REFUNDED: { label: "بازپرداخت جزئی", color: "bg-orange-500/20 text-orange-400" }
    };
    
    return statusMap[status] || statusMap.PENDING;
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    const methodMap = {
      ZARINPAL: "زرین‌پال",
      BANK_TRANSFER: "انتقال بانکی",
      CASH_ON_DELIVERY: "پرداخت در محل"
    };
    
    return methodMap[method] || method;
  };

  const getShippingMethodLabel = (method: ShippingMethod) => {
    const methodMap = {
      TIPAX: "تیپاکس",
      POST: "پست",
      EXPRESS: "پست سریع"
    };
    
    return methodMap[method] || method;
  };

  const handleTrackingEdit = (orderId: string, currentTracking: string) => {
    setEditingTracking(orderId);
    setTrackingInput(currentTracking || "");
  };

  const handleTrackingSave = (orderId: string) => {
    onTrackingNumberUpdate(orderId, trackingInput);
    setEditingTracking(null);
    setTrackingInput("");
  };

  const handleTrackingCancel = () => {
    setEditingTracking(null);
    setTrackingInput("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">هیچ سفارشی یافت نشد</h3>
        <p className="text-gray-400">سفارشات شما در اینجا نمایش داده خواهند شد</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Orders Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">شماره سفارش</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">مشتری</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">مبلغ کل</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">وضعیت</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">وضعیت پرداخت</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">روش پرداخت</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">روش ارسال</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">شماره پیگیری</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">تاریخ</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const paymentStatusInfo = getPaymentStatusInfo(order.paymentStatus);
                
                return (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{order.orderNumber}</div>
                      <div className="text-gray-400 text-sm">{order._count.orderItems} آیتم</div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">
                        {order.user.firstName} {order.user.lastName}
                      </div>
                      <div className="text-gray-400 text-sm">{order.customerEmail}</div>
                      {order.customerPhone && (
                        <div className="text-gray-400 text-sm">{order.customerPhone}</div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{formatPrice(order.totalAmount)}</div>
                      {order.discountAmount > 0 && (
                        <div className="text-green-400 text-sm">
                          تخفیف: {formatPrice(order.discountAmount)}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${statusInfo.color} focus:ring-2 focus:ring-primary-orange`}
                      >
                        <option value="PENDING">در انتظار</option>
                        <option value="CONFIRMED">تأیید شده</option>
                        <option value="PROCESSING">در حال پردازش</option>
                        <option value="SHIPPED">ارسال شده</option>
                        <option value="DELIVERED">تحویل شده</option>
                        <option value="CANCELLED">لغو شده</option>
                        <option value="REFUNDED">بازپرداخت شده</option>
                      </select>
                    </td>
                    
                    <td className="px-6 py-4">
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => onPaymentStatusChange(order.id, e.target.value as PaymentStatus)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${paymentStatusInfo.color} focus:ring-2 focus:ring-primary-orange`}
                      >
                        <option value="PENDING">در انتظار</option>
                        <option value="PAID">پرداخت شده</option>
                        <option value="FAILED">ناموفق</option>
                        <option value="REFUNDED">بازپرداخت شده</option>
                        <option value="PARTIALLY_REFUNDED">بازپرداخت جزئی</option>
                      </select>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className="text-gray-300 text-sm">
                        {getPaymentMethodLabel(order.paymentMethod)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className="text-gray-300 text-sm">
                        {getShippingMethodLabel(order.shippingMethod)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      {editingTracking === order.id ? (
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <input
                            type="text"
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm w-24"
                            placeholder="شماره پیگیری"
                          />
                          <button
                            onClick={() => handleTrackingSave(order.id)}
                            className="text-green-400 hover:text-green-300 text-sm"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleTrackingCancel}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <span className="text-gray-300 text-sm">
                            {order.trackingNumber || "نامشخص"}
                          </span>
                          <button
                            onClick={() => handleTrackingEdit(order.id, order.trackingNumber || "")}
                            className="text-primary-orange hover:text-orange-400 text-sm"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-gray-300 text-sm">{formatDate(order.createdAt)}</div>
                      {order.shippedAt && (
                        <div className="text-blue-400 text-xs">ارسال: {formatDate(order.shippedAt)}</div>
                      )}
                      {order.deliveredAt && (
                        <div className="text-green-400 text-xs">تحویل: {formatDate(order.deliveredAt)}</div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onViewOrder(order)}
                        className="px-3 py-1 bg-primary-orange/20 text-primary-orange rounded-lg hover:bg-primary-orange/30 transition-colors text-sm"
                      >
                        مشاهده
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-gray-400 text-sm">
            نمایش {((pagination.page - 1) * pagination.limit) + 1} تا {Math.min(pagination.page * pagination.limit, pagination.total)} از {pagination.total} سفارش
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              قبلی
            </button>
            
            <div className="flex items-center space-x-1 space-x-reverse">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    pageNum === pagination.page
                      ? "bg-primary-orange text-white"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              بعدی
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
