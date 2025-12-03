"use client";

import { useState, useEffect, useCallback } from "react";
import LeadList from "@/components/admin/crm/LeadList";
import LeadForm from "@/components/admin/crm/LeadForm";
import { getMessages, Messages } from "@/lib/i18n";

interface LeadFormData extends Record<string, unknown> {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  industry: string;
  companySize: string;
  source: string;
  status: string;
  assignedTo: string;
  notes: string;
  tags: string[];
  nextFollowUp: string | null;
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
  interactions: Array<{
    id: string;
    type: string;
    subject?: string;
    content: string;
    outcome?: string;
    nextAction?: string;
    createdAt: string;
  }>;
}

interface LeadMetrics {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  converted: number;
  lost: number;
}

interface LeadManagementClientProps {
  locale: string;
}

export default function LeadManagementClient({ locale }: LeadManagementClientProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [metrics, setMetrics] = useState<LeadMetrics>({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    converted: 0,
    lost: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messages, setMessages] = useState<Messages | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessages(locale);
      setMessages(msgs);
    };
    loadMessages();
  }, [locale]);

  // Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLeads = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(search && { search }),
        ...(status && { status }),
        ...(source && { source }),
        ...(assignedTo && { assignedTo })
      });

      const response = await fetch(`/api/crm/leads?${params}`);
      const result = await response.json();

      if (result.success) {
        setLeads(result.data.leads);
        setMetrics(result.data.metrics);
        setTotalPages(result.data.pagination.totalPages);
        setTotalCount(result.data.pagination.totalCount);
      } else {
        const t = messages?.admin?.crm?.leads;
        setError(result.error || (t?.error ? String(t.error) : "Error loading leads"));
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      const t = messages?.admin?.crm?.leads;
      setError(t?.error ? String(t.error) : "Error loading leads");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, status, source, assignedTo, messages]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleCreateLead = async (formData: LeadFormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/crm/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setShowForm(false);
        fetchLeads(); // Refresh the list
      } else {
        const t = messages?.admin?.crm?.leads;
        setError(result.error || (t?.createError ? String(t.createError) : "Error creating lead"));
      }
    } catch (error) {
      console.error("Error creating lead:", error);
      const t = messages?.admin?.crm?.leads;
      setError(t?.createError ? String(t.createError) : "Error creating lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateLead = async (formData: LeadFormData) => {
    if (!editingLead) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/crm/leads/${editingLead.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setEditingLead(undefined);
        fetchLeads(); // Refresh the list
      } else {
        const t = messages?.admin?.crm?.leads;
        setError(result.error || (t?.updateError ? String(t.updateError) : "Error updating lead"));
      }
    } catch (error) {
      console.error("Error updating lead:", error);
      const t = messages?.admin?.crm?.leads;
      setError(t?.updateError ? String(t.updateError) : "Error updating lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleEditLead = (lead: Lead) => {
  //   setEditingLead(lead);
  //   setShowForm(true);
  // };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingLead(undefined);
  };

  if (!messages || !messages.admin?.crm?.leads) {
    return <div className="text-white p-4">{messages?.common?.loading || "Loading..."}</div>;
  }

  const t = messages.admin.crm.leads;

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {editingLead ? String(t.editLead) : String(t.createLead)}
            </h1>
            <p className="text-gray-300 mt-2">
              {editingLead ? String(t.leadDetails) : String(t.createLead)}
            </p>
          </div>
          <button
            onClick={handleCancelForm}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {String(messages.common.back)}
          </button>
        </div>

        <LeadForm
          lead={editingLead}
          onSubmit={editingLead ? handleUpdateLead : handleCreateLead}
          onCancel={handleCancelForm}
          isLoading={isSubmitting}
          locale={locale}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{String(t.title)}</h1>
          <p className="text-gray-300 mt-2">{String(t.leadManagement)}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-primary-orange-dark transition-colors"
        >
          {String(t.createLead)}
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="glass rounded-3xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{metrics.total}</div>
          <div className="text-sm text-gray-300">{String(t.metrics?.total || 'Total')}</div>
        </div>
        <div className="glass rounded-3xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{metrics.new}</div>
          <div className="text-sm text-gray-300">{String(t.metrics?.new || 'New')}</div>
        </div>
        <div className="glass rounded-3xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{metrics.contacted}</div>
          <div className="text-sm text-gray-300">{String(t.metrics?.contacted || 'Contacted')}</div>
        </div>
        <div className="glass rounded-3xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{metrics.qualified}</div>
          <div className="text-sm text-gray-300">{String(t.metrics?.qualified || 'Qualified')}</div>
        </div>
        <div className="glass rounded-3xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{metrics.converted}</div>
          <div className="text-sm text-gray-300">{String(t.metrics?.converted || 'Converted')}</div>
        </div>
        <div className="glass rounded-3xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{metrics.lost}</div>
          <div className="text-sm text-gray-300">{String(t.metrics?.lost || 'Lost')}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{String(messages.common.filter)}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {String(messages.common.search)}
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
              placeholder={String(messages.common.search)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {String(t.status)}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
            >
              <option value="">{String(messages.common.filter)}</option>
              <option value="NEW">{String(t.statusOptions?.new || '')}</option>
              <option value="CONTACTED">{String(t.statusOptions?.contacted || '')}</option>
              <option value="QUALIFIED">{String(t.statusOptions?.qualified || '')}</option>
              <option value="CONVERTED">{String(t.statusOptions?.converted || '')}</option>
              <option value="LOST">{String(t.statusOptions?.lost || '')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {String(t.source)}
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
            >
              <option value="">{String(messages.common.filter)}</option>
              <option value="WEBSITE">{String(t.sourceOptions?.website || '')}</option>
              <option value="REFERRAL">{String(t.sourceOptions?.referral || '')}</option>
              <option value="SOCIAL_MEDIA">{String(t.sourceOptions?.socialMedia || '')}</option>
              <option value="EMAIL">{String(t.sourceOptions?.email || '')}</option>
              <option value="TRADE_SHOW">{String(t.sourceOptions?.tradeShow || '')}</option>
              <option value="PHONE">{String(t.sourceOptions?.phone || '')}</option>
              <option value="PARTNER">{String(t.sourceOptions?.partner || '')}</option>
              <option value="ADVERTISING">{String(t.sourceOptions?.advertising || '')}</option>
              <option value="OTHER">{String(t.sourceOptions?.other || '')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {String(t.assignedTo)}
            </label>
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
              placeholder={String(t.assignedToPlaceholder)}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch("");
                setStatus("");
                setSource("");
                setAssignedTo("");
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {String(messages.common.reset)}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="glass rounded-3xl p-4 bg-red-500/20 border border-red-500/30">
          <div className="text-red-400">{error}</div>
        </div>
      )}

      {/* Leads List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-white">{String(t.loading)}</div>
        </div>
      ) : (
        <LeadList
          leads={leads}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          locale={locale}
        />
      )}
    </div>
  );
}
