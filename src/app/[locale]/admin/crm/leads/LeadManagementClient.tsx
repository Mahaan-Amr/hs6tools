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
      try {
        const msgs = await getMessages(locale);
        setMessages(msgs);
      } catch (error) {
        console.error('Error loading messages in LeadManagementClient:', error);
        // Don't block rendering - components will use fallbacks
      }
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
      setError(null);
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(search && { search }),
        ...(status && { status }),
        ...(source && { source }),
        ...(assignedTo && { assignedTo })
      });

      const response = await fetch(`/api/crm/leads?${params}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setLeads(result.data.leads || []);
        setMetrics(result.data.metrics || {
          total: 0,
          new: 0,
          contacted: 0,
          qualified: 0,
          converted: 0,
          lost: 0
        });
        setTotalPages(result.data.pagination?.totalPages || 1);
        setTotalCount(result.data.pagination?.totalCount || 0);
      } else {
        const t = messages?.admin?.crm?.leads;
        setError(result.error || (t?.error ? String(t.error) : "Error loading leads"));
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error("Leads fetch timeout");
        setError("Request timeout. Please try again.");
      } else {
        console.error("Error fetching leads:", error);
        const t = messages?.admin?.crm?.leads;
        setError(t?.error ? String(t.error) : "Error loading leads");
      }
      // Don't block rendering - show empty state
      setLeads([]);
      setMetrics({
        total: 0,
        new: 0,
        contacted: 0,
        qualified: 0,
        converted: 0,
        lost: 0
      });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Don't block rendering - use fallbacks if messages aren't loaded
  const t = messages?.admin?.crm?.leads || {
    title: locale === "fa" ? "مدیریت لیدها" : locale === "ar" ? "إدارة الفرص" : "Lead Management",
    leadManagement: locale === "fa" ? "مدیریت و پیگیری لیدها" : locale === "ar" ? "إدارة وتتبع الفرص" : "Manage and track leads",
    createLead: locale === "fa" ? "ایجاد لید جدید" : locale === "ar" ? "إنشاء فرصة جديدة" : "Create New Lead",
    editLead: locale === "fa" ? "ویرایش لید" : locale === "ar" ? "تعديل الفرصة" : "Edit Lead",
    leadDetails: locale === "fa" ? "جزئیات لید" : locale === "ar" ? "تفاصيل الفرصة" : "Lead Details",
    loading: locale === "fa" ? "در حال بارگذاری..." : locale === "ar" ? "جاري التحميل..." : "Loading...",
    status: locale === "fa" ? "وضعیت" : locale === "ar" ? "الحالة" : "Status",
    source: locale === "fa" ? "منبع" : locale === "ar" ? "المصدر" : "Source",
    assignedTo: locale === "fa" ? "اختصاص یافته به" : locale === "ar" ? "مخصص ل" : "Assigned To",
    assignedToPlaceholder: locale === "fa" ? "نام نماینده فروش" : locale === "ar" ? "اسم مندوب المبيعات" : "Sales rep name",
    metrics: {
      total: locale === "fa" ? "کل" : locale === "ar" ? "المجموع" : "Total",
      new: locale === "fa" ? "جدید" : locale === "ar" ? "جديد" : "New",
      contacted: locale === "fa" ? "تماس گرفته شده" : locale === "ar" ? "تم الاتصال" : "Contacted",
      qualified: locale === "fa" ? "واجد شرایط" : locale === "ar" ? "مؤهل" : "Qualified",
      converted: locale === "fa" ? "تبدیل شده" : locale === "ar" ? "محول" : "Converted",
      lost: locale === "fa" ? "از دست رفته" : locale === "ar" ? "مفقود" : "Lost"
    },
    statusOptions: {
      new: locale === "fa" ? "جدید" : locale === "ar" ? "جديد" : "New",
      contacted: locale === "fa" ? "تماس گرفته شده" : locale === "ar" ? "تم الاتصال" : "Contacted",
      qualified: locale === "fa" ? "واجد شرایط" : locale === "ar" ? "مؤهل" : "Qualified",
      converted: locale === "fa" ? "تبدیل شده" : locale === "ar" ? "محول" : "Converted",
      lost: locale === "fa" ? "از دست رفته" : locale === "ar" ? "مفقود" : "Lost"
    },
    sourceOptions: {
      website: locale === "fa" ? "وب‌سایت" : locale === "ar" ? "الموقع" : "Website",
      referral: locale === "fa" ? "معرفی" : locale === "ar" ? "إحالة" : "Referral",
      socialMedia: locale === "fa" ? "شبکه‌های اجتماعی" : locale === "ar" ? "وسائل التواصل" : "Social Media",
      email: locale === "fa" ? "ایمیل" : locale === "ar" ? "البريد" : "Email",
      tradeShow: locale === "fa" ? "نمایشگاه" : locale === "ar" ? "معرض" : "Trade Show",
      phone: locale === "fa" ? "تلفن" : locale === "ar" ? "الهاتف" : "Phone",
      partner: locale === "fa" ? "شریک" : locale === "ar" ? "شريك" : "Partner",
      advertising: locale === "fa" ? "تبلیغات" : locale === "ar" ? "إعلان" : "Advertising",
      other: locale === "fa" ? "سایر" : locale === "ar" ? "أخرى" : "Other"
    },
    error: locale === "fa" ? "خطا در بارگذاری لیدها" : locale === "ar" ? "خطأ في تحميل الفرص" : "Error loading leads",
    createError: locale === "fa" ? "خطا در ایجاد لید" : locale === "ar" ? "خطأ في إنشاء الفرصة" : "Error creating lead",
    updateError: locale === "fa" ? "خطا در به‌روزرسانی لید" : locale === "ar" ? "خطأ في تحديث الفرصة" : "Error updating lead"
  };

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
            {String(messages?.common?.back || (locale === "fa" ? "بازگشت" : locale === "ar" ? "رجوع" : "Back"))}
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
        <h3 className="text-lg font-semibold text-white mb-4">
          {String(messages?.common?.filter || (locale === "fa" ? "فیلتر" : locale === "ar" ? "تصفية" : "Filter"))}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {String(messages?.common?.search || (locale === "fa" ? "جستجو" : locale === "ar" ? "بحث" : "Search"))}
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
              placeholder={String(messages?.common?.search || (locale === "fa" ? "جستجو" : locale === "ar" ? "بحث" : "Search"))}
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
              <option value="">
                {String(messages?.common?.filter || (locale === "fa" ? "فیلتر" : locale === "ar" ? "تصفية" : "Filter"))}
              </option>
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
              <option value="">
                {String(messages?.common?.filter || (locale === "fa" ? "فیلتر" : locale === "ar" ? "تصفية" : "Filter"))}
              </option>
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
              {String(messages?.common?.reset || (locale === "fa" ? "بازنشانی" : locale === "ar" ? "إعادة تعيين" : "Reset"))}
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
