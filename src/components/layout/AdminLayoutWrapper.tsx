"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { isAdmin } from "@/lib/admin-auth";

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
  locale: string;
}

export default function AdminLayoutWrapper({ children, locale }: AdminLayoutWrapperProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    console.log("AdminLayoutWrapper - Status:", status);
    console.log("AdminLayoutWrapper - Session:", session);
    console.log("AdminLayoutWrapper - User role:", session?.user?.role);
    console.log("AdminLayoutWrapper - User email:", session?.user?.email);

    if (status === "unauthenticated") {
      console.log("AdminLayoutWrapper - User not authenticated, redirecting to login");
      router.push(`/${locale}/auth/login`);
      return;
    }

    // Check if user has admin access
    if (session?.user && isAdmin(session.user.role)) {
      console.log("AdminLayoutWrapper - User is admin, setting authorized");
      setIsAuthorized(true);
    } else {
      console.log("AdminLayoutWrapper - User is not admin, redirecting to home");
      console.log("AdminLayoutWrapper - isAdmin result:", isAdmin(session?.user?.role));
      router.push(`/${locale}`);
    }

    setIsLoading(false);
  }, [session, status, router, locale]);

  // Show loading state
  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-black via-gray-900 to-primary-black flex items-center justify-center" style={{ zIndex: 9999 }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">در حال بررسی دسترسی...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-black via-gray-900 to-primary-black flex items-center justify-center" style={{ zIndex: 9999 }}>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">دسترسی غیرمجاز</h1>
          <p className="text-gray-300 mb-6">شما مجوز دسترسی به این بخش را ندارید.</p>
          <button
            onClick={() => router.push(`/${locale}`)}
            className="px-6 py-3 bg-primary-orange text-white rounded-xl hover:bg-orange-600 transition-colors duration-200"
          >
            بازگشت به صفحه اصلی
          </button>
        </div>
      </div>
    );
  }

  // Render admin layout with proper isolation
  return (
    <div className="admin-layout-wrapper" style={{ zIndex: 9999, isolation: 'isolate' }}>
      <style jsx global>{`
        /* Ensure admin layout wrapper is completely isolated */
        .admin-layout-wrapper {
          position: relative;
          z-index: 9999 !important;
          isolation: isolate;
        }
        
        /* Prevent any external styles from affecting admin layout */
        .admin-layout-wrapper * {
          box-sizing: border-box;
        }
        
        /* Ensure proper stacking context */
        .admin-layout-wrapper {
          transform: translateZ(0);
          will-change: transform;
        }
      `}</style>
      <AdminLayout locale={locale}>
        {children}
      </AdminLayout>
    </div>
  );
}
