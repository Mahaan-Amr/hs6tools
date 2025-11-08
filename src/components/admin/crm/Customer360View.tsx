"use client";

import { useState, useEffect, useCallback } from "react";
import CustomerInteractionForm from "./CustomerInteractionForm";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  orderItems: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}

interface Interaction {
  id: string;
  type: string;
  subject: string;
  description: string;
  outcome: string;
  createdAt: string;
  createdBy: string;
  content: string;
}

interface Opportunity {
  id: string;
  title: string;
  stage: string;
  value: number;
  probability: number;
  expectedCloseDate: string;
  createdAt: string;
  description: string;
}

interface Quote {
  id: string;
  quoteNumber: string;
  status: string;
  totalAmount: number;
  validUntil: string;
  createdAt: string;
  total: number;
}

interface Customer360Data {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
  
  // CRM Fields
  customerType?: string;
  industry?: string;
  companySize?: string;
  customerTier?: string;
  healthScore?: number;
  tags: string[];
  notes?: string;
  assignedSalesRep?: string;
  leadSource?: string;
  lifecycleStage?: string;
  lastInteraction?: string;
  nextFollowUp?: string;
  
  // Metrics
  metrics: {
    totalOrders: number;
    totalSpent: number;
    paidOrders: number;
    averageOrderValue: number;
    daysSinceLastOrder?: number;
    daysSinceLastLogin?: number;
    totalReviews: number;
    totalWishlistItems: number;
    totalInteractions: number;
    totalOpportunities: number;
    totalQuotes: number;
  };
  
  // Recent Activity
  recentActivity: {
    orders: number;
    interactions: number;
    reviews: number;
    wishlistItems: number;
  };
  
  // Top Categories
  topCategories: Array<{
    name: string;
    count: number;
  }>;
  
  // Related Data
  addresses: unknown[];
  orders: Order[];
  reviews: unknown[];
  wishlistItems: unknown[];
  interactions: Interaction[];
  opportunities: Opportunity[];
  quotes: Quote[];
  campaigns: unknown[];
  settings?: unknown;
}

interface Customer360ViewProps {
  customerId: string;
}

