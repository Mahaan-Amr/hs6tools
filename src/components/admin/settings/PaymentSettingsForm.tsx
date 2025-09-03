"use client";
import { useState, useEffect } from "react";
import { PaymentSettings } from "@/types/admin";

interface PaymentSettingsFormProps {
  locale: string;
  onSaveSuccess: (message: string) => void;
  onSaveError: (message: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export default function PaymentSettingsForm({
  onSaveSuccess,
  onSaveError,
  setIsLoading,
}: Omit<PaymentSettingsFormProps, 'locale'>) {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">تنظیمات پرداخت</h2>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-gradient-to-r from-primary-orange to-orange-500 text-white font-semibold rounded-xl hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "در حال ذخیره..." : "ذخیره تنظیمات"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ZarinPal Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
            تنظیمات ZarinPal
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              شناسه فروشنده
            </label>
            <input
              type="text"
              value={formData.zarinpalMerchantId}
              onChange={(e) => handleInputChange("zarinpalMerchantId", e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              کلید API
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={formData.zarinpalApiKey}
                onChange={(e) => handleInputChange("zarinpalApiKey", e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent pr-12"
                placeholder="کلید API"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
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
          </div>

          <div>
            <label className="flex items-center space-x-3 space-x-reverse cursor-pointer">
              <input
                type="checkbox"
                checked={formData.zarinpalSandbox}
                onChange={(e) => handleInputChange("zarinpalSandbox", e.target.checked)}
                className="w-5 h-5 text-primary-orange bg-white/10 border-gray-600 rounded focus:ring-primary-orange focus:ring-2"
              />
              <span className="text-gray-300">حالت تست (Sandbox)</span>
            </label>
            <p className="text-sm text-gray-400 mt-1 mr-8">
              برای تست سیستم پرداخت فعال کنید
            </p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
            روش‌های پرداخت
          </h3>
          
          <div>
            <label className="flex items-center space-x-3 space-x-reverse cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowBankTransfer}
                onChange={(e) => handleInputChange("allowBankTransfer", e.target.checked)}
                className="w-5 h-5 text-primary-orange bg-white/10 border-gray-600 rounded focus:ring-primary-orange focus:ring-2"
              />
              <span className="text-gray-300">انتقال بانکی</span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-3 space-x-reverse cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowCashOnDelivery}
                onChange={(e) => handleInputChange("allowCashOnDelivery", e.target.checked)}
                className="w-5 h-5 text-primary-orange bg-white/10 border-gray-600 rounded focus:ring-primary-orange focus:ring-2"
              />
              <span className="text-gray-300">پرداخت در محل</span>
            </label>
          </div>
        </div>

        {/* Order Amount Limits */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
            محدودیت‌های سفارش
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              حداقل مبلغ سفارش
            </label>
            <input
              type="number"
              value={formData.minimumOrderAmount}
              onChange={(e) => handleInputChange("minimumOrderAmount", parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
              placeholder="0"
              min="0"
              step="1000"
            />
            <p className="text-sm text-gray-400 mt-1">
              {formatPrice(formData.minimumOrderAmount)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              حداکثر مبلغ سفارش
            </label>
            <input
              type="number"
              value={formData.maximumOrderAmount}
              onChange={(e) => handleInputChange("maximumOrderAmount", parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
              placeholder="1000000000"
              min="0"
              step="1000000"
            />
            <p className="text-sm text-gray-400 mt-1">
              {formatPrice(formData.maximumOrderAmount)}
            </p>
          </div>
        </div>

        {/* Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
            اطلاعات
          </h3>
          
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <h4 className="text-blue-400 font-medium mb-2">نکات مهم:</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• شناسه فروشنده و کلید API را از پنل ZarinPal دریافت کنید</li>
              <li>• در حالت تست، پرداخت‌ها واقعی نیستند</li>
              <li>• محدودیت‌های مبلغ سفارش برای کنترل ریسک است</li>
              <li>• روش‌های پرداخت اضافی را بر اساس نیاز فعال کنید</li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
}
