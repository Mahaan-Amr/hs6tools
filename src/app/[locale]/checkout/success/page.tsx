"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getMessages, Messages } from "@/lib/i18n";

interface CheckoutSuccessPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderNumber?: string }>;
}

export default function CheckoutSuccessPage({ params, searchParams }: CheckoutSuccessPageProps) {
  const [locale, setLocale] = useState<string>("fa");
  const [orderNumber, setOrderNumber] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Messages | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const { locale: currentLocale } = await params;
      const { orderNumber: orderNum } = await searchParams;
      setLocale(currentLocale);
      setOrderNumber(orderNum);
      const msgs = await getMessages(currentLocale);
      setMessages(msgs);
    };
    loadData();
  }, [params, searchParams]);

  if (!messages || !messages.checkout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange mx-auto"></div>
            <p className="text-gray-900 dark:text-white mt-4">{messages?.common?.loading || "Loading..."}</p>
          </div>
        </div>
      </div>
    );
  }

  const t = messages.checkout;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          {/* Success Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {String(t.successTitle)}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 max-w-2xl mx-auto text-justify leading-relaxed">
            {String(t.successMessage)}
          </p>
          
          {/* Order Details */}
          <div className="glass rounded-3xl p-8 mb-8 max-w-lg mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{String(t.orderDetails)}</h2>
            <div className="space-y-3 text-left">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{String(t.orderNumberLabel)}</span>
                <span className="text-gray-900 dark:text-white font-medium">#{orderNumber || `HS6-${Date.now().toString().slice(-6)}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{String(t.orderDateLabel)}</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {new Date().toLocaleDateString(locale === "fa" ? "fa-IR" : locale === "ar" ? "ar-SA" : "en-US")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{String(t.orderStatusLabel)}</span>
                <span className="text-green-600 dark:text-green-400 font-medium">{String(t.processingStatus)}</span>
              </div>
            </div>
          </div>
          
          {/* Next Steps */}
          <div className="glass rounded-3xl p-8 mb-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{String(t.nextSteps)}</h3>
            <div className="space-y-3 text-left text-gray-600 dark:text-gray-300">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-orange/20 text-primary-orange rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  1
                </div>
                <p>{String(t.step1)}</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-orange/20 text-primary-orange rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  2
                </div>
                <p>{String(t.step2)}</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-orange/20 text-primary-orange rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  3
                </div>
                <p>{String(t.step3)}</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-orange/20 text-primary-orange rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  4
                </div>
                <p>{String(t.step4)}</p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-x-4">
            <Link
              href={`/${locale}/shop`}
              className="inline-block bg-gradient-to-r from-primary-orange to-orange-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-glass-orange hover:scale-105 transition-all duration-200"
            >
              {String(t.continueShopping)}
            </Link>
            
            <Link
              href={`/${locale}`}
              className="inline-block glass border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200"
            >
              {String(t.backToHome)}
            </Link>
          </div>
          
          {/* Contact Info */}
          <div className="mt-12 p-6 glass rounded-2xl max-w-lg mx-auto">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{String(t.needHelp)}</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {String(t.contactMessage)}
            </p>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>📧 {String(t.email)} support@hs6tools.com</p>
              <p>📞 {String(t.phone)} 021-12345678</p>
              <p>💬 {String(t.whatsapp)} 09123456789</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
