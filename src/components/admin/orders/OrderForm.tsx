"use client";

import { useState, useEffect } from "react";
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">ویرایش سفارش</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Information */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">اطلاعات سفارش</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">شماره سفارش</label>
                <div className="text-white font-medium">{order.orderNumber}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">تاریخ ایجاد</label>
                <div className="text-gray-300">{formatDate(order.createdAt)}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">مبلغ کل</label>
                <div className="text-white font-medium">{formatPrice(order.totalAmount)}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">تعداد آیتم‌ها</label>
                <div className="text-gray-300">{order._count.orderItems} آیتم</div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">اطلاعات مشتری</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">نام و نام خانوادگی</label>
                <div className="text-white">
                  {order.user.firstName} {order.user.lastName}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">ایمیل</label>
                <div className="text-gray-300">{order.customerEmail}</div>
              </div>
              
              {order.customerPhone && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">شماره تلفن</label>
                  <div className="text-gray-300">{order.customerPhone}</div>
                </div>
              )}
              
              {order.customerNote && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-2">یادداشت مشتری</label>
                  <div className="text-gray-300 bg-white/5 p-3 rounded-lg">{order.customerNote}</div>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">آیتم‌های سفارش</h3>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
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
                      <div className="text-white font-medium">{item.name}</div>
                      <div className="text-gray-400 text-sm">SKU: {item.sku}</div>
                      {item.variant && (
                        <div className="text-gray-400 text-sm">تنوع: {item.variant.name}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{formatPrice(item.totalPrice)}</div>
                    <div className="text-gray-400 text-sm">تعداد: {item.quantity}</div>
                    <div className="text-gray-400 text-sm">قیمت واحد: {formatPrice(item.unitPrice)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Management */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">مدیریت سفارش</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Status */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">وضعیت سفارش</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value as OrderStatus)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
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
                <label className="block text-sm font-medium text-white mb-2">وضعیت پرداخت</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => handleInputChange("paymentStatus", e.target.value as PaymentStatus)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
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
                <label className="block text-sm font-medium text-white mb-2">
                  شماره پیگیری
                  {formData.status === "SHIPPED" && <span className="text-red-400">*</span>}
                </label>
                <input
                  type="text"
                  value={formData.trackingNumber}
                  onChange={(e) => handleInputChange("trackingNumber", e.target.value)}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange ${
                    errors.trackingNumber ? "border-red-400" : "border-white/20"
                  }`}
                  placeholder="شماره پیگیری ارسال"
                />
                {errors.trackingNumber && (
                  <p className="text-red-400 text-sm mt-1">{errors.trackingNumber}</p>
                )}
              </div>

              {/* Shipped Date */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">تاریخ ارسال</label>
                <input
                  type="datetime-local"
                  value={formData.shippedAt ? formData.shippedAt.slice(0, 16) : ""}
                  onChange={(e) => handleInputChange("shippedAt", e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
                />
              </div>

              {/* Delivered Date */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">تاریخ تحویل</label>
                <input
                  type="datetime-local"
                  value={formData.deliveredAt ? formData.deliveredAt.slice(0, 16) : ""}
                  onChange={(e) => handleInputChange("deliveredAt", e.target.value)}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange ${
                    errors.deliveredAt ? "border-red-400" : "border-white/20"
                  }`}
                />
                {errors.deliveredAt && (
                  <p className="text-red-400 text-sm mt-1">{errors.deliveredAt}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 space-x-reverse">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-gradient-to-r from-primary-orange to-orange-500 text-white font-semibold rounded-xl hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
