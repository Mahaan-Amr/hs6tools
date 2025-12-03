'use client';

import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessages(locale);
      setMessages(msgs);
    };
    loadMessages();
  }, [locale]);

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messages) return;

    // Basic validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
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
          {messages?.customer?.profile?.errorLoadingProfile || 'خطا در بارگذاری پروفایل'}
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
                {messages?.customer?.profile?.firstName || 'نام'}
              </label>
              <p className="text-white">{profile?.firstName || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {messages?.customer?.profile?.lastName || 'نام خانوادگی'}
              </label>
              <p className="text-white">{profile?.lastName || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {messages?.customer?.profile?.email || 'ایمیل'}
              </label>
              <p className="text-white">{profile?.email || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {messages?.customer?.profile?.phone || 'شماره تلفن'}
              </label>
              <p className="text-white">{profile?.phone || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {messages?.customer?.profile?.company || 'شرکت'}
              </label>
              <p className="text-white">{profile?.company || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {messages?.customer?.profile?.position || 'سمت'}
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
                required
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
              />
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
                required
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
              />
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
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
              />
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
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
              />
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
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
              />
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
