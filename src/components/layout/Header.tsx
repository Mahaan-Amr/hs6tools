"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Messages } from "@/lib/i18n";
import { useCartStore } from "@/contexts/CartContext";
import { useSession, signOut } from "next-auth/react";
import MiniCart from "@/components/ecommerce/MiniCart";

interface HeaderProps {
  locale: string;
  messages: Messages;
}

export default function Header({ locale, messages }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { toggleCart, totalItems } = useCartStore();
  const { data: session } = useSession();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

  return (
    <header className="fixed top-0 left-0 right-0 main-header" style={{ zIndex: 50 }}>
      {/* Global styles to prevent conflicts with admin panel */}
      <style jsx global>{`
        /* Ensure main header doesn't interfere with admin panel */
        .main-header {
          position: fixed;
          z-index: 50 !important;
        }
        
        /* Hide main header when admin panel is active */
        .admin-panel-container ~ .main-header,
        .admin-layout-wrapper ~ .main-header {
          display: none !important;
        }
        
        /* Ensure proper stacking context */
        .main-header {
          transform: translateZ(0);
          will-change: transform;
        }
      `}</style>
      
      {/* Main Header with subtle wood grain theme */}
      <div className="relative glass border-b border-wood backdrop-blur-xl bg-wood-grain bg-wood-polish shadow-wood">
        {/* readability overlay */}
        <div className="pointer-events-none absolute inset-0 bg-black/35" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-orange to-orange-500 rounded-xl flex items-center justify-center ring-wood">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <span className="text-white font-bold text-xl">HS6Tools</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              <Link 
                href={`/${locale}`} 
                className="px-2 py-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200"
              >
                {messages.navigation.home}
              </Link>
              <Link 
                href={`/${locale}/shop`} 
                className="px-2 py-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200"
              >
                {messages.navigation.shop}
              </Link>
              <Link 
                href={`/${locale}/categories`} 
                className="px-2 py-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200"
              >
                دسته‌بندی‌ها
              </Link>
              <Link 
                href={`/${locale}/about`} 
                className="px-2 py-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200"
              >
                {messages.navigation.about}
              </Link>
              <Link 
                href={`/${locale}/blog`} 
                className="px-2 py-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200"
              >
                {messages.navigation.blog}
              </Link>
              <Link 
                href={`/${locale}/contact`} 
                className="px-2 py-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200"
              >
                {messages.navigation.contact}
              </Link>
              {isAdmin && (
                <Link 
                  href={`/${locale}/admin`} 
                  className="px-2 py-1.5 rounded-md text-primary-orange hover:text-orange-300 hover:bg-orange-500/10 transition-colors duration-200 font-medium"
                >
                  پنل مدیریت
                </Link>
              )}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Language Switcher */}
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/fa" className={`px-1.5 py-1 rounded text-sm transition-colors duration-200 ${locale === 'fa' ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
                  FA
                </Link>
                <span className="mx-0.5 text-white/30">|</span>
                <Link href="/en" className={`px-1.5 py-1 rounded text-sm transition-colors duration-200 ${locale === 'en' ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
                  EN
                </Link>
                <span className="mx-0.5 text-white/30">|</span>
                <Link href="/ar" className={`px-1.5 py-1 rounded text-sm transition-colors duration-200 ${locale === 'ar' ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
                  AR
                </Link>
              </div>

              {/* User Actions */}
              <div className="flex items-center gap-3">
                <Link 
                  href={`/${locale}/wishlist`}
                  className="p-2.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </Link>
                
                <button 
                  onClick={toggleCart}
                  className="p-2.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200 relative"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 10-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-orange text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                </button>
                
                {/* User Menu Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="p-2.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 glass rounded-xl shadow-xl border border-white/10 backdrop-blur-xl" style={{ zIndex: 60 }}>
                      <div className="py-2">
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-sm text-white/60">
                            {session?.user?.firstName} {session?.user?.lastName}
                          </p>
                          <p className="text-xs text-white/40">{session?.user?.email}</p>
                        </div>
                        
                        <Link 
                          href={`/${locale}/account`}
                          className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          {messages?.customer?.account?.title || 'حساب کاربری'}
                        </Link>
                        
                        <button
                          onClick={() => {
                            signOut({ callbackUrl: `/${locale}/auth/login` });
                            setIsUserMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-200"
                        >
                          {messages?.common?.logout || 'خروج از حساب'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-white/80 hover:text-white transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden glass border-t border-white/10 backdrop-blur-xl" style={{ zIndex: 55 }}>
          <div className="px-4 py-6 space-y-4">
            <Link 
              href={`/${locale}`} 
              className="block text-white/80 hover:text-white transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              {messages.navigation.home}
            </Link>
            <Link 
              href={`/${locale}/shop`} 
              className="block text-white/80 hover:text-white transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              {messages.navigation.shop}
            </Link>
            <Link 
              href={`/${locale}/categories`} 
              className="block text-white/80 hover:text-white transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              دسته‌بندی‌ها
            </Link>
            <Link 
              href={`/${locale}/about`} 
              className="block text-white/80 hover:text-white transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              {messages.navigation.about}
            </Link>
            <Link 
              href={`/${locale}/blog`} 
              className="block text-white/80 hover:text-white transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              {messages.navigation.blog}
            </Link>
            <Link 
              href={`/${locale}/contact`} 
              className="block text-white/80 hover:text-white transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              {messages.navigation.contact}
            </Link>
            {isAdmin && (
              <Link 
                href={`/${locale}/admin`} 
                className="block text-primary-orange hover:text-orange-400 transition-colors duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                پنل مدیریت
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Mini Cart */}
      <MiniCart locale={locale} />
    </header>
  );
}
