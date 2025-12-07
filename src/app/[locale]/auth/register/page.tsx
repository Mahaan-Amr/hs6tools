"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMessages, Messages } from "@/lib/i18n";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface RegisterPageProps {
  params: Promise<{ locale: string }>;
}

export default function RegisterPage({ params }: RegisterPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationPhone, setVerificationPhone] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const [messages, setMessages] = useState<Messages | null>(null);
  const [locale, setLocale] = useState<string>("fa");
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null);

  // Load messages and get callbackUrl from query params
  useEffect(() => {
    const loadMessages = async () => {
      const { locale: loc } = await params;
      setLocale(loc);
      const msg = await getMessages(loc);
      setMessages(msg);
    };
    loadMessages();

    // Get callbackUrl from URL search params
    const searchParams = new URLSearchParams(window.location.search);
    const callback = searchParams.get("callbackUrl");
    if (callback) {
      setCallbackUrl(decodeURIComponent(callback));
    }
  }, [params]);

  // Create schema with translated messages
  const registerSchema = z.object({
    email: z.string().email(messages?.auth?.invalidEmail || "Invalid email address"),
    password: z.string().min(8, messages?.auth?.passwordTooShort || "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, messages?.auth?.passwordRequired || "Please confirm your password"),
    firstName: z.string().min(2, messages?.auth?.firstNameRequired || "First name must be at least 2 characters"),
    lastName: z.string().min(2, messages?.auth?.lastNameRequired || "Last name must be at least 2 characters"),
    phone: z.string().optional(),
    company: z.string().optional(),
    position: z.string().optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: messages?.auth?.passwordsDontMatch || "Passwords don't match",
    path: ["confirmPassword"],
  });

  type RegisterFormData = z.infer<typeof registerSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || messages?.common?.error || "Registration failed");
      } else {
        // If phone is provided, show verification step
        if (data.phone) {
          setVerificationPhone(data.phone);
          setShowVerification(true);
          setSuccess(messages?.auth?.verificationCodeSent || "Registration successful! Please verify your phone number.");
          // Auto-send verification code
          handleSendVerificationCode(data.phone);
        } else {
          setSuccess(messages?.auth?.registerSuccess || "Registration successful!");
          // Redirect to login (with callbackUrl if provided) after 2 seconds
          setTimeout(() => {
            if (callbackUrl) {
              router.push(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
            } else {
              router.push(`/${locale}/auth/login`);
            }
          }, 2000);
        }
      }
    } catch {
      setError(messages?.common?.error || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVerificationCode = async (phone: string) => {
    setIsSendingCode(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/verify-phone/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      const result = await response.json();

      if (result.success) {
        setCountdown(300); // 5 minutes in seconds
        // Start countdown timer
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        // Show warning if SMS sending failed but code was generated
        if (result.warning) {
          console.warn('SMS warning:', result.warning);
          // Optionally show a warning message to user
          // setError(result.warning); // Uncomment if you want to show warning
        }
      } else {
        setError(result.error || messages?.common?.error || "Failed to send verification code");
      }
    } catch {
      setError(messages?.common?.error || "Failed to send verification code");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError(messages?.auth?.invalidCodeFormat || "Please enter a valid 6-digit code");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/verify-phone/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: verificationPhone,
          code: verificationCode,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(messages?.auth?.phoneVerified || "Phone number verified successfully!");
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push(`/${locale}/auth/login`);
        }, 2000);
      } else {
        setError(result.error || messages?.common?.error || "Invalid verification code");
      }
    } catch {
      setError(messages?.common?.error || "Failed to verify code");
    } finally {
      setIsVerifying(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  // If showing verification step, render verification UI
  if (showVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {messages.auth?.verifyPhoneNumber}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {messages.auth?.enterCodeSentTo?.replace("{phone}", verificationPhone) || `Enter the verification code sent to ${verificationPhone}`}
              </p>
            </div>

            {/* Verification Form */}
            <div className="glass rounded-3xl p-8">
              <div className="space-y-6">
                {/* Verification Code Field */}
                <div>
                  <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {messages.auth?.verificationCode}
                  </label>
                  <input
                    type="text"
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setVerificationCode(value);
                      setError(null);
                    }}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                    {messages.auth?.enter6DigitCode}
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                    <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
                    <p className="text-green-400 text-sm text-center">{success}</p>
                  </div>
                )}

                {/* Resend Code Button */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleSendVerificationCode(verificationPhone)}
                    disabled={isSendingCode || countdown > 0}
                    className="text-sm text-primary-orange hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSendingCode ? messages.auth?.sending : countdown > 0 ? messages.auth?.resendCodeIn?.replace("{time}", formatCountdown(countdown)) : messages.auth?.resendCode}
                  </button>
                </div>

                {/* Verify Button */}
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={isVerifying || verificationCode.length !== 6}
                  className="w-full py-3 bg-gradient-to-r from-primary-orange to-orange-500 text-white font-semibold rounded-xl hover:shadow-glass-orange transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {messages.auth?.verifying}
                    </div>
                  ) : (
                    messages.auth?.verifyPhoneNumberButton
                  )}
                </button>

                {/* Skip Verification */}
                <button
                  type="button"
                  onClick={() => {
                    const loc = messages?.common?.locale || 'fa';
                    if (callbackUrl) {
                      router.push(`/${loc}/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
                    } else {
                      router.push(`/${loc}/auth/login`);
                    }
                  }}
                  className="w-full py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 text-sm"
                >
                  {messages.auth?.skipVerification}
                </button>
              </div>
            </div>
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
              {messages.auth?.register}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {messages.auth?.createAccount}
            </p>
          </div>

          {/* Registration Form */}
          <div className="glass rounded-3xl p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* First Name Field */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {messages.auth?.firstName}
                </label>
                <input
                  {...register("firstName")}
                  type="text"
                  id="firstName"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  placeholder={messages.auth?.firstName}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName.message}</p>
                )}
              </div>

              {/* Last Name Field */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {messages.auth?.lastName}
                </label>
                <input
                  {...register("lastName")}
                  type="text"
                  id="lastName"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  placeholder={messages.auth?.lastName}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName.message}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {messages.auth?.email}
                </label>
                <input
                  {...register("email")}
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  placeholder={messages.auth?.email}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {messages.auth?.phone}
                </label>
                <input
                  {...register("phone")}
                  type="tel"
                  id="phone"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  placeholder={messages.auth?.phone}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone.message}</p>
                )}
              </div>

              {/* Company Field */}
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {messages.auth?.company}
                </label>
                <input
                  {...register("company")}
                  type="text"
                  id="company"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  placeholder={messages.auth?.company}
                />
                {errors.company && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.company.message}</p>
                )}
              </div>

              {/* Position Field */}
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {messages.auth?.position}
                </label>
                <input
                  {...register("position")}
                  type="text"
                  id="position"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  placeholder={messages.auth?.position}
                />
                {errors.position && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.position.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {messages.auth?.password}
                </label>
                <input
                  {...register("password")}
                  type="password"
                  id="password"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  placeholder={messages.auth?.password}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {messages.auth?.confirmPassword}
                </label>
                <input
                  {...register("confirmPassword")}
                  type="password"
                  id="confirmPassword"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  placeholder={messages.auth?.confirmPassword}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                  <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
                  <p className="text-green-400 text-sm text-center">{success}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-primary-orange to-orange-500 text-gray-900 dark:text-white font-semibold rounded-xl hover:shadow-glass-orange transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {messages.auth?.creatingAccount}
                  </div>
                ) : (
                  messages.auth?.register
                )}
              </button>
            </form>

            {/* Links */}
            <div className="mt-6 text-center">
              <Link
                href={`/${locale}/auth/login`}
                className="text-primary-orange hover:text-orange-400 transition-colors duration-200"
              >
                {messages.auth?.alreadyHaveAccount}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
