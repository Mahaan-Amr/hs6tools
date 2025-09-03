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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">تنظیمات عمومی سیستم</h2>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-gradient-to-r from-primary-orange to-orange-500 text-white font-semibold rounded-xl hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "در حال ذخیره..." : "ذخیره تنظیمات"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Site Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
            اطلاعات سایت
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              نام سایت *
            </label>
            <input
              type="text"
              value={formData.siteName}
              onChange={(e) => handleInputChange("siteName", e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
              placeholder="نام سایت"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              توضیحات سایت
            </label>
            <textarea
              value={formData.siteDescription}
              onChange={(e) => handleInputChange("siteDescription", e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
              placeholder="توضیحات سایت"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              آدرس سایت *
            </label>
            <input
              type="url"
              value={formData.siteUrl}
              onChange={(e) => handleInputChange("siteUrl", e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
              placeholder="https://example.com"
              required
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
            اطلاعات تماس
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ایمیل تماس *
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleInputChange("contactEmail", e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
              placeholder="support@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              شماره تماس
            </label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => handleInputChange("contactPhone", e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
              placeholder="+98-21-12345678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              آدرس کسب و کار
            </label>
            <textarea
              value={formData.businessAddress}
              onChange={(e) => handleInputChange("businessAddress", e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
              placeholder="آدرس کامل کسب و کار"
            />
          </div>
        </div>

        {/* System Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
            پیکربندی سیستم
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              واحد پول
            </label>
            <select
              value={formData.currency}
              onChange={(e) => handleInputChange("currency", e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
            >
              <option value="IRR">ریال ایران (IRR)</option>
              <option value="USD">دلار آمریکا (USD)</option>
              <option value="EUR">یورو (EUR)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              زبان پیش‌فرض
            </label>
            <select
              value={formData.language}
              onChange={(e) => handleInputChange("language", e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
            >
              <option value="fa">فارسی</option>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              منطقه زمانی
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => handleInputChange("timezone", e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
            >
              <option value="Asia/Tehran">تهران (UTC+3:30)</option>
              <option value="UTC">UTC</option>
              <option value="Europe/London">لندن (UTC+0)</option>
            </select>
          </div>
        </div>

        {/* System Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
            گزینه‌های سیستم
          </h3>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-3 space-x-reverse cursor-pointer">
              <input
                type="checkbox"
                checked={formData.maintenanceMode}
                onChange={(e) => handleInputChange("maintenanceMode", e.target.checked)}
                className="w-5 h-5 text-primary-orange bg-white/10 border-gray-600 rounded focus:ring-primary-orange focus:ring-2"
              />
              <span className="text-gray-300">حالت نگهداری</span>
            </label>

            <label className="flex items-center space-x-3 space-x-reverse cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowRegistration}
                onChange={(e) => handleInputChange("allowRegistration", e.target.checked)}
                className="w-5 h-5 text-primary-orange bg-white/10 border-gray-600 rounded focus:ring-primary-orange focus:ring-2"
              />
              <span className="text-gray-300">اجازه ثبت‌نام</span>
            </label>

            <label className="flex items-center space-x-3 space-x-reverse cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requireEmailVerification}
                onChange={(e) => handleInputChange("requireEmailVerification", e.target.checked)}
                className="w-5 h-5 text-primary-orange bg-white/10 border-gray-600 rounded focus:ring-primary-orange focus:ring-2"
              />
              <span className="text-gray-300">تأیید ایمیل اجباری</span>
            </label>

            <label className="flex items-center space-x-3 space-x-reverse cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requirePhoneVerification}
                onChange={(e) => handleInputChange("requirePhoneVerification", e.target.checked)}
                className="w-5 h-5 text-primary-orange bg-white/10 border-gray-600 rounded focus:ring-primary-orange focus:ring-2"
              />
              <span className="text-gray-300">تأیید شماره تلفن اجباری</span>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
