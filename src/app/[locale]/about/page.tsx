"use client";

import { useState, useEffect } from "react";
import { getMessages, Messages } from "@/lib/i18n";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export default function AboutPage({ params }: AboutPageProps) {
  const [messages, setMessages] = useState<Messages | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      const { locale } = await params;
      const msg = await getMessages(locale);
      setMessages(msg);
    };
    loadMessages();
  }, [params]);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12" data-scroll-reveal>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {messages.about?.pageTitle}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-justify leading-relaxed">
            {messages.about?.pageSubtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div data-scroll-reveal>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{messages.about?.companyHistory}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed text-justify mb-6">
              {messages.about?.historyText1}
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed text-justify">
              {messages.about?.historyText2}
            </p>
          </div>
          
          <div className="glass rounded-3xl p-8 text-center" data-scroll-reveal style={{ transitionDelay: "0.1s" }}>
            <div className="w-32 h-32 bg-gradient-to-r from-primary-orange to-orange-500 rounded-3xl mx-auto mb-6 flex items-center justify-center">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{messages.about?.yearsExperience}</h3>
            <p className="text-gray-600 dark:text-gray-300">{messages.about?.inIndustrialTools}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass rounded-3xl p-8 text-center" data-scroll-reveal style={{ transitionDelay: "0.2s" }}>
            <div className="w-20 h-20 bg-gradient-to-r from-primary-orange to-orange-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{messages.about?.guaranteedQuality}</h3>
            <p className="text-gray-600 dark:text-gray-300">{messages.about?.qualityDescription}</p>
          </div>
          
          <div className="glass rounded-3xl p-8 text-center" data-scroll-reveal style={{ transitionDelay: "0.3s" }}>
            <div className="w-20 h-20 bg-gradient-to-r from-primary-orange to-orange-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{messages.about?.advancedTechnology}</h3>
            <p className="text-gray-600 dark:text-gray-300">{messages.about?.technologyDescription}</p>
          </div>
          
          <div className="glass rounded-3xl p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-primary-orange to-orange-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{messages.about?.support247}</h3>
            <p className="text-gray-600 dark:text-gray-300">{messages.about?.supportDescription}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
