"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getMessages, Messages } from "@/lib/i18n";

interface ResetPasswordPageProps {
  params: Promise<{ locale: string }>;
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const [messages, setMessages] = useState<Messages | null>(null);
  const [locale, setLocale] = useState<string>("fa");

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      const { locale: loc } = await params;
      setLocale(loc);
      const msg = await getMessages(loc);
      setMessages(msg);
    };
    loadMessages();
  }, [params]);

  // Get phone from URL params
  useEffect(() => {
    const phoneParam = searchParams.get('phone');
    if (phoneParam) {
      setPhone(decodeURIComponent(phoneParam));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate inputs
    if (!phone || !code || !newPassword || !confirmPassword) {
      setError(messages?.auth?.allFieldsRequired || "All fields are required");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError(messages?.auth?.passwordMustBe8Chars || "Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(messages?.auth?.passwordsDontMatch || "Passwords don't match");
      setIsLoading(false);
      return;
    }

    // Validate phone number format
    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setError(messages?.auth?.invalidPhoneFormat || "Invalid phone number format");
      setIsLoading(false);
      return;
    }

    if (code.length !== 6) {
      setError(messages?.auth?.invalidCodeFormat || "Verification code must be 6 digits");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          code,
          newPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push(`/${locale}/auth/login`);
        }, 3000);
      } else {
        setError(result.error || messages?.common?.error || "Failed to reset password");
      }
    } catch {
      setError(messages?.common?.error || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!messages) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-gray-900 dark:text-white">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-orange mx-auto"></div>
            <p className="mt-4 text-xl">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {messages.auth?.resetPasswordTitle}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {messages.auth?.enterCodeAndNewPassword?.replace("{phone}", phone || messages.auth?.phone || "your phone")}
            </p>
          </div>

          {/* Form */}
          <div className="glass rounded-3xl p-8">
            {success ? (
              <div className="space-y-6">
                <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                  <p className="text-green-400 text-sm text-center">
                    {messages.auth?.passwordResetSuccess}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Phone Field (if not from URL) */}
                {!phone && (
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {messages.auth?.phone}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                        setPhone(value);
                        setError(null);
                      }}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                      placeholder="09123456789"
                      required
                    />
                  </div>
                )}

                {/* Verification Code Field */}
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {messages.auth?.verificationCode}
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setCode(value);
                      setError(null);
                    }}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                    {messages.auth?.enter6DigitCode}
                  </p>
                </div>

                {/* New Password Field */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {messages.auth?.newPassword}
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError(null);
                    }}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    placeholder={messages.auth?.newPassword}
                    required
                    minLength={8}
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {messages.auth?.passwordMustBe8Chars}
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {messages.auth?.confirmNewPassword}
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError(null);
                    }}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    placeholder={messages.auth?.confirmNewPassword}
                    required
                    minLength={8}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                    <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !phone || code.length !== 6 || newPassword.length < 8 || newPassword !== confirmPassword}
                  className="w-full py-3 bg-gradient-to-r from-primary-orange to-orange-500 text-white font-semibold rounded-xl hover:shadow-glass-orange transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {messages.auth?.sendingCode}
                    </div>
                  ) : (
                    messages.auth?.resetPasswordTitle
                  )}
                </button>
              </form>
            )}

            {/* Links */}
            <div className="mt-6 text-center space-y-3">
              <Link
                href={`/${locale}/auth/forgot-password`}
                className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 text-sm"
              >
                {messages.auth?.resendCodeLink}
              </Link>
              <Link
                href={`/${locale}/auth/login`}
                className="block text-primary-orange hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200"
              >
                {messages.auth?.backToLogin}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

