"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getMessages, Messages } from "@/lib/i18n";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface RecentOrdersProps {
  locale: string;
}

export default function RecentOrders({ locale }: RecentOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Messages | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const msgs = await getMessages(locale);
        setMessages(msgs);
      } catch (error) {
        console.error('Error loading messages in RecentOrders:', error);
        // Don't block rendering - components will use fallbacks
      }
    };
    loadMessages();
  }, [locale]);

  useEffect(() => {
    // Fetch orders independently - don't wait for messages
    const fetchOrders = async () => {
      setIsLoading(true);
      
      try {
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch('/api/orders?limit=5&sortBy=createdAt&sortOrder=desc', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data && result.data.data && Array.isArray(result.data.data)) {
          console.log('RecentOrders - Received data:', result.data.data);
          
          // Get messages for formatting (use fallback if not loaded)
          const t = messages?.admin?.recentOrders || {
            unknown: "نامشخص",
            daysAgo: "روز پیش",
            hoursAgo: "ساعت پیش",
            minutesAgo: "دقیقه پیش",
            justNow: "همین الان"
          };
          
          const formatRelativeTime = (dateString: string) => {
            const date = new Date(dateString);
            const now = new Date();
            const diffInMs = now.getTime() - date.getTime();
            const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
            const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

            if (diffInDays > 0) {
              return `${diffInDays} ${String(t.daysAgo)}`;
            } else if (diffInHours > 0) {
              return `${diffInHours} ${String(t.hoursAgo)}`;
            } else if (diffInMinutes > 0) {
              return `${diffInMinutes} ${String(t.minutesAgo)}`;
            } else {
              return String(t.justNow);
            }
          };
          
          const ordersData = result.data.data.map((order: {
            id: string;
            orderNumber: string;
            customer?: { name?: string; email?: string };
            totalAmount: number;
            status: string;
            createdAt: string;
          }) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customer?.name || order.customer?.email || String(t.unknown),
            amount: Number(order.totalAmount) || 0, // Ensure it's a number
            status: String(order.status).toLowerCase(),
            createdAt: formatRelativeTime(order.createdAt)
          }));
          console.log('RecentOrders - Mapped orders data:', ordersData);
          console.log('RecentOrders - Setting orders state, count:', ordersData.length);
          setOrders(ordersData);
        } else {
          console.error('Error fetching recent orders:', result.error || 'Unknown error', result);
          setOrders([]);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.error('Recent orders fetch timeout');
        } else {
          console.error('Error fetching recent orders:', error);
        }
        // Don't block rendering - show empty state
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fetch independently - don't depend on messages. We intentionally don't include messages in deps to avoid race conditions.

  // Don't block rendering - use fallbacks if messages aren't loaded
  const t = messages?.admin?.recentOrders || {
    title: "سفارشات اخیر",
    viewAll: "مشاهده همه",
    noOrders: "هیچ سفارشی یافت نشد",
    unknown: "نامشخص",
    daysAgo: "روز پیش",
    hoursAgo: "ساعت پیش",
    minutesAgo: "دقیقه پیش",
    justNow: "همین الان",
    statusPending: "در انتظار",
    statusProcessing: "در حال پردازش",
    statusShipped: "ارسال شده",
    statusDelivered: "تحویل داده شده",
    statusCancelled: "لغو شده"
  };

  // Show skeleton ONLY while loading messages AND data hasn't loaded yet
  // Once data is loaded (isLoading is false), always render content even if messages aren't loaded
  if ((!messages || !messages.admin?.recentOrders) && isLoading) {
    return (
      <div className="glass rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="w-32 h-8 bg-white/10 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div className="space-y-2">
                <div className="w-32 h-4 bg-white/10 rounded animate-pulse"></div>
                <div className="w-24 h-3 bg-white/10 rounded animate-pulse"></div>
              </div>
              <div className="w-24 h-4 bg-white/10 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Always render content - show loading state or data

  const getStatusInfo = (status: string) => {
    const statusMap = {
      pending: { label: String(t.statusPending), color: "bg-yellow-500/20 text-yellow-400" },
      processing: { label: String(t.statusProcessing), color: "bg-blue-500/20 text-blue-400" },
      shipped: { label: String(t.statusShipped), color: "bg-purple-500/20 text-purple-400" },
      delivered: { label: String(t.statusDelivered), color: "bg-green-500/20 text-green-400" },
      cancelled: { label: String(t.statusCancelled), color: "bg-red-500/20 text-red-400" }
    };
    
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const formatCurrency = (amount: number) => {
    const localeCode = locale === "fa" ? "fa-IR" : locale === "ar" ? "ar-SA" : "en-US";
    return new Intl.NumberFormat(localeCode, {
      style: "currency",
      currency: locale === "fa" ? "IRR" : "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Show loading state while fetching orders (only if we haven't shown skeleton already)
  // This handles the case where messages are loaded but data is still fetching
  if (isLoading && messages && messages.admin?.recentOrders) {
    return (
      <div className="glass rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">{String(t.title)}</h2>
          <Link 
            href={`/${locale}/admin/orders`}
            className="text-primary-orange hover:text-orange-400 text-sm transition-colors duration-200"
          >
            {String(t.viewAll)} →
          </Link>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl animate-pulse">
              <div className="space-y-2">
                <div className="w-32 h-4 bg-white/10 rounded"></div>
                <div className="w-24 h-3 bg-white/10 rounded"></div>
              </div>
              <div className="space-y-2 text-right">
                <div className="w-24 h-4 bg-white/10 rounded"></div>
                <div className="w-20 h-6 bg-white/10 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">{String(t.title)}</h2>
        <Link 
          href={`/${locale}/admin/orders`}
          className="text-primary-orange hover:text-orange-400 text-sm transition-colors duration-200"
        >
          {String(t.viewAll)} →
        </Link>
      </div>
      
      <div className="space-y-4">
        {orders.map((order) => {
          const statusInfo = getStatusInfo(order.status);
          
          return (
            <div key={order.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors duration-200">
              <div>
                <h3 className="text-white font-medium">{order.orderNumber}</h3>
                <p className="text-gray-400 text-sm">{order.customerName}</p>
                <p className="text-gray-500 text-xs">{order.createdAt}</p>
              </div>
              
              <div className="text-right">
                <p className="text-white font-medium mb-2">
                  {formatCurrency(order.amount)}
                </p>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {orders.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-gray-400">{String(t.noOrders)}</p>
        </div>
      )}
    </div>
  );
}
