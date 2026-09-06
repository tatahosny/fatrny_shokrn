'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  BarChart3,
  Truck,
  ClipboardList,
  UtensilsCrossed,
  Layers,
  Users,
  PieChart,
  History,
  ShieldCheck,
  Menu,
  X,
  UserCog,
  Store,
  GraduationCap,
  Coins,
  LogOut,
  Moon,
  Sun,
  User,
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme ? savedTheme === 'dark' : true;
    setIsDarkMode(isDark);
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

  const links = [
    { name: 'الرئيسية والإحصائيات', href: '/admin', icon: LayoutDashboard },
    { name: 'إجمالي الطلبات', href: '/admin/totals', icon: BarChart3, highlight: true },
    { name: 'تتبع التسليم', href: '/admin/delivery', icon: Truck, highlight: true },
    { name: 'طلبات الطلاب والكرنيهات', href: '/admin/students', icon: GraduationCap, highlight: true },
    { name: 'الأرباح وصافي الدخل', href: '/admin/profits', icon: Coins, highlight: true },
    { name: 'إدارة الطلبات', href: '/admin/orders', icon: ClipboardList },
    { name: 'إدارة المطاعم', href: '/admin/restaurants', icon: Store },
    { name: 'قائمة الأطعمة', href: '/admin/foods', icon: UtensilsCrossed },
    { name: 'التصنيفات الـ 9', href: '/admin/categories', icon: Layers },
    { name: 'إدارة المستخدمين', href: '/admin/users', icon: UserCog },
    { name: 'التحليلات والرسوم', href: '/admin/analytics', icon: PieChart },
    { name: 'سجل النشاطات', href: '/admin/activity', icon: History },
  ];

  const NavLinksList = () => (
    <nav className="space-y-1">
      {links.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all ${
              isActive
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25'
                : link.highlight
                ? 'bg-orange-50/70 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-950/50'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-stone-400'}`} />
              <span className="truncate">{link.name}</span>
            </div>
            {link.highlight && !isActive && (
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shrink-0"></span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const UserFooter = () => (
    <div className="space-y-3 pt-3 border-t border-stone-200 dark:border-stone-800">
      {/* Admin User Info */}
      <div className="flex items-center justify-between p-2.5 rounded-2xl bg-stone-100/80 dark:bg-stone-800/80 border border-stone-200/60 dark:border-stone-700/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black text-xs shadow-sm shrink-0">
            {user?.name ? user.name.charAt(0) : 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-stone-900 dark:text-white truncate">
              {user?.name || 'مدير النظام'}
            </p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              مسؤول الإدارة العليا
            </p>
          </div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title="تبديل الوضع الليلي"
          className="p-2 rounded-xl text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors shrink-0"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
        </button>
      </div>

      {/* Logout button */}
      <button
        onClick={() => logout()}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 font-black text-xs transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span>تسجيل الخروج من الإدارة</span>
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Top App Bar */}
      <div className="md:hidden sticky top-0 z-50 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-sm shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-black bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
              لوحة الإدارة العليا
            </span>
            <p className="text-[10px] text-stone-400 font-bold">جامعة برج العرب التكنولوجية</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200"
            aria-label="القائمة"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm pt-16 flex flex-col justify-between p-4 overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <NavLinksList />
            <UserFooter />
          </div>
        </div>
      )}

      {/* Desktop Sidebar (Permanent Full-Height) */}
      <aside className="hidden md:flex w-72 h-screen sticky top-0 bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800 flex-col justify-between shrink-0 p-4 z-40">
        
        {/* Top Branding Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/20">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black text-stone-900 dark:text-white leading-tight">
                لوحة الإدارة المركزية
              </h2>
              <p className="text-[10.5px] text-orange-600 dark:text-orange-400 font-bold truncate mt-0.5">
                جامعة برج العرب (BATU)
              </p>
            </div>
          </div>
        </div>

        {/* Middle Navigation (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-3 my-2 scrollbar-none">
          <NavLinksList />
        </div>

        {/* Bottom User & Actions Section */}
        <UserFooter />

      </aside>
    </>
  );
}
