import React from 'react';
import { db } from '@/lib/db';
import { BarChart, LineChart, DonutChart } from '@/components/Charts';
import { PieChart, TrendingUp, Users, ShoppingBag, UtensilsCrossed, Trophy, BarChart3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const stats = await db.getDashboardStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white flex items-center gap-3">
          <PieChart className="w-7 h-7 text-orange-500" />
          <span>التحليلات والإحصائيات</span>
        </h1>
        <p className="text-sm text-stone-500 mt-1">رسوم بيانية تفصيلية لنشاط المنظومة</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي المستخدمين', value: stats.totalUsers, icon: Users, color: 'blue' },
          { label: 'إجمالي الطلبات', value: stats.totalOrders, icon: ShoppingBag, color: 'orange' },
          { label: 'الطلبات المعلقة', value: stats.pendingOrders, icon: TrendingUp, color: 'amber' },
          { label: 'الوجبات المطلوبة', value: stats.totalFoodItemsCount, icon: UtensilsCrossed, color: 'purple' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 text-center shadow-sm">
              <Icon className={`w-6 h-6 mx-auto mb-2 text-${card.color}-500`} />
              <div className={`text-3xl font-black text-${card.color}-600`}>{card.value}</div>
              <div className="text-xs text-stone-500 font-bold mt-1">{card.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Popular Foods */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
          <h2 className="font-black text-stone-900 dark:text-white mb-5 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>الأصناف الأكثر طلباً</span>
          </h2>
          <BarChart data={stats.popularFoods} />
        </div>

        {/* Delivery Status Donut */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
          <h2 className="font-black text-stone-900 dark:text-white mb-5 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            <span>حالة التسليم</span>
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
            <span>الطلبات حسب الأيام</span>
          </h2>
          <LineChart data={stats.ordersPerDay} />
        </div>

        {/* Top Active Users */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm lg:col-span-2">
          <h2 className="font-black text-stone-900 dark:text-white mb-5 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            <span>أكثر المستخدمين نشاطاً</span>
          </h2>
          <BarChart
            data={stats.topActiveUsers.map((u) => ({ name: u.name, count: u.orders }))}
            barColor="from-blue-500 to-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}
