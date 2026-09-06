'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Crown, Flame, ShoppingBag, ClipboardList, Star, LogOut, Settings } from 'lucide-react';

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-3xl animate-pulse">🍳</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      
      {/* Profile Hero */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/10 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-orange-500/30">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black">{user.name}</h1>
              {user.role === 'ADMIN' && (
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  مشرف
                </span>
              )}
            </div>
            <p className="text-stone-400 text-sm mt-1">{user.phone}</p>
            <p className="text-xs text-stone-500 mt-1">عضو في فريق إدارة التقديمات - جامعة برج العرب</p>
          </div>
        </div>
      </div>

      {/* Quick Nav Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/my-orders" className="group bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-orange-300 hover:shadow-md transition-all flex flex-col gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <div className="font-black text-stone-900 dark:text-white text-sm">طلباتي</div>
            <div className="text-xs text-stone-500">سجل كل طلباتك السابقة</div>
          </div>
        </Link>

        <Link href="/leaderboard" className="group bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-amber-300 hover:shadow-md transition-all flex flex-col gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="font-black text-stone-900 dark:text-white text-sm">لوحة الشرف</div>
            <div className="text-xs text-stone-500">اعرف ترتيبك في الجامعة</div>
          </div>
        </Link>

        <Link href="/menu" className="group bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="font-black text-stone-900 dark:text-white text-sm">المنيو الكامل</div>
            <div className="text-xs text-stone-500">اطلب فطارك الآن</div>
          </div>
        </Link>

        {user.role === 'ADMIN' && (
          <Link href="/admin" className="group bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-purple-300 hover:shadow-md transition-all flex flex-col gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-stone-900 dark:text-white text-sm">لوحة الإدارة</div>
              <div className="text-xs text-stone-500">إدارة الطلبات والتسليم</div>
            </div>
          </Link>
        )}
      </div>

      {/* Logout Button */}
      <button
        onClick={() => logout()}
        className="w-full py-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-stone-700 dark:text-stone-300 hover:text-red-600 dark:hover:text-red-400 font-bold text-sm flex items-center justify-center gap-2 border border-stone-200 dark:border-stone-700 hover:border-red-200 transition-all"
      >
        <LogOut className="w-4 h-4" />
        <span>تسجيل الخروج</span>
      </button>
    </div>
  );
}
