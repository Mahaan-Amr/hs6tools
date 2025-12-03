'use client';

import React, { useState, useEffect } from 'react';
import { getMessages, Messages } from '@/lib/i18n';

interface AddressFormProps {
  locale: string;
  address?: CustomerAddress | null;
  onSubmit: (addressData: AddressFormData) => Promise<boolean>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface AddressFormData {
  type: string;
  title: string;
  firstName: string;
  lastName: string;
  company: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CustomerAddress {
  id: string;
  type: string;
  title: string;
  firstName: string;
  lastName: string;
  company: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AddressForm({ 
  locale, 
  address, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}: AddressFormProps) {
  const [messages, setMessages] = useState<Messages | null>(null);
  const [formData, setFormData] = useState<AddressFormData>({
    type: 'SHIPPING',
    title: '',
    firstName: '',
    lastName: '',
    company: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Iran',
    phone: '',
    isDefault: false,
    createdAt: '',
    updatedAt: ''
  });
  const [errors, setErrors] = useState<Partial<AddressFormData>>({});

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessages(locale);
      setMessages(msgs);
    };
    loadMessages();
  }, [locale]);

  useEffect(() => {
    if (address) {
      setFormData({
        type: address.type,
        title: address.title,
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company || '',
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || '',
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phone: address.phone,
        isDefault: address.isDefault,
        createdAt: address.createdAt,
        updatedAt: address.updatedAt
      });
    }
  }, [address]);

  const handleInputChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AddressFormData> = {};

    if (!formData.title.trim()) newErrors.title = 'required';
    if (!formData.firstName.trim()) newErrors.firstName = 'required';
    if (!formData.lastName.trim()) newErrors.lastName = 'required';
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'required';
    if (!formData.city.trim()) newErrors.city = 'required';
    if (!formData.state.trim()) newErrors.state = 'required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'required';
    if (!formData.phone.trim()) newErrors.phone = 'required';

