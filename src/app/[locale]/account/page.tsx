'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CustomerProvider } from '@/contexts/CustomerContext';
import ProfileForm from '@/components/customer/profile/ProfileForm';
import RecentOrders from '@/components/customer/orders/RecentOrders';
import OrderHistory from '@/components/customer/orders/OrderHistory';
import AddressesTab from '@/components/customer/addresses/AddressesTab';
import WishlistTab from '@/components/customer/wishlist/WishlistTab';
import SecurityTab from '@/components/customer/security/SecurityTab';
import SettingsTab from '@/components/customer/settings/SettingsTab';
import TicketsTab from '@/components/customer/support/TicketsTab';
import { getMessages, Messages } from '@/lib/i18n';
import { textOr } from '@/utils/text';

interface AccountPageProps {
  params: Promise<{ locale: string }>;
}

function AccountPageContent({ params }: AccountPageProps) {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [messages, setMessages] = useState<Messages | null>(null);
  const [locale, setLocale] = useState('fa');

  useEffect(() => {
    const loadMessages = async () => {
      const { locale: currentLocale } = await params;
      setLocale(currentLocale);
      const msgs = await getMessages(currentLocale);
      setMessages(msgs);
    };
    loadMessages();
  }, [params]);

  useEffect(() => {
    const tab = searchParams.get('tab') || 'profile';
    setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const newUrl = `/${locale}/account?tab=${tab}`;
    router.push(newUrl, { scroll: false });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange mx-auto"></div>
            <p className="text-gray-900 dark:text-white mt-4">{messages?.common?.loading || "Loading..."}</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push(`/${locale}/auth/login`);
    return null;
  }

  if (!messages) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange mx-auto"></div>
            <p className="text-gray-900 dark:text-white mt-4">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const logoutLabel = textOr(
    messages?.common?.logout ?? messages?.auth?.logout ?? messages?.customer?.account?.logout,
    locale === 'fa' ? 'خروج' : locale === 'ar' ? 'تسجيل الخروج' : 'Logout'
  );
  const accountLabels = {
    title: textOr(messages?.customer?.account?.title, locale === 'fa' ? 'حساب کاربری' : 'Account'),
    subtitle: textOr(
      messages?.customer?.account?.subtitle,
      locale === 'fa' ? 'مدیریت اطلاعات شخصی و سفارشات شما' : 'Manage your personal information and orders'
    ),
    personalInfo: textOr(messages?.customer?.account?.personalInfo, locale === 'fa' ? 'اطلاعات شخصی' : 'Personal Information'),
    orders: textOr(messages?.customer?.account?.orders, locale === 'fa' ? 'سفارشات' : 'Orders'),
    addresses: textOr(messages?.customer?.account?.addresses, locale === 'fa' ? 'آدرس‌ها' : 'Addresses'),
    wishlist: textOr(messages?.customer?.account?.wishlist, locale === 'fa' ? 'لیست علاقه‌مندی' : 'Wishlist'),
    settings: textOr(messages?.customer?.account?.settings, locale === 'fa' ? 'تنظیمات' : 'Settings'),
    security: textOr(messages?.customer?.account?.security, locale === 'fa' ? 'امنیت' : 'Security'),
    profileTitle: textOr(messages?.customer?.profile?.title, locale === 'fa' ? 'اطلاعات شخصی' : 'Personal Information'),
    recentOrders: textOr(messages?.customer?.orders?.recentOrders, locale === 'fa' ? 'سفارشات اخیر' : 'Recent Orders'),
    orderHistory: textOr(messages?.customer?.orders?.title, locale === 'fa' ? 'تاریخچه سفارشات' : 'Order History'),
    addressesTitle: textOr(messages?.customer?.addresses?.title, locale === 'fa' ? 'آدرس‌ها' : 'Addresses'),
    wishlistTitle: textOr(messages?.customer?.wishlist?.title, locale === 'fa' ? 'لیست علاقه‌مندی' : 'Wishlist'),
    settingsTitle: textOr(messages?.customer?.settings?.title, locale === 'fa' ? 'تنظیمات' : 'Settings'),
    securityTitle: textOr(messages?.customer?.security?.title, locale === 'fa' ? 'امنیت' : 'Security'),
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <>
            <div className="glass rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {accountLabels.profileTitle}
              </h2>
              <ProfileForm locale={locale} />
            </div>
            <div className="glass rounded-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {accountLabels.recentOrders}
              </h2>
              <RecentOrders locale={locale} />
            </div>
          </>
        );
      case 'orders':
        return (
          <div className="glass rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {accountLabels.orderHistory}
            </h2>
            <OrderHistory locale={locale} />
          </div>
        );
      case 'addresses':
        return (
          <div className="glass rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {accountLabels.addressesTitle}
            </h2>
            <AddressesTab locale={locale} />
          </div>
        );
      case 'wishlist':
        return (
          <div className="glass rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {accountLabels.wishlistTitle}
            </h2>
            <WishlistTab locale={locale} />
          </div>
        );
      case 'settings':
        return (
          <div className="glass rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {accountLabels.settingsTitle}
            </h2>
            <SettingsTab locale={locale} />
          </div>
        );
      case 'support':
        return (
          <div className="glass rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              پشتیبانی و تیکت‌ها
            </h2>
            <TicketsTab />
          </div>
        );
      case 'security':
        return (
          <div className="glass rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {accountLabels.securityTitle}
            </h2>
            <SecurityTab locale={locale} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="theme-public account-page min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12" data-scroll-reveal>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {accountLabels.title}
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-6 text-justify leading-relaxed">
            {accountLabels.subtitle}
          </p>
          
          {/* Logout Button */}
          <div className="flex justify-center" data-scroll-reveal style={{ transitionDelay: "0.15s" }}>
            <button
              onClick={() => signOut({ callbackUrl: `/${locale}/auth/login` })}
              className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {logoutLabel}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1" data-scroll-reveal style={{ transitionDelay: "0.1s" }}>
            <div className="glass rounded-3xl p-6">
              <nav className="space-y-2">
                <button
                  onClick={() => handleTabChange('profile')}
                  className={`w-full text-right px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === 'profile'
                      ? 'bg-primary-orange/20 text-primary-orange border border-primary-orange/30'
                      : 'text-gray-900 dark:text-white/80 hover:text-gray-900 dark:text-white hover:bg-white/10'
                  }`}
                >
                  {accountLabels.personalInfo}
                </button>
                <button
                  onClick={() => handleTabChange('orders')}
                  className={`w-full text-right px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === 'orders'
                      ? 'bg-primary-orange/20 text-primary-orange border border-primary-orange/30'
                      : 'text-gray-900 dark:text-white/80 hover:text-gray-900 dark:text-white hover:bg-white/10'
                  }`}
                >
                  {accountLabels.orders}
                </button>
                <button
                  onClick={() => handleTabChange('addresses')}
                  className={`w-full text-right px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === 'addresses'
                      ? 'bg-primary-orange/20 text-primary-orange border border-primary-orange/30'
                      : 'text-gray-900 dark:text-white/80 hover:text-gray-900 dark:text-white hover:bg-white/10'
                  }`}
                >
                  {accountLabels.addresses}
                </button>
                <button
                  onClick={() => handleTabChange('wishlist')}
                  className={`w-full text-right px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === 'wishlist'
                      ? 'bg-primary-orange/20 text-primary-orange border border-primary-orange/30'
                      : 'text-gray-900 dark:text-white/80 hover:text-gray-900 dark:text-white hover:bg-white/10'
                  }`}
                >
                  {accountLabels.wishlist}
                </button>
                <button
                  onClick={() => handleTabChange('settings')}
                  className={`w-full text-right px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === 'settings'
                      ? 'bg-primary-orange/20 text-primary-orange border border-primary-orange/30'
                      : 'text-gray-900 dark:text-white/80 hover:text-gray-900 dark:text-white hover:bg-white/10'
                  }`}
                >
                  {accountLabels.settings}
                </button>
                
                <button
                  onClick={() => handleTabChange('support')}
                  className={`w-full text-right px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === 'support'
                      ? 'bg-primary-orange/20 text-primary-orange border border-primary-orange/30'
                      : 'text-gray-900 dark:text-white/80 hover:text-gray-900 dark:text-white hover:bg-white/10'
                  }`}
                >
                  پشتیبانی
                </button>

                <button
                  onClick={() => handleTabChange('security')}
                  className={`w-full text-right px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === 'security'
                      ? 'bg-primary-orange/20 text-primary-orange border border-primary-orange/30'
                      : 'text-gray-900 dark:text-white/80 hover:text-gray-900 dark:text-white hover:bg-white/10'
                  }`}
                >
                  {accountLabels.security}
                </button>
                
                {/* Logout Button in Sidebar */}
                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={() => signOut({ callbackUrl: `/${locale}/auth/login` })}
                    className="w-full text-right px-4 py-3 rounded-xl transition-all duration-200 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
                  >
                    <div className="flex items-center justify-end">
                      <span>{logoutLabel}</span>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </div>
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="lg:col-span-2" data-scroll-reveal style={{ transitionDelay: "0.2s" }}>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage({ params }: AccountPageProps) {
  return (
    <CustomerProvider>
      <AccountPageContent params={params} />
    </CustomerProvider>
  );
}
