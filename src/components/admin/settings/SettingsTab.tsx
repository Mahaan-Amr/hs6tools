"use client";
import { useState } from "react";
import SystemSettingsForm from "./SystemSettingsForm";
import EmailSettingsForm from "./EmailSettingsForm";
import PaymentSettingsForm from "./PaymentSettingsForm";



export default function SettingsTab() {
  const [activeTab, setActiveTab] = useState("system");
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const tabs = [
    {
      id: "system",
      name: "تنظیمات عمومی",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: "email",
      name: "تنظیمات ایمیل",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "payment",
      name: "تنظیمات پرداخت",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
  ];

  const handleSaveSuccess = (message: string) => {
    setSaveStatus({ type: "success", message });
    setTimeout(() => setSaveStatus({ type: null, message: "" }), 3000);
  };

  const handleSaveError = (message: string) => {
    setSaveStatus({ type: "error", message });
    setTimeout(() => setSaveStatus({ type: null, message: "" }), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Status Message */}
      {saveStatus.type && (
        <div
          className={`p-4 rounded-xl ${
            saveStatus.type === "success"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {saveStatus.message}
        </div>
      )}

      {/* Tabs */}
      <div className="glass rounded-3xl p-2">
        <div className="flex space-x-2 space-x-reverse">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-2xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-primary-orange to-orange-500 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="glass rounded-3xl p-8">
        {activeTab === "system" && (
          <SystemSettingsForm
            onSaveSuccess={handleSaveSuccess}
            onSaveError={handleSaveError}
            setIsLoading={setIsLoading}
          />
        )}
        {activeTab === "email" && (
          <EmailSettingsForm
            onSaveSuccess={handleSaveSuccess}
            onSaveError={handleSaveError}
            setIsLoading={setIsLoading}
          />
        )}
        {activeTab === "payment" && (
          <PaymentSettingsForm
            onSaveSuccess={handleSaveSuccess}
            onSaveError={handleSaveError}
            setIsLoading={setIsLoading}
          />
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass rounded-3xl p-8 flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange"></div>
            <p className="text-white text-lg">در حال ذخیره...</p>
          </div>
        </div>
      )}
    </div>
  );
}
