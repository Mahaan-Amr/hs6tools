"use client";

import { useState, useEffect, useCallback } from "react";
import OpportunityList from "@/components/admin/crm/OpportunityList";
import OpportunityForm from "@/components/admin/crm/OpportunityForm";
import SalesPipeline from "@/components/admin/crm/SalesPipeline";

interface OpportunityFormData extends Record<string, unknown> {
  customerId: string;
  title: string;
  description: string;
  value: number;
  stage: string;
  probability: number;
  expectedClose: string;
  assignedTo: string;
}

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

interface OpportunityMetrics {
  total: number;
  totalPipelineValue: number;
  weightedPipelineValue: number;
  stageCounts: Record<string, { count: number; value: number }>;
}

interface OpportunityManagementClientProps {
  locale: string;
}

export default function OpportunityManagementClient({ locale }: OpportunityManagementClientProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [metrics, setMetrics] = useState<OpportunityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "pipeline">("list");

  // Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(search && { search }),
        ...(stage && { stage }),
        ...(assignedTo && { assignedTo }),
        ...(customerId && { customerId })
      });

      const response = await fetch(`/api/crm/opportunities?${params}`);
      const result = await response.json();

      if (result.success) {
        setOpportunities(result.data.opportunities);
        setMetrics(result.data.metrics);
        setTotalPages(result.data.pagination.totalPages);
        setTotalCount(result.data.pagination.totalCount);
      } else {
        setError(result.error || "خطا در بارگذاری فرصت‌ها");
      }
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      setError("خطا در بارگذاری فرصت‌ها");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, stage, assignedTo, customerId]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const handleCreateOpportunity = async (formData: OpportunityFormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/crm/opportunities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setShowForm(false);
        setEditingOpportunity(undefined);
        await fetchOpportunities();
      } else {
        setError(result.error || "خطا در ایجاد فرصت");
      }
    } catch (error) {
      console.error("Error creating opportunity:", error);
      setError("خطا در ایجاد فرصت");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateOpportunity = async (formData: OpportunityFormData) => {
    if (!editingOpportunity) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/crm/opportunities/${editingOpportunity.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setShowForm(false);
        setEditingOpportunity(undefined);
        await fetchOpportunities();
      } else {
        setError(result.error || "خطا در به‌روزرسانی فرصت");
      }
    } catch (error) {
      console.error("Error updating opportunity:", error);
      setError("خطا در به‌روزرسانی فرصت");
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleDeleteOpportunity = async (opportunityId: string) => {
  //   if (!confirm("آیا از حذف این فرصت اطمینان دارید؟")) return;

  //   try {
  //     const response = await fetch(`/api/crm/opportunities/${opportunityId}`, {
  //       method: "DELETE"
  //     });

  //     const result = await response.json();

  //     if (result.success) {
  //       await fetchOpportunities();
  //     } else {
  //       setError(result.error || "خطا در حذف فرصت");
  //     }
  //   } catch (error) {
  //     console.error("Error deleting opportunity:", error);
  //     setError("خطا در حذف فرصت");
  //   }
  // };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingOpportunity(undefined);
  };

  // const handlePageChange = (page: number) => {
  //   setCurrentPage(page);
  // };

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setCurrentPage(1);
    if (newFilters.search !== undefined) setSearch(newFilters.search);
    if (newFilters.stage !== undefined) setStage(newFilters.stage);
    if (newFilters.assignedTo !== undefined) setAssignedTo(newFilters.assignedTo);
    if (newFilters.customerId !== undefined) setCustomerId(newFilters.customerId);
  };

  if (showForm) {
    return (
      <OpportunityForm
        opportunity={editingOpportunity}
        onSubmit={editingOpportunity ? handleUpdateOpportunity : handleCreateOpportunity}
        onCancel={handleCancelForm}
        isLoading={isSubmitting}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">مدیریت فرصت‌های فروش</h1>
          <p className="text-gray-300 mt-2">
            مدیریت و پیگیری فرصت‌های فروش در سیستم CRM
          </p>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          {metrics && (
            <div className="flex items-center space-x-6 space-x-reverse text-center">
              <div>
                <div className="text-2xl font-bold text-white">{metrics.total}</div>
                <div className="text-sm text-gray-300">کل فرصت‌ها</div>
              </div>
              <div className="w-px h-12 bg-gray-600"></div>
              <div>
                <div className="text-2xl font-bold text-primary-orange">
                  {new Intl.NumberFormat('fa-IR', {
                    style: 'currency',
                    currency: 'IRR',
                    minimumFractionDigits: 0
                  }).format(metrics.totalPipelineValue)}
                </div>
                <div className="text-sm text-gray-300">ارزش کل Pipeline</div>
              </div>
            </div>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-primary-orange text-white rounded-xl hover:bg-primary-orange-dark transition-colors flex items-center space-x-2 space-x-reverse"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>ایجاد فرصت جدید</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 space-x-reverse bg-white/5 rounded-xl p-1">
        <button
          onClick={() => setActiveTab("list")}
          className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
            activeTab === "list"
              ? "bg-primary-orange text-white"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
        >
          لیست فرصت‌ها
        </button>
        <button
          onClick={() => setActiveTab("pipeline")}
          className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
            activeTab === "pipeline"
              ? "bg-primary-orange text-white"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
        >
          Pipeline فروش
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="glass rounded-3xl p-4 bg-red-500/10 border border-red-500/20">
          <div className="text-red-400">{error}</div>
        </div>
      )}

      {/* Content */}
      {activeTab === "list" ? (
        <div className="space-y-6">
          {/* Filters */}
          <div className="glass rounded-3xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  جستجو
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                  placeholder="جستجو در فرصت‌ها..."
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  مرحله
                </label>
                <select
                  value={stage}
                  onChange={(e) => handleFilterChange({ stage: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
                >
                  <option value="">همه مراحل</option>
                  <option value="PROSPECTING">پیش‌فروش</option>
                  <option value="QUALIFICATION">صلاحیت‌سنجی</option>
                  <option value="PROPOSAL">پیشنهاد</option>
                  <option value="NEGOTIATION">مذاکره</option>
                  <option value="CLOSED_WON">بسته شده (موفق)</option>
                  <option value="CLOSED_LOST">بسته شده (ناموفق)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  واگذار شده به
                </label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => handleFilterChange({ assignedTo: e.target.value })}
                  placeholder="نام نماینده فروش"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => handleFilterChange({ search: "", stage: "", assignedTo: "", customerId: "" })}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  پاک کردن فیلترها
                </button>
              </div>
            </div>
          </div>

          {/* Opportunities List */}
          {loading ? (
            <div className="glass rounded-3xl p-8 text-center">
              <div className="text-white">در حال بارگذاری فرصت‌ها...</div>
            </div>
          ) : (
            <OpportunityList
              opportunities={opportunities}
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              locale={locale}
            />
          )}
        </div>
      ) : (
        <SalesPipeline locale={locale} />
      )}
    </div>
  );
}
