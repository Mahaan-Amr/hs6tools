'use client';

import React, { useState, useEffect } from 'react';
import { getMessages, Messages } from '@/lib/i18n';
import { useSession } from 'next-auth/react';

interface SettingsTabProps {
  locale: string;
}

interface UserSettings {
  language: string;
  currency: string;
  timezone: string;
  notifications: {
    orderUpdates: boolean;
    promotionalEmails: boolean;
    smsNotifications: boolean;
    newProductAlerts: boolean;
    priceDropAlerts: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    allowDataSharing: boolean;
    showPurchaseHistory: boolean;
  };
  display: {
    itemsPerPage: number;
    dateFormat: string;
    theme: string;
  };
}

export default function SettingsTab({ locale }: SettingsTabProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Messages | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const [settings, setSettings] = useState<UserSettings>({
    language: locale,
    currency: 'IRR',
    timezone: 'Asia/Tehran',
    notifications: {
      orderUpdates: true,
      promotionalEmails: true,
      smsNotifications: false,
      newProductAlerts: false,
      priceDropAlerts: false,
    },
    privacy: {
      showOnlineStatus: false,
      allowDataSharing: false,
      showPurchaseHistory: true,
    },
    display: {
      itemsPerPage: 10,
      dateFormat: 'persian',
      theme: 'auto',
    },
  });

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessages(locale);
      setMessages(msgs);
    };
    loadMessages();
  }, [locale]);

  useEffect(() => {
    fetchUserSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserSettings = async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/customer/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setSettings({ ...settings, ...data.data });
        }
      }
    } catch (err) {
      console.error('Error fetching user settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!session?.user?.id) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/customer/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();
      
      if (data.success) {
        setSaveStatus({
          type: 'success',
          message: messages?.customer?.settings?.saveSuccess || 'تنظیمات با موفقیت ذخیره شد',
        });
      } else {
        setSaveStatus({
          type: 'error',
          message: data.error || messages?.customer?.settings?.saveError || 'خطا در ذخیره تنظیمات',
        });
      }
    } catch {
      setSaveStatus({
        type: 'error',
        message: messages?.customer?.settings?.networkError || 'خطا در ارتباط با سرور',
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus({ type: null, message: '' }), 3000);
    }
  };

  const handleNotificationChange = (field: keyof UserSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value,
      },
    }));
  };

  const handlePrivacyChange = (field: keyof UserSettings['privacy'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: value,
      },
    }));
  };

  const handleDisplayChange = (field: keyof UserSettings['display'], value: string | number) => {
    setSettings(prev => ({
      ...prev,
      display: {
        ...prev.display,
        [field]: value,
      },
    }));
  };

  const tabs = [
    {
      id: 'general',
      name: messages?.customer?.settings?.generalTab || 'عمومی',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: 'notifications',
      name: messages?.customer?.settings?.notificationsTab || 'اطلاع‌رسانی',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V7h5v10z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19H6.5A2.5 2.5 0 014 16.5v-9A2.5 2.5 0 016.5 5H18a2 2 0 012 2v4M9 9h1m4 0h1m-6 4h1m4 0h1" />
        </svg>
      ),
    },
    {
      id: 'privacy',
      name: messages?.customer?.settings?.privacyTab || 'حریم خصوصی',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      id: 'display',
      name: messages?.customer?.settings?.displayTab || 'نمایش',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  if (!messages) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange"></div>
      </div>
    );
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          {messages?.customer?.settings?.languageAndRegion || 'زبان و منطقه'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {messages?.customer?.settings?.language || 'زبان'}
            </label>
            <select
              value={settings.language}
              onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all appearance-none cursor-pointer"
            >
              <option value="fa" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">فارسی</option>
              <option value="en" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">English</option>
              <option value="ar" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">العربية</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {messages?.customer?.settings?.currency || 'واحد پول'}
            </label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all appearance-none cursor-pointer"
            >
              <option value="IRR" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">ریال ایران (IRR)</option>
              <option value="USD" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">دلار آمریکا (USD)</option>
              <option value="EUR" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">یورو (EUR)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {messages?.customer?.settings?.timezone || 'منطقه زمانی'}
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all appearance-none cursor-pointer"
            >
              <option value="Asia/Tehran" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">تهران (UTC+3:30)</option>
              <option value="UTC" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">UTC</option>
              <option value="Europe/London" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">لندن (UTC+0)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          {messages?.customer?.settings?.orderNotifications || 'اطلاع‌رسانی سفارشات'}
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <span className="text-white font-medium">
                {messages?.customer?.settings?.orderUpdates || 'به‌روزرسانی سفارشات'}
              </span>
              <p className="text-sm text-gray-400">
                {messages?.customer?.settings?.orderUpdatesDesc || 'اطلاع‌رسانی در مورد وضعیت سفارشات'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.orderUpdates}
              onChange={(e) => handleNotificationChange('orderUpdates', e.target.checked)}
              className="w-5 h-5 text-primary-orange bg-white/10 border-white/20 rounded focus:ring-primary-orange focus:ring-2"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <span className="text-white font-medium">
                {messages?.customer?.settings?.smsNotifications || 'پیامک'}
              </span>
              <p className="text-sm text-gray-400">
                {messages?.customer?.settings?.smsNotificationsDesc || 'دریافت پیامک برای به‌روزرسانی‌ها'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.smsNotifications}
              onChange={(e) => handleNotificationChange('smsNotifications', e.target.checked)}
              className="w-5 h-5 text-primary-orange bg-white/10 border-white/20 rounded focus:ring-primary-orange focus:ring-2"
            />
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          {messages?.customer?.settings?.marketingNotifications || 'اطلاع‌رسانی بازاریابی'}
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <span className="text-white font-medium">
                {messages?.customer?.settings?.promotionalEmails || 'ایمیل‌های تبلیغاتی'}
              </span>
              <p className="text-sm text-gray-400">
                {messages?.customer?.settings?.promotionalEmailsDesc || 'دریافت اطلاعات تخفیف‌ها و پیشنهادات'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.promotionalEmails}
              onChange={(e) => handleNotificationChange('promotionalEmails', e.target.checked)}
              className="w-5 h-5 text-primary-orange bg-white/10 border-white/20 rounded focus:ring-primary-orange focus:ring-2"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <span className="text-white font-medium">
                {messages?.customer?.settings?.newProductAlerts || 'اطلاع محصولات جدید'}
              </span>
              <p className="text-sm text-gray-400">
                {messages?.customer?.settings?.newProductAlertsDesc || 'اطلاع‌رسانی محصولات جدید'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.newProductAlerts}
              onChange={(e) => handleNotificationChange('newProductAlerts', e.target.checked)}
              className="w-5 h-5 text-primary-orange bg-white/10 border-white/20 rounded focus:ring-primary-orange focus:ring-2"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <span className="text-white font-medium">
                {messages?.customer?.settings?.priceDropAlerts || 'کاهش قیمت'}
              </span>
              <p className="text-sm text-gray-400">
                {messages?.customer?.settings?.priceDropAlertsDesc || 'اطلاع‌رسانی کاهش قیمت محصولات موردعلاقه'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.priceDropAlerts}
              onChange={(e) => handleNotificationChange('priceDropAlerts', e.target.checked)}
              className="w-5 h-5 text-primary-orange bg-white/10 border-white/20 rounded focus:ring-primary-orange focus:ring-2"
            />
          </label>
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          {messages?.customer?.settings?.accountPrivacy || 'حریم خصوصی حساب'}
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <span className="text-white font-medium">
                {messages?.customer?.settings?.showOnlineStatus || 'نمایش وضعیت آنلاین'}
              </span>
              <p className="text-sm text-gray-400">
                {messages?.customer?.settings?.showOnlineStatusDesc || 'نمایش وضعیت حضور به سایر کاربران'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.privacy.showOnlineStatus}
              onChange={(e) => handlePrivacyChange('showOnlineStatus', e.target.checked)}
              className="w-5 h-5 text-primary-orange bg-white/10 border-white/20 rounded focus:ring-primary-orange focus:ring-2"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <span className="text-white font-medium">
                {messages?.customer?.settings?.allowDataSharing || 'اشتراک گذاری داده‌ها'}
              </span>
              <p className="text-sm text-gray-400">
                {messages?.customer?.settings?.allowDataSharingDesc || 'اجازه استفاده از داده‌ها برای بهبود خدمات'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.privacy.allowDataSharing}
              onChange={(e) => handlePrivacyChange('allowDataSharing', e.target.checked)}
              className="w-5 h-5 text-primary-orange bg-white/10 border-white/20 rounded focus:ring-primary-orange focus:ring-2"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <span className="text-white font-medium">
                {messages?.customer?.settings?.showPurchaseHistory || 'نمایش تاریخچه خرید'}
              </span>
              <p className="text-sm text-gray-400">
                {messages?.customer?.settings?.showPurchaseHistoryDesc || 'نمایش تاریخچه خریدهای شما در پروفایل'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.privacy.showPurchaseHistory}
              onChange={(e) => handlePrivacyChange('showPurchaseHistory', e.target.checked)}
              className="w-5 h-5 text-primary-orange bg-white/10 border-white/20 rounded focus:ring-primary-orange focus:ring-2"
            />
          </label>
        </div>
      </div>
    </div>
  );

  const renderDisplaySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          {messages?.customer?.settings?.displayPreferences || 'تنظیمات نمایش'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {messages?.customer?.settings?.itemsPerPage || 'تعداد محصول در صفحه'}
            </label>
            <select
              value={settings.display.itemsPerPage}
              onChange={(e) => handleDisplayChange('itemsPerPage', parseInt(e.target.value))}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all appearance-none cursor-pointer"
            >
              <option value={5} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">5</option>
              <option value={10} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">10</option>
              <option value={20} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">20</option>
              <option value={50} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">50</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {messages?.customer?.settings?.dateFormat || 'فرمت تاریخ'}
            </label>
            <select
              value={settings.display.dateFormat}
              onChange={(e) => handleDisplayChange('dateFormat', e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all appearance-none cursor-pointer"
            >
              <option value="persian" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">فارسی (۱۴۰۳/۱۲/۲۹)</option>
              <option value="gregorian" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">میلادی (2024/12/29)</option>
              <option value="islamic" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">هجری قمری</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {messages?.customer?.settings?.theme || 'تم'}
            </label>
            <select
              value={settings.display.theme}
              onChange={(e) => handleDisplayChange('theme', e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all appearance-none cursor-pointer"
            >
              <option value="auto" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">{messages?.customer?.settings?.themeAuto || 'خودکار'}</option>
              <option value="light" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">{messages?.customer?.settings?.themeLight || 'روشن'}</option>
              <option value="dark" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">{messages?.customer?.settings?.themeDark || 'تیره'}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'display':
        return renderDisplaySettings();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Message */}
      {saveStatus.type && (
        <div
          className={`p-4 rounded-xl ${
            saveStatus.type === 'success'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}
        >
          {saveStatus.message}
        </div>
      )}

      {/* Tabs */}
      <div className="glass rounded-3xl p-2">
        <div className="flex space-x-2 space-x-reverse overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-2xl font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary-orange to-orange-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="glass rounded-3xl p-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange"></div>
          </div>
        ) : (
          <>
            {renderTabContent()}

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t border-white/10 mt-8">
              <button
                onClick={saveSettings}
                disabled={isSaving}
                className="px-6 py-3 bg-primary-orange text-white font-medium rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 space-x-reverse"
              >
                {isSaving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>
                  {isSaving
                    ? (messages?.common?.saving || 'در حال ذخیره...')
                    : (messages?.common?.saveChanges || 'ذخیره تغییرات')
                  }
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
