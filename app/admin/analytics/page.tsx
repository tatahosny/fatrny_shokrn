import React from 'react';
import { db } from '@/lib/db';
import { BarChart, LineChart, DonutChart } from '@/components/Charts';
import {
  PieChart,
  TrendingUp,
  Users,
  ShoppingBag,
  UtensilsCrossed,
  Trophy,
  BarChart3,
  Store,
  Calendar,
  DollarSign,
  CheckCircle2,
  Database,
  Download,
} from 'lucide-react';
import AdminExportBackupButton from '@/components/admin/AdminExportBackupButton';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const [stats, adminAnalytics] = await Promise.all([
    db.getDashboardStats(),
    db.getAdminAnalytics(),
  ]);

  const { overview, dailyStats, restaurantBreakdown, topSellingItems } = adminAnalytics;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white flex items-center gap-3">
            <PieChart className="w-7 h-7 text-orange-500" />
            <span>التحليلات الشاملة والنسخ الاحتياطي اليومي</span>
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            إحصائيات تفصيلية لأداء المطاعم والمبيعات اليومية لجامعة برج العرب
          </p>
        </div>

        <AdminExportBackupButton data={{ stats, adminAnalytics, exportedAt: new Date().toISOString() }} />
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-500">إجمالي المبيعات</span>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            {overview.totalRevenue.toLocaleString('ar-EG')} <span className="text-xs font-bold text-stone-400">ج.م</span>
          </div>
          <div className="text-[11px] text-stone-400 mt-1">مبيعات اليوم: {overview.todayRevenue} ج.م</div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-500">إجمالي الطلبات</span>
            <ShoppingBag className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-orange-600">
            {overview.totalOrders.toLocaleString('ar-EG')}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">طلبات اليوم: {overview.todayOrders}</div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-500">الطلبات المسلّمة</span>
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600">
            {overview.deliveredOrders.toLocaleString('ar-EG')}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">بنسبة نجاح {overview.totalOrders > 0 ? Math.round((overview.deliveredOrders / overview.totalOrders) * 100) : 0}%</div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-500">المستخدمين المسجلين</span>
            <Users className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-600">
            {stats.totalUsers.toLocaleString('ar-EG')}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">طلاب وعملاء ومطاعم</div>
        </div>
      </div>

      {/* Per Restaurant Breakdown Table */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-4">
        <h2 className="font-black text-base text-stone-900 dark:text-white flex items-center gap-2">
          <Store className="w-5 h-5 text-orange-500" />
          <span>تحليلات المبيعات بحسب المطاعم المشتركة</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 font-black">
                <th className="py-3 px-4">اسم المطعم</th>
                <th className="py-3 px-4 text-center">عدد الطلبات</th>
                <th className="py-3 px-4 text-left">إجمالي المبيعات</th>
                <th className="py-3 px-4">الوجبة الأكثر مبيعاً</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {restaurantBreakdown.map((r) => (
                <tr key={r.restaurantId} className="hover:bg-stone-50 dark:hover:bg-stone-850 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center font-bold">
                      {r.restaurantName.charAt(0)}
                    </span>
                    <span>{r.restaurantName}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-stone-700 dark:text-stone-300">
                    {r.totalOrders}
                  </td>
                  <td className="py-3.5 px-4 text-left font-mono font-black text-emerald-600 dark:text-emerald-400">
                    {r.totalRevenue.toLocaleString('ar-EG')} ج.م
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-[11px]">
                      {r.topItem}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Snapshots and Top items table */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-base text-stone-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-500" />
            <span>سجل إحصائيات الأيام والنسخ اليومي (آخر 30 يوم)</span>
          </h2>
          <span className="text-xs text-stone-400 font-bold">تسجيل يوم بيوم</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 font-black">
                <th className="py-3 px-4">اليوم والتاريخ</th>
                <th className="py-3 px-4 text-center">إجمالي الطلبات</th>
                <th className="py-3 px-4 text-center">المسلمة</th>
                <th className="py-3 px-4 text-left">أرباح اليوم</th>
                <th className="py-3 px-4">أكثر الوجبات طلباً في هذا اليوم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {dailyStats.map((day) => (
                <tr key={day.date} className="hover:bg-stone-50 dark:hover:bg-stone-850 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-stone-900 dark:text-stone-200">{day.date}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-stone-900 dark:text-white">{day.totalOrders}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {day.deliveredOrders}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-left font-mono font-black text-emerald-600 dark:text-emerald-400">
                    {day.totalRevenue.toLocaleString('ar-EG')} ج.م
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1.5">
                      {day.topItems && day.topItems.length > 0 ? (
                        day.topItems.map((it) => (
                          <span key={it.name} className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-bold">
                            {it.name} ({it.qty})
                          </span>
                        ))
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Foods */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
          <h2 className="font-black text-stone-900 dark:text-white mb-5 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>أكثر الأصناف طلباً في النظام</span>
          </h2>
          <BarChart data={stats.popularFoods} />
        </div>

        {/* Delivery Status Donut */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
          <h2 className="font-black text-stone-900 dark:text-white mb-5 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            <span>حالات تسليم الطلبات</span>
          </h2>
          <DonutChart
            data={stats.deliveryStatusDistribution.map((d) => ({
              label: d.label,
              count: d.count,
              color: d.status === 'DELIVERED' ? '#10b981' : d.status === 'PENDING' ? '#f59e0b' : '#ef4444',
            }))}
          />
        </div>

        {/* Orders Per Day Line Chart */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm lg:col-span-2">
          <h2 className="font-black text-stone-900 dark:text-white mb-5 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <span>حركة الطلبات حسب الأيام</span>
          </h2>
          <LineChart data={stats.ordersPerDay} />
        </div>
      </div>
    </div>
  );
}
