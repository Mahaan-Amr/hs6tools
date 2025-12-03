"use client";

import { useState, useEffect } from "react";
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
  nextFollowUp?: string | null;
}

interface LeadFormProps {
  lead?: Lead;
  onSubmit: (data: LeadFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  locale: string;
}

export default function LeadForm({ lead, onSubmit, onCancel, isLoading = false, locale }: LeadFormProps) {
  const [messages, setMessages] = useState<Messages | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessages(locale);
      setMessages(msgs);
    };
    loadMessages();
  }, [locale]);
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
    const t = messages?.admin?.crm?.leads;

    if (!formData.firstName.trim()) {
      newErrors.firstName = (t && typeof t === 'object' && 'firstNameRequired' in t) ? String(t.firstNameRequired) : "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = (t && typeof t === 'object' && 'lastNameRequired' in t) ? String(t.lastNameRequired) : "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = (t && typeof t === 'object' && 'emailRequired' in t) ? String(t.emailRequired) : "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = (t && typeof t === 'object' && 'emailInvalid' in t) ? String(t.emailInvalid) : "Email format is invalid";
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = (t && typeof t === 'object' && 'phoneInvalid' in t) ? String(t.phoneInvalid) : "Phone format is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (!messages || !messages.admin?.crm?.leads) {
    return <div className="text-white p-4">{messages?.common?.loading || "Loading..."}</div>;
  }

  const t = messages.admin.crm.leads;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      tags: formData.tags ? formData.tags.split(",").map((tag: string) => tag.trim()).filter((tag: string) => tag) : [],
      nextFollowUp: formData.nextFollowUp || null
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{String(t.personalInfo)}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
              {String(t.firstName)} *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                errors.firstName ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder={String(t.firstName)}
            />
            {errors.firstName && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
              {String(t.lastName)} *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                errors.lastName ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder={String(t.lastName)}
            />
            {errors.lastName && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
              {String(t.email)} *
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
              {String(t.phone)}
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{String(t.companyInfo)}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
              {String(t.company)}
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
              placeholder={String(t.company)}
            />
          </div>

          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
              {String(t.position)}
            </label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
              placeholder={String(t.positionPlaceholder)}
            />
          </div>

          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
              {String(t.industry)}
            </label>
            <input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
              placeholder={String(t.industry)}
            />
          </div>

          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
              {String(t.companySize)}
            </label>
            <select
              name="companySize"
              value={formData.companySize}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
            >
              <option value="">{String(t.selectCompanySize)}</option>
              <option value="STARTUP">{String(t.startup)}</option>
              <option value="SMALL">{String(t.small)}</option>
              <option value="MEDIUM">{String(t.medium)}</option>
              <option value="LARGE">{String(t.large)}</option>
              <option value="ENTERPRISE">{String(t.enterprise)}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lead Information */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{String(t.leadInfo)}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
              {String(t.source)} *
            </label>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
            >
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
            <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
              {String(t.status)}
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
            >
              <option value="NEW">{String(t.statusOptions?.new || '')}</option>
              <option value="CONTACTED">{String(t.statusOptions?.contacted || '')}</option>
              <option value="QUALIFIED">{String(t.statusOptions?.qualified || '')}</option>
              <option value="CONVERTED">{String(t.statusOptions?.converted || '')}</option>
              <option value="LOST">{String(t.statusOptions?.lost || '')}</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
              {String(t.assignedTo)}
            </label>
            <input
              type="text"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
              placeholder={String(t.assignedToPlaceholder)}
            />
          </div>

          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
              {String(t.nextFollowUp)}
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
            {String(t.tags)}
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
            placeholder={String(t.tagsPlaceholder)}
          />
        </div>

        <div className="mt-6">
          <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
            {String(t.notes)}
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all resize-none"
            placeholder={String(t.notesPlaceholder)}
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
          {String(t.cancel)}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-primary-orange text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-orange/30"
        >
          {isLoading ? String(t.saving) : lead ? String(t.update) : String(t.create)}
        </button>
      </div>
    </form>
  );
}
