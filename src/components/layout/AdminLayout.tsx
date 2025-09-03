"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface AdminLayoutProps {
  children: React.ReactNode;
  locale: string;
}

export default function AdminLayout({ children, locale }: AdminLayoutProps) {
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Auto-collapse sidebar on mobile
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsRightSidebarCollapsed(true);
      }
    };

    // Keyboard shortcut to toggle sidebar (Ctrl+M or Cmd+M)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        setIsRightSidebarCollapsed(!isRightSidebarCollapsed);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRightSidebarCollapsed]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push(`/${locale}`);
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-primary-black via-gray-900 to-primary-black relative bg-opacity-95 admin-panel-container"
      style={{ zIndex: 9999 }}
    >
      {/* Global CSS fixes to prevent conflicts */}
      <style jsx global>{`
        /* Ensure admin panel is completely isolated from main platform */
        .admin-panel-container {
          position: relative;
          z-index: 9999 !important;
          isolation: isolate;
        }
        
        /* Hide any conflicting elements from main platform */
        .admin-panel-container ~ * {
          display: none !important;
        }
        
        /* Ensure admin header is above everything */
        .admin-header {
          position: relative;
          z-index: 10000 !important;
        }
        
        /* Fix any potential overflow issues */
        .admin-panel-container * {
          box-sizing: border-box;
        }
        
        /* Ensure proper stacking context */
        .admin-panel-container {
          transform: translateZ(0);
          will-change: transform;
        }
        
        /* Prevent any external styles from affecting admin panel */
        .admin-panel-container * {
          font-family: inherit !important;
        }
      `}</style>
      
      {/* Main Content */}
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="glass border-b border-white/10 backdrop-blur-xl relative admin-header shadow-2xl border-l-4 border-l-primary-orange" style={{ zIndex: 10000 }}>
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-white">پنل مدیریت</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Right Sidebar Toggle */}
              <button
                onClick={() => setIsRightSidebarCollapsed(!isRightSidebarCollapsed)}
                className="p-2 text-white/80 hover:text-white transition-colors duration-200"
                title={`${isRightSidebarCollapsed ? 'باز کردن منو' : 'بستن منو'} (Ctrl+M)`}
              >
                <svg 
                  className={`w-5 h-5 transition-transform duration-300 ${isRightSidebarCollapsed ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Notifications */}
              <button className="p-2 text-white/80 hover:text-white relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Back to Site */}
              <Link
                href={`/${locale}`}
                className="p-2 text-white/80 hover:text-white"
                title="بازگشت به سایت"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="p-2 text-white/80 hover:text-red-400 transition-colors duration-200"
                title="خروج"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Right Sidebar - Collapsible */}
      <div 
        data-sidebar="main-admin-sidebar"
        className={`fixed inset-y-0 right-0 bg-black/20 backdrop-blur-xl border-l border-white/10 transform transition-all duration-300 ease-in-out ${
          isRightSidebarCollapsed ? 'translate-x-full' : 'translate-x-0'
        }`}
        style={{ zIndex: 10001 }}
      >
        <div className="flex flex-col h-full w-64">
          {/* Right Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
            <h2 className="text-white font-bold text-lg">منوی مدیریت</h2>
            <button
              onClick={() => setIsRightSidebarCollapsed(true)}
              className="p-1 text-white/60 hover:text-white transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Right Sidebar Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <Link
              href={`/${locale}/admin`}
              className="flex items-center justify-between px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="text-white/60 group-hover:text-primary-orange transition-colors duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                  </svg>
                </div>
                <span className="font-medium">داشبورد</span>
              </div>
            </Link>

            <Link
              href={`/${locale}/admin/products`}
              className="flex items-center justify-between px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="text-white/60 group-hover:text-primary-orange transition-colors duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className="font-medium">محصولات</span>
              </div>
            </Link>

            <Link
              href={`/${locale}/admin/categories`}
              className="flex items-center justify-between px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="text-white/60 group-hover:text-primary-orange transition-colors duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className="font-medium">دسته‌بندی‌ها</span>
              </div>
            </Link>

            <Link
              href={`/${locale}/admin/orders`}
              className="flex items-center justify-between px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 group"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <div className="text-white/60 group-hover:text-primary-orange transition-colors duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <span className="font-medium">سفارشات</span>
                </div>
                <span className="px-2 py-1 bg-primary-orange text-white text-xs rounded-full">12</span>
              </div>
            </Link>

            <Link
              href={`/${locale}/admin/users`}
              className="flex items-center justify-between px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="text-white/60 group-hover:text-primary-orange transition-colors duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="font-medium">کاربران</span>
              </div>
            </Link>

            <Link
              href={`/${locale}/admin/content`}
              className="flex items-center justify-between px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="text-white/60 group-hover:text-primary-orange transition-colors duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="font-medium">محتوا</span>
              </div>
            </Link>

            <Link
              href={`/${locale}/admin/analytics`}
              className="flex items-center justify-between px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="text-white/60 group-hover:text-primary-orange transition-colors duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="font-medium">گزارش‌ها</span>
              </div>
            </Link>

            <Link
              href={`/${locale}/admin/settings`}
              className="flex items-center justify-between px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="text-white/60 group-hover:text-primary-orange transition-colors duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="font-medium">تنظیمات</span>
              </div>
            </Link>
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-orange to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {session?.user?.firstName?.[0] || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  {session?.user?.firstName} {session?.user?.lastName}
                </p>
                <p className="text-white/60 text-xs truncate">
                  {session?.user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button to Show Sidebar */}
      {isRightSidebarCollapsed && (
        <button
          onClick={() => setIsRightSidebarCollapsed(false)}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-primary-orange hover:bg-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          title="نمایش منو"
          style={{ zIndex: 10002 }}
        >
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
    </div>
  );
}
