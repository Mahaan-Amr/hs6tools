"use client";
import { useState, useEffect } from "react";
import { EmailSettings } from "@/types/admin";

interface EmailSettingsFormProps {
  locale: string;
  onSaveSuccess: (message: string) => void;
  onSaveError: (message: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export default function EmailSettingsForm({
  onSaveSuccess,
  onSaveError,
  setIsLoading,
}: Omit<EmailSettingsFormProps, 'locale'>) {
  const [formData, setFormData] = useState<EmailSettings>({
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "",
    fromName: "",
    enableSSL: true,
    isActive: false,
  });

  const [isLoading, setIsLoadingLocal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings/email");
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setFormData(result.data);
        }
      }
    } catch (error) {
      console.error("Error fetching email settings:", error);
    }
  };

  const handleInputChange = (
    field: keyof EmailSettings,
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
      const response = await fetch("/api/settings/email", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          onSaveSuccess("تنظیمات ایمیل با موفقیت ذخیره شد");
        } else {
          onSaveError(result.error || "خطا در ذخیره تنظیمات");
        }
      } else {
        onSaveError("خطا در ارتباط با سرور");
      }
    } catch (error) {
      console.error("Error saving email settings:", error);
      onSaveError("خطا در ذخیره تنظیمات");
    } finally {
      setIsLoadingLocal(false);
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    // This would be implemented with a test endpoint
    onSaveError("تست اتصال در حال توسعه است");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">تنظیمات ایمیل</h2>
        <div className="flex space-x-3 space-x-reverse">
          <button
            type="button"
            onClick={testConnection}
            className="px-6 py-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold rounded-xl hover:bg-blue-500/30 transition-colors duration-300"
          >
            تست اتصال
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-primary-orange to-orange-500 text-white font-semibold rounded-xl hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "در حال ذخیره..." : "ذخیره تنظیمات"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SMTP Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
            تنظیمات SMTP
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              سرور SMTP *
            </label>
            <input
              type="text"
              value={formData.smtpHost}
              onChange={(e) => handleInputChange("smtpHost", e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
              placeholder="smtp.gmail.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              پورت SMTP *
            </label>
            <input
              type="number"
              value={formData.smtpPort}
              onChange={(e) => handleInputChange("smtpPort", parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
              placeholder="587"
              min="1"
              max="65535"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              نام کاربری SMTP
            </label>
            <input
              type="text"
              value={formData.smtpUser}
              onChange={(e) => handleInputChange("smtpUser", e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
              placeholder="your-email@gmail.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              رمز عبور SMTP
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.smtpPassword}
                onChange={(e) => handleInputChange("smtpPassword", e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent pr-12"
                placeholder="رمز عبور"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? (
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
                checked={formData.enableSSL}
                onChange={(e) => handleInputChange("enableSSL", e.target.checked)}
                className="w-5 h-5 text-primary-orange bg-white/10 border-gray-600 rounded focus:ring-primary-orange focus:ring-2"
              />
              <span className="text-gray-300">فعال‌سازی SSL/TLS</span>
            </label>
          </div>
        </div>

        {/* Sender Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
            تنظیمات فرستنده
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ایمیل فرستنده *
            </label>
            <input
              type="email"
              value={formData.fromEmail}
              onChange={(e) => handleInputChange("fromEmail", e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
              placeholder="noreply@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              نام فرستنده *
            </label>
            <input
              type="text"
              value={formData.fromName}
              onChange={(e) => handleInputChange("fromName", e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
              placeholder="نام شرکت"
              required
            />
          </div>

          <div>
            <label className="flex items-center space-x-3 space-x-reverse cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleInputChange("isActive", e.target.checked)}
                className="w-5 h-5 text-primary-orange bg-white/10 border-gray-600 rounded focus:ring-primary-orange focus:ring-2"
              />
              <span className="text-gray-300">فعال‌سازی سیستم ایمیل</span>
            </label>
          </div>

          {/* Common SMTP Settings */}
          <div className="pt-4">
            <h4 className="text-md font-medium text-white mb-3">تنظیمات رایج SMTP</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex justify-between">
                <span>Gmail:</span>
                <span>smtp.gmail.com:587</span>
              </div>
              <div className="flex justify-between">
                <span>Outlook:</span>
                <span>smtp-mail.outlook.com:587</span>
              </div>
              <div className="flex justify-between">
                <span>Yahoo:</span>
                <span>smtp.mail.yahoo.com:587</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
