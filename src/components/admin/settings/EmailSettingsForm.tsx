"use client";
import { useState, useEffect } from "react";
import { EmailSettings } from "@/types/admin";
import { getMessages, Messages } from "@/lib/i18n";

interface EmailSettingsFormProps {
  locale: string;
  onSaveSuccess: (message: string) => void;
  onSaveError: (message: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export default function EmailSettingsForm({
  locale,
  onSaveSuccess,
  onSaveError,
  setIsLoading,
}: EmailSettingsFormProps) {
  const [messages, setMessages] = useState<Messages | null>(null);
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessages(locale);
      setMessages(msgs);
    };
    loadMessages();
  }, [locale]);

  // Helper to access emailSettings from messages
  const getEmailSettings = () => {
    if (!messages) return undefined;
    const settingsPage = (messages as unknown as Record<string, unknown>)?.settingsPage as Record<string, unknown> | undefined;
    return settingsPage?.emailSettings as Record<string, string> | undefined;
  };

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
    const settingsPage = messages ? (messages as unknown as Record<string, unknown>)?.settingsPage as Record<string, unknown> | undefined : undefined;
    const emailSettingsObj = settingsPage?.emailSettings as Record<string, unknown> | undefined;
    const validation = emailSettingsObj?.validation as Record<string, string> | undefined;

    if (!formData.smtpHost.trim()) {
      newErrors.smtpHost = validation?.smtpHostRequired 
        ? String(validation.smtpHostRequired) 
        : "SMTP server is required";
    } else if (formData.smtpHost.trim().length > 255) {
      newErrors.smtpHost = validation?.smtpHostMaxLength 
        ? String(validation.smtpHostMaxLength) 
        : "SMTP server must be at most 255 characters";
    }

    if (!formData.smtpPort || formData.smtpPort < 1 || formData.smtpPort > 65535) {
      newErrors.smtpPort = validation?.smtpPortInvalid 
        ? String(validation.smtpPortInvalid) 
        : "SMTP port must be between 1 and 65535";
    }

    if (!formData.fromEmail.trim()) {
      newErrors.fromEmail = validation?.fromEmailRequired 
        ? String(validation.fromEmailRequired) 
        : "Sender email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.fromEmail)) {
      newErrors.fromEmail = validation?.fromEmailInvalid 
        ? String(validation.fromEmailInvalid) 
        : "Sender email format is invalid";
    }

    if (!formData.fromName.trim()) {
      newErrors.fromName = validation?.fromNameRequired 
        ? String(validation.fromNameRequired) 
        : "Sender name is required";
    } else if (formData.fromName.trim().length > 100) {
      newErrors.fromName = validation?.fromNameMaxLength 
        ? String(validation.fromNameMaxLength) 
        : "Sender name must be at most 100 characters";
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
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">تنظیمات ایمیل</h2>
        <div className="flex space-x-3 space-x-reverse">
          <button
            type="button"
            onClick={testConnection}
            className="px-6 py-3 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-2 border-blue-300 dark:border-blue-500/30 font-semibold rounded-lg hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors duration-200"
          >
            تست اتصال
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-primary-orange text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-orange/30"
          >
            {isLoading ? "در حال ذخیره..." : "ذخیره تنظیمات"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SMTP Configuration */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            تنظیمات SMTP
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                سرور SMTP *
              </label>
              <input
                type="text"
                value={formData.smtpHost}
                onChange={(e) => handleInputChange("smtpHost", e.target.value)}
                maxLength={255}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                  errors.smtpHost 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="smtp.gmail.com"
                required
              />
              {errors.smtpHost && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.smtpHost}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                {getEmailSettings()?.smtpPort || "SMTP Port"} *
              </label>
              <input
                type="number"
                value={formData.smtpPort}
                onChange={(e) => handleInputChange("smtpPort", parseInt(e.target.value) || 587)}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                  errors.smtpPort 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="587"
                min="1"
                max="65535"
                required
              />
              {errors.smtpPort && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.smtpPort}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                نام کاربری SMTP
              </label>
              <input
                type="text"
                value={formData.smtpUser}
                onChange={(e) => handleInputChange("smtpUser", e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                placeholder="your-email@gmail.com"
              />
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                رمز عبور SMTP
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.smtpPassword}
                  onChange={(e) => handleInputChange("smtpPassword", e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                  placeholder="رمز عبور"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
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
              <div className="flex items-center pt-2">
                <input
                  type="checkbox"
                  id="enableSSL"
                  checked={formData.enableSSL}
                  onChange={(e) => handleInputChange("enableSSL", e.target.checked)}
                  className="w-5 h-5 text-primary-orange bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-orange focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="enableSSL" className="mr-3 text-gray-900 dark:text-white font-semibold cursor-pointer">
                  فعال‌سازی SSL/TLS
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Sender Configuration */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            تنظیمات فرستنده
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                ایمیل فرستنده *
              </label>
              <input
                type="email"
                value={formData.fromEmail}
                onChange={(e) => handleInputChange("fromEmail", e.target.value)}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                  errors.fromEmail 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="noreply@example.com"
                required
              />
              {errors.fromEmail && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fromEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                {getEmailSettings()?.fromName || "Sender Name"} *
              </label>
              <input
                type="text"
                value={formData.fromName}
                onChange={(e) => handleInputChange("fromName", e.target.value)}
                maxLength={100}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                  errors.fromName 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder={getEmailSettings()?.fromName || "Company Name"}
                required
              />
              {errors.fromName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fromName}</p>
              )}
            </div>

            <div>
              <div className="flex items-center pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange("isActive", e.target.checked)}
                  className="w-5 h-5 text-primary-orange bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-orange focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="isActive" className="mr-3 text-gray-900 dark:text-white font-semibold cursor-pointer">
                  فعال‌سازی سیستم ایمیل
                </label>
              </div>
            </div>

            {/* Common SMTP Settings */}
            <div className="pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4">تنظیمات رایج SMTP</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Gmail:</span>
                  <span className="font-mono text-gray-600 dark:text-gray-400">smtp.gmail.com:587</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Outlook:</span>
                  <span className="font-mono text-gray-600 dark:text-gray-400">smtp-mail.outlook.com:587</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Yahoo:</span>
                  <span className="font-mono text-gray-600 dark:text-gray-400">smtp.mail.yahoo.com:587</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
