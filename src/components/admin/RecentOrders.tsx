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
      const msgs = await getMessages(locale);
      setMessages(msgs);
    };
    loadMessages();
  }, [locale]);

  useEffect(() => {
    if (!messages || !messages.admin?.recentOrders) return;

    const t = messages.admin.recentOrders;

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

    // Fetch real recent orders from API
    const fetchOrders = async () => {
      setIsLoading(true);
      
      try {
        const response = await fetch('/api/orders?limit=5&sortBy=createdAt&sortOrder=desc');
        const result = await response.json();
        
        if (result.success && result.data) {
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
            amount: order.totalAmount,
            status: order.status.toLowerCase(),
            createdAt: formatRelativeTime(order.createdAt)
          }));
          setOrders(ordersData);
        } else {
          console.error('Error fetching recent orders:', result.error);
          setOrders([]);
        }
      } catch (error) {
        console.error('Error fetching recent orders:', error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [messages]);

  if (!messages || !messages.admin?.recentOrders) {
    return <div className="text-white p-4">Loading...</div>;
  }

  const t = messages.admin.recentOrders;

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

  if (isLoading) {
    return (
      <div className="glass rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">{String(t.title)}</h2>
          <div className="w-24 h-8 bg-white/10 rounded animate-pulse"></div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div className="space-y-2">
                <div className="w-32 h-4 bg-white/10 rounded animate-pulse"></div>
                <div className="w-24 h-3 bg-white/10 rounded animate-pulse"></div>
              </div>
              <div className="space-y-2 text-right">
                <div className="w-24 h-4 bg-white/10 rounded animate-pulse"></div>
                <div className="w-20 h-6 bg-white/10 rounded-full animate-pulse"></div>
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
