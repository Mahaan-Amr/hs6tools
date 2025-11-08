"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  customerType?: string;
  industry?: string;
  companySize?: string;
  customerTier?: string;
  healthScore?: number;
  tags: string[];
  lifecycleStage?: string;
  lastLoginAt?: string;
  createdAt: string;
  metrics: {
    totalOrders: number;
    totalSpent: number;
    paidOrders: number;
    averageOrderValue: number;
    daysSinceLastOrder?: number;
    daysSinceLastLogin?: number;
  };
}

interface CustomerListProps {
  customers: Customer[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  search?: string;
  tier?: string;
  stage?: string;
  locale: string;
}

export default function CustomerList({
  customers,
  currentPage,
  totalPages,
  totalCount,
  search,
  tier,
  stage,
  locale
}: CustomerListProps) {
  const router = useRouter();
  const [localSearch, setLocalSearch] = useState(search || "");
  const [localTier, setLocalTier] = useState(tier || "");
  const [localStage, setLocalStage] = useState(stage || "");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (localSearch) params.set("search", localSearch);
    if (localTier) params.set("tier", localTier);
    if (localStage) params.set("stage", localStage);
    
    router.push(`/${locale}/admin/crm/customers?${params.toString()}`);
  };

  const handleReset = () => {
    setLocalSearch("");
    setLocalTier("");
    setLocalStage("");
    router.push(`/${locale}/admin/crm/customers`);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "PLATINUM": return "text-purple-400 bg-purple-500/20";
      case "GOLD": return "text-yellow-400 bg-yellow-500/20";
      case "SILVER": return "text-gray-400 bg-gray-500/20";
      case "BRONZE": return "text-orange-400 bg-orange-500/20";
      default: return "text-gray-400 bg-gray-500/20";
    }
  };

  const getLifecycleColor = (stage: string) => {
    switch (stage) {
      case "LEAD": return "text-blue-400 bg-blue-500/20";
      case "PROSPECT": return "text-cyan-400 bg-cyan-500/20";
      case "CUSTOMER": return "text-green-400 bg-green-500/20";
      case "LOYAL_CUSTOMER": return "text-purple-400 bg-purple-500/20";
      case "AT_RISK": return "text-orange-400 bg-orange-500/20";
      case "CHURNED": return "text-red-400 bg-red-500/20";
      default: return "text-gray-400 bg-gray-500/20";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'IRR',
      minimumFractionDigits: 0
    }).format(amount);
  };


  return (
    <div className="space-y-6">
      {/* Glass Filters Section */}
      <div className="glass rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">فیلتر و جستجو</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              جستجو
            </label>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="جستجو در مشتریان..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              سطح مشتری
            </label>
            <select
              value={localTier}
              onChange={(e) => setLocalTier(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
            >
              <option value="">همه سطوح</option>
              <option value="PLATINUM">پلاتین</option>
              <option value="GOLD">طلایی</option>
              <option value="SILVER">نقره‌ای</option>
              <option value="BRONZE">برنزی</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              مرحله چرخه زندگی
            </label>
            <select
              value={localStage}
              onChange={(e) => setLocalStage(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
            >
              <option value="">همه مراحل</option>
              <option value="LEAD">سرنخ</option>
              <option value="PROSPECT">مشتری احتمالی</option>
              <option value="CUSTOMER">مشتری</option>
              <option value="LOYAL_CUSTOMER">مشتری وفادار</option>
              <option value="AT_RISK">در معرض خطر</option>
              <option value="CHURNED">از دست رفته</option>
            </select>
          </div>
          
          <div className="flex items-end space-x-2 space-x-reverse">
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-primary-orange-dark transition-colors"
            >
              جستجو
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              بازنشانی
            </button>
          </div>
        </div>
      </div>

      {/* Glass Results Summary */}
      <div className="flex items-center justify-between text-gray-300">
        <div>
          نمایش {customers.length} از {totalCount} مشتری
        </div>
        <div>
          صفحه {currentPage} از {totalPages}
        </div>
      </div>

      {/* Glass Customer List */}
      <div className="glass rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                  مشتری
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                  سطح
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                  مرحله
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                  امتیاز سلامت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                  مجموع خرید
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                  سفارشات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                  آخرین فعالیت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-orange rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-white">
                          {customer.firstName} {customer.lastName}
                        </div>
                        <div className="text-sm text-gray-300">{customer.email}</div>
                        {customer.company && (
                          <div className="text-xs text-gray-400">{customer.company}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTierColor(customer.customerTier || "BRONZE")}`}>
                      {customer.customerTier || "BRONZE"}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLifecycleColor(customer.lifecycleStage || "CUSTOMER")}`}>
                      {customer.lifecycleStage || "CUSTOMER"}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-lg font-bold ${getHealthScoreColor(customer.healthScore || 0)}`}>
                      {customer.healthScore || 0}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {formatCurrency(customer.metrics.totalSpent)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {customer.metrics.totalOrders}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {customer.metrics.daysSinceLastOrder ? 
                      `${customer.metrics.daysSinceLastOrder} روز پیش` : 
                      "هرگز"
                    }
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/${locale}/admin/crm/customers/${customer.id}`}
                      className="text-primary-orange hover:text-primary-orange-dark transition-colors"
                    >
                      مشاهده جزئیات
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clean Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 space-x-reverse">
          <button
            onClick={() => {
              const params = new URLSearchParams();
              if (search) params.set("search", search);
              if (tier) params.set("tier", tier);
              if (stage) params.set("stage", stage);
              params.set("page", (currentPage - 1).toString());
              router.push(`/${locale}/admin/crm/customers?${params.toString()}`);
            }}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            قبلی
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => {
                const params = new URLSearchParams();
                if (search) params.set("search", search);
                if (tier) params.set("tier", tier);
                if (stage) params.set("stage", stage);
                params.set("page", page.toString());
                router.push(`/${locale}/admin/crm/customers?${params.toString()}`);
              }}
              className={`px-3 py-2 rounded-lg transition-colors ${
                page === currentPage
                  ? "bg-primary-orange text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => {
              const params = new URLSearchParams();
              if (search) params.set("search", search);
              if (tier) params.set("tier", tier);
              if (stage) params.set("stage", stage);
              params.set("page", (currentPage + 1).toString());
              router.push(`/${locale}/admin/crm/customers?${params.toString()}`);
            }}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            بعدی
          </button>
        </div>
      )}
    </div>
  );
}
