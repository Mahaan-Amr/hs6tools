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
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          {opportunity ? "ویرایش فرصت" : "ایجاد فرصت جدید"}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            مشتری *
          </label>
          <select
            name="customerId"
            value={formData.customerId}
            onChange={handleInputChange}
            required
            disabled={loadingCustomers}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            عنوان فرصت *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
            placeholder="عنوان فرصت فروش"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            توضیحات
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent resize-none"
            placeholder="توضیحات فرصت فروش"
          />
        </div>

        {/* Value and Stage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
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
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              مرحله *
            </label>
            <select
              name="stage"
              value={formData.stage}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
            >
              {stageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Probability and Expected Close */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              احتمال موفقیت
            </label>
            <select
              name="probability"
              value={formData.probability}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
            >
              {probabilityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              تاریخ بسته شدن مورد انتظار
            </label>
            <input
              type="date"
              name="expectedClose"
              value={formData.expectedClose}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
            />
          </div>
        </div>

        {/* Assigned To */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            واگذار شده به
          </label>
          <input
            type="text"
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
            placeholder="نام نماینده فروش"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 space-x-reverse pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-primary-orange text-white rounded-xl hover:bg-primary-orange-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "در حال ذخیره..." : opportunity ? "به‌روزرسانی" : "ایجاد فرصت"}
          </button>
        </div>
      </form>
    </div>
  );
}
