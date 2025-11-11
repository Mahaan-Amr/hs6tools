"use client";

import { useState } from "react";

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
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  industry?: string;
  companySize?: string;
  source?: string;
  status?: string;
  assignedTo?: string;
  notes?: string;
  tags?: string[];
  expectedValue?: number | null;
  expectedClose?: string | null;
  nextFollowUp?: string | null;
}

interface LeadFormProps {
  lead?: Lead;
  onSubmit: (data: LeadFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function LeadForm({ lead, onSubmit, onCancel, isLoading = false }: LeadFormProps) {
  const [formData, setFormData] = useState({
    firstName: lead?.firstName || "",
    lastName: lead?.lastName || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
    company: lead?.company || "",
    position: lead?.position || "",
    industry: lead?.industry || "",
    companySize: lead?.companySize || "",
    source: lead?.source || "WEBSITE",
    status: lead?.status || "NEW",
    assignedTo: lead?.assignedTo || "",
    notes: lead?.notes || "",
    tags: lead?.tags?.join(", ") || "",
    expectedValue: lead?.expectedValue || "",
    expectedClose: lead?.expectedClose || "",
    nextFollowUp: lead?.nextFollowUp || ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "نام الزامی است";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "نام خانوادگی الزامی است";
    }

    if (!formData.email.trim()) {
      newErrors.email = "ایمیل الزامی است";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "فرمت ایمیل صحیح نیست";
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "فرمت شماره تلفن صحیح نیست";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      tags: formData.tags ? formData.tags.split(",").map((tag: string) => tag.trim()).filter((tag: string) => tag) : [],
      expectedValue: formData.expectedValue ? parseFloat(formData.expectedValue.toString()) : null,
      expectedClose: formData.expectedClose || null,
      nextFollowUp: formData.nextFollowUp || null
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">اطلاعات شخصی</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
              نام *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                errors.firstName ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="نام"
            />
            {errors.firstName && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
              نام خانوادگی *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                errors.lastName ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="نام خانوادگی"
            />
            {errors.lastName && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
              ایمیل *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                errors.email ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="example@domain.com"
            />
            {errors.email && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
              شماره تلفن
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                errors.phone ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="09123456789"
            />
            {errors.phone && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{errors.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">اطلاعات شرکت</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
              نام شرکت
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
              placeholder="نام شرکت"
            />
          </div>

          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
              سمت
            </label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
              placeholder="مدیر، مهندس، ..."
            />
          </div>

          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
              صنعت
            </label>
            <input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
              placeholder="صنعت"
            />
          </div>

          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
              اندازه شرکت
            </label>
            <select
              name="companySize"
              value={formData.companySize}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
            >
              <option value="">انتخاب کنید</option>
              <option value="STARTUP">استارتاپ (1-10 نفر)</option>
              <option value="SMALL">کوچک (11-50 نفر)</option>
              <option value="MEDIUM">متوسط (51-200 نفر)</option>
              <option value="LARGE">بزرگ (201-1000 نفر)</option>
              <option value="ENTERPRISE">سازمانی (1000+ نفر)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lead Information */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">اطلاعات لید</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
              منبع لید *
            </label>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
            >
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
            <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
              وضعیت
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
            >
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
            <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
              اختصاص داده شده به
            </label>
            <input
              type="text"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
              placeholder="نام فروشنده"
            />
          </div>

          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
              ارزش مورد انتظار
            </label>
            <input
              type="number"
              name="expectedValue"
              value={formData.expectedValue}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
              placeholder="0"
              min="0"
            />
          </div>

          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
              تاریخ بسته شدن مورد انتظار
            </label>
            <input
              type="date"
              name="expectedClose"
              value={formData.expectedClose}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
            />
          </div>

          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
              پیگیری بعدی
            </label>
            <input
              type="datetime-local"
              name="nextFollowUp"
              value={formData.nextFollowUp}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
            برچسب‌ها
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
            placeholder="برچسب‌ها را با کاما جدا کنید"
          />
        </div>

        <div className="mt-6">
          <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
            یادداشت‌ها
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all resize-none"
            placeholder="یادداشت‌های مربوط به لید..."
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
          {isLoading ? "در حال ذخیره..." : lead ? "به‌روزرسانی" : "ایجاد"}
        </button>
      </div>
    </form>
  );
}
