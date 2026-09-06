'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import {
  ShoppingBag,
  Flame,
  UtensilsCrossed,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Moon,
  Sun,
  ClipboardList,
  Home,
  Store,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAdmin, isRestaurant, logout } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme ? savedTheme === 'dark' : true;
    if (isDark) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const navLinks = [
    { name: 'الرئيسية', href: '/', icon: Home },
    { name: 'المطاعم الشريكة', href: '/restaurants', icon: Store },
    { name: 'الأكثر طلباً', href: '/leaderboard', icon: Flame },
    ...(user ? [{ name: 'طلباتي', href: '/my-orders', icon: ClipboardList }] : []),
  ];

  const isDashboardRoute =
    pathname.startsWith('/admin') ||
    pathname === '/restaurant' ||
    pathname.startsWith('/restaurant/') ||
    pathname.startsWith('/restaurant-dashboard');

  if (isDashboardRoute) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-stone-900/90 border-b border-orange-100/80 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-1.5 sm:gap-4">
          
          {/* Logo & University Subtitle */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0 select-none">
            <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform shrink-0">
              <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex flex-col shrink-0">
              <span className="text-lg sm:text-xl md:text-2xl font-black bg-gradient-to-r from-orange-600 via-amber-500 to-red-500 bg-clip-text text-transparent tracking-tight whitespace-nowrap leading-tight">
                فطرني شكراً
              </span>
              
              {/* Mobile Subtitle */}
              <div className="flex sm:hidden items-center gap-1 text-[9.5px] font-semibold text-stone-500 dark:text-stone-400 leading-tight mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span>جامعة برج العرب</span>
                <span className="text-orange-400">•</span>
                <span className="text-orange-600 dark:text-orange-400 font-bold">التقديمات</span>
              </div>

              {/* Tablet / Desktop Subtitle */}
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-stone-500 dark:text-stone-400 leading-tight mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>جامعة برج العرب التكنولوجية</span>
                <span className="text-orange-400">•</span>
                <span className="text-orange-600 dark:text-orange-400 font-semibold">إدارة التقديمات</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-100/70 dark:bg-stone-800/70 p-1.5 rounded-full border border-stone-200/50 dark:border-stone-700/50">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                      : 'text-stone-700 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-white/60 dark:hover:bg-stone-700/50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Cart, User Menu, Dark Mode */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 shrink-0">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="تبديل الوضع الليلي"
              aria-label="تبديل الوضع الليلي"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-stone-600" />
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/50 border border-orange-200 dark:border-orange-800 transition-all active:scale-95"
              aria-label="سلة المشتريات"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline font-bold text-sm">السلة</span>
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-500 text-white text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-sm"
                >
                  {totalItems}
                </motion.span>
              )}
            </button>

            {/* Restaurant Badge link (Desktop) */}
            {isRestaurant && (
              <Link
                href="/restaurant"
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/30 text-xs font-bold hover:bg-orange-500/20 transition-all"
              >
                <Store className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span>لوحة المطعم</span>
              </Link>
            )}

            {/* Admin Badge link (Desktop) */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/20 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>لوحة الإدارة</span>
              </Link>
            )}

            {/* Student Status Badge (Desktop) */}
            {user?.role === 'STUDENT' && (
              <div
                className={`hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border ${
                  user.status === 'ACTIVE'
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                }`}
              >
                <span>{user.status === 'ACTIVE' ? '🎓 طالب معتمد (خصم خاص)' : '⏳ الكرنيه قيد المراجعة'}</span>
              </div>
            )}

            {/* User Account / Login Button */}
            {user ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 p-1 sm:p-1.5 sm:pr-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-200/70 dark:hover:bg-stone-700 transition-colors"
                  title="حسابي"
                >
                  <div className="w-7 h-7 sm:w-7 sm:h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline text-xs font-bold truncate max-w-[80px]">
                    {user.name.split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={() => logout()}
                  title="تسجيل الخروج"
                  className="hidden sm:flex p-2 rounded-xl text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 transition-all active:scale-95"
              >
                <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>دخول</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              aria-label="القائمة الرئيسية"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-4 pt-3 pb-6 flex flex-col gap-2 shadow-xl"
          >
            {/* User Profile Card inside Mobile Menu */}
            {user && (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-orange-50/70 dark:bg-stone-800/70 border border-orange-100 dark:border-stone-700/60 mb-1">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 min-w-0"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-orange-500/20 shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-black text-stone-900 dark:text-white truncate">
                      {user.name}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                      {user.phone}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 transition-colors shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>خروج</span>
                </button>
              </div>
            )}

            {/* Nav Links */}
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-colors ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                      : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {/* Restaurant link inside Mobile Menu */}
            {isRestaurant && (
              <Link
                href="/restaurant"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/10 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 font-bold text-sm border border-orange-500/20"
              >
                <Store className="w-4 h-4 text-orange-500" />
                <span>لوحة المطعم</span>
              </Link>
            )}

            {/* Admin link inside Mobile Menu */}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-bold text-sm border border-amber-500/20"
              >
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>لوحة الإدارة الشاملة</span>
              </Link>
            )}

            {/* Profile Link inside Mobile Menu */}
            {user && (
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-sm"
              >
                <UserIcon className="w-4 h-4" />
                <span>الملف الشخصي وإحصائياتي</span>
              </Link>
            )}

            {/* Login Prompt if guest */}
            {!user && (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm shadow-md shadow-orange-500/20"
              >
                <UserIcon className="w-4 h-4" />
                <span>تسجيل الدخول / إنشاء حساب</span>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
