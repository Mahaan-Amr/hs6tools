"use client";

import { useState } from "react";
import ArticlesTab from "./ArticlesTab";
import CategoriesTab from "./CategoriesTab";

export default function ContentTabs() {
  const [activeTab, setActiveTab] = useState<"articles" | "categories">("articles");

  const tabs = [
    {
      id: "articles",
      name: "مقالات",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: "categories",
      name: "دسته‌بندی‌ها",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
  ];

  return (
    <div className="glass rounded-3xl p-8">
      {/* Tabs Navigation */}
      <div className="flex space-x-1 mb-8 bg-white/5 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "articles" | "categories")}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-primary-orange text-white shadow-lg"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            {tab.icon}
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === "articles" && <ArticlesTab />}
        {activeTab === "categories" && <CategoriesTab />}
      </div>
    </div>
  );
}
