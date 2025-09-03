"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMessages, Messages } from "@/lib/i18n";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginPageProps {
  params: Promise<{ locale: string }>;
}

export default function LoginPage({ params }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [messages, setMessages] = useState<Messages | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Load messages
  useState(() => {
    const loadMessages = async () => {
      const { locale } = await params;
      const msg = await getMessages(locale);
      setMessages(msg);
    };
    loadMessages();
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
        if (session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN") {
          router.push(`/${(await params).locale}/admin`);
        } else {
          router.push(`/${(await params).locale}`);
        }
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!messages) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-black via-gray-900 to-primary-black pt-20">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-orange mx-auto"></div>
            <p className="mt-4 text-xl">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-black via-gray-900 to-primary-black pt-20">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              {messages.auth?.login || "Login"}
            </h1>
            <p className="text-gray-300">
              {messages.auth?.login || "Welcome back to HS6Tools"}
            </p>
          </div>

          {/* Login Form */}
          <div className="glass rounded-3xl p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  {messages.auth?.email || "Email"}
                </label>
                <input
                  {...register("email")}
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  placeholder={messages.auth?.email || "Enter your email"}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                  {messages.auth?.password || "Password"}
                </label>
                <input
                  {...register("password")}
                  type="password"
                  id="password"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  placeholder={messages.auth?.password || "Enter your password"}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                  <p className="text-red-400 text-sm text-center">{error}</p>
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
                    {messages.auth?.login || "Logging in..."}
                  </div>
                ) : (
                  messages.auth?.login || "Login"
                )}
              </button>
            </form>

            {/* Links */}
            <div className="mt-6 text-center space-y-3">
              <Link
                href={`/${messages?.common?.locale || 'fa'}/auth/register`}
                className="block text-primary-orange hover:text-orange-400 transition-colors duration-200"
              >
                {messages.auth?.register || "Don't have an account? Sign up"}
              </Link>
              <Link
                href={`/${messages?.common?.locale || 'fa'}/auth/forgot-password`}
                className="block text-gray-400 hover:text-white transition-colors duration-200"
              >
                {messages.auth?.forgotPassword || "Forgot your password?"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
