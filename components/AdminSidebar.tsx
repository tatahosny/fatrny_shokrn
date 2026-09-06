'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  ArrowRight,
  ShieldCheck,
  Menu,
  X,
  UserCog,
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { name: 'الرئيسية والإحصائيات', href: '/admin', icon: LayoutDashboard },
    { name: 'إجمالي الطلبات 📊', href: '/admin/totals', icon: BarChart3, highlight: true },
    { name: 'تتبع التسليم 🚚', href: '/admin/delivery', icon: Truck, highlight: true },
    { name: 'إدارة الطلبات', href: '/admin/orders', icon: ClipboardList },
    { name: 'قائمة الأطعمة', href: '/admin/foods', icon: UtensilsCrossed },
    { name: 'التصنيفات الـ 9', href: '/admin/categories', icon: Layers },
    { name: 'إدارة المستخدمين 👤', href: '/admin/users', icon: UserCog },
    { name: 'التحليلات والرسوم', href: '/admin/analytics', icon: PieChart },
    { name: 'سجل النشاطات', href: '/admin/activity', icon: History },
  ];

  const SidebarContent = () => (
    <div className="space-y-6">
      {/* Admin Header Title */}
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300">
        <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
        <div>
          <h2 className="text-sm font-black">لوحة المشرفين</h2>
          <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">فريق إدارة التقديمات</p>
        </div>
      </div>

      {/* Links */}
      <nav className="space-y-1.5">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : link.highlight
                  ? 'bg-orange-50/60 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-950/40'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span>{link.name}</span>
              </div>
              {link.highlight && !isActive && (
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden sticky top-20 z-30 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 py-3">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 font-bold text-sm w-full"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>قائمة الإدارة</span>
          <ShieldCheck className="w-4 h-4 text-amber-500 mr-auto" />
        </button>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <div className="mt-2 p-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl">
            <SidebarContent />
            <div className="pt-4 mt-4 border-t border-stone-200 dark:border-stone-800">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-stone-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-stone-800 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                <span>الرجوع للموقع والمنيو العام</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800 flex-col justify-between shrink-0 p-4 min-h-[calc(100vh-5rem)] sticky top-20 self-start">
        <SidebarContent />

        {/* Back to public site */}
        <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-stone-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-stone-800 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>الرجوع للموقع والمنيو العام</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
