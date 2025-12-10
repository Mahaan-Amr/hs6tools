"use client";

import { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMessages, Messages } from "@/lib/i18n";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { sanitizeCallbackUrl } from "@/utils/safeRedirect";

interface LoginPageProps {
  params: Promise<{ locale: string }>;
}

export default function LoginPage({ params }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

      // Get callbackUrl from URL search params (only same-origin paths allowed)
      const searchParams = new URLSearchParams(window.location.search);
      const callback = searchParams.get("callbackUrl");
      const safe = sanitizeCallbackUrl(callback, loc);
      if (safe) {
        setCallbackUrl(safe);
      }
    };
    loadMessages();
  }, [params]);

  // Create schema with translated messages
  const loginSchema = z.object({
    email: z.string().email(messages?.auth?.invalidEmail || "Invalid email address"),
    password: z.string().min(1, messages?.auth?.passwordRequired || "Password is required"),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError(messages?.auth?.invalidCredentials || "Invalid credentials");
      } else {
        // Check if user is admin and redirect accordingly
        const session = await getSession();
        
        // If callbackUrl is provided, redirect there (e.g., back to checkout)
        if (callbackUrl) {
          router.push(callbackUrl);
        } else if (session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN") {
          router.push(`/${locale}/admin`);
        } else {
          router.push(`/${locale}`);
        }
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
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {messages.auth?.login}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {messages.auth?.welcomeBack}
            </p>
          </div>

          {/* Login Form */}
          <div className="glass rounded-3xl p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 rounded-xl">
                  <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-primary-orange to-orange-500 text-white font-semibold rounded-xl hover:shadow-glass-orange transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {messages.auth?.loggingIn}
                  </div>
                ) : (
                  messages.auth?.login
                )}
              </button>
            </form>

            {/* Links */}
            <div className="mt-6 text-center space-y-3">
              <Link
                href={callbackUrl ? `/${locale}/auth/register?callbackUrl=${encodeURIComponent(callbackUrl)}` : `/${locale}/auth/register`}
                className="block text-primary-orange hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200"
              >
                {messages.auth?.dontHaveAccount}
              </Link>
              <Link
                href={`/${locale}/auth/forgot-password`}
                className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                {messages.auth?.forgotPassword}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
