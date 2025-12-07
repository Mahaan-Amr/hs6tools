"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getMessages, Messages } from "@/lib/i18n";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { useSession } from "next-auth/react";

interface CheckoutSuccessPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderNumber?: string; refId?: string }>;
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

export default function CheckoutSuccessPage({ params, searchParams }: CheckoutSuccessPageProps) {
  const [locale, setLocale] = useState<string>("fa");
  const [orderNumber, setOrderNumber] = useState<string | undefined>(undefined);
  const [refId, setRefId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Messages | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const loadData = async () => {
      const { locale: currentLocale } = await params;
      const { orderNumber: orderNum, refId: refIdParam } = await searchParams;
      setLocale(currentLocale);
      setOrderNumber(orderNum);
      setRefId(refIdParam);
      const msgs = await getMessages(currentLocale);
      setMessages(msgs);
    };
    loadData();
  }, [params, searchParams]);

  // Fetch order details when orderNumber is available
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderNumber || !session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/customer/orders/${orderNumber}`);
        const result = await response.json();

        if (result.success && result.data) {
          setOrder(result.data);
        } else {
          setError(result.error || "Failed to load order details");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber && session?.user?.id) {
      fetchOrder();
    }
  }, [orderNumber, session?.user?.id]);

  if (!messages || !messages.checkout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange mx-auto"></div>
            <p className="text-gray-900 dark:text-white mt-4">{messages?.common?.loading || "Loading..."}</p>
          </div>
        </div>
      </div>
    );
  }

  const t = messages.checkout;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange mx-auto"></div>
            <p className="text-gray-900 dark:text-white mt-4">{String(t.orderProcessing || "Loading order details...")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {error || String(t.orderNotFound || "Order not found")}
            </h1>
            <Link
              href={`/${locale}/account?tab=orders`}
              className="inline-block bg-gradient-to-r from-primary-orange to-orange-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-glass-orange hover:scale-105 transition-all duration-200"
            >
              {String(messages?.customer?.orders?.viewAllOrders || "View Orders")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-500/20 text-green-400";
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-400";
      case "FAILED":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "PAID":
        return String(t.paymentStatusPaid || "Paid");
      case "PENDING":
        return String(t.paymentStatusPending || "Pending");
      case "FAILED":
        return String(t.paymentStatusFailed || "Failed");
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          {/* Success Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {String(t.successTitle)}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 max-w-2xl mx-auto text-justify leading-relaxed">
            {String(t.successMessage)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Order Details Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="glass rounded-3xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {String(t.orderItems || "Order Items")}
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    {item.image && (
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.description}</p>
                      )}
                      {item.variant && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">
                          {String(t.variant || "Variant")}: {item.variant.name}
                        </p>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {String(t.quantity || "Quantity")}: {item.quantity}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(item.totalPrice, "IRR")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 gap-6">
              {/* Shipping Address */}
              <div className="glass rounded-3xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {String(t.shippingAddress || "Shipping Address")}
                </h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium text-gray-900 dark:text-white">
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
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  <p>{order.shippingAddress.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass rounded-3xl p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {String(t.orderDetails)}
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{String(t.orderNumberLabel)}</span>
                  <span className="text-gray-900 dark:text-white font-medium">#{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{String(t.orderDateLabel)}</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {formatDateTime(order.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{String(t.orderStatusLabel)}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {getPaymentStatusText(order.paymentStatus)}
                  </span>
                </div>
                {refId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{String(t.paymentRefIdLabel || "Payment Reference:")}</span>
                    <span className="text-gray-900 dark:text-white font-medium">{refId}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{String(t.subtotal || "Subtotal")}</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(order.subtotal, "IRR")}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{String(t.discount || "Discount")}</span>
                      <span className="text-green-600 dark:text-green-400">-{formatCurrency(order.discountAmount, "IRR")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{String(t.shippingCost || "Shipping")}</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(order.shippingAmount, "IRR")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{String(t.tax || "Tax")}</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(order.taxAmount, "IRR")}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2">
                    <span className="text-gray-900 dark:text-white">{String(t.total || "Total")}</span>
                    <span className="text-primary-orange">{formatCurrency(order.totalAmount, "IRR")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Next Steps */}
        <div className="glass rounded-3xl p-8 mb-8 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{String(t.nextSteps)}</h3>
          <div className="space-y-3 text-left text-gray-600 dark:text-gray-300">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-orange/20 text-primary-orange rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                1
              </div>
              <p>{String(t.step1)}</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-orange/20 text-primary-orange rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                2
              </div>
              <p>{String(t.step2)}</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-orange/20 text-primary-orange rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                3
              </div>
              <p>{String(t.step3)}</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-orange/20 text-primary-orange rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                4
              </div>
              <p>{String(t.step4)}</p>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Link
            href={`/${locale}/account/orders/${order.id}`}
            className="inline-block bg-gradient-to-r from-primary-orange to-orange-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-glass-orange hover:scale-105 transition-all duration-200"
          >
            {String(t.viewOrderDetails || "View Order Details")}
          </Link>
          <Link
            href={`/${locale}/shop`}
            className="inline-block glass border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200"
          >
            {String(t.continueShopping || "Continue Shopping")}
          </Link>
        </div>
        
        {/* Contact Info */}
        <div className="mt-12 p-6 glass rounded-2xl max-w-lg mx-auto">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{String(t.needHelp || "Need Help?")}</h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {String(t.contactMessage || "If you have any questions about your order, please contact us:")}
          </p>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>📧 {String(t.email || "Email")}: support@hs6tools.com</p>
            <p>📞 {String(t.phone || "Phone")}: 021-12345678</p>
            <p>💬 {String(t.whatsapp || "WhatsApp")}: 09123456789</p>
          </div>
        </div>
      </div>
    </div>
  );
}
