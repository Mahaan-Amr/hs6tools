'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface CustomerProfile {
  id: string;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string;
  company: string | null;
  position: string | null;
  avatar: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  addresses: CustomerAddress[];
  recentOrders: CustomerOrder[];
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

interface CustomerOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingMethod: string;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  customerNote?: string;
  trackingNumber?: string;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt: string;
  billingAddress: CustomerAddress;
  shippingAddress: CustomerAddress;
  items: CustomerOrderItem[];
}

interface CustomerOrderItem {
  id: string;
  productId?: string;
  variantId?: string;
  sku: string;
  name: string;
  description?: string;
  image?: string;
  unitPrice: number;
  totalPrice: number;
  quantity: number;
  attributes?: Record<string, unknown>;
  product?: {
    id: string;
    name: string;
    slug: string;
    images?: { url: string; alt?: string }[];
  };
  variant?: {
    id: string;
    name: string;
    sku: string;
  };
}

interface OrderPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface CustomerContextType {
  profile: CustomerProfile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<CustomerProfile>) => Promise<boolean>;
  
  // Order management
  orders: CustomerOrder[];
  ordersLoading: boolean;
  ordersError: string | null;
  ordersPagination: OrderPagination | null;
  fetchOrders: (page?: number, limit?: number, filters?: OrderFilters) => Promise<void>;
  fetchOrderDetails: (orderId: string) => Promise<CustomerOrder | null>;
  refreshOrders: () => Promise<void>;

  // Address management
  addresses: CustomerAddress[];
  addressesLoading: boolean;
  addressesError: string | null;
  fetchAddresses: () => Promise<void>;
  createAddress: (addressData: Omit<CustomerAddress, 'id'>) => Promise<boolean>;
  updateAddress: (id: string, addressData: Partial<CustomerAddress>) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
  setDefaultAddress: (id: string) => Promise<boolean>;
  refreshAddresses: () => Promise<void>;
}

interface OrderFilters {
  status?: string;
  dateRange?: string;
  sortBy?: string;
  sortOrder?: string;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Order management state
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [ordersPagination, setOrdersPagination] = useState<OrderPagination | null>(null);

