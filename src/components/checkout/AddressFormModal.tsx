'use client';

import React, { useState } from 'react';
import { getMessages, Messages } from '@/lib/i18n';
import { useCustomer } from '@/contexts/CustomerContext';
import AddressForm from '@/components/customer/addresses/AddressForm';

interface AddressFormModalProps {
  locale: string;
  isOpen: boolean;
  onClose: () => void;
  onAddressCreated: () => void;
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

export default function AddressFormModal({
  locale,
  isOpen,
  onClose,
  onAddressCreated
}: AddressFormModalProps) {
  const { createAddress } = useCustomer();
  const [messages, setMessages] = useState<Messages | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessages(locale);
      setMessages(msgs);
    };
    loadMessages();
  }, [locale]);

  const handleSubmit = async (addressData: AddressFormData): Promise<boolean> => {
    setIsSubmitting(true);
    
    try {
      // Set the address type to SHIPPING (only type supported)
      const addressToCreate = {
        ...addressData,
        type: 'SHIPPING'
      };
      
      const success = await createAddress(addressToCreate);
      
      if (success) {
        onAddressCreated();
        onClose();
        return true;
      } else {
        // Error is already set in CustomerContext, but we can show a toast/notification here if needed
        console.error('Failed to create address during checkout');
        return false;
      }
    } catch (err) {
      console.error('❌ Address Creation Error in Modal:', err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !messages) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {messages?.customer?.addresses?.addNewAddress || 'افزودن آدرس جدید'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <AddressForm
          locale={locale}
          address={null}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}

