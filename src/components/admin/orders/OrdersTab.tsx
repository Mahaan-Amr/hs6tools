"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminOrder, UpdateOrderData } from "@/types/admin";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import OrderList from "./OrderList";
import OrderForm from "./OrderForm";
import { formatPrice } from "@/utils/format";

export default function OrdersTab() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    paymentStatus: "",
    dateRange: ""
  });
  
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0
  });

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
        ...(filters.dateRange && { dateRange: filters.dateRange })
      });

      const response = await fetch(`/api/orders?${params}`);
      const result = await response.json();

      if (result.success) {
        setOrders(result.data.data);
        setPagination(result.data.pagination);
      } else {
        console.error("Error fetching orders:", result.error);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, sortBy, sortOrder, filters]);

  // Fetch order statistics
  const fetchStats = async () => {
    try {
      const response = await fetch("/api/orders?limit=1000"); // Get all orders for stats
      const result = await response.json();

      if (result.success) {
        const allOrders = result.data.data;
        
        const newStats = {
          totalOrders: allOrders.length,
          pendingOrders: allOrders.filter((o: AdminOrder) => o.status === "PENDING").length,
          processingOrders: allOrders.filter((o: AdminOrder) => o.status === "PROCESSING").length,
          shippedOrders: allOrders.filter((o: AdminOrder) => o.status === "SHIPPED").length,
          deliveredOrders: allOrders.filter((o: AdminOrder) => o.status === "DELIVERED").length,
          cancelledOrders: allOrders.filter((o: AdminOrder) => o.status === "CANCELLED").length,
          totalRevenue: allOrders.reduce((sum: number, o: AdminOrder) => sum + o.totalAmount, 0)
        };
        
        setStats(newStats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Update order
  const handleOrderUpdate = async (data: UpdateOrderData) => {
    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/orders/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setOrders(prev => prev.map(order => 
          order.id === data.id ? result.data : order
        ));
        
        setShowOrderForm(false);
        setSelectedOrder(null);
        
        // Refresh stats
        fetchStats();
      } else {
        console.error("Error updating order:", result.error);
        alert("خطا در بروزرسانی سفارش");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("خطا در بروزرسانی سفارش");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: orderId, status })
      });

      const result = await response.json();

      if (result.success) {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? result.data : order
        ));
        fetchStats();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Handle payment status change
  const handlePaymentStatusChange = async (orderId: string, paymentStatus: PaymentStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: orderId, paymentStatus })
      });

      const result = await response.json();

      if (result.success) {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? result.data : order
        ));
        fetchStats();
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  // Handle tracking number update
  const handleTrackingNumberUpdate = async (orderId: string, trackingNumber: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: orderId, trackingNumber })
      });

      const result = await response.json();

      if (result.success) {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? result.data : order
        ));
      }
    } catch (error) {
      console.error("Error updating tracking number:", error);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Handle sort change
  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Handle view order
  const handleViewOrder = (order: AdminOrder) => {
    setSelectedOrder(order);
    setShowOrderForm(true);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setShowOrderForm(false);
    setSelectedOrder(null);
  };

  // Apply filters and sorting
  useEffect(() => {
    fetchOrders();
  }, [pagination.page, sortBy, sortOrder, filters, fetchOrders]);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-white mb-2">{stats.totalOrders}</div>
          <div className="text-gray-300">کل سفارشات</div>
        </div>
        
        <div className="glass rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-2">{stats.pendingOrders}</div>
          <div className="text-gray-300">در انتظار</div>
        </div>
        
        <div className="glass rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-blue-400 mb-2">{stats.processingOrders}</div>
          <div className="text-gray-300">در حال پردازش</div>
        </div>
        
        <div className="glass rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">{formatPrice(stats.totalRevenue)}</div>
          <div className="text-gray-300">کل درآمد</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="glass rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">جستجو</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="شماره سفارش، ایمیل، نام..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">وضعیت سفارش</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
            >
              <option value="">همه وضعیت‌ها</option>
              <option value="PENDING">در انتظار</option>
              <option value="CONFIRMED">تأیید شده</option>
              <option value="PROCESSING">در حال پردازش</option>
              <option value="SHIPPED">ارسال شده</option>
              <option value="DELIVERED">تحویل شده</option>
              <option value="CANCELLED">لغو شده</option>
              <option value="REFUNDED">بازپرداخت شده</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">وضعیت پرداخت</label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => handleFilterChange("paymentStatus", e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
            >
              <option value="">همه وضعیت‌ها</option>
              <option value="PENDING">در انتظار</option>
              <option value="PAID">پرداخت شده</option>
              <option value="FAILED">ناموفق</option>
              <option value="REFUNDED">بازپرداخت شده</option>
              <option value="PARTIALLY_REFUNDED">بازپرداخت جزئی</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">بازه زمانی</label>
            <input
              type="date"
              value={filters.dateRange}
              onChange={(e) => handleFilterChange("dateRange", e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
            />
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <span className="text-white text-sm">مرتب‌سازی بر اساس:</span>
            <button
              onClick={() => handleSortChange("createdAt")}
              className={`px-3 py-2 rounded-lg transition-colors ${
                sortBy === "createdAt"
                  ? "bg-primary-orange text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              تاریخ {sortBy === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
            <button
              onClick={() => handleSortChange("orderNumber")}
              className={`px-3 py-2 rounded-lg transition-colors ${
                sortBy === "orderNumber"
                  ? "bg-primary-orange text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              شماره سفارش {sortBy === "orderNumber" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
            <button
              onClick={() => handleSortChange("totalAmount")}
              className={`px-3 py-2 rounded-lg transition-colors ${
                sortBy === "totalAmount"
                  ? "bg-primary-orange text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              مبلغ {sortBy === "totalAmount" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
          </div>

          <div className="text-gray-400 text-sm">
            {isLoading ? "در حال بارگذاری..." : `${pagination.total} سفارش یافت شد`}
          </div>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="glass rounded-2xl p-8 text-center">
          <div className="w-16 h-16 border-4 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">در حال بارگذاری سفارشات...</p>
        </div>
      ) : (
        <OrderList
          orders={orders}
          pagination={pagination}
          onPageChange={handlePageChange}
          onStatusChange={handleStatusChange}
          onPaymentStatusChange={handlePaymentStatusChange}
          onTrackingNumberUpdate={handleTrackingNumberUpdate}
          onViewOrder={handleViewOrder}
        />
      )}

      {/* Order Form Modal */}
      {showOrderForm && selectedOrder && (
        <OrderForm
          order={selectedOrder}
          onSave={handleOrderUpdate}
          onCancel={handleCancelEdit}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
