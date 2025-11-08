"use client";

import { useState, useEffect, useCallback } from "react";
import LeadList from "@/components/admin/crm/LeadList";
import LeadForm from "@/components/admin/crm/LeadForm";

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
  expectedValue: number | null;
  expectedClose: string | null;
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
  score: number;
  assignedTo?: string;
  expectedValue?: number;
  expectedClose?: string;
  nextFollowUp?: string;
  createdAt: string;
  activities: Array<{
    id: string;
    type: string;
    subject: string;
    description: string;
    outcome?: string;
    nextAction?: string;
    scheduledAt?: string;
    completedAt?: string;
    createdAt: string;
  }>;
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
        setError(result.error || "خطا در بارگذاری لیدها");
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      setError("خطا در بارگذاری لیدها");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, status, source, assignedTo]);

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
        setError(result.error || "خطا در ایجاد لید");
      }
    } catch (error) {
      console.error("Error creating lead:", error);
      setError("خطا در ایجاد لید");
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
        setError(result.error || "خطا در به‌روزرسانی لید");
      }
    } catch (error) {
      console.error("Error updating lead:", error);
      setError("خطا در به‌روزرسانی لید");
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

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {editingLead ? "ویرایش لید" : "ایجاد لید جدید"}
            </h1>
            <p className="text-gray-300 mt-2">
              {editingLead ? "اطلاعات لید را ویرایش کنید" : "لید جدید را ایجاد کنید"}
            </p>
          </div>
          <button
            onClick={handleCancelForm}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            بازگشت
          </button>
        </div>

        <LeadForm
          lead={editingLead}
          onSubmit={editingLead ? handleUpdateLead : handleCreateLead}
          onCancel={handleCancelForm}
          isLoading={isSubmitting}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">مدیریت لیدها</h1>
          <p className="text-gray-300 mt-2">مدیریت و پیگیری لیدهای فروش</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-primary-orange-dark transition-colors"
        >
          ایجاد لید جدید
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="glass rounded-3xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{metrics.total}</div>
          <div className="text-sm text-gray-300">کل لیدها</div>
        </div>
        <div className="glass rounded-3xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{metrics.new}</div>
          <div className="text-sm text-gray-300">جدید</div>
        </div>
        <div className="glass rounded-3xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{metrics.contacted}</div>
          <div className="text-sm text-gray-300">تماس گرفته شده</div>
        </div>
        <div className="glass rounded-3xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{metrics.qualified}</div>
          <div className="text-sm text-gray-300">صلاحیت‌دار</div>
        </div>
        <div className="glass rounded-3xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{metrics.converted}</div>
          <div className="text-sm text-gray-300">تبدیل شده</div>
        </div>
        <div className="glass rounded-3xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{metrics.lost}</div>
          <div className="text-sm text-gray-300">از دست رفته</div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">فیلتر و جستجو</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              جستجو در لیدها
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
              placeholder="نام، ایمیل، شرکت..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              وضعیت
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
            >
              <option value="">همه وضعیت‌ها</option>
              <option value="NEW">جدید</option>
              <option value="CONTACTED">تماس گرفته شده</option>
              <option value="QUALIFIED">صلاحیت‌دار</option>
              <option value="PROPOSAL">پیشنهاد</option>
              <option value="NEGOTIATION">مذاکره</option>
              <option value="CONVERTED">تبدیل شده</option>
              <option value="LOST">از دست رفته</option>
              <option value="UNQUALIFIED">غیر صلاحیت‌دار</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              منبع
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
            >
              <option value="">همه منابع</option>
              <option value="WEBSITE">وب‌سایت</option>
              <option value="REFERRAL">معرفی</option>
              <option value="SOCIAL_MEDIA">شبکه‌های اجتماعی</option>
              <option value="EMAIL_CAMPAIGN">کمپین ایمیل</option>
              <option value="TRADE_SHOW">نمایشگاه</option>
              <option value="COLD_CALL">تماس سرد</option>
              <option value="PARTNER">شریک</option>
              <option value="ADVERTISING">تبلیغات</option>
              <option value="OTHER">سایر</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              اختصاص داده شده به
            </label>
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
              placeholder="نام فروشنده"
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
              بازنشانی
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
          <div className="text-white">در حال بارگذاری لیدها...</div>
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
