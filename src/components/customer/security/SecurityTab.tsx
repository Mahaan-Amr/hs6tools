'use client';

import React, { useState, useEffect } from 'react';
import { getMessages, Messages } from '@/lib/i18n';
import { useSession } from 'next-auth/react';

interface SecurityTabProps {
  locale: string;
}

export default function SecurityTab({ locale }: SecurityTabProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Messages | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessages(locale);
      setMessages(msgs);
    };
    loadMessages();
  }, [locale]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    // Basic validation
    if (newPassword.length < 8) {
      setPasswordError(messages?.customer?.security?.passwordTooShort || 'رمز عبور باید حداقل 8 کاراکتر باشد');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(messages?.customer?.security?.passwordsDoNotMatch || 'رمزهای عبور مطابقت ندارند');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/customer/security/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setPasswordSuccess(messages?.customer?.security?.passwordChanged || 'رمز عبور با موفقیت تغییر یافت');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordForm(false);
      } else {
        setPasswordError(result.error || messages?.customer?.security?.passwordChangeError || 'خطا در تغییر رمز عبور');
      }
    } catch {
      setPasswordError(messages?.customer?.security?.networkError || 'خطا در ارتباط با سرور');
    } finally {
      setIsLoading(false);
    }
  };

  if (!messages) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-white/10 rounded w-1/3"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Password Management */}
      <div className="glass rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">
            {messages?.customer?.security?.passwordManagement || 'مدیریت رمز عبور'}
          </h3>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="px-4 py-2 bg-primary-orange text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors duration-200"
          >
            {showPasswordForm 
              ? (messages?.customer?.security?.cancel || 'انصراف')
              : (messages?.customer?.security?.changePassword || 'تغییر رمز عبور')
            }
          </button>
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {messages?.customer?.security?.currentPassword || 'رمز عبور فعلی'}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                placeholder={messages?.customer?.security?.currentPasswordPlaceholder || 'رمز عبور فعلی خود را وارد کنید'}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {messages?.customer?.security?.newPassword || 'رمز عبور جدید'}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                placeholder={messages?.customer?.security?.newPasswordPlaceholder || 'رمز عبور جدید (حداقل 8 کاراکتر)'}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {messages?.customer?.security?.confirmPassword || 'تأیید رمز عبور جدید'}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                placeholder={messages?.customer?.security?.confirmPasswordPlaceholder || 'رمز عبور جدید را دوباره وارد کنید'}
                required
              />
            </div>

            {passwordError && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{passwordError}</p>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                <p className="text-green-400 text-sm">{passwordSuccess}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-primary-orange text-white font-medium rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50"
              >
                {isLoading 
                  ? (messages?.customer?.security?.changing || 'در حال تغییر...')
                  : (messages?.customer?.security?.saveChanges || 'ذخیره تغییرات')
                }
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                  setPasswordSuccess('');
                }}
                className="px-6 py-3 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-colors duration-200"
              >
                {messages?.customer?.security?.cancel || 'انصراف'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Security Information */}
      <div className="glass rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4">
          {messages?.customer?.security?.securityInfo || 'اطلاعات امنیتی'}
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <h4 className="font-medium text-white">
                {messages?.customer?.security?.lastLogin || 'آخرین ورود'}
              </h4>
              <p className="text-sm text-gray-400">
                {session?.user?.lastLoginAt 
                  ? new Date(session.user.lastLoginAt).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US')
                  : (messages?.customer?.security?.unknown || 'نامشخص')
                }
              </p>
            </div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <h4 className="font-medium text-white">
                {messages?.customer?.security?.emailVerified || 'تأیید ایمیل'}
              </h4>
              <p className="text-sm text-gray-400">
                {session?.user?.emailVerified 
                  ? (messages?.customer?.security?.verified || 'تأیید شده')
                  : (messages?.customer?.security?.notVerified || 'تأیید نشده')
                }
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              session?.user?.emailVerified ? 'bg-green-400' : 'bg-yellow-400'
            }`}></div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <h4 className="font-medium text-white">
                {messages?.customer?.security?.phoneVerified || 'تأیید شماره تلفن'}
              </h4>
              <p className="text-sm text-gray-400">
                {session?.user?.phoneVerified 
                  ? (messages?.customer?.security?.verified || 'تأیید شده')
                  : (messages?.customer?.security?.notVerified || 'تأیید نشده')
                }
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              session?.user?.phoneVerified ? 'bg-green-400' : 'bg-yellow-400'
            }`}></div>
          </div>
        </div>
      </div>

      {/* Coming Soon Features */}
      <div className="glass rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4">
          {messages?.customer?.security?.advancedSecurity || 'امنیت پیشرفته'}
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-white">
                {messages?.customer?.security?.twoFactorAuth || 'احراز هویت دو مرحله‌ای'}
              </h4>
              <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                {messages?.customer?.security?.comingSoon || 'به زودی'}
              </span>
            </div>
            <p className="text-sm text-gray-400">
              {messages?.customer?.security?.twoFactorAuthDesc || 'افزایش امنیت حساب کاربری با کد تأیید اضافی'}
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-white">
                {messages?.customer?.security?.loginHistory || 'تاریخچه ورود'}
              </h4>
              <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                {messages?.customer?.security?.comingSoon || 'به زودی'}
              </span>
            </div>
            <p className="text-sm text-gray-400">
              {messages?.customer?.security?.loginHistoryDesc || 'مشاهده تمام ورودهای اخیر و دستگاه‌های فعال'}
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-white">
                {messages?.customer?.security?.deviceManagement || 'مدیریت دستگاه‌ها'}
              </h4>
              <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                {messages?.customer?.security?.comingSoon || 'به زودی'}
              </span>
            </div>
            <p className="text-sm text-gray-400">
              {messages?.customer?.security?.deviceManagementDesc || 'مدیریت و حذف دستگاه‌های متصل به حساب کاربری'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
