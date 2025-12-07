"use client";
import { useState, useEffect, useMemo } from "react";
import { PaymentSettings } from "@/types/admin";
import { getMessages, Messages } from "@/lib/i18n";

interface PaymentSettingsFormProps {
  locale: string;
  onSaveSuccess: (message: string) => void;
  onSaveError: (message: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export default function PaymentSettingsForm({
  locale,
  onSaveSuccess,
  onSaveError,
  setIsLoading,
}: PaymentSettingsFormProps) {
  const [messages, setMessages] = useState<Messages | null>(null);
  const [formData, setFormData] = useState<PaymentSettings>({
    zarinpalMerchantId: "",
    zarinpalApiKey: "",
    zarinpalSandbox: true,
    allowBankTransfer: true,
    allowCashOnDelivery: true,
    minimumOrderAmount: 0,
    maximumOrderAmount: 1000000000,
  });

  const [isLoading, setIsLoadingLocal] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessages(locale);
      setMessages(msgs);
    };
    loadMessages();
  }, [locale]);

  // Helper to access settingsPage messages
  const settingsPage = useMemo(() => {
    return messages ? (messages as unknown as Record<string, unknown>)?.settingsPage as Record<string, unknown> | undefined : undefined;
  }, [messages]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings/payment");
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setFormData(result.data);
        }
      }
    } catch (error) {
      console.error("Error fetching payment settings:", error);
    }
  };

  const handleInputChange = (
    field: keyof PaymentSettings,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const validation = (settingsPage?.paymentSettings as Record<string, unknown> | undefined)?.validation as Record<string, string> | undefined;

    if (formData.minimumOrderAmount < 0) {
      newErrors.minimumOrderAmount = validation?.minimumOrderAmountInvalid 
        ? String(validation.minimumOrderAmountInvalid) 
        : "Minimum order amount must be greater than or equal to zero";
    }

    if (formData.maximumOrderAmount <= formData.minimumOrderAmount) {
      newErrors.maximumOrderAmount = validation?.maximumOrderAmountInvalid 
        ? String(validation.maximumOrderAmountInvalid) 
        : "Maximum order amount must be greater than minimum amount";
    }

    if (formData.zarinpalMerchantId && formData.zarinpalMerchantId.length > 100) {
      newErrors.zarinpalMerchantId = validation?.merchantIdMaxLength 
        ? String(validation.merchantIdMaxLength) 
        : "Merchant ID must be at most 100 characters";
    }

    if (formData.zarinpalApiKey && formData.zarinpalApiKey.length > 200) {
      newErrors.zarinpalApiKey = validation?.apiKeyMaxLength 
        ? String(validation.apiKeyMaxLength) 
        : "API key must be at most 200 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoadingLocal(true);
    setIsLoading(true);

    try {
      const response = await fetch("/api/settings/payment", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          onSaveSuccess("تنظیمات پرداخت با موفقیت ذخیره شد");
        } else {
          onSaveError(result.error || "خطا در ذخیره تنظیمات");
        }
      } else {
        onSaveError("خطا در ارتباط با سرور");
      }
    } catch (error) {
      console.error("Error saving payment settings:", error);
      onSaveError("خطا در ذخیره تنظیمات");
    } finally {
      setIsLoadingLocal(false);
      setIsLoading(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("fa-IR").format(amount) + " ریال";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">تنظیمات پرداخت</h2>
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-primary-orange text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-orange/30"
        >
          {isLoading ? "در حال ذخیره..." : "ذخیره تنظیمات"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ZarinPal Configuration */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            تنظیمات ZarinPal
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                شناسه فروشنده
              </label>
              <input
                type="text"
                value={formData.zarinpalMerchantId}
                onChange={(e) => handleInputChange("zarinpalMerchantId", e.target.value)}
                maxLength={100}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                  errors.zarinpalMerchantId 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
              {errors.zarinpalMerchantId && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.zarinpalMerchantId}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                {(settingsPage?.paymentSettings as Record<string, string> | undefined)?.apiKey || "API Key"}
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={formData.zarinpalApiKey}
                  onChange={(e) => handleInputChange("zarinpalApiKey", e.target.value)}
                  maxLength={200}
                  className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                    errors.zarinpalApiKey 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder={(settingsPage?.paymentSettings as Record<string, string> | undefined)?.apiKey || "API Key"}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {showApiKey ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.zarinpalApiKey && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.zarinpalApiKey}</p>
              )}
            </div>

            <div>
              <div className="flex items-center pt-2">
                <input
                  type="checkbox"
                  id="zarinpalSandbox"
                  checked={formData.zarinpalSandbox}
                  onChange={(e) => handleInputChange("zarinpalSandbox", e.target.checked)}
                  className="w-5 h-5 text-primary-orange bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-orange focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="zarinpalSandbox" className="mr-3 text-gray-900 dark:text-white font-semibold cursor-pointer">
                  حالت تست (Sandbox)
                </label>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mr-8">
                برای تست سیستم پرداخت فعال کنید
              </p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            روش‌های پرداخت
          </h3>
          <div className="space-y-4">
            <div className="flex items-center pt-2">
              <input
                type="checkbox"
                id="allowBankTransfer"
                checked={formData.allowBankTransfer}
                onChange={(e) => handleInputChange("allowBankTransfer", e.target.checked)}
                className="w-5 h-5 text-primary-orange bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-orange focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="allowBankTransfer" className="mr-3 text-gray-900 dark:text-white font-semibold cursor-pointer">
                انتقال بانکی
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowCashOnDelivery"
                checked={formData.allowCashOnDelivery}
                onChange={(e) => handleInputChange("allowCashOnDelivery", e.target.checked)}
                className="w-5 h-5 text-primary-orange bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-orange focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="allowCashOnDelivery" className="mr-3 text-gray-900 dark:text-white font-semibold cursor-pointer">
                پرداخت در محل
              </label>
            </div>
          </div>
        </div>

        {/* Order Amount Limits */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            محدودیت‌های سفارش
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                حداقل مبلغ سفارش
              </label>
              <input
                type="number"
                value={formData.minimumOrderAmount}
                onChange={(e) => handleInputChange("minimumOrderAmount", parseInt(e.target.value) || 0)}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                  errors.minimumOrderAmount 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="0"
                min="0"
                step="1000"
              />
              {errors.minimumOrderAmount && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.minimumOrderAmount}</p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
                {formatPrice(formData.minimumOrderAmount)}
              </p>
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                {(settingsPage?.paymentSettings as Record<string, string> | undefined)?.maxOrderAmount || "Maximum Order Amount"}
              </label>
              <input
                type="number"
                value={formData.maximumOrderAmount}
                onChange={(e) => handleInputChange("maximumOrderAmount", parseInt(e.target.value) || 0)}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                  errors.maximumOrderAmount 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="1000000000"
                min="0"
                step="1000000"
              />
              {errors.maximumOrderAmount && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.maximumOrderAmount}</p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
                {formatPrice(formData.maximumOrderAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Information */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            اطلاعات
          </h3>
          <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border-2 border-blue-200 dark:border-blue-500/30 rounded-lg">
            <h4 className="text-blue-600 dark:text-blue-400 font-semibold mb-3">نکات مهم:</h4>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 list-disc list-inside">
              <li>شناسه فروشنده و کلید API را از پنل ZarinPal دریافت کنید</li>
              <li>در حالت تست، پرداخت‌ها واقعی نیستند</li>
              <li>محدودیت‌های مبلغ سفارش برای کنترل ریسک است</li>
              <li>روش‌های پرداخت اضافی را بر اساس نیاز فعال کنید</li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
}
