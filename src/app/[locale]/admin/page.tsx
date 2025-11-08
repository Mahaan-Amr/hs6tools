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
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4">
            پنل مدیریت
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto px-4">
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
        <div className="glass rounded-3xl p-4 sm:p-6 lg:p-8 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">وضعیت سیستم</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white/5 rounded-xl">
              <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-3"></div>
              <p className="text-white font-medium text-lg mb-1">سرور</p>
              <p className="text-green-400 text-sm font-medium">آنلاین</p>
              <p className="text-gray-400 text-xs mt-1">Node.js {process.version}</p>
            </div>
            
            <div className="text-center p-6 bg-white/5 rounded-xl">
              <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-3"></div>
              <p className="text-white font-medium text-lg mb-1">دیتابیس</p>
              <p className="text-green-400 text-sm font-medium">PostgreSQL</p>
              <p className="text-gray-400 text-xs mt-1">Prisma ORM</p>
            </div>
            
            <div className="text-center p-6 bg-white/5 rounded-xl">
              <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-3"></div>
              <p className="text-white font-medium text-lg mb-1">احراز هویت</p>
              <p className="text-green-400 text-sm font-medium">NextAuth.js</p>
              <p className="text-gray-400 text-xs mt-1">JWT + Sessions</p>
            </div>

            <div className="text-center p-6 bg-white/5 rounded-xl">
              <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-3"></div>
              <p className="text-white font-medium text-lg mb-1">پلتفرم</p>
              <p className="text-green-400 text-sm font-medium">Next.js 15</p>
              <p className="text-gray-400 text-xs mt-1">App Router</p>
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
        <div className="glass rounded-3xl p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">فعالیت‌های اخیر</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">سیستم راه‌اندازی شد</p>
                <p className="text-gray-400 text-sm">پلتفرم HS6Tools آماده به کار است</p>
              </div>
              <span className="text-gray-500 text-xs">همیشه</span>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">دیتابیس متصل است</p>
                <p className="text-gray-400 text-sm">PostgreSQL با Prisma ORM</p>
              </div>
              <span className="text-gray-500 text-xs">همیشه</span>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">احراز هویت فعال</p>
                <p className="text-gray-400 text-sm">NextAuth.js با JWT و Sessions</p>
              </div>
              <span className="text-gray-500 text-xs">همیشه</span>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
              <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">پلتفرم آماده</p>
                <p className="text-gray-400 text-sm">Next.js 15 با App Router</p>
              </div>
              <span className="text-gray-500 text-xs">همیشه</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayoutWrapper>
  );
}
