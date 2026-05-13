"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useParams } from "next/navigation";
import ArticlesTab from "./ArticlesTab";
import CategoriesTab from "./CategoriesTab";
import HomepageTab from "./HomepageTab";
import AboutPageTab from "./AboutPageTab";
import ContactPageTab from "./ContactPageTab";
import FAQPageTab from "./FAQPageTab";
import EducationTab from "../education/EducationTab";
import EducationCategoryTab from "../education/EducationCategoryTab";

type ContentTabId =
  | "homepage"
  | "aboutPage"
  | "contactPage"
  | "faqPage"
  | "articles"
  | "categories"
  | "education"
  | "educationCategories";

export default function ContentTabs() {
  const params = useParams();
  const locale = (params?.locale as string) || "fa";
  const [activeTab, setActiveTab] = useState<ContentTabId>("homepage");

  const tabs: Array<{ id: ContentTabId; name: string; icon: ReactNode }> = [
    {
      id: "homepage",
      name: "مدیریت صفحه اصلی",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10.25L12 3l9 7.25V20a1 1 0 01-1 1h-5.75a.75.75 0 01-.75-.75V14a1.5 1.5 0 00-3 0v6.25a.75.75 0 01-.75.75H4a1 1 0 01-1-1v-9.75z"
          />
        </svg>
      ),
    },
    {
      id: "aboutPage",
      name: "درباره ما",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: "contactPage",
      name: "تماس با ما",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 16.72V20a2 2 0 01-2 2h-1C9.716 22 2 14.284 2 5V5z"
          />
        </svg>
      ),
    },
    {
      id: "faqPage",
      name: "سوالات متداول",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9a3.75 3.75 0 117.044 1.803c-.77.34-1.272.983-1.272 1.697v.5M12 17h.01" />
        </svg>
      ),
    },
    {
      id: "articles",
      name: "مقالات",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: "categories",
      name: "دسته‌بندی‌های محتوا",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
    {
      id: "education",
      name: "دروس آموزشی",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
    {
      id: "educationCategories",
      name: "دسته‌بندی‌های آموزشی",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="glass rounded-3xl p-8">
      <div className="mb-8 flex flex-wrap gap-2 rounded-xl bg-gray-100 p-1 dark:bg-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-primary-orange text-white shadow-lg"
                : "text-gray-700 hover:bg-gray-200 hover:text-gray-900 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
            }`}
          >
            {tab.icon}
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      <div className="min-h-[600px]">
        {activeTab === "homepage" && <HomepageTab locale={locale} />}
        {activeTab === "aboutPage" && <AboutPageTab locale={locale} />}
        {activeTab === "contactPage" && <ContactPageTab locale={locale} />}
        {activeTab === "faqPage" && <FAQPageTab locale={locale} />}
        {activeTab === "articles" && <ArticlesTab locale={locale} />}
        {activeTab === "categories" && <CategoriesTab locale={locale} />}
        {activeTab === "education" && <EducationTab locale={locale} />}
        {activeTab === "educationCategories" && <EducationCategoryTab locale={locale} />}
      </div>
    </div>
  );
}
