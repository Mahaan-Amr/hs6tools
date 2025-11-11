"use client";

import Link from "next/link";

interface QuickActionsProps {
  locale: string;
}

export default function QuickActions({ locale }: QuickActionsProps) {
  const actions = [
    {
      name: "افزودن محصول",
      href: `/${locale}/admin/products`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: "bg-gradient-to-r from-primary-orange to-orange-500",
      description: "افزودن محصول جدید به فروشگاه"
    },
    {
      name: "مدیریت دسته‌بندی",
      href: `/${locale}/admin/categories`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: "bg-gradient-to-r from-primary-orange to-orange-500",
      description: "سازماندهی دسته‌بندی محصولات"
    },
    {
      name: "مدیریت کاربران",
      href: `/${locale}/admin/users`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: "bg-gradient-to-r from-primary-orange to-orange-500",
      description: "مدیریت حساب‌های کاربری"
    },
    {
      name: "گزارش‌ها",
      href: `/${locale}/admin/analytics`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      description: "مشاهده آمار و گزارش‌ها"
    },
    {
      name: "محتوا",
      href: `/${locale}/admin/content`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: "bg-gradient-to-r from-indigo-500 to-indigo-600",
      description: "مدیریت مقالات و محتوا"
    },
    {
      name: "تنظیمات",
      href: `/${locale}/admin/settings`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: "bg-gradient-to-r from-gray-500 to-gray-600",
      description: "تنظیمات سیستم و پلتفرم"
    }
  ];

  return (
    <div className="glass rounded-3xl p-4 sm:p-6 lg:p-8">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">عملیات سریع</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="group block p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                {action.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-primary-orange transition-colors duration-200">
                  {action.name}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {action.description}
                </p>
              </div>
            </div>
            
            <div className="mt-4 flex items-center text-primary-orange text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span>شروع کنید</span>
              <svg className="w-4 h-4 mr-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Additional Quick Stats */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">آمار سریع</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <div className="text-2xl font-bold text-primary-orange mb-1">۱۲</div>
            <div className="text-gray-400 text-sm">سفارشات جدید</div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <div className="text-2xl font-bold text-primary-orange mb-1">۸</div>
            <div className="text-gray-400 text-sm">محصولات کم‌موجود</div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <div className="text-2xl font-bold text-primary-orange mb-1">۲۴</div>
            <div className="text-gray-400 text-sm">نظرات جدید</div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <div className="text-2xl font-bold text-purple-400 mb-1">۵</div>
            <div className="text-gray-400 text-sm">پیام‌های جدید</div>
          </div>
        </div>
      </div>
    </div>
  );
}
