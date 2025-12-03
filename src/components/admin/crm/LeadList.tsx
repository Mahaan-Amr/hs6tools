"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getMessages, Messages } from "@/lib/i18n";


interface LeadInteraction {
  id: string;
  type: string;
  subject?: string;
  content?: string;
  description?: string;
  outcome?: string;
  nextAction?: string;
  createdAt: string;
}

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
  assignedTo?: string;
  nextFollowUp?: string;
  createdAt: string;
  interactions: LeadInteraction[];
}

interface LeadListProps {
  leads: Lead[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  locale: string;
}

export default function LeadList({
  leads,
  currentPage,
  totalPages,
  totalCount,
  locale
}: LeadListProps) {
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [messages, setMessages] = useState<Messages | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessages(locale);
      setMessages(msgs);
    };
    loadMessages();
  }, [locale]);

  if (!messages || !messages.admin?.crm?.leads) {
    return <div className="text-white p-4">{messages?.common?.loading || "Loading..."}</div>;
  }

  const t = messages.admin.crm.leads;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW": return "bg-blue-500/20 text-blue-400";
      case "CONTACTED": return "bg-yellow-500/20 text-yellow-400";
      case "QUALIFIED": return "bg-green-500/20 text-green-400";
      case "CONVERTED": return "bg-emerald-500/20 text-emerald-400";
      case "LOST": return "bg-red-500/20 text-red-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case "WEBSITE": return "bg-blue-500/20 text-blue-400";
      case "REFERRAL": return "bg-green-500/20 text-green-400";
      case "SOCIAL_MEDIA": return "bg-purple-500/20 text-purple-400";
      case "EMAIL": return "bg-orange-500/20 text-orange-400";
      case "TRADE_SHOW": return "bg-pink-500/20 text-pink-400";
      case "PHONE": return "bg-red-500/20 text-red-400";
      case "PARTNER": return "bg-indigo-500/20 text-indigo-400";
      case "ADVERTISING": return "bg-yellow-500/20 text-yellow-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const formatDate = (dateString: string) => {
    const localeCode = locale === 'fa' ? 'fa-IR' : locale === 'ar' ? 'ar-SA' : 'en-US';
    return new Date(dateString).toLocaleDateString(localeCode);
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      'NEW': String(t.statusOptions?.new || ''),
      'CONTACTED': String(t.statusOptions?.contacted || ''),
      'QUALIFIED': String(t.statusOptions?.qualified || ''),
      'CONVERTED': String(t.statusOptions?.converted || ''),
      'LOST': String(t.statusOptions?.lost || '')
    };
    return statusMap[status] || status;
  };

  const getSourceLabel = (source: string): string => {
    const sourceMap: Record<string, string> = {
      'WEBSITE': String(t.sourceOptions?.website || ''),
      'REFERRAL': String(t.sourceOptions?.referral || ''),
      'SOCIAL_MEDIA': String(t.sourceOptions?.socialMedia || ''),
      'EMAIL': String(t.sourceOptions?.email || ''),
      'TRADE_SHOW': String(t.sourceOptions?.tradeShow || ''),
      'PHONE': String(t.sourceOptions?.phone || ''),
      'PARTNER': String(t.sourceOptions?.partner || ''),
      'ADVERTISING': String(t.sourceOptions?.advertising || ''),
      'OTHER': String(t.sourceOptions?.other || '')
    };
    return sourceMap[source] || source;
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
          {typeof t.showLeads === 'string' ? t.showLeads.replace('{count}', leads.length.toString()).replace('{total}', totalCount.toString()) : `Showing ${leads.length} of ${totalCount} leads`}
        </div>
        {selectedLeads.length > 0 && (
          <div className="flex items-center space-x-4 space-x-reverse">
            <span className="text-sm">{typeof t.selectedCount === 'string' ? t.selectedCount.replace('{count}', selectedLeads.length.toString()) : `${selectedLeads.length} selected`}</span>
            <button className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors">
              {String(t.deleteSelected)}
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
                <th className="text-right p-4 text-white font-medium">{String(t.lead)}</th>
                <th className="text-right p-4 text-white font-medium">{String(t.company)}</th>
                <th className="text-right p-4 text-white font-medium">{String(t.source)}</th>
                <th className="text-right p-4 text-white font-medium">{String(t.status)}</th>
                <th className="text-right p-4 text-white font-medium">{String(t.createdAt)}</th>
                <th className="text-right p-4 text-white font-medium">{String(t.actions)}</th>
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
                      {getSourceLabel(lead.source)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {getStatusLabel(lead.status)}
                    </span>
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
                        title={String(t.viewDetails)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <button
                        className="p-2 text-green-400 hover:bg-green-400/20 rounded-lg transition-colors"
                        title={String(t.convertToCustomer)}
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
                {String(t.previous)}
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
                {String(t.next)}
              </button>
            </div>
            
            <div className="text-gray-300 text-sm">
              {typeof t.page === 'string' ? t.page.replace('{current}', currentPage.toString()).replace('{total}', totalPages.toString()) : `Page ${currentPage} of ${totalPages}`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
