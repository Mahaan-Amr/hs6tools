"use client";

import { useState, useEffect } from "react";
import { getMessages, Messages } from "@/lib/i18n";

interface Customer {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string; // Fallback if firstName/lastName not available
  email: string;
  lifecycleStage?: string;
  customerTier?: string;
  healthScore?: number;
  metrics?: {
    totalOrders: number;
    totalSpent: number;
    daysSinceLastOrder?: number;
    daysSinceLastLogin?: number;
  };
  // Fields from analytics API
  totalOrders?: number;
  totalSpent?: number;
  paidOrders?: number;
  averageOrderValue?: number;
  daysSinceLastOrder?: number;
  daysSinceLastLogin?: number;
  customerType?: string;
}

interface CustomerLifecycleManagerProps {
  locale: string;
}

export default function CustomerLifecycleManager({ locale }: CustomerLifecycleManagerProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [messages, setMessages] = useState<Messages | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const msgs = await getMessages(locale);
        setMessages(msgs);
      } catch (error) {
        console.error('Error loading messages in CustomerLifecycleManager:', error);
      }
    };
    loadMessages();
  }, [locale]);

  // Get translations with fallbacks
  const t = messages?.admin?.crm?.customer360 || {
    lifecycleStage: "مرحله",
    customerTier: "سطح",
    healthScore: "امتیاز سلامت",
    totalSpent: "مجموع خرید",
    totalOrders: "کل سفارشات"
  };

  const lifecycleStages = [
    { value: "LEAD", label: locale === "fa" ? "لید" : locale === "ar" ? "فرصة" : "Lead", color: "bg-blue-500/20 text-blue-400" },
    { value: "PROSPECT", label: locale === "fa" ? "پیشنهاد" : locale === "ar" ? "عميل محتمل" : "Prospect", color: "bg-cyan-500/20 text-cyan-400" },
    { value: "CUSTOMER", label: locale === "fa" ? "مشتری" : locale === "ar" ? "عميل" : "Customer", color: "bg-green-500/20 text-green-400" },
    { value: "LOYAL_CUSTOMER", label: locale === "fa" ? "مشتری وفادار" : locale === "ar" ? "عميل مخلص" : "Loyal Customer", color: "bg-purple-500/20 text-purple-400" },
    { value: "AT_RISK", label: locale === "fa" ? "در معرض خطر" : locale === "ar" ? "معرض للخطر" : "At Risk", color: "bg-orange-500/20 text-orange-400" },
    { value: "CHURNED", label: locale === "fa" ? "از دست رفته" : locale === "ar" ? "مفقود" : "Churned", color: "bg-red-500/20 text-red-400" }
  ];

  const customerTiers = [
    { value: "PLATINUM", label: locale === "fa" ? "پلاتین" : locale === "ar" ? "بلاتينيوم" : "Platinum", color: "bg-purple-500/20 text-purple-400" },
    { value: "GOLD", label: locale === "fa" ? "طلایی" : locale === "ar" ? "ذهبي" : "Gold", color: "bg-yellow-500/20 text-yellow-400" },
    { value: "SILVER", label: locale === "fa" ? "نقره‌ای" : locale === "ar" ? "فضي" : "Silver", color: "bg-gray-500/20 text-gray-400" },
    { value: "BRONZE", label: locale === "fa" ? "برنزی" : locale === "ar" ? "برونزي" : "Bronze", color: "bg-orange-500/20 text-orange-400" }
  ];

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      // For now, use the existing customers API endpoint
      const response = await fetch("/api/analytics?type=customers&period=365");
      const result = await response.json();

      if (result.success) {
        // Transform the analytics data to match our interface
        const allCustomers = [
          ...result.data.customerSegments.highValue,
          ...result.data.customerSegments.frequent,
          ...result.data.customerSegments.dormant,
          ...result.data.customerSegments.regular
        ].map(customer => ({
          ...customer,
          // Ensure firstName and lastName exist, fallback to parsing name if needed
          firstName: customer.firstName || (customer.name ? customer.name.split(' ')[0] : ''),
          lastName: customer.lastName || (customer.name ? customer.name.split(' ').slice(1).join(' ') : ''),
          // Map analytics fields to metrics if needed
          metrics: customer.metrics || {
            totalOrders: customer.totalOrders || 0,
            totalSpent: customer.totalSpent || 0,
            daysSinceLastOrder: customer.daysSinceLastOrder,
            daysSinceLastLogin: customer.daysSinceLastLogin
          },
          // Ensure lifecycleStage and customerTier are set (from analytics API response)
          lifecycleStage: customer.lifecycleStage || "CUSTOMER",
          customerTier: customer.customerTier || "BRONZE",
          healthScore: customer.healthScore || 0
        }));
        setCustomers(allCustomers);
      } else {
        setError(result.error || "Failed to fetch customers");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setError("Failed to fetch customers");
    } finally {
      setIsLoading(false);
    }
  };

  const updateCustomerStage = async (customerId: string, newStage: string) => {
    try {
      const response = await fetch(`/api/crm/customers/${customerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ lifecycleStage: newStage })
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setCustomers(prev => prev.map(customer => 
          customer.id === customerId 
            ? { ...customer, lifecycleStage: newStage }
            : customer
        ));
      } else {
        console.error("Failed to update customer stage:", result.error);
      }
    } catch (error) {
      console.error("Error updating customer stage:", error);
    }
  };

  const updateCustomerTier = async (customerId: string, newTier: string) => {
    try {
      const response = await fetch(`/api/crm/customers/${customerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ customerTier: newTier })
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setCustomers(prev => prev.map(customer => 
          customer.id === customerId 
            ? { ...customer, customerTier: newTier }
            : customer
        ));
      } else {
        console.error("Failed to update customer tier:", result.error);
      }
    } catch (error) {
      console.error("Error updating customer tier:", error);
    }
  };

  const recalculateHealthScores = async () => {
    try {
      const response = await fetch("/api/crm/customers/health-scores", {
        method: "POST"
      });

      const result = await response.json();

      if (result.success) {
        // Refresh customer data
        fetchCustomers();
      } else {
        console.error("Failed to recalculate health scores:", result.error);
      }
    } catch (error) {
      console.error("Error recalculating health scores:", error);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const formatCurrency = (amount: number) => {
    const localeCode = locale === "fa" ? "fa-IR" : locale === "ar" ? "ar-SA" : "en-US";
    return new Intl.NumberFormat(localeCode, {
      style: 'currency',
      currency: locale === "fa" ? "IRR" : "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredCustomers = customers.filter(customer => {
    if (selectedStage && customer.lifecycleStage !== selectedStage) return false;
    if (selectedTier && customer.customerTier !== selectedTier) return false;
    return true;
  });

  // Group customers by lifecycle stage
  const customersByStage = lifecycleStages.map(stage => ({
    ...stage,
    customers: filteredCustomers.filter(c => c.lifecycleStage === stage.value),
    count: filteredCustomers.filter(c => c.lifecycleStage === stage.value).length
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 mb-4">❌ {error}</div>
        <button 
          onClick={fetchCustomers}
          className="px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-primary-orange-dark transition-colors"
        >
          {locale === "fa" ? "تلاش مجدد" : locale === "ar" ? "إعادة المحاولة" : "Try Again"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {messages?.admin?.crm?.customerLifecycle || "Customer Lifecycle Management"}
          </h1>
          <p className="text-gray-300 mt-2">
            {locale === "fa" ? "مدیریت مراحل و سطوح چرخه زندگی مشتری" : 
             locale === "ar" ? "إدارة مراحل ومستويات دورة حياة العميل" :
             "Manage customer lifecycle stages and tiers"}
          </p>
        </div>
        <button
          onClick={recalculateHealthScores}
          className="px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-primary-orange-dark transition-colors"
        >
          {locale === "fa" ? "محاسبه مجدد امتیاز سلامت" :
           locale === "ar" ? "إعادة حساب نقاط الصحة" :
           "Recalculate Health Scores"}
        </button>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {locale === "fa" ? "فیلتر بر اساس مرحله" :
               locale === "ar" ? "تصفية حسب المرحلة" :
               "Filter by Lifecycle Stage"}
            </label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full pl-3 pr-10 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
            >
              <option value="">
                {locale === "fa" ? "همه مراحل" : locale === "ar" ? "جميع المراحل" : "All Stages"}
              </option>
              {lifecycleStages.map((stage) => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {locale === "fa" ? "فیلتر بر اساس سطح" :
               locale === "ar" ? "تصفية حسب المستوى" :
               "Filter by Customer Tier"}
            </label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full pl-3 pr-10 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
            >
              <option value="">
                {locale === "fa" ? "همه سطوح" : locale === "ar" ? "جميع المستويات" : "All Tiers"}
              </option>
              {customerTiers.map((tier) => (
                <option key={tier.value} value={tier.value}>
                  {tier.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lifecycle Stage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customersByStage.map((stage) => (
          <div key={stage.value} className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{stage.label}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${stage.color}`}>
                {stage.count}
              </span>
            </div>
            
            <div className="space-y-3">
              {stage.customers.slice(0, 5).map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-white font-medium">
                      {customer.firstName} {customer.lastName}
                    </div>
                    <div className="text-sm text-gray-300">
                      {formatCurrency(customer.metrics?.totalSpent || customer.totalSpent || 0)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${getHealthScoreColor(customer.healthScore || 0)}`}>
                      {customer.healthScore || 0}
                    </div>
                    <div className="text-xs text-gray-400">
                      {customer.metrics?.totalOrders || customer.totalOrders || 0} {locale === "fa" ? "سفارش" : locale === "ar" ? "طلب" : "orders"}
                    </div>
                  </div>
                </div>
              ))}
              
              {stage.customers.length > 5 && (
                <div className="text-center text-gray-400 text-sm">
                  +{stage.customers.length - 5} {locale === "fa" ? "مشتری بیشتر" : locale === "ar" ? "عملاء آخرين" : "more customers"}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Customer List */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            {locale === "fa" ? `همه مشتریان (${filteredCustomers.length})` :
             locale === "ar" ? `جميع العملاء (${filteredCustomers.length})` :
             `All Customers (${filteredCustomers.length})`}
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {locale === "fa" ? "مشتری" : locale === "ar" ? "العميل" : "Customer"}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {String(t.lifecycleStage)}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {String(t.customerTier)}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {String(t.healthScore)}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {String(t.totalSpent)}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {locale === "fa" ? "عملیات" : locale === "ar" ? "الإجراءات" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-white/5">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary-orange to-primary-orange-dark rounded-2xl flex items-center justify-center text-white text-base font-bold shadow-lg shadow-primary-orange/20">
                        {(customer.firstName || '').charAt(0)}{(customer.lastName || '').charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-white leading-tight">
                          {customer.firstName || ''} {customer.lastName || ''}
                        </div>
                        <div className="text-xs text-gray-300">{customer.email || ''}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={customer.lifecycleStage || "CUSTOMER"}
                      onChange={(e) => updateCustomerStage(customer.id, e.target.value)}
                      className="pl-3 pr-10 py-1.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all appearance-none cursor-pointer"
                    >
                      {lifecycleStages.map((stage) => (
                        <option key={stage.value} value={stage.value} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                          {stage.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={customer.customerTier || "BRONZE"}
                      onChange={(e) => updateCustomerTier(customer.id, e.target.value)}
                      className="pl-3 pr-10 py-1.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all appearance-none cursor-pointer"
                    >
                      {customerTiers.map((tier) => (
                        <option key={tier.value} value={tier.value} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                          {tier.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-lg font-bold ${getHealthScoreColor(customer.healthScore || 0)}`}>
                      {customer.healthScore || 0}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {formatCurrency(customer.metrics?.totalSpent || customer.totalSpent || 0)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a
                      href={`/${locale}/admin/crm/customers/${customer.id}`}
                      className="text-primary-orange hover:text-primary-orange-dark transition-colors"
                    >
                      {locale === "fa" ? "مشاهده جزئیات" : locale === "ar" ? "عرض التفاصيل" : "View Details"}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
