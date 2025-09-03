'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CustomerProvider } from '@/contexts/CustomerContext';
import OrderDetails from '@/components/customer/orders/OrderDetails';
import { getMessages, Messages } from '@/lib/i18n';

interface OrderDetailsPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

function OrderDetailsPageContent({ params }: OrderDetailsPageProps) {
  const { status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Messages | null>(null);
  const [resolvedParams, setResolvedParams] = useState<{ id: string; locale: string } | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
      
      const msgs = await getMessages(resolved.locale);
      setMessages(msgs);
    };
    resolveParams();
  }, [params]);

  // Show loading state while checking authentication or resolving params
  if (status === 'loading' || !messages || !resolvedParams) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-black via-gray-900 to-primary-black pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange mx-auto"></div>
            <p className="text-white mt-4">
              {messages?.common?.loading || 'در حال بارگذاری...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    router.push(`/${resolvedParams.locale}/auth/login`);
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-black via-gray-900 to-primary-black pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-gray-400">
            <button 
              onClick={() => router.push(`/${resolvedParams.locale}/account`)}
              className="hover:text-white transition-colors"
            >
              {messages?.customer?.orderDetails?.breadcrumb?.account || 'حساب کاربری'}
            </button>
            <span>/</span>
            <button 
              onClick={() => router.push(`/${resolvedParams.locale}/account?tab=orders`)}
              className="hover:text-white transition-colors"
            >
              {messages?.customer?.orderDetails?.breadcrumb?.orders || 'سفارشات'}
            </button>
            <span>/</span>
            <span className="text-white">
              {messages?.customer?.orderDetails?.breadcrumb?.orderDetails || 'جزئیات سفارش'}
            </span>
          </nav>
        </div>

        {/* Order Details Component */}
        <OrderDetails orderId={resolvedParams.id} locale={resolvedParams.locale} />
      </div>
    </div>
  );
}

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  return (
    <CustomerProvider>
      <OrderDetailsPageContent params={params} />
    </CustomerProvider>
  );
}
