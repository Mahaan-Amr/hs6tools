'use client';

import React, { useState, useEffect } from 'react';
import { getMessages, Messages } from '@/lib/i18n';
import { useCustomer } from '@/contexts/CustomerContext';
import AddressFormModal from './AddressFormModal';

interface CheckoutAddressSelectorProps {
  locale: string;
  onAddressSelect: (address: CustomerAddress) => void;
  selectedShippingAddress?: CustomerAddress | null;
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

export default function CheckoutAddressSelector({ 
  locale, 
  onAddressSelect, 
  selectedShippingAddress 
}: CheckoutAddressSelectorProps) {
  const { addresses, addressesLoading } = useCustomer();
  const [messages, setMessages] = useState<Messages | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessages(locale);
      setMessages(msgs);
    };
    loadMessages();
  }, [locale]);

  const getShippingAddresses = () => {
    const shippingAddresses = addresses.filter(addr => addr.type === 'SHIPPING');
    // Deduplicate by ID to prevent showing the same address multiple times
    const uniqueAddresses = Array.from(
      new Map(shippingAddresses.map(addr => [addr.id, addr])).values()
    );
    return uniqueAddresses;
  };

  const handleAddressSelect = (address: CustomerAddress) => {
    onAddressSelect(address);
  };

  const handleAddNewAddress = () => {
    setShowAddressModal(true);
  };

  const handleAddressCreated = () => {
    // Addresses will be refreshed automatically by CustomerContext
  };

  if (addressesLoading || !messages) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-white/10 rounded w-1/3"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const shippingAddresses = getShippingAddresses();

  return (
    <div className="space-y-6">
      {/* Shipping Address Section */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {messages?.checkout?.shippingAddress || 'آدرس ارسال'}
        </h3>
        
        {shippingAddresses.length > 0 ? (
          <div className="space-y-3">
            {shippingAddresses.map((address) => (
              <div
                key={address.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedShippingAddress?.id === address.id
                    ? 'border-primary-orange bg-primary-orange/10'
                    : 'border-gray-300 dark:border-white/20 hover:border-gray-400 dark:hover:border-white/40'
                }`}
                onClick={() => handleAddressSelect(address)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {address.title}
                      </span>
                      {address.isDefault && (
                        <span className="px-2 py-1 text-xs bg-primary-orange/20 text-primary-orange rounded-full">
                          {messages?.customer?.addresses?.isDefault || 'پیش‌فرض'}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {address.firstName} {address.lastName}
                    </p>
                    {address.company && (
                      <p className="text-sm text-gray-700 dark:text-gray-300">{address.company}</p>
                    )}
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{address.addressLine1}</p>
                    {address.addressLine2 && (
                      <p className="text-sm text-gray-700 dark:text-gray-300">{address.addressLine2}</p>
                    )}
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {address.city}، {address.state} {address.postalCode}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{address.country}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{address.phone}</p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="radio"
                      name="shippingAddress"
                      checked={selectedShippingAddress?.id === address.id}
                      onChange={() => handleAddressSelect(address)}
                      className="w-4 h-4 text-primary-orange bg-white/10 border-white/20 focus:ring-primary-orange focus:ring-2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {messages?.customer?.addresses?.noAddresses || 'هنوز آدرسی ندارید'}
            </p>
          </div>
        )}
        
        <button
          onClick={handleAddNewAddress}
          className="mt-4 w-full px-4 py-3 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors duration-200"
        >
          + {messages?.customer?.addresses?.addNewAddress || 'افزودن آدرس جدید'}
        </button>
      </div>

      {/* Address Form Modal */}
      <AddressFormModal
        locale={locale}
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onAddressCreated={handleAddressCreated}
      />
    </div>
  );
}
