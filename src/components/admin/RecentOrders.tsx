"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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

  useEffect(() => {
    // Simulate API call to fetch recent orders
    const fetchOrders = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data - replace with actual API call
      setOrders([
        {
          id: "1",
          orderNumber: "HS6-12345",
          customerName: "احمد محمدی",
          amount: 2500000,
          status: "delivered",
          createdAt: "2 روز پیش"
        },
        {
          id: "2",
          orderNumber: "HS6-12344",
          customerName: "علی رضایی",
          amount: 1800000,
          status: "shipped",
          createdAt: "1 هفته پیش"
        },
        {
          id: "3",
          orderNumber: "HS6-12343",
          customerName: "مریم کریمی",
          amount: 3200000,
          status: "pending",
          createdAt: "3 روز پیش"
        },
        {
          id: "4",
          orderNumber: "HS6-12342",
          customerName: "حسن احمدی",
          amount: 950000,
          status: "processing",
          createdAt: "5 روز پیش"
        }
      ]);
      
      setIsLoading(false);
    };

    fetchOrders();
  }, []);

  const getStatusInfo = (status: string) => {
    const statusMap = {
      pending: { label: "در انتظار پرداخت", color: "bg-yellow-500/20 text-yellow-400" },
      processing: { label: "در حال پردازش", color: "bg-blue-500/20 text-blue-400" },
      shipped: { label: "در حال ارسال", color: "bg-purple-500/20 text-purple-400" },
      delivered: { label: "تحویل شده", color: "bg-green-500/20 text-green-400" },
      cancelled: { label: "لغو شده", color: "bg-red-500/20 text-red-400" }
    };
    
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
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
          <h2 className="text-2xl font-bold text-white">سفارشات اخیر</h2>
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
        <h2 className="text-2xl font-bold text-white">سفارشات اخیر</h2>
        <Link 
          href={`/${locale}/admin/orders`}
          className="text-primary-orange hover:text-orange-400 text-sm transition-colors duration-200"
        >
          مشاهده همه →
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
          <p className="text-gray-400">هیچ سفارشی یافت نشد</p>
        </div>
      )}
    </div>
  );
}
