'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useCustomer } from '@/contexts/CustomerContext';
import { getMessages, Messages } from '@/lib/i18n';

interface ProfileFormProps {
  locale: string;
}

export default function ProfileForm({ locale }: ProfileFormProps) {
  const { profile, loading, error, updateProfile } = useCustomer();
  const [messages, setMessages] = useState<Messages | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    company: '',
    position: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessages(locale);
      setMessages(msgs);
    };
    loadMessages();
  }, [locale]);

  // Helper to access customer.profile messages
  const customerProfile = useMemo(() => {
    if (!messages) return undefined;
    const customer = (messages as unknown as Record<string, unknown>)?.customer as Record<string, unknown> | undefined;
    return customer?.profile as Record<string, unknown> | undefined;
  }, [messages]);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        company: profile.company || '',
        position: profile.position || ''
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const validation = customerProfile?.validation as Record<string, string> | undefined;

    if (!formData.firstName.trim()) {
      newErrors.firstName = validation?.firstNameRequired 
        ? String(validation.firstNameRequired) 
        : "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = validation?.firstNameMinLength 
        ? String(validation.firstNameMinLength) 
        : "First name must be at least 2 characters";
    } else if (formData.firstName.trim().length > 50) {
      newErrors.firstName = validation?.firstNameMaxLength 
        ? String(validation.firstNameMaxLength) 
        : "First name must be at most 50 characters";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = validation?.lastNameRequired 
        ? String(validation.lastNameRequired) 
        : "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = validation?.lastNameMinLength 
        ? String(validation.lastNameMinLength) 
        : "Last name must be at least 2 characters";
    } else if (formData.lastName.trim().length > 50) {
      newErrors.lastName = validation?.lastNameMaxLength 
        ? String(validation.lastNameMaxLength) 
        : "Last name must be at most 50 characters";
    }

    if (formData.phone && formData.phone.trim()) {
      if (formData.phone.trim().length > 20) {
        newErrors.phone = validation?.phoneMaxLength 
          ? String(validation.phoneMaxLength) 
          : "Phone number must be at most 20 characters";
      } else if (!/^(\+98|0)?9\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = validation?.phoneInvalid 
          ? String(validation.phoneInvalid) 
          : "Phone number format is invalid";
      }
    }

    if (formData.company && formData.company.trim().length > 100) {
      newErrors.company = validation?.companyMaxLength 
        ? String(validation.companyMaxLength) 
        : "Company name must be at most 100 characters";
    }

    if (formData.position && formData.position.trim().length > 100) {
      newErrors.position = validation?.positionMaxLength 
        ? String(validation.positionMaxLength) 
        : "Position must be at most 100 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messages) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        company: profile.company || '',
        position: profile.position || ''
      });
    }
    setIsEditing(false);
  };

  if (loading || !messages || !messages.customer?.profile) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-white/5 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          {(customerProfile as Record<string, string> | undefined)?.errorLoadingProfile || 'خطا در بارگذاری پروفایل'}
        </h3>
        <p className="text-gray-400 mb-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isEditing ? (
        // Display Mode
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {(customerProfile as Record<string, string> | undefined)?.firstName || 'نام'}
              </label>
              <p className="text-white">{profile?.firstName || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {(customerProfile as Record<string, string> | undefined)?.lastName || 'نام خانوادگی'}
              </label>
              <p className="text-white">{profile?.lastName || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {(customerProfile as Record<string, string> | undefined)?.email || 'ایمیل'}
              </label>
              <p className="text-white">{profile?.email || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {(customerProfile as Record<string, string> | undefined)?.phone || 'شماره تلفن'}
              </label>
              <p className="text-white">{profile?.phone || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {(customerProfile as Record<string, string> | undefined)?.company || 'شرکت'}
              </label>
              <p className="text-white">{profile?.company || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {(customerProfile as Record<string, string> | undefined)?.position || 'سمت'}
              </label>
              <p className="text-white">{profile?.position || '-'}</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            {messages?.common?.edit || 'ویرایش'}
          </button>
        </div>
      ) : (
        // Edit Mode
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-400 mb-1">
                {messages.customer.profile.firstName} *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                maxLength={50}
                required
                className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-orange ${
                  errors.firstName 
                    ? 'border-red-500' 
                    : 'border-white/20'
                }`}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-400 mb-1">
                {messages.customer.profile.lastName} *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                maxLength={50}
                required
                className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-orange ${
                  errors.lastName 
                    ? 'border-red-500' 
                    : 'border-white/20'
                }`}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>
              )}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-1">
                {messages.customer.profile.phone}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                maxLength={20}
                className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-orange ${
                  errors.phone 
                    ? 'border-red-500' 
                    : 'border-white/20'
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
              )}
            </div>
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-400 mb-1">
                {messages.customer.profile.company}
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                maxLength={100}
                className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-orange ${
                  errors.company 
                    ? 'border-red-500' 
                    : 'border-white/20'
                }`}
              />
              {errors.company && (
                <p className="mt-1 text-sm text-red-400">{errors.company}</p>
              )}
            </div>
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-400 mb-1">
                {messages.customer.profile.position}
              </label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                maxLength={100}
                className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-orange ${
                  errors.position 
                    ? 'border-red-500' 
                    : 'border-white/20'
                }`}
              />
              {errors.position && (
                <p className="mt-1 text-sm text-red-400">{errors.position}</p>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? messages.common.loading : messages.customer.profile.saveChanges}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {messages.customer.profile.resetForm}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
