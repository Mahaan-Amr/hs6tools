"use client";

import { useState } from "react";
import Link from "next/link";

interface Opportunity {
  id: string;
  title: string;
  description?: string;
  value: number;
  stage: string;
  probability: number;
  expectedClose?: string;
  assignedTo?: string;
  createdAt: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
    phone?: string;
  };
  activities: Array<{
    id: string;
    type: string;
    description: string;
    outcome?: string;
    nextAction?: string;
    scheduledAt?: string;
    completedAt?: string;
    createdAt: string;
  }>;
  quotes: Array<{
    id: string;
    quoteNumber: string;
    status: string;
    totalAmount: number;
    validUntil: string;
    createdAt: string;
  }>;
}

interface OpportunityListProps {
  opportunities: Opportunity[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  locale: string;
}

export default function OpportunityList({
  opportunities,
  currentPage,
  totalPages,
  totalCount,
  locale
}: OpportunityListProps) {
  const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>([]);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "PROSPECTING": return "bg-blue-500/20 text-blue-400";
      case "QUALIFICATION": return "bg-yellow-500/20 text-yellow-400";
      case "PROPOSAL": return "bg-purple-500/20 text-purple-400";
      case "NEGOTIATION": return "bg-orange-500/20 text-orange-400";
      case "CLOSED_WON": return "bg-green-500/20 text-green-400";
      case "CLOSED_LOST": return "bg-red-500/20 text-red-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case "PROSPECTING": return "پیش‌فروش";
      case "QUALIFICATION": return "صلاحیت‌سنجی";
      case "PROPOSAL": return "پیشنهاد";
      case "NEGOTIATION": return "مذاکره";
      case "CLOSED_WON": return "بسته شده (موفق)";
      case "CLOSED_LOST": return "بسته شده (ناموفق)";
      default: return stage;
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return "text-green-400";
    if (probability >= 60) return "text-yellow-400";
    if (probability >= 40) return "text-orange-400";
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

  const handleSelectAll = () => {
    if (selectedOpportunities.length === opportunities.length) {
      setSelectedOpportunities([]);
    } else {
      setSelectedOpportunities(opportunities.map(opp => opp.id));
    }
  };

  const handleSelectOpportunity = (opportunityId: string) => {
    setSelectedOpportunities(prev => 
      prev.includes(opportunityId) 
        ? prev.filter(id => id !== opportunityId)
        : [...prev, opportunityId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="flex items-center justify-between text-gray-300">
        <div className="text-sm">
          نمایش {opportunities.length} از {totalCount} فرصت
        </div>
        {selectedOpportunities.length > 0 && (
          <div className="flex items-center space-x-4 space-x-reverse">
            <span className="text-sm">{selectedOpportunities.length} مورد انتخاب شده</span>
            <button className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors">
              حذف انتخاب شده
            </button>
          </div>
        )}
      </div>

      {/* Opportunities Table */}
      <div className="glass rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr>
                <th className="text-right p-4">
                  <input
                    type="checkbox"
                    checked={selectedOpportunities.length === opportunities.length && opportunities.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-primary-orange bg-gray-700 border-gray-600 rounded focus:ring-primary-orange focus:ring-2"
                  />
                </th>
                <th className="text-right p-4 text-white font-medium">فرصت</th>
                <th className="text-right p-4 text-white font-medium">مشتری</th>
                <th className="text-right p-4 text-white font-medium">مرحله</th>
                <th className="text-right p-4 text-white font-medium">ارزش</th>
                <th className="text-right p-4 text-white font-medium">احتمال</th>
                <th className="text-right p-4 text-white font-medium">تاریخ بسته شدن</th>
                <th className="text-right p-4 text-white font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((opportunity) => (
                <tr key={opportunity.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedOpportunities.includes(opportunity.id)}
                      onChange={() => handleSelectOpportunity(opportunity.id)}
                      className="w-4 h-4 text-primary-orange bg-gray-700 border-gray-600 rounded focus:ring-primary-orange focus:ring-2"
                    />
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="text-white font-medium">{opportunity.title}</div>
                      {opportunity.description && (
                        <div className="text-gray-400 text-sm mt-1 line-clamp-2">
                          {opportunity.description}
                        </div>
                      )}
                      <div className="text-gray-500 text-xs mt-1">
                        ایجاد شده: {formatDate(opportunity.createdAt)}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-10 h-10 bg-primary-orange rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {opportunity.customer.firstName.charAt(0)}{opportunity.customer.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {opportunity.customer.firstName} {opportunity.customer.lastName}
                        </div>
                        <div className="text-gray-400 text-sm">{opportunity.customer.email}</div>
                        {opportunity.customer.company && (
                          <div className="text-gray-400 text-sm">{opportunity.customer.company}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(opportunity.stage)}`}>
                      {getStageLabel(opportunity.stage)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-white font-medium">
                      {formatCurrency(opportunity.value)}
                    </div>
                    <div className="text-gray-400 text-sm">
                      وزن‌دار: {formatCurrency(opportunity.value * (opportunity.probability / 100))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`font-bold ${getProbabilityColor(opportunity.probability)}`}>
                      {opportunity.probability}%
                    </div>
                  </td>
                  <td className="p-4">
                    {opportunity.expectedClose ? (
                      <div className="text-gray-300 text-sm">
                        {formatDate(opportunity.expectedClose)}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Link
                        href={`/${locale}/admin/crm/opportunities/${opportunity.id}`}
                        className="p-2 text-primary-orange hover:bg-primary-orange/20 rounded-lg transition-colors"
                        title="مشاهده جزئیات"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <button
                        className="p-2 text-blue-400 hover:bg-blue-400/20 rounded-lg transition-colors"
                        title="ویرایش"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        className="p-2 text-green-400 hover:bg-green-400/20 rounded-lg transition-colors"
                        title="ایجاد پیشنهاد"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/10">
            <div className="flex items-center space-x-2 space-x-reverse">
              <button
                disabled={currentPage === 1}
                className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                قبلی
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? "bg-primary-orange text-white"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                بعدی
              </button>
            </div>
            
            <div className="text-gray-300 text-sm">
              صفحه {currentPage} از {totalPages}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
