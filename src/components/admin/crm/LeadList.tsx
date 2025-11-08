"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  source: string;
  status: string;
  score: number;
  assignedTo?: string;
  expectedValue?: number;
  expectedClose?: string;
  nextFollowUp?: string;
  createdAt: string;
  activities: any[];
  interactions: any[];
}

interface LeadListProps {
  leads: Lead[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  search: string;
  status: string;
  source: string;
  assignedTo: string;
  locale: string;
}

export default function LeadList({
  leads,
  currentPage,
  totalPages,
  totalCount,
  search,
  status,
  source,
  assignedTo,
  locale
}: LeadListProps) {
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW": return "bg-blue-500/20 text-blue-400";
      case "CONTACTED": return "bg-yellow-500/20 text-yellow-400";
      case "QUALIFIED": return "bg-green-500/20 text-green-400";
      case "PROPOSAL": return "bg-purple-500/20 text-purple-400";
      case "NEGOTIATION": return "bg-orange-500/20 text-orange-400";
      case "CONVERTED": return "bg-emerald-500/20 text-emerald-400";
      case "LOST": return "bg-red-500/20 text-red-400";
      case "UNQUALIFIED": return "bg-gray-500/20 text-gray-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case "WEBSITE": return "bg-blue-500/20 text-blue-400";
      case "REFERRAL": return "bg-green-500/20 text-green-400";
      case "SOCIAL_MEDIA": return "bg-purple-500/20 text-purple-400";
      case "EMAIL_CAMPAIGN": return "bg-orange-500/20 text-orange-400";
      case "TRADE_SHOW": return "bg-pink-500/20 text-pink-400";
      case "COLD_CALL": return "bg-red-500/20 text-red-400";
      case "PARTNER": return "bg-indigo-500/20 text-indigo-400";
      case "ADVERTISING": return "bg-yellow-500/20 text-yellow-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getScoreColor = (score: number) => {
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

  const handleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(lead => lead.id));
    }
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="flex items-center justify-between text-gray-300">
        <div className="text-sm">
          نمایش {leads.length} از {totalCount} لید
        </div>
        {selectedLeads.length > 0 && (
          <div className="flex items-center space-x-4 space-x-reverse">
            <span className="text-sm">{selectedLeads.length} مورد انتخاب شده</span>
            <button className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors">
              حذف انتخاب شده
            </button>
          </div>
        )}
      </div>

      {/* Leads Table */}
      <div className="glass rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr>
                <th className="text-right p-4">
                  <input
                    type="checkbox"
                    checked={selectedLeads.length === leads.length && leads.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-primary-orange bg-gray-700 border-gray-600 rounded focus:ring-primary-orange focus:ring-2"
                  />
                </th>
                <th className="text-right p-4 text-white font-medium">لید</th>
                <th className="text-right p-4 text-white font-medium">شرکت</th>
                <th className="text-right p-4 text-white font-medium">منبع</th>
                <th className="text-right p-4 text-white font-medium">وضعیت</th>
                <th className="text-right p-4 text-white font-medium">امتیاز</th>
                <th className="text-right p-4 text-white font-medium">ارزش مورد انتظار</th>
                <th className="text-right p-4 text-white font-medium">تاریخ ایجاد</th>
                <th className="text-right p-4 text-white font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => handleSelectLead(lead.id)}
                      className="w-4 h-4 text-primary-orange bg-gray-700 border-gray-600 rounded focus:ring-primary-orange focus:ring-2"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-10 h-10 bg-primary-orange rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {lead.firstName} {lead.lastName}
                        </div>
                        <div className="text-gray-400 text-sm">{lead.email}</div>
                        {lead.phone && (
                          <div className="text-gray-400 text-sm">{lead.phone}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      {lead.company && (
                        <div className="text-white font-medium">{lead.company}</div>
                      )}
                      {lead.position && (
                        <div className="text-gray-400 text-sm">{lead.position}</div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(lead.source)}`}>
                      {lead.source.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {lead.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className={`font-bold ${getScoreColor(lead.score)}`}>
                      {lead.score}
                    </div>
                  </td>
                  <td className="p-4">
                    {lead.expectedValue ? (
                      <div className="text-white font-medium">
                        {formatCurrency(lead.expectedValue)}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="text-gray-300 text-sm">
                      {formatDate(lead.createdAt)}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Link
                        href={`/${locale}/admin/crm/leads/${lead.id}`}
                        className="p-2 text-primary-orange hover:bg-primary-orange/20 rounded-lg transition-colors"
                        title="مشاهده جزئیات"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <button
                        className="p-2 text-green-400 hover:bg-green-400/20 rounded-lg transition-colors"
                        title="تبدیل به مشتری"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
