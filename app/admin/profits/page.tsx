'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Store,
  Calendar,
  Percent,
  RefreshCw,
  Coins,
  ArrowUpRight,
} from 'lucide-react';
import { ProfitStats } from '@/lib/types';

export default function AdminProfitsPage() {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<ProfitStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace('/login');
    }
  }, [isLoading, isAdmin, router]);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/profits', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [fetchStats, isAdmin]);

  if (isLoading || loading || !stats) {
    return (
      <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
        <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
        <p className="text-sm font-bold text-stone-500">جاري احتساب وتحميل بيانات الأرباح...</p>
      </div>
    );
  }

  const avgOrderValue = stats.totalDelivered > 0
    ? (stats.totalRevenue / stats.totalDelivered).toFixed(1)
    : '0';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-stone-900 dark:text-white">
                تقرير الأرباح وصافي دخل المنصة
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                متابعة المبيعات الكلية، أرباح كل مطعم شريك، وصافي عائد موقع فطرني شكراً
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchStats}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>تحديث الأرقام</span>
        </button>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Profit Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-white/20 text-white">
              نسبة المنصة {stats.platformFeePercent}%
            </span>
          </div>
          <div className="mt-6">
            <div className="text-3xl font-black">{stats.netProfit.toLocaleString('ar-EG')} ج.م</div>
            <div className="text-xs text-emerald-100 font-bold mt-1">صافي ربح موقع فطرني شكراً</div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-200 dark:border-orange-800">
              <DollarSign className="w-6 h-6" />
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-6">
            <div className="text-3xl font-black text-stone-900 dark:text-white">
              {stats.totalRevenue.toLocaleString('ar-EG')} ج.م
            </div>
            <div className="text-xs text-stone-500 font-bold mt-1">إجمالي قيمة المبيعات المسلمة</div>
          </div>
        </div>

        {/* Total & Delivered Orders */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{stats.totalDelivered} تم تسليمها</span>
            </div>
          </div>
          <div className="mt-6">
            <div className="text-3xl font-black text-stone-900 dark:text-white">
              {stats.totalOrders}
            </div>
            <div className="text-xs text-stone-500 font-bold mt-1">إجمالي عدد الطلبات الكلية</div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-800">
              <Percent className="w-6 h-6" />
            </div>
            {stats.totalCancelled > 0 && (
              <span className="text-[11px] text-red-600 font-bold flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                <span>{stats.totalCancelled} ملغي</span>
              </span>
            )}
          </div>
          <div className="mt-6">
            <div className="text-3xl font-black text-stone-900 dark:text-white">
              {avgOrderValue} ج.م
            </div>
            <div className="text-xs text-stone-500 font-bold mt-1">متوسط قيمة الطلب الواحد</div>
          </div>
        </div>
      </div>

      {/* Revenue by Partner Restaurant */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Store className="w-5 h-5 text-orange-500" />
            <h2 className="font-black text-lg text-stone-900 dark:text-white">
              توزيع الأرباح والمبيعات حسب المطاعم الشريكة
            </h2>
          </div>
          <span className="text-xs font-bold text-stone-400">
            {stats.revenueByRestaurant.length} مطعم
          </span>
        </div>

        {stats.revenueByRestaurant.length === 0 ? (
          <div className="text-center py-10 text-stone-400 text-sm font-bold">
            لم يتم تسليم أي طلبات لأي مطعم حتى الآن
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-stone-100 dark:border-stone-800 text-stone-400 font-black">
                  <th className="pb-3 pr-2">اسم المطعم</th>
                  <th className="pb-3 text-center">الطلبات المسلمة</th>
                  <th className="pb-3 text-center">إجمالي المبيعات</th>
                  <th className="pb-3 text-center">عمولة المنصة ({stats.platformFeePercent}%)</th>
                  <th className="pb-3 text-left pl-2">مستحقات المطعم ({(100 - stats.platformFeePercent)}%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {stats.revenueByRestaurant.map((r, i) => {
                  const platformCut = r.revenue * (stats.platformFeePercent / 100);
                  const restaurantCut = r.revenue - platformCut;
                  return (
                    <tr key={i} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                      <td className="py-3.5 pr-2 font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-[11px] font-black flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span>{r.restaurantName}</span>
                      </td>
                      <td className="py-3.5 text-center font-bold text-stone-600 dark:text-stone-300">
                        {r.orders} طلب
                      </td>
                      <td className="py-3.5 text-center font-black text-stone-900 dark:text-white">
                        {r.revenue.toLocaleString('ar-EG')} ج.م
                      </td>
                      <td className="py-3.5 text-center font-black text-emerald-600 dark:text-emerald-400">
                        +{platformCut.toLocaleString('ar-EG')} ج.م
                      </td>
                      <td className="py-3.5 text-left pl-2 font-bold text-stone-500 dark:text-stone-400">
                        {restaurantCut.toLocaleString('ar-EG')} ج.م
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Daily Revenue History (Last 30 Days) */}
      {stats.revenueByDay.length > 0 && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <Calendar className="w-5 h-5 text-indigo-500" />
            <h2 className="font-black text-lg text-stone-900 dark:text-white">
              سجل المبيعات اليومية (آخر 30 يوماً)
            </h2>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {stats.revenueByDay.map((day, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 text-xs"
              >
                <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300 font-bold">
                  <Calendar className="w-4 h-4 text-stone-400" />
                  <span>{day.date}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 block font-bold">المبيعات</span>
                    <span className="font-black text-stone-900 dark:text-white">
                      {day.revenue.toLocaleString('ar-EG')} ج.م
                    </span>
                  </div>
                  <div className="text-right pl-2">
                    <span className="text-[10px] text-emerald-600 block font-bold">صافي المنصة</span>
                    <span className="font-black text-emerald-600">
                      +{(day.revenue * 0.1).toLocaleString('ar-EG')} ج.م
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