export default function Customer360View({ customerId }: Customer360ViewProps) {
  const [customer, setCustomer] = useState<Customer360Data | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showInteractionForm, setShowInteractionForm] = useState(false);

  const fetchCustomerData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/crm/customers/${customerId}`);
      const result = await response.json();

      if (result.success) {
        setCustomer(result.data);
      } else {
        setError(result.error || "Failed to fetch customer data");
      }
    } catch (error) {
      console.error("Error fetching customer data:", error);
      setError("خطا در بارگذاری اطلاعات مشتری");
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchCustomerData();
  }, [fetchCustomerData]);

  const handleInteractionSuccess = () => {
    setShowInteractionForm(false);
    fetchCustomerData(); // Refresh customer data
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'IRR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">در حال بارگذاری اطلاعات مشتری...</div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 mb-4">❌ {error || "مشتری یافت نشد"}</div>
        <button 
          onClick={fetchCustomerData}
          className="px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-primary-orange-dark transition-colors"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Glass Customer Header */}
      <div className="glass rounded-3xl p-4 sm:p-6 lg:p-8">
        {/* Mobile: Stack everything vertically */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
          {/* Customer Info */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-orange rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold">
              {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-white truncate">
                {customer.firstName} {customer.lastName}
              </h1>
              <p className="text-gray-300 text-sm sm:text-base truncate">{customer.email}</p>
              {customer.company && (
                <p className="text-gray-400 text-xs sm:text-sm truncate">{customer.company} - {customer.position}</p>
              )}
            </div>
          </div>
          
          {/* Status Cards - Responsive Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:flex lg:items-center lg:space-x-4 lg:space-x-reverse">
            {/* Health Score */}
            <div className="px-2 py-2 sm:px-4 sm:py-2 rounded-lg bg-white/5 text-center">
              <div className="text-xs sm:text-sm text-gray-300">امتیاز سلامت</div>
              <div className={`text-lg sm:text-2xl font-bold ${getHealthScoreColor(customer.healthScore || 0)}`}>
                {customer.healthScore || 0}
              </div>
            </div>
            
            {/* Customer Tier */}
            <div className="px-2 py-2 sm:px-4 sm:py-2 rounded-lg bg-white/5 text-center">
              <div className="text-xs sm:text-sm text-gray-300">سطح</div>
              <div className="text-sm sm:text-lg font-bold text-white">
                {customer.customerTier || "BRONZE"}
              </div>
            </div>
            
            {/* Lifecycle Stage */}
            <div className="px-2 py-2 sm:px-4 sm:py-2 rounded-lg bg-white/5 text-center">
              <div className="text-xs sm:text-sm text-gray-300">مرحله</div>
              <div className="text-sm sm:text-lg font-bold text-white">
                {customer.lifecycleStage || "CUSTOMER"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="glass rounded-3xl p-3 sm:p-4 hover:scale-105 transition-transform duration-300">
          <div className="text-xs sm:text-sm text-gray-300 mb-1">مجموع خرید</div>
          <div className="text-lg sm:text-2xl font-bold text-white">
            {formatCurrency(customer.metrics.totalSpent)}
          </div>
        </div>
        
        <div className="glass rounded-3xl p-3 sm:p-4 hover:scale-105 transition-transform duration-300">
          <div className="text-xs sm:text-sm text-gray-300 mb-1">کل سفارشات</div>
          <div className="text-lg sm:text-2xl font-bold text-white">
            {customer.metrics.totalOrders}
          </div>
        </div>
        
        <div className="glass rounded-3xl p-3 sm:p-4 hover:scale-105 transition-transform duration-300">
          <div className="text-xs sm:text-sm text-gray-300 mb-1">میانگین سفارش</div>
          <div className="text-lg sm:text-2xl font-bold text-white">
            {formatCurrency(customer.metrics.averageOrderValue)}
          </div>
        </div>
        
        <div className="glass rounded-3xl p-3 sm:p-4 hover:scale-105 transition-transform duration-300">
          <div className="text-xs sm:text-sm text-gray-300 mb-1">آخرین سفارش</div>
          <div className="text-lg sm:text-2xl font-bold text-white">
            {customer.metrics.daysSinceLastOrder ? 
              `${customer.metrics.daysSinceLastOrder} روز پیش` : 
              "هرگز"
            }
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass rounded-3xl p-4 sm:p-6 lg:p-8">
        <div className="flex flex-wrap gap-2 sm:gap-4 space-x-reverse mb-6">
          {[
            { id: "overview", label: "نمای کلی" },
            { id: "orders", label: "سفارشات" },
            { id: "interactions", label: "تعاملات" },
            { id: "opportunities", label: "فرصت‌ها" },
            { id: "quotes", label: "پیشنهادات" },
            { id: "activity", label: "فعالیت" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base ${
                activeTab === tab.id
                  ? "bg-primary-orange text-white"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Customer Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-4">اطلاعات مشتری</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-300">نوع مشتری:</span>
                  <span className="text-white">{customer.customerType || "B2C"}</span>
                </div>
                
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-300">صنعت:</span>
                  <span className="text-white">{customer.industry || "نامشخص"}</span>
                </div>
                
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-300">اندازه شرکت:</span>
                  <span className="text-white">{customer.companySize || "نامشخص"}</span>
                </div>
                
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-300">منبع سرنخ:</span>
                  <span className="text-white">{customer.leadSource || "نامشخص"}</span>
                </div>
                
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-300">نماینده فروش:</span>
                  <span className="text-white">{customer.assignedSalesRep || "تخصیص نیافته"}</span>
                </div>
                
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-300">عضو از:</span>
                  <span className="text-white">{formatDate(customer.createdAt)}</span>
                </div>
                
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-300">آخرین ورود:</span>
                  <span className="text-white">
                    {customer.lastLoginAt ? formatDate(customer.lastLoginAt) : "هرگز"}
                  </span>
                </div>
              </div>
              
              {/* Tags */}
              {customer.tags.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {customer.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-orange/20 text-primary-orange text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Notes */}
              {customer.notes && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">یادداشت‌ها</h4>
                  <p className="text-white text-sm bg-white/5 p-3 rounded-lg">
                    {customer.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Recent Activity & Top Categories */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">فعالیت اخیر (30 روز)</h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="glass rounded-lg p-3">
                    <div className="text-xs sm:text-sm text-gray-300">سفارشات</div>
                    <div className="text-lg sm:text-xl font-bold text-white">{customer.recentActivity.orders}</div>
                  </div>
                  <div className="glass rounded-lg p-3">
                    <div className="text-xs sm:text-sm text-gray-300">تعاملات</div>
                    <div className="text-lg sm:text-xl font-bold text-white">{customer.recentActivity.interactions}</div>
                  </div>
                  <div className="glass rounded-lg p-3">
                    <div className="text-xs sm:text-sm text-gray-300">نظرات</div>
                    <div className="text-lg sm:text-xl font-bold text-white">{customer.recentActivity.reviews}</div>
                  </div>
                  <div className="glass rounded-lg p-3">
                    <div className="text-xs sm:text-sm text-gray-300">لیست علاقه‌مندی</div>
                    <div className="text-lg sm:text-xl font-bold text-white">{customer.recentActivity.wishlistItems}</div>
                  </div>
                </div>
              </div>

              {/* Top Categories */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">دسته‌بندی‌های برتر</h3>
                <div className="space-y-2">
                  {customer.topCategories.map((category, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-white">{category.name}</span>
                      <span className="text-primary-orange font-bold">{category.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">سفارشات اخیر</h3>
            {customer.orders.length > 0 ? (
              <div className="space-y-3">
                {customer.orders.map((order) => (
                  <div key={order.id} className="glass rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-white">سفارش #{order.orderNumber}</div>
                        <div className="text-sm text-gray-300">
                          {formatDate(order.createdAt)} • {order.orderItems.length} آیتم
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">{formatCurrency(Number(order.totalAmount))}</div>
                        <div className={`text-sm px-2 py-1 rounded-full ${
                          order.status === "DELIVERED" ? "bg-green-500/20 text-green-400" :
                          order.status === "SHIPPED" ? "bg-blue-500/20 text-blue-400" :
                          order.status === "PROCESSING" ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-gray-500/20 text-gray-400"
                        }`}>
                          {order.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                سفارشی یافت نشد
              </div>
            )}
          </div>
        )}

        {activeTab === "interactions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">تعاملات مشتری</h3>
              <button
                onClick={() => setShowInteractionForm(true)}
                className="px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-primary-orange-dark transition-colors"
              >
                افزودن تعامل
              </button>
            </div>
            {customer.interactions.length > 0 ? (
              <div className="space-y-3">
                {customer.interactions.map((interaction) => (
                  <div key={interaction.id} className="glass rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-white">{interaction.type}</div>
                        {interaction.subject && (
                          <div className="text-sm text-gray-300">{interaction.subject}</div>
                        )}
                        <div className="text-sm text-gray-400 mt-1">{interaction.content}</div>
                      </div>
                      <div className="text-sm text-gray-400">
                        {formatDate(interaction.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No interactions found
              </div>
            )}
          </div>
        )}

        {activeTab === "opportunities" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">فرصت‌های فروش</h3>
            {customer.opportunities.length > 0 ? (
              <div className="space-y-3">
                {customer.opportunities.map((opportunity) => (
                  <div key={opportunity.id} className="glass rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-white">{opportunity.title}</div>
                        {opportunity.description && (
                          <div className="text-sm text-gray-300 mt-1">{opportunity.description}</div>
                        )}
                        <div className="text-sm text-gray-400 mt-2">
                          مرحله: {opportunity.stage} • احتمال: {opportunity.probability}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">{formatCurrency(Number(opportunity.value))}</div>
                        <div className="text-sm text-gray-400">
                          {formatDate(opportunity.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                فرصتی یافت نشد
              </div>
            )}
          </div>
        )}

        {activeTab === "quotes" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">پیشنهادات</h3>
            {customer.quotes.length > 0 ? (
              <div className="space-y-3">
                {customer.quotes.map((quote) => (
                  <div key={quote.id} className="glass rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-white">پیشنهاد #{quote.quoteNumber}</div>
                        <div className="text-sm text-gray-400 mt-1">
                          معتبر تا: {formatDate(quote.validUntil)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">{formatCurrency(Number(quote.total))}</div>
                        <div className={`text-sm px-2 py-1 rounded-full ${
                          quote.status === "ACCEPTED" ? "bg-green-500/20 text-green-400" :
                          quote.status === "SENT" ? "bg-blue-500/20 text-blue-400" :
                          quote.status === "REJECTED" ? "bg-red-500/20 text-red-400" :
                          "bg-gray-500/20 text-gray-400"
                        }`}>
                          {quote.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                پیشنهادی یافت نشد
              </div>
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">جدول زمانی فعالیت</h3>
            <div className="text-center py-8 text-gray-400">
              جدول زمانی فعالیت به زودی...
            </div>
          </div>
        )}
      </div>

      {/* Interaction Form Modal */}
      {showInteractionForm && customer && (
        <CustomerInteractionForm
          customerId={customer.id}
          onSuccess={handleInteractionSuccess}
          onCancel={() => setShowInteractionForm(false)}
        />
      )}
    </div>
  );
}
