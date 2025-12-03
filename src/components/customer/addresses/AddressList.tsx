'use client';

import React, { useState, useEffect } from 'react';
import { getMessages, Messages } from '@/lib/i18n';
import { useCustomer } from '@/contexts/CustomerContext';

interface AddressListProps {
  locale: string;
}



export default function AddressList({ locale }: AddressListProps) {
  const { addresses, addressesLoading, addressesError, deleteAddress, setDefaultAddress } = useCustomer();
  const [messages, setMessages] = useState<Messages | null>(null);
  // const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessages(locale);
      setMessages(msgs);
    };
    loadMessages();
  }, [locale]);

  const handleDelete = async (addressId: string) => {
    const success = await deleteAddress(addressId);
    if (success) {
      setShowDeleteConfirm(null);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    await setDefaultAddress(addressId);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'BILLING':
        return messages?.customer?.addresses?.billing || 'صورتحساب';
      case 'SHIPPING':
        return messages?.customer?.addresses?.shipping || 'ارسال';
      case 'BOTH':
        return messages?.customer?.addresses?.both || 'هر دو';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BILLING':
        return 'bg-blue-500/20 text-blue-400';
      case 'SHIPPING':
        return 'bg-green-500/20 text-green-400';
      case 'BOTH':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (addressesLoading || !messages) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-white/5 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (addressesError) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          {messages?.customer?.addresses?.errorLoadingAddresses || 'خطا در بارگذاری آدرس‌ها'}
        </h3>
        <p className="text-gray-400 mb-4">{addressesError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-primary-orange text-white font-medium rounded-xl hover:bg-orange-600 transition-colors duration-200"
        >
          {messages?.customer?.addresses?.retry || messages?.common?.retry || 'تلاش مجدد'}
        </button>
      </div>
    );
  }

  if (!addresses || addresses.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          {messages?.customer?.addresses?.noAddresses || 'هنوز آدرسی ندارید'}
        </h3>
        <p className="text-gray-400">
          {messages?.customer?.addresses?.noAddressesMessage || 'اولین آدرس خود را اضافه کنید'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <div key={address.id} className="glass rounded-xl p-6 border border-white/10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-xs rounded-full ${getTypeColor(address.type)}`}>
                {getTypeLabel(address.type)}
              </span>
              {address.isDefault && (
                <span className="px-2 py-1 text-xs bg-primary-orange/20 text-primary-orange rounded-full">
                  {messages?.customer?.addresses?.isDefault || 'پیش‌فرض'}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {!address.isDefault && (
                <button
                  onClick={() => handleSetDefault(address.id)}
                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors duration-200"
                  title={messages?.customer?.addresses?.setAsDefault || 'تنظیم به عنوان پیش‌فرض'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              )}
              
              <button
                onClick={() => console.log('Edit address:', address)}
                className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-colors duration-200"
                title={messages?.customer?.addresses?.editAddress || 'ویرایش آدرس'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(address.id)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                title={messages?.customer?.addresses?.deleteAddress || 'حذف آدرس'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Address Content */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">
              {address.title}
            </h3>
            
            <div className="text-gray-300">
              <p className="font-medium text-white">
                {address.firstName} {address.lastName}
              </p>
              {address.company && (
                <p className="text-sm">{address.company}</p>
              )}
              <p className="mt-2">{address.addressLine1}</p>
              {address.addressLine2 && (
                <p>{address.addressLine2}</p>
              )}
              <p className="mt-2">
                {address.city}، {address.state} {address.postalCode}
              </p>
              <p>{address.country}</p>
              <p className="mt-2 text-sm">
                {messages?.customer?.addresses?.phone || 'تلفن:'} {address.phone}
              </p>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm === address.id && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="glass rounded-xl p-6 max-w-md mx-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {messages?.customer?.addresses?.deleteAddress || 'حذف آدرس'}
                </h3>
                <p className="text-gray-300 mb-6">
                  {messages?.customer?.addresses?.deleteConfirmMessage || 'آیا مطمئن هستید که می‌خواهید این آدرس را حذف کنید؟ این عملیات قابل بازگشت نیست.'}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    {messages?.common?.delete || 'حذف'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors duration-200"
                  >
                    {messages?.common?.cancel || 'لغو'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
