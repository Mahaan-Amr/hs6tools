'use client';

import React, { useState, useEffect } from 'react';
import { getMessages, Messages } from '@/lib/i18n';
import { useCustomer } from '@/contexts/CustomerContext';
import AddressForm from './AddressForm';
import AddressList from './AddressList';

interface AddressesTabProps {
  locale: string;
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

export default function AddressesTab({ locale }: AddressesTabProps) {
  const { createAddress, updateAddress } = useCustomer();
  const [messages, setMessages] = useState<Messages | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessages(locale);
      setMessages(msgs);
    };
    loadMessages();
  }, [locale]);

  const handleSubmit = async (addressData: AddressFormData): Promise<boolean> => {
    setIsSubmitting(true);
    
    try {
      let success: boolean;
      
      if (editingAddress) {
        // Update existing address
        success = await updateAddress(editingAddress.id, addressData as Partial<CustomerAddress>);
      } else {
        // Create new address
        success = await createAddress(addressData);
      }
      
      if (success) {
        setShowForm(false);
        setEditingAddress(null);
        return true;
      }
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAddress(null);
  };



  const handleAddNew = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  if (!messages) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {messages?.customer?.addresses?.title || 'آدرس‌ها'}
        </h2>
        
        {!showForm && (
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-primary-orange text-white font-medium rounded-xl hover:bg-orange-600 transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {messages?.customer?.addresses?.addNewAddress || 'افزودن آدرس جدید'}
          </button>
        )}
      </div>

      {/* Form or List */}
      {showForm ? (
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">
              {editingAddress 
                ? messages?.customer?.addresses?.editAddress || 'ویرایش آدرس'
                : messages?.customer?.addresses?.addNewAddress || 'افزودن آدرس جدید'
              }
            </h3>
            
            <button
              onClick={handleCancel}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <AddressForm
            locale={locale}
            address={editingAddress}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </div>
      ) : (
        <AddressList locale={locale} />
      )}
    </div>
  );
}
