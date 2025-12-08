"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getMessages, Messages } from "@/lib/i18n";

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
}

interface QuoteListProps {
  quotes: Quote[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  locale: string;
}

export default function QuoteList({
  quotes,
  currentPage,
  totalPages,
  totalCount,
  locale
}: QuoteListProps) {
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);
  const [messages, setMessages] = useState<Messages | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const msgs = await getMessages(locale);
        setMessages(msgs);
      } catch (error) {
        console.error("Error loading messages in QuoteList:", error);
        // Don't block rendering - components will use fallbacks
      }
    };
    loadMessages();
  }, [locale]);

  const common = messages?.common || {
    loading: locale === "fa" ? "در حال بارگذاری..." : locale === "ar" ? "جاري التحميل..." : "Loading...",
    items: locale === "fa" ? "آیتم" : locale === "ar" ? "عنصر" : "items",
    createdAt: locale === "fa" ? "ایجاد شده" : locale === "ar" ? "تم الإنشاء" : "Created at",
    previous: locale === "fa" ? "قبلی" : locale === "ar" ? "السابق" : "Previous",
    next: locale === "fa" ? "بعدی" : locale === "ar" ? "التالي" : "Next",
    edit: locale === "fa" ? "ویرایش" : locale === "ar" ? "تعديل" : "Edit"
  };

  const t = messages?.admin?.crm?.quotes || {
    showQuotes:
      locale === "fa"
        ? "نمایش {count} از {total} پیشنهاد"
        : locale === "ar"
          ? "عرض {count} من {total} عرض"
          : "Showing {count} of {total} quotes",
    selectedCount:
      locale === "fa"
        ? "{count} مورد انتخاب شده"
        : locale === "ar"
          ? "{count} محددة"
          : "{count} selected",
    deleteSelected: locale === "fa" ? "حذف انتخاب شده" : locale === "ar" ? "حذف المحدد" : "Delete selected",
    quoteNumber: locale === "fa" ? "شماره پیش‌فاکتور" : locale === "ar" ? "رقم العرض" : "Quote #",
    customer: locale === "fa" ? "مشتری" : locale === "ar" ? "العميل" : "Customer",
    status: locale === "fa" ? "وضعیت" : locale === "ar" ? "الحالة" : "Status",
    totalAmount: locale === "fa" ? "مبلغ کل" : locale === "ar" ? "المبلغ الإجمالي" : "Total amount",
    validUntil: locale === "fa" ? "معتبر تا" : locale === "ar" ? "صالح حتى" : "Valid until",
    actions: locale === "fa" ? "عملیات" : locale === "ar" ? "الإجراءات" : "Actions",
    viewDetails: locale === "fa" ? "مشاهده جزئیات" : locale === "ar" ? "عرض التفاصيل" : "View details",
    convertQuote: locale === "fa" ? "تبدیل به سفارش" : locale === "ar" ? "تحويل إلى طلب" : "Convert to order",
    sendQuote: locale === "fa" ? "ارسال پیش‌فاکتور" : locale === "ar" ? "إرسال العرض" : "Send quote",
    page: locale === "fa" ? "صفحه" : locale === "ar" ? "صفحة" : "Page",
    of: locale === "fa" ? "از" : locale === "ar" ? "من" : "of",
    statusOptions: {
      draft: locale === "fa" ? "پیش‌نویس" : locale === "ar" ? "مسودة" : "Draft",
      sent: locale === "fa" ? "ارسال شده" : locale === "ar" ? "مُرسلة" : "Sent",
      viewed: locale === "fa" ? "مشاهده شده" : locale === "ar" ? "مُشاهدة" : "Viewed",
      accepted: locale === "fa" ? "پذیرفته شده" : locale === "ar" ? "مقبولة" : "Accepted",
      rejected: locale === "fa" ? "رد شده" : locale === "ar" ? "مرفوضة" : "Rejected",
      expired: locale === "fa" ? "منقضی" : locale === "ar" ? "منتهية" : "Expired"
    },
    tax: locale === "fa" ? "مالیات" : locale === "ar" ? "الضريبة" : "Tax"
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT": return "bg-gray-500/20 text-gray-400";
      case "SENT": return "bg-blue-500/20 text-blue-400";
      case "VIEWED": return "bg-yellow-500/20 text-yellow-400";
      case "ACCEPTED": return "bg-green-500/20 text-green-400";
      case "REJECTED": return "bg-red-500/20 text-red-400";
      case "EXPIRED": return "bg-orange-500/20 text-orange-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "DRAFT": return String(t.statusOptions?.draft || "");
      case "SENT": return String(t.statusOptions?.sent || "");
      case "VIEWED": return String(t.statusOptions?.viewed || "");
      case "ACCEPTED": return String(t.statusOptions?.accepted || "");
      case "REJECTED": return String(t.statusOptions?.rejected || "");
      case "EXPIRED": return String(t.statusOptions?.expired || "");
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    const localeCode = locale === 'fa' ? 'fa-IR' : locale === 'ar' ? 'ar-SA' : 'en-US';
    return new Intl.NumberFormat(localeCode, {
      style: 'currency',
      currency: 'IRR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const localeCode = locale === 'fa' ? 'fa-IR' : locale === 'ar' ? 'ar-SA' : 'en-US';
    return new Date(dateString).toLocaleDateString(localeCode);
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const handleSelectAll = () => {
    if (selectedQuotes.length === quotes.length) {
      setSelectedQuotes([]);
    } else {
      setSelectedQuotes(quotes.map(quote => quote.id));
    }
  };

  const handleSelectQuote = (quoteId: string) => {
    setSelectedQuotes(prev => 
      prev.includes(quoteId) 
        ? prev.filter(id => id !== quoteId)
        : [...prev, quoteId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="flex items-center justify-between text-gray-300">
        <div className="text-sm">
          {t.showQuotes ? t.showQuotes.replace('{count}', quotes.length.toString()).replace('{total}', totalCount.toString()) : `Showing ${quotes.length} of ${totalCount} quotes`}
        </div>
        {selectedQuotes.length > 0 && (
          <div className="flex items-center space-x-4 space-x-reverse">
            <span className="text-sm">{t.selectedCount ? t.selectedCount.replace('{count}', selectedQuotes.length.toString()) : `${selectedQuotes.length} مورد انتخاب شده`}</span>
            <button className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors">
              {String(t.deleteSelected || 'حذف انتخاب شده')}
            </button>
          </div>
        )}
      </div>

      {/* Quotes Table */}
      <div className="glass rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr>
                <th className="text-right p-4">
                  <input
                    type="checkbox"
                    checked={selectedQuotes.length === quotes.length && quotes.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-primary-orange bg-gray-700 border-gray-600 rounded focus:ring-primary-orange focus:ring-2"
                  />
                </th>
                <th className="text-right p-4 text-white font-medium">{String(t.quoteNumber)}</th>
                <th className="text-right p-4 text-white font-medium">{String(t.customer)}</th>
                <th className="text-right p-4 text-white font-medium">{String(t.status)}</th>
                <th className="text-right p-4 text-white font-medium">{String(t.totalAmount)}</th>
                <th className="text-right p-4 text-white font-medium">{String(t.validUntil)}</th>
                <th className="text-right p-4 text-white font-medium">{String(t.actions)}</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedQuotes.includes(quote.id)}
                      onChange={() => handleSelectQuote(quote.id)}
                      className="w-4 h-4 text-primary-orange bg-gray-700 border-gray-600 rounded focus:ring-primary-orange focus:ring-2"
                    />
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="text-white font-medium">{quote.quoteNumber}</div>
                      <div className="text-gray-400 text-sm mt-1">
                        {quote.items.length} {String(common.items)}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        {String(common.createdAt)}: {formatDate(quote.createdAt)}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-10 h-10 bg-primary-orange rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {(quote.customer.firstName || "").charAt(0)}{(quote.customer.lastName || "").charAt(0)}
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {quote.customer.firstName} {quote.customer.lastName}
                        </div>
                        <div className="text-gray-400 text-sm">{quote.customer.email}</div>
                        {quote.customer.company && (
                          <div className="text-gray-400 text-sm">{quote.customer.company}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col space-y-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                        {getStatusLabel(quote.status)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-white font-medium">
                      {formatCurrency(quote.total)}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {String(t.tax)}: {formatCurrency(quote.tax)}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`text-sm ${isExpired(quote.validUntil) ? 'text-red-400' : 'text-gray-300'}`}>
                      {formatDate(quote.validUntil)}
                    </div>
                    {isExpired(quote.validUntil) && (
                      <div className="text-red-400 text-xs">{String(t.statusOptions.expired)}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Link
                        href={`/${locale}/admin/crm/quotes/${quote.id}`}
                        className="p-2 text-primary-orange hover:bg-primary-orange/20 rounded-lg transition-colors"
                        title={String(t.viewDetails || 'مشاهده جزئیات')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <button
                        className="p-2 text-blue-400 hover:bg-blue-400/20 rounded-lg transition-colors"
                        title={String(common.edit)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {quote.status === "DRAFT" && (
                        <button
                          className="p-2 text-green-400 hover:bg-green-400/20 rounded-lg transition-colors"
                          title={String(t.sendQuote || 'ارسال')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </button>
                      )}
                      {quote.status === "ACCEPTED" && (
                        <button
                          className="p-2 text-purple-400 hover:bg-purple-400/20 rounded-lg transition-colors"
                          title={String(t.convertQuote || 'تبدیل به سفارش')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}
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
                {String(common.previous)}
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
                {String(common.next)}
              </button>
            </div>
            
            <div className="text-gray-300 text-sm">
              {t.page ? `${String(t.page)} ${currentPage} ${String(t.of || "of")} ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
