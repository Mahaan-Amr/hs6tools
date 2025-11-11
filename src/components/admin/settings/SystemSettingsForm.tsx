"use client";
import { useState, useEffect } from "react";
import { SystemSettings } from "@/types/admin";

interface SystemSettingsFormProps {
  locale: string;
  onSaveSuccess: (message: string) => void;
  onSaveError: (message: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export default function SystemSettingsForm({
  onSaveSuccess,
  onSaveError,
  setIsLoading,
}: Omit<SystemSettingsFormProps, 'locale'>) {
  const [formData, setFormData] = useState<SystemSettings>({
    siteName: "",
    siteDescription: "",
    siteUrl: "",
    contactEmail: "",
    contactPhone: "",
    businessAddress: "",
    currency: "IRR",
    language: "fa",
    timezone: "Asia/Tehran",
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: false,
    requirePhoneVerification: false,
  });

  const [isLoading, setIsLoadingLocal] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings/system");
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setFormData(result.data);
        }
      }
    } catch (error) {
      console.error("Error fetching system settings:", error);
    }
  };

  const handleInputChange = (
    field: keyof SystemSettings,
    value: string | boolean
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
      const response = await fetch("/api/settings/system", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          onSaveSuccess("تنظیمات سیستم با موفقیت ذخیره شد");
        } else {
          onSaveError(result.error || "خطا در ذخیره تنظیمات");
        }
      } else {
        onSaveError("خطا در ارتباط با سرور");
      }
    } catch (error) {
      console.error("Error saving system settings:", error);
      onSaveError("خطا در ذخیره تنظیمات");
    } finally {
      setIsLoadingLocal(false);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">تنظیمات عمومی سیستم</h2>
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-primary-orange text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-orange/30"
        >
          {isLoading ? "در حال ذخیره..." : "ذخیره تنظیمات"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Site Information */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            اطلاعات سایت
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                نام سایت *
              </label>
              <input
                type="text"
                value={formData.siteName}
                onChange={(e) => handleInputChange("siteName", e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                placeholder="نام سایت"
                required
              />
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                توضیحات سایت
              </label>
              <textarea
                value={formData.siteDescription}
                onChange={(e) => handleInputChange("siteDescription", e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all resize-none"
                placeholder="توضیحات سایت"
              />
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                آدرس سایت *
              </label>
              <input
                type="url"
                value={formData.siteUrl}
                onChange={(e) => handleInputChange("siteUrl", e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                placeholder="https://example.com"
                required
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            اطلاعات تماس
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                ایمیل تماس *
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                placeholder="support@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                شماره تماس
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                placeholder="+98-21-12345678"
              />
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                آدرس کسب و کار
              </label>
              <textarea
                value={formData.businessAddress}
                onChange={(e) => handleInputChange("businessAddress", e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all resize-none"
                placeholder="آدرس کامل کسب و کار"
              />
            </div>
          </div>
        </div>

        {/* System Configuration */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            پیکربندی سیستم
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                واحد پول
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleInputChange("currency", e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
              >
                <option value="IRR">ریال ایران (IRR)</option>
                <option value="USD">دلار آمریکا (USD)</option>
                <option value="EUR">یورو (EUR)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                زبان پیش‌فرض
              </label>
              <select
                value={formData.language}
                onChange={(e) => handleInputChange("language", e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
              >
                <option value="fa">فارسی</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                منطقه زمانی
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => handleInputChange("timezone", e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
              >
                <option value="Asia/Tehran">تهران (UTC+3:30)</option>
                <option value="UTC">UTC</option>
                <option value="Europe/London">لندن (UTC+0)</option>
              </select>
            </div>
          </div>
        </div>

        {/* System Options */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            گزینه‌های سیستم
          </h3>
          <div className="space-y-4">
            <div className="flex items-center pt-2">
              <input
                type="checkbox"
                id="maintenanceMode"
                checked={formData.maintenanceMode}
                onChange={(e) => handleInputChange("maintenanceMode", e.target.checked)}
                className="w-5 h-5 text-primary-orange bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-orange focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="maintenanceMode" className="mr-3 text-gray-900 dark:text-white font-semibold cursor-pointer">
                حالت نگهداری
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowRegistration"
                checked={formData.allowRegistration}
                onChange={(e) => handleInputChange("allowRegistration", e.target.checked)}
                className="w-5 h-5 text-primary-orange bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-orange focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="allowRegistration" className="mr-3 text-gray-900 dark:text-white font-semibold cursor-pointer">
                اجازه ثبت‌نام
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="requireEmailVerification"
                checked={formData.requireEmailVerification}
                onChange={(e) => handleInputChange("requireEmailVerification", e.target.checked)}
                className="w-5 h-5 text-primary-orange bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-orange focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="requireEmailVerification" className="mr-3 text-gray-900 dark:text-white font-semibold cursor-pointer">
                تأیید ایمیل اجباری
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="requirePhoneVerification"
                checked={formData.requirePhoneVerification}
                onChange={(e) => handleInputChange("requirePhoneVerification", e.target.checked)}
                className="w-5 h-5 text-primary-orange bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-orange focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="requirePhoneVerification" className="mr-3 text-gray-900 dark:text-white font-semibold cursor-pointer">
                تأیید شماره تلفن اجباری
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
