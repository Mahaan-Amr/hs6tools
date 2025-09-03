import AdminLayoutWrapper from "@/components/layout/AdminLayoutWrapper";
import DashboardStats from "@/components/admin/DashboardStats";
import RecentOrders from "@/components/admin/RecentOrders";
import QuickActions from "@/components/admin/QuickActions";

interface AdminDashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminDashboardPage({ params }: AdminDashboardPageProps) {
  const { locale } = await params;

  return (
    <AdminLayoutWrapper locale={locale}>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            پنل مدیریت
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            مدیریت کامل سیستم و محصولات
          </p>
        </div>

        {/* Dashboard Stats - Moved to top for better visibility */}
        <div className="mb-8">
          <DashboardStats locale={locale} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Orders */}
          <RecentOrders locale={locale} />

          {/* Quick Actions */}
          <QuickActions locale={locale} />
        </div>

        {/* System Status */}
        <div className="glass rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">وضعیت سیستم</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white/5 rounded-xl">
              <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-3"></div>
              <p className="text-white font-medium text-lg mb-1">سرور</p>
              <p className="text-green-400 text-sm font-medium">آنلاین</p>
              <p className="text-gray-400 text-xs mt-1">Uptime: 99.9%</p>
            </div>
            
            <div className="text-center p-6 bg-white/5 rounded-xl">
              <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-3"></div>
              <p className="text-white font-medium text-lg mb-1">دیتابیس</p>
              <p className="text-green-400 text-sm font-medium">آنلاین</p>
              <p className="text-gray-400 text-xs mt-1">Response: 12ms</p>
            </div>
            
            <div className="text-center p-6 bg-white/5 rounded-xl">
              <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-3"></div>
              <p className="text-white font-medium text-lg mb-1">پرداخت</p>
              <p className="text-green-400 text-sm font-medium">آنلاین</p>
              <p className="text-gray-400 text-xs mt-1">Gateway: ZarinPal</p>
            </div>

            <div className="text-center p-6 bg-white/5 rounded-xl">
              <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-3"></div>
              <p className="text-white font-medium text-lg mb-1">CDN</p>
              <p className="text-green-400 text-sm font-medium">آنلاین</p>
              <p className="text-gray-400 text-xs mt-1">Cache: 95%</p>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">معیارهای عملکرد</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-white/5 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">سرعت بارگذاری صفحه</span>
                  <span className="text-green-400 text-sm font-medium">1.2s</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">Core Web Vitals</span>
                  <span className="text-yellow-400 text-sm font-medium">75</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">SEO Score</span>
                  <span className="text-green-400 text-sm font-medium">92</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">فعالیت‌های اخیر</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">محصول جدید اضافه شد</p>
                <p className="text-gray-400 text-sm">دیسک الماس ۱۲۵ میلیمتری - ۲ ساعت پیش</p>
              </div>
              <span className="text-gray-500 text-xs">۲ ساعت پیش</span>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">سفارش جدید ثبت شد</p>
                <p className="text-gray-400 text-sm">سفارش #HS6-12346 - ۴ ساعت پیش</p>
              </div>
              <span className="text-gray-500 text-xs">۴ ساعت پیش</span>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">کاربر جدید ثبت‌نام کرد</p>
                <p className="text-gray-400 text-sm">علی احمدی - ۶ ساعت پیش</p>
              </div>
              <span className="text-gray-500 text-xs">۶ ساعت پیش</span>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
              <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">مقاله جدید منتشر شد</p>
                <p className="text-gray-400 text-sm">راهنمای استفاده از دیسک‌های الماس - ۸ ساعت پیش</p>
              </div>
              <span className="text-gray-500 text-xs">۸ ساعت پیش</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayoutWrapper>
  );
}
