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
      <div className="glass rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">اطلاعات شخصی</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              نام *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange ${
                errors.firstName ? "border-red-500" : "border-white/20"
              }`}
              placeholder="نام"
            />
            {errors.firstName && (
              <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              نام خانوادگی *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange ${
                errors.lastName ? "border-red-500" : "border-white/20"
              }`}
              placeholder="نام خانوادگی"
            />
            {errors.lastName && (
              <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ایمیل *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange ${
                errors.email ? "border-red-500" : "border-white/20"
              }`}
              placeholder="example@domain.com"
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              شماره تلفن
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange ${
                errors.phone ? "border-red-500" : "border-white/20"
              }`}
              placeholder="09123456789"
            />
            {errors.phone && (
              <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="glass rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">اطلاعات شرکت</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              نام شرکت
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
              placeholder="نام شرکت"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              سمت
            </label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
              placeholder="مدیر، مهندس، ..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              صنعت
            </label>
            <input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
              placeholder="صنعت"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              اندازه شرکت
            </label>
            <select
              name="companySize"
              value={formData.companySize}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
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
      <div className="glass rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">اطلاعات لید</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              منبع لید *
            </label>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              وضعیت
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              اختصاص داده شده به
            </label>
            <input
              type="text"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
              placeholder="نام فروشنده"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ارزش مورد انتظار
            </label>
            <input
              type="number"
              name="expectedValue"
              value={formData.expectedValue}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
              placeholder="0"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              تاریخ بسته شدن مورد انتظار
            </label>
            <input
              type="date"
              name="expectedClose"
              value={formData.expectedClose}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              پیگیری بعدی
            </label>
            <input
              type="datetime-local"
              name="nextFollowUp"
              value={formData.nextFollowUp}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            برچسب‌ها
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
            placeholder="برچسب‌ها را با کاما جدا کنید"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            یادداشت‌ها
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
            placeholder="یادداشت‌های مربوط به لید..."
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 space-x-reverse">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          انصراف
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-primary-orange text-white rounded-lg hover:bg-primary-orange-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "در حال ذخیره..." : lead ? "به‌روزرسانی" : "ایجاد لید"}
        </button>
      </div>
    </form>
  );
}
