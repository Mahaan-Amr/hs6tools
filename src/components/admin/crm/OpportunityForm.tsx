"use client";

import { useState, useEffect } from "react";

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

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
}

interface Opportunity {
  id?: string;
  customerId?: string;
  title?: string;
  description?: string;
  value?: number;
  stage?: string;
  probability?: number;
  expectedClose?: string;
  assignedTo?: string;
}

interface OpportunityFormProps {
  opportunity?: Opportunity;
  onSubmit: (data: OpportunityFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function OpportunityForm({
  opportunity,
  onSubmit,
  onCancel,
  isLoading = false
}: OpportunityFormProps) {
  const [formData, setFormData] = useState<OpportunityFormData>({
    customerId: "",
    title: "",
    description: "",
    value: 0,
    stage: "PROSPECTING",
    probability: 0,
    expectedClose: "",
    assignedTo: ""
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  useEffect(() => {
    if (opportunity) {
      setFormData({
        customerId: opportunity.customerId || "",
        title: opportunity.title || "",
        description: opportunity.description || "",
        value: opportunity.value || 0,
        stage: opportunity.stage || "PROSPECTING",
        probability: opportunity.probability || 0,
        expectedClose: opportunity.expectedClose || "",
        assignedTo: opportunity.assignedTo || ""
      });
    }
  }, [opportunity]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const response = await fetch("/api/analytics?type=customers&period=365");
      const result = await response.json();
      
      if (result.success) {
        setCustomers(result.data.customers || []);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "value" || name === "probability" ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const stageOptions = [
    { value: "PROSPECTING", label: "پیش‌فروش" },
    { value: "QUALIFICATION", label: "صلاحیت‌سنجی" },
    { value: "PROPOSAL", label: "پیشنهاد" },
    { value: "NEGOTIATION", label: "مذاکره" },
    { value: "CLOSED_WON", label: "بسته شده (موفق)" },
    { value: "CLOSED_LOST", label: "بسته شده (ناموفق)" }
  ];

  const probabilityOptions = [
    { value: 0, label: "0%" },
    { value: 10, label: "10%" },
    { value: 25, label: "25%" },
    { value: 50, label: "50%" },
    { value: 75, label: "75%" },
    { value: 90, label: "90%" },
    { value: 100, label: "100%" }
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {opportunity ? "ویرایش فرصت" : "ایجاد فرصت جدید"}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Opportunity Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">جزئیات فرصت</h3>
          <div className="space-y-6">
            {/* Customer Selection */}
            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                مشتری *
              </label>
              <select
                name="customerId"
                value={formData.customerId}
                onChange={handleInputChange}
                required
                disabled={loadingCustomers}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingCustomers ? "در حال بارگذاری..." : "انتخاب مشتری"}
                </option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.firstName} {customer.lastName} - {customer.email}
                    {customer.company && ` (${customer.company})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                عنوان فرصت *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                placeholder="عنوان فرصت فروش"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                توضیحات
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all resize-none"
                placeholder="توضیحات فرصت فروش"
              />
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">اطلاعات مالی</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                ارزش فرصت (ریال) *
              </label>
              <input
                type="number"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                required
                min="0"
                step="1000"
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                احتمال موفقیت
              </label>
              <select
                name="probability"
                value={formData.probability}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
              >
                {probabilityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sales Pipeline */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">خط فروش</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                مرحله *
              </label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
              >
                {stageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                تاریخ بسته شدن مورد انتظار
              </label>
              <input
                type="date"
                name="expectedClose"
                value={formData.expectedClose}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
              واگذار شده به
            </label>
            <input
              type="text"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
              placeholder="نام نماینده فروش"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-primary-orange text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-orange/30"
          >
            {isLoading ? "در حال ذخیره..." : opportunity ? "به‌روزرسانی" : "ایجاد"}
          </button>
        </div>
      </form>
    </div>
  );
}
