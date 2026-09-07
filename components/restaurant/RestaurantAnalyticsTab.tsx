'use client';

import React, { useState, useEffect } from 'react';
import { RestaurantAnalytics, DailyRestaurantStats } from '@/lib/types';
import {
  TrendingUp,
  DollarSign,
  Package,
  Calendar,
  Award,
  Download,
  RefreshCw,
  Sparkles,
  Flame,
  CheckCircle2,
  XCircle,
  Database,
} from 'lucide-react';

interface Props {
  restaurantId?: string;
}

export default function RestaurantAnalyticsTab({ restaurantId }: Props) {
  const [analytics, setAnalytics] = useState<RestaurantAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const url = restaurantId
        ? `/api/restaurant/analytics?restaurantId=${restaurantId}`
        : '/api/restaurant/analytics';
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'فشل جلب الإحصائيات');
      }
      const data = await res.json();
      setAnalytics(data.analytics);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [restaurantId]);

  // Export backup JSON
  const handleExportBackup = () => {
    if (!analytics) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(analytics, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup-${analytics.restaurantName || 'restaurant'}-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
        <p className="text-stone-400 font-bold text-sm">جاري تجميع وتحليل البيانات والنسخ الاحتياطي...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-8 text-center bg-stone-900 border border-stone-800 rounded-3xl space-y-4">
        <p className="text-red-400 font-bold">{error || 'لا توجد بيانات متاحة حالياً'}</p>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-bold"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const { last30Days, allTimeRevenue, allTimeOrders, topItemsAllTime, bestDay } = analytics;

  return (
    <div className="space-y-6">
      {/* Top Banner with Backup export */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
              <Database className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black text-white">
              إحصائيات الأداء اليومية والنسخ الاحتياطي
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            يتم تسجيل وحفظ طلبات اليوم بيوم تلقائياً مع تحليل الوجبات الأكثر طلباً والأرباح
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-all"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-4 h-4" />
            <span>تحديث</span>
          </button>

          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black shadow-lg shadow-orange-500/20 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>تحميل نسخة احتياطية (Backup JSON)</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* All time revenue */}
        <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400">إجمالي المبيعات المكتملة</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {allTimeRevenue.toLocaleString('ar-EG')} <span className="text-xs text-stone-400">ج.م</span>
          </div>
          <p className="text-[11px] text-stone-500">من جميع الطلبات المسلمة</p>
        </div>

        {/* All time orders */}
        <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400">إجمالي الطلبات</span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-white">
            {allTimeOrders.toLocaleString('ar-EG')} <span className="text-xs text-stone-400">طلب</span>
          </div>
          <p className="text-[11px] text-stone-500">إجمالي النشاط من بداية التسجيل</p>
        </div>

        {/* Best Performing Day */}
        <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400">أعلى يوم مبيعات</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-black text-amber-400">
            {bestDay ? `${bestDay.totalRevenue.toLocaleString('ar-EG')} ج.م` : '—'}
          </div>
          <p className="text-[11px] text-stone-500">
            {bestDay ? `بتاريخ ${bestDay.date} (${bestDay.deliveredOrders} طلب)` : 'لا توجد بيانات كافية'}
          </p>
        </div>

        {/* Top selling item */}
        <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400">الوجبة الأكثر طلباً</span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <div className="text-lg font-black text-white truncate">
            {topItemsAllTime[0]?.name || '—'}
          </div>
          <p className="text-[11px] text-stone-500">
            {topItemsAllTime[0] ? `${topItemsAllTime[0].qty} طلب تم تسليمه` : 'لا توجد وجبات'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 10 Best Sellers */}
        <div className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>أكثر 10 أصناف طلباً في المنيو</span>
            </h3>
          </div>

          {topItemsAllTime.length === 0 ? (
            <p className="text-xs text-stone-500 py-6 text-center">لا توجد بيانات مبيعات بعد</p>
          ) : (
            <div className="space-y-3">
              {topItemsAllTime.map((item, idx) => {
                const maxQty = topItemsAllTime[0]?.qty || 1;
                const percentage = Math.round((item.qty / maxQty) * 100);
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-200 flex items-center gap-2">
                        <span className="text-[10px] w-5 h-5 rounded-full bg-stone-800 text-stone-400 flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <span className="truncate max-w-[180px]">{item.name}</span>
                      </span>
                      <span className="font-mono text-orange-400 font-bold">{item.qty} طلب</span>
                    </div>
                    {/* Bar */}
                    <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Daily Orders & Backup Log Table */}
        <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-400" />
              <span>سجل الأيام والإحصائيات اليومية</span>
            </h3>
            <span className="text-[11px] text-stone-500 font-bold">آخر 30 يوم</span>
          </div>

          {last30Days.length === 0 ? (
            <p className="text-xs text-stone-500 py-8 text-center">لم يتم تسجيل طلبات في هذه الفترة</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 font-black">
                    <th className="py-2.5 px-3">التاريخ</th>
                    <th className="py-2.5 px-3 text-center">الطلبات</th>
                    <th className="py-2.5 px-3 text-center">المسلّم</th>
                    <th className="py-2.5 px-3 text-left">أرباح اليوم</th>
                    <th className="py-2.5 px-3">أفضل وجبة اليوم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {last30Days.map((day) => (
                    <tr key={day.date} className="hover:bg-stone-850 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-stone-300">{day.date}</td>
                      <td className="py-3 px-3 text-center font-bold text-white">{day.totalOrders}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          {day.deliveredOrders}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-left font-mono font-bold text-emerald-400">
                        {day.totalRevenue.toLocaleString('ar-EG')} ج.م
                      </td>
                      <td className="py-3 px-3 text-stone-300">
                        {day.topItems && day.topItems.length > 0 ? (
                          <span className="bg-stone-800 px-2 py-0.5 rounded-md text-[10px] font-bold text-amber-300">
                            {day.topItems[0].name} ({day.topItems[0].qty})
                          </span>
                        ) : (
                          <span className="text-stone-600">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