    // Phone validation (Iranian format)
    const phoneRegex = /^(\+98|0)?9\d{9}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'invalid';
    }

    // Postal code validation (Iranian format)
    const postalCodeRegex = /^\d{10}$/;
    if (!postalCodeRegex.test(formData.postalCode.replace(/\s/g, ''))) {
      newErrors.postalCode = 'invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const success = await onSubmit(formData);
    if (success) {
      // Form will be closed by parent component
    }
  };

  if (!messages) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const getErrorMessage = (field: keyof AddressFormData, errorType: string) => {
    if (!messages?.customer?.addresses?.validation) return 'Invalid field';
    
    const fieldName = messages.customer.addresses[field as keyof typeof messages.customer.addresses] || field;
    const errorMessage = messages.customer.addresses.validation?.[errorType as keyof typeof messages.customer.addresses.validation];
    
    return errorMessage ? `${fieldName} ${errorMessage}` : `${fieldName} is invalid`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Address Type and Title */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            {messages?.customer?.addresses?.addressType || 'نوع آدرس'} *
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
          >
            <option value="SHIPPING">{messages?.customer?.addresses?.shipping || 'ارسال'}</option>
            <option value="BILLING">{messages?.customer?.addresses?.billing || 'صورتحساب'}</option>
            <option value="BOTH">{messages?.customer?.addresses?.both || 'هر دو'}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            {messages?.customer?.addresses?.title || 'عنوان'} *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-orange ${
              errors.title ? 'border-red-500' : 'border-white/20'
            }`}
            placeholder={messages?.customer?.addresses?.title || 'عنوان'}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-400">
              {getErrorMessage('title', errors.title)}
            </p>
          )}
        </div>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            {messages?.customer?.addresses?.firstName || 'نام'} *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-orange ${
              errors.firstName ? 'border-red-500' : 'border-white/20'
            }`}
            placeholder={messages?.customer?.addresses?.firstName || 'نام'}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-400">
              {getErrorMessage('firstName', errors.firstName)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            {messages?.customer?.addresses?.lastName || 'نام خانوادگی'} *
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-orange ${
              errors.lastName ? 'border-red-500' : 'border-white/20'
            }`}
            placeholder={messages?.customer?.addresses?.lastName || 'نام خانوادگی'}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-400">
              {getErrorMessage('lastName', errors.lastName)}
            </p>
          )}
        </div>
      </div>

      {/* Company */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          {messages?.customer?.addresses?.company || 'شرکت'}
        </label>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => handleInputChange('company', e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
          placeholder={messages?.customer?.addresses?.companyOptional || messages?.customer?.addresses?.company || 'شرکت (اختیاری)'}
        />
      </div>

      {/* Address Lines */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            {messages?.customer?.addresses?.addressLine1 || 'خط آدرس 1'} *
          </label>
          <input
            type="text"
            value={formData.addressLine1}
            onChange={(e) => handleInputChange('addressLine1', e.target.value)}
            className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-orange ${
              errors.addressLine1 ? 'border-red-500' : 'border-white/20'
            }`}
            placeholder={messages?.customer?.addresses?.addressLine1 || 'آدرس کامل'}
          />
          {errors.addressLine1 && (
            <p className="mt-1 text-sm text-red-400">
              {getErrorMessage('addressLine1', errors.addressLine1)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            {messages?.customer?.addresses?.addressLine2 || 'خط آدرس 2'}
          </label>
          <input
            type="text"
            value={formData.addressLine2}
            onChange={(e) => handleInputChange('addressLine2', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
            placeholder={messages?.customer?.addresses?.addressLine2Optional || messages?.customer?.addresses?.addressLine2 || 'آدرس تکمیلی (اختیاری)'}
          />
        </div>
      </div>

      {/* City, State, Postal Code */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            {messages?.customer?.addresses?.city || 'شهر'} *
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-orange ${
              errors.city ? 'border-red-500' : 'border-white/20'
            }`}
            placeholder={messages?.customer?.addresses?.city || 'شهر'}
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-400">
              {getErrorMessage('city', errors.city)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            {messages?.customer?.addresses?.state || 'استان'} *
          </label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-orange ${
              errors.state ? 'border-red-500' : 'border-white/20'
            }`}
            placeholder={messages?.customer?.addresses?.state || 'استان'}
          />
          {errors.state && (
            <p className="mt-1 text-sm text-red-400">
              {getErrorMessage('state', errors.state)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            {messages?.customer?.addresses?.postalCode || 'کد پستی'} *
          </label>
          <input
            type="text"
            value={formData.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-orange ${
              errors.postalCode ? 'border-red-500' : 'border-white/20'
            }`}
            placeholder="1234567890"
            maxLength={10}
          />
          {errors.postalCode && (
            <p className="mt-1 text-sm text-red-400">
              {getErrorMessage('postalCode', errors.postalCode)}
            </p>
          )}
        </div>
      </div>

      {/* Country and Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            {messages?.customer?.addresses?.country || 'کشور'} *
          </label>
          <select
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
          >
            <option value="Iran">{messages?.customer?.addresses?.countries?.iran || 'ایران'}</option>
            <option value="Afghanistan">{messages?.customer?.addresses?.countries?.afghanistan || 'افغانستان'}</option>
            <option value="Iraq">{messages?.customer?.addresses?.countries?.iraq || 'عراق'}</option>
            <option value="Turkey">{messages?.customer?.addresses?.countries?.turkey || 'ترکیه'}</option>
            <option value="Other">{messages?.customer?.addresses?.countries?.other || 'سایر'}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            {messages?.customer?.addresses?.phone || 'تلفن'} *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-orange ${
              errors.phone ? 'border-red-500' : 'border-white/20'
            }`}
            placeholder="09123456789"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-400">
              {getErrorMessage('phone', errors.phone)}
            </p>
          )}
        </div>
      </div>

      {/* Default Address */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isDefault"
          checked={formData.isDefault}
          onChange={(e) => handleInputChange('isDefault', e.target.checked)}
          className="w-4 h-4 text-primary-orange bg-white/10 border-white/20 rounded focus:ring-primary-orange focus:ring-2"
        />
        <label htmlFor="isDefault" className="ml-2 text-sm text-white">
          {messages?.customer?.addresses?.isDefault || 'آدرس پیش‌فرض'}
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-primary-orange text-white font-medium rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {messages?.common?.saving || 'در حال ذخیره...'}
            </span>
          ) : (
            address ? (messages?.common?.saveChanges || 'ذخیره تغییرات') : (messages?.customer?.addresses?.addNewAddress || 'افزودن آدرس')
          )}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {messages?.common?.cancel || 'لغو'}
        </button>
      </div>
    </form>
  );
}
