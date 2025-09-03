"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMessages, Messages } from "@/lib/i18n";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterPageProps {
  params: Promise<{ locale: string }>;
}

export default function RegisterPage({ params }: RegisterPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const [messages, setMessages] = useState<Messages | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
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
        setError(result.error || "Registration failed");
      } else {
        setSuccess(messages?.auth?.registerSuccess || "Registration successful!");
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push(`/${messages?.common?.locale || 'fa'}/auth/login`);
        }, 2000);
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
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              {messages.auth?.register || "Register"}
            </h1>
            <p className="text-gray-300">
              {messages.auth?.register || "Create your HS6Tools account"}
            </p>
          </div>

          {/* Registration Form */}
          <div className="glass rounded-3xl p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* First Name Field */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-white mb-2">
                  {messages.auth?.firstName || "First Name"}
                </label>
                <input
                  {...register("firstName")}
                  type="text"
                  id="firstName"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  placeholder={messages.auth?.firstName || "Enter your first name"}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-400">{errors.firstName.message}</p>
                )}
              </div>

              {/* Last Name Field */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-white mb-2">
                  {messages.auth?.lastName || "Last Name"}
                </label>
                <input
                  {...register("lastName")}
                  type="text"
                  id="lastName"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  placeholder={messages.auth?.lastName || "Enter your last name"}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-400">{errors.lastName.message}</p>
                )}
              </div>

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

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
                  {messages.auth?.phone || "Phone (Optional)"}
                </label>
                <input
                  {...register("phone")}
                  type="tel"
                  id="phone"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  placeholder={messages.auth?.phone || "Enter your phone number"}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
                )}
              </div>

              {/* Company Field */}
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-white mb-2">
                  {messages.auth?.company || "Company (Optional)"}
                </label>
                <input
                  {...register("company")}
                  type="text"
                  id="company"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  placeholder={messages.auth?.company || "Enter your company name"}
                />
                {errors.company && (
                  <p className="mt-1 text-sm text-red-400">{errors.company.message}</p>
                )}
              </div>

              {/* Position Field */}
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-white mb-2">
                  {messages.auth?.position || "Position (Optional)"}
                </label>
                <input
                  {...register("position")}
                  type="text"
                  id="position"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  placeholder={messages.auth?.position || "Enter your position"}
                />
                {errors.position && (
                  <p className="mt-1 text-sm text-red-400">{errors.position.message}</p>
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

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                  {messages.auth?.confirmPassword || "Confirm Password"}
                </label>
                <input
                  {...register("confirmPassword")}
                  type="password"
                  id="confirmPassword"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  placeholder={messages.auth?.confirmPassword || "Confirm your password"}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                  <p className="text-red-400 text-sm text-center">{error}</p>
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
                className="w-full py-3 bg-gradient-to-r from-primary-orange to-orange-500 text-white font-semibold rounded-xl hover:shadow-glass-orange transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {messages.auth?.register || "Creating account..."}
                  </div>
                ) : (
                  messages.auth?.register || "Create Account"
                )}
              </button>
            </form>

            {/* Links */}
            <div className="mt-6 text-center">
              <Link
                href={`/${messages?.common?.locale || 'fa'}/auth/login`}
                className="text-primary-orange hover:text-orange-400 transition-colors duration-200"
              >
                {messages.auth?.login || "Already have an account? Sign in"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
