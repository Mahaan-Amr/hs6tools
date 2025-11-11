"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AdminOrder, UpdateOrderData } from "@/types/admin";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { formatPrice } from "@/utils/format";

interface OrderFormProps {
  order: AdminOrder;
  onSave: (data: UpdateOrderData) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export default function OrderForm({
  order,
  onSave,
  onCancel,
  isSaving
}: OrderFormProps) {
  const [formData, setFormData] = useState<UpdateOrderData>({
    id: order.id,
    status: order.status,
    paymentStatus: order.paymentStatus,
    trackingNumber: order.trackingNumber || "",
    shippedAt: order.shippedAt || "",
    deliveredAt: order.deliveredAt || ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({
      id: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber || "",
      shippedAt: order.shippedAt || "",
      deliveredAt: order.deliveredAt || ""
    });
  }, [order]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  const handleInputChange = (field: keyof UpdateOrderData, value: string | OrderStatus | PaymentStatus) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.trackingNumber && formData.status === "SHIPPED") {
      newErrors.trackingNumber = "شماره پیگیری برای سفارشات ارسال شده الزامی است";
    }

    if (formData.deliveredAt && !formData.shippedAt) {
      newErrors.deliveredAt = "سفارش باید ابتدا ارسال شود تا بتواند تحویل شود";
    }

    if (formData.deliveredAt && formData.shippedAt) {
      const shippedDate = new Date(formData.shippedAt);
      const deliveredDate = new Date(formData.deliveredAt);
      if (deliveredDate < shippedDate) {
        newErrors.deliveredAt = "تاریخ تحویل نمی‌تواند قبل از تاریخ ارسال باشد";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
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

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxHeight: '90vh',
          margin: 'auto'
        }}
      >
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">ویرایش سفارش</h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Information */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">اطلاعات سفارش</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">شماره سفارش</label>
                <div className="text-gray-900 dark:text-white font-medium">{order.orderNumber}</div>
              </div>
              
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">تاریخ ایجاد</label>
                <div className="text-gray-600 dark:text-gray-400">{formatDate(order.createdAt)}</div>
              </div>
              
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">مبلغ کل</label>
                <div className="text-gray-900 dark:text-white font-medium">{formatPrice(order.totalAmount)}</div>
              </div>
              
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">تعداد آیتم‌ها</label>
                <div className="text-gray-600 dark:text-gray-400">{order._count.orderItems} آیتم</div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">اطلاعات مشتری</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">نام و نام خانوادگی</label>
                <div className="text-gray-900 dark:text-white">
                  {order.user.firstName} {order.user.lastName}
                </div>
              </div>
              
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">ایمیل</label>
                <div className="text-gray-600 dark:text-gray-400">{order.customerEmail}</div>
              </div>
              
              {order.customerPhone && (
                <div>
                  <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">شماره تلفن</label>
                  <div className="text-gray-600 dark:text-gray-400">{order.customerPhone}</div>
                </div>
              )}
              
              {order.customerNote && (
                <div className="md:col-span-2">
                  <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">یادداشت مشتری</label>
                  <div className="text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">{order.customerNote}</div>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">آیتم‌های سفارش</h3>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <div className="text-gray-900 dark:text-white font-medium">{item.name}</div>
                      <div className="text-gray-600 dark:text-gray-400 text-sm">SKU: {item.sku}</div>
                      {item.variant && (
                        <div className="text-gray-600 dark:text-gray-400 text-sm">تنوع: {item.variant.name}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-900 dark:text-white font-medium">{formatPrice(item.totalPrice)}</div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">تعداد: {item.quantity}</div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">قیمت واحد: {formatPrice(item.unitPrice)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Management */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">مدیریت سفارش</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Status */}
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">وضعیت سفارش</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value as OrderStatus)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                >
                  <option value="PENDING">در انتظار</option>
                  <option value="CONFIRMED">تأیید شده</option>
                  <option value="PROCESSING">در حال پردازش</option>
                  <option value="SHIPPED">ارسال شده</option>
                  <option value="DELIVERED">تحویل شده</option>
                  <option value="CANCELLED">لغو شده</option>
                  <option value="REFUNDED">بازپرداخت شده</option>
                </select>
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">وضعیت پرداخت</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => handleInputChange("paymentStatus", e.target.value as PaymentStatus)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                >
                  <option value="PENDING">در انتظار</option>
                  <option value="PAID">پرداخت شده</option>
                  <option value="FAILED">ناموفق</option>
                  <option value="REFUNDED">بازپرداخت شده</option>
                  <option value="PARTIALLY_REFUNDED">بازپرداخت جزئی</option>
                </select>
              </div>

              {/* Tracking Number */}
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                  شماره پیگیری
                  {formData.status === "SHIPPED" && <span className="text-red-500 mr-1">*</span>}
                </label>
                <input
                  type="text"
                  value={formData.trackingNumber}
                  onChange={(e) => handleInputChange("trackingNumber", e.target.value)}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                    errors.trackingNumber ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="شماره پیگیری ارسال"
                />
                {errors.trackingNumber && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{errors.trackingNumber}</p>
                )}
              </div>

              {/* Shipped Date */}
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">تاریخ ارسال</label>
                <input
                  type="datetime-local"
                  value={formData.shippedAt ? formData.shippedAt.slice(0, 16) : ""}
                  onChange={(e) => handleInputChange("shippedAt", e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                />
              </div>

              {/* Delivered Date */}
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">تاریخ تحویل</label>
                <input
                  type="datetime-local"
                  value={formData.deliveredAt ? formData.deliveredAt.slice(0, 16) : ""}
                  onChange={(e) => handleInputChange("deliveredAt", e.target.value)}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                    errors.deliveredAt ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {errors.deliveredAt && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{errors.deliveredAt}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 bg-primary-orange text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-orange/30"
            >
              {isSaving ? "در حال ذخیره..." : "به‌روزرسانی"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Render modal using portal to document.body
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}
