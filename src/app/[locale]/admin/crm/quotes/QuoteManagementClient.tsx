"use client";

import { useState, useEffect, useCallback } from "react";
import QuoteList from "@/components/admin/crm/QuoteList";
import QuoteForm from "@/components/admin/crm/QuoteForm";

interface QuoteFormData extends Record<string, unknown> {
  customerId: string;
  opportunityId: string;
  items: Array<{
    productId: string;
    productName: string;
    productSku: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  validUntil: string;
  status: string;
}

interface Quote {
  id: string;
  quoteNumber: string;
  items: Array<{
    productId: string;
    productName: string;
    productSku: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  validUntil: string;
  status: string;
  createdAt: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
    phone?: string;
  };
  opportunity?: {
    id: string;
    title: string;
    stage: string;
    value: number;
  };
}

interface QuoteMetrics {
  total: number;
  totalQuoteValue: number;
  conversionRate: number;
  statusCounts: Record<string, { count: number; value: number }>;
}

interface QuoteManagementClientProps {
  locale: string;
}

export default function QuoteManagementClient({ locale }: QuoteManagementClientProps) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [metrics, setMetrics] = useState<QuoteMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [opportunityId, setOpportunityId] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(search && { search }),
        ...(status && { status }),
        ...(customerId && { customerId }),
        ...(opportunityId && { opportunityId })
      });

      const response = await fetch(`/api/crm/quotes?${params}`);
      const result = await response.json();

      if (result.success) {
        setQuotes(result.data.quotes);
        setMetrics(result.data.metrics);
        setTotalPages(result.data.pagination.totalPages);
        setTotalCount(result.data.pagination.totalCount);
      } else {
        setError(result.error || "خطا در بارگذاری پیشنهادات");
      }
    } catch (error) {
      console.error("Error fetching quotes:", error);
      setError("خطا در بارگذاری پیشنهادات");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, status, customerId, opportunityId]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const handleCreateQuote = async (formData: QuoteFormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/crm/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setShowForm(false);
        setEditingQuote(undefined);
        await fetchQuotes();
      } else {
        setError(result.error || "خطا در ایجاد پیشنهاد");
      }
    } catch (error) {
      console.error("Error creating quote:", error);
      setError("خطا در ایجاد پیشنهاد");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateQuote = async (formData: QuoteFormData) => {
    if (!editingQuote) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/crm/quotes/${editingQuote.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setShowForm(false);
        setEditingQuote(undefined);
        await fetchQuotes();
      } else {
        setError(result.error || "خطا در به‌روزرسانی پیشنهاد");
      }
    } catch (error) {
      console.error("Error updating quote:", error);
      setError("خطا در به‌روزرسانی پیشنهاد");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingQuote(undefined);
  };

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setCurrentPage(1);
    if (newFilters.search !== undefined) setSearch(newFilters.search);
    if (newFilters.status !== undefined) setStatus(newFilters.status);
    if (newFilters.customerId !== undefined) setCustomerId(newFilters.customerId);
    if (newFilters.opportunityId !== undefined) setOpportunityId(newFilters.opportunityId);
  };

  if (showForm) {
    return (
      <QuoteForm
        quote={editingQuote}
        onSubmit={editingQuote ? handleUpdateQuote : handleCreateQuote}
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
          <h1 className="text-3xl font-bold text-white">مدیریت پیشنهادات</h1>
          <p className="text-gray-300 mt-2">
            مدیریت و پیگیری پیشنهادات فروش در سیستم CRM
          </p>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          {metrics && (
            <div className="flex items-center space-x-6 space-x-reverse text-center">
              <div>
                <div className="text-2xl font-bold text-white">{metrics.total}</div>
                <div className="text-sm text-gray-300">کل پیشنهادات</div>
              </div>
              <div className="w-px h-12 bg-gray-600"></div>
              <div>
                <div className="text-2xl font-bold text-primary-orange">
                  {new Intl.NumberFormat('fa-IR', {
                    style: 'currency',
                    currency: 'IRR',
                    minimumFractionDigits: 0
                  }).format(metrics.totalQuoteValue)}
                </div>
                <div className="text-sm text-gray-300">ارزش کل پیشنهادات</div>
              </div>
              <div className="w-px h-12 bg-gray-600"></div>
              <div>
                <div className="text-2xl font-bold text-green-400">{metrics.conversionRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-300">نرخ تبدیل</div>
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
            <span>ایجاد پیشنهاد جدید</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="glass rounded-3xl p-4 bg-red-500/10 border border-red-500/20">
          <div className="text-red-400">{error}</div>
        </div>
      )}

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
              placeholder="جستجو در پیشنهادات..."
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              وضعیت
            </label>
            <select
              value={status}
              onChange={(e) => handleFilterChange({ status: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
            >
              <option value="">همه وضعیت‌ها</option>
              <option value="DRAFT">پیش‌نویس</option>
              <option value="SENT">ارسال شده</option>
              <option value="VIEWED">مشاهده شده</option>
              <option value="ACCEPTED">پذیرفته شده</option>
              <option value="REJECTED">رد شده</option>
              <option value="EXPIRED">منقضی شده</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              مشتری
            </label>
            <input
              type="text"
              value={customerId}
              onChange={(e) => handleFilterChange({ customerId: e.target.value })}
              placeholder="شناسه مشتری"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => handleFilterChange({ search: "", status: "", customerId: "", opportunityId: "" })}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              پاک کردن فیلترها
            </button>
          </div>
        </div>
      </div>

      {/* Quotes List */}
      {loading ? (
        <div className="glass rounded-3xl p-8 text-center">
          <div className="text-white">در حال بارگذاری پیشنهادات...</div>
        </div>
      ) : (
        <QuoteList
          quotes={quotes}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          locale={locale}
        />
      )}
    </div>
  );
}