  // Address management state
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!session?.user?.id) {
      console.log('❌ fetchProfile: No session user ID');
      return;
    }

    console.log('🔍 fetchProfile: Starting fetch for user:', session.user.id);
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 fetchProfile: Calling /api/customer/profile');
      const response = await fetch('/api/customer/profile');
      console.log('🔍 fetchProfile: Response status:', response.status);
      
      const result = await response.json();
      console.log('🔍 fetchProfile: Response result:', result);

      if (result.success) {
        console.log('✅ fetchProfile: Successfully fetched profile');
        setProfile(result.data);
      } else {
        console.error('❌ fetchProfile: API error:', result.error);
        setError(result.error || 'Failed to fetch profile');
      }
    } catch (err) {
      console.error('❌ fetchProfile: Network error:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  const updateProfile = async (data: Partial<CustomerProfile>): Promise<boolean> => {
    if (!session?.user?.id) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh profile data
        await fetchProfile();
        return true;
      } else {
        setError(result.error || 'Failed to update profile');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error updating profile:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  // Order management functions
  const fetchOrders = useCallback(async (page: number = 1, limit: number = 10, filters: OrderFilters = {}) => {
    if (!session?.user?.id) {
      console.log('❌ fetchOrders: No session user ID');
      return;
    }

    console.log('🔍 fetchOrders: Starting fetch for user:', session.user.id);
    console.log('🔍 fetchOrders: Page:', page, 'Limit:', limit, 'Filters:', filters);
    
    setOrdersLoading(true);
    setOrdersError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.dateRange && { dateRange: filters.dateRange }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
        ...(filters.sortOrder && { sortOrder: filters.sortOrder })
      });

      const url = `/api/customer/orders?${params}`;
      console.log('🔍 fetchOrders: Fetching from URL:', url);
      
      const response = await fetch(url);
      const result = await response.json();

      console.log('🔍 fetchOrders: Response:', result);

      if (result.success) {
        setOrders(result.data.orders);
        setOrdersPagination(result.data.pagination);
        console.log('✅ fetchOrders: Successfully fetched orders:', result.data.orders.length);
      } else {
        setOrdersError(result.error || 'Failed to fetch orders');
        console.error('❌ fetchOrders: API error:', result.error);
      }
    } catch (err) {
      setOrdersError('Network error occurred');
      console.error('❌ fetchOrders: Network error:', err);
    } finally {
      setOrdersLoading(false);
    }
  }, [session?.user?.id]);

  const fetchOrderDetails = async (orderId: string): Promise<CustomerOrder | null> => {
    if (!session?.user?.id) return null;

    try {
      const response = await fetch(`/api/customer/orders/${orderId}`);
      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        setOrdersError(result.error || 'Failed to fetch order details');
        return null;
      }
    } catch (err) {
      setOrdersError('Network error occurred');
      console.error('Error fetching order details:', err);
      return null;
    }
  };

  const refreshOrders = async () => {
    if (ordersPagination) {
      await fetchOrders(ordersPagination.page, ordersPagination.limit);
    }
  };

  // Address management functions
  const fetchAddresses = useCallback(async () => {
    if (!session?.user?.id) {
      console.log('❌ fetchAddresses: No session user ID');
      return;
    }

    console.log('🔍 fetchAddresses: Starting fetch for user:', session.user.id);
    setAddressesLoading(true);
    setAddressesError(null);

    try {
      const response = await fetch('/api/customer/addresses');
      const result = await response.json();

      if (result.success) {
        setAddresses(result.data);
        console.log('✅ fetchAddresses: Successfully fetched addresses:', result.data.length);
      } else {
        setAddressesError(result.error || 'Failed to fetch addresses');
        console.error('❌ fetchAddresses: API error:', result.error);
      }
    } catch (err) {
      setAddressesError('Network error occurred');
      console.error('❌ fetchAddresses: Network error:', err);
    } finally {
      setAddressesLoading(false);
    }
  }, [session?.user?.id]);

  const createAddress = async (addressData: Omit<CustomerAddress, 'id'>): Promise<boolean> => {
    if (!session?.user?.id) return false;

    setAddressesLoading(true);
    setAddressesError(null);

    try {
      const response = await fetch('/api/customer/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      });

      const result = await response.json();

      if (result.success) {
        await fetchAddresses(); // Refresh addresses
        return true;
      } else {
        setAddressesError(result.error || 'Failed to create address');
        return false;
      }
    } catch (err) {
      setAddressesError('Network error occurred');
      console.error('Error creating address:', err);
      return false;
    } finally {
      setAddressesLoading(false);
    }
  };

  const updateAddress = async (id: string, addressData: Partial<CustomerAddress>): Promise<boolean> => {
    if (!session?.user?.id) return false;

    setAddressesLoading(true);
    setAddressesError(null);

    try {
      const response = await fetch(`/api/customer/addresses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      });

      const result = await response.json();

      if (result.success) {
        await fetchAddresses(); // Refresh addresses
        return true;
      } else {
        setAddressesError(result.error || 'Failed to update address');
        return false;
      }
    } catch (err) {
      setAddressesError('Network error occurred');
      console.error('Error updating address:', err);
      return false;
    } finally {
      setAddressesLoading(false);
    }
  };

  const deleteAddress = async (id: string): Promise<boolean> => {
    if (!session?.user?.id) return false;

    setAddressesLoading(true);
    setAddressesError(null);

    try {
      const response = await fetch(`/api/customer/addresses/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        await fetchAddresses(); // Refresh addresses
        return true;
      } else {
        setAddressesError(result.error || 'Failed to delete address');
        return false;
      }
    } catch (err) {
      setAddressesError('Network error occurred');
      console.error('Error deleting address:', err);
      return false;
    } finally {
      setAddressesLoading(false);
    }
  };

  const setDefaultAddress = async (id: string): Promise<boolean> => {
    if (!session?.user?.id) return false;

    setAddressesLoading(true);
    setAddressesError(null);

    try {
      const response = await fetch(`/api/customer/addresses/${id}/default`, {
        method: 'PUT',
      });

      const result = await response.json();

      if (result.success) {
        await fetchAddresses(); // Refresh addresses
        return true;
      } else {
        setAddressesError(result.error || 'Failed to set default address');
        return false;
      }
    } catch (err) {
      setAddressesError('Network error occurred');
      console.error('Error setting default address:', err);
      return false;
    } finally {
      setAddressesLoading(false);
    }
  };

  const refreshAddresses = async () => {
    await fetchAddresses();
  };

  // Fetch profile and orders when session changes
  useEffect(() => {
    console.log('🔄 CustomerContext useEffect: status:', status, 'session user ID:', session?.user?.id);
    
    if (status === 'authenticated' && session?.user?.id) {
      console.log('✅ CustomerContext: Session authenticated, fetching profile and orders');
      fetchProfile();
      // Fetch initial orders with default parameters
      fetchOrders(1, 10, {});
      // Fetch initial addresses
      fetchAddresses();
    } else if (status === 'unauthenticated') {
      console.log('❌ CustomerContext: Session unauthenticated, clearing data');
      setProfile(null);
      setError(null);
      setOrders([]);
      setOrdersPagination(null);
      setAddresses([]);
      setAddressesError(null);
    }
  }, [session?.user?.id, status, fetchProfile, fetchOrders, fetchAddresses]);

  const value: CustomerContextType = {
    profile,
    loading,
    error,
    refreshProfile,
    updateProfile,
    
    // Order management
    orders,
    ordersLoading,
    ordersError,
    ordersPagination,
    fetchOrders,
    fetchOrderDetails,
    refreshOrders,

    // Address management
    addresses,
    addressesLoading,
    addressesError,
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refreshAddresses,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
}
