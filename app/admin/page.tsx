import React from 'react';
import { db } from '@/lib/db';
import Link from 'next/link';
import {
  Users, ShoppingBag, Clock, CheckCircle2, BarChart3, UtensilsCrossed,
  TrendingUp, Crown, Truck, ArrowLeft, Sparkles, AlertCircle,
} from 'lucide-react';
import { BarChart } from '@/components/Charts';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [stats, totals, deliveryData] = await Promise.all([
    db.getDashboardStats(),
    db.getAggregatedFoodTotals(),
    db.getDeliveryTracking(),
  ]);

  const statCards = [
    {
      title: 'إجمالي المستخدمين',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-200 dark:border-blue-800/50',
    },
    {
      title: 'إجمالي الطلبات',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-950/40',
      border: 'border-orange-200 dark:border-orange-800/50',
    },
    {
      title: 'قيد الانتظار ⏳',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-800/50',
    },
    {
      title: 'تم التسليم ✅',
      value: stats.deliveredOrders,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-800/50',
    },
    {
      title: 'إجمالي الوجبات المطلوبة',
      value: stats.totalFoodItemsCount,
      icon: UtensilsCrossed,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      border: 'border-purple-200 dark:border-purple-800/50',
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white flex items-center gap-3">
          <Sparkles className="w-7 h-7 text-orange-500" />
          <span>لوحة الإدارة الرئيسية</span>
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          نظرة عامة شاملة على كافة طلبات فطرني شكراً — جامعة برج العرب التكنولوجية
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`${card.bg} ${card.border} border rounded-3xl p-5 flex flex-col gap-3`}
            >
              <div className={`w-10 h-10 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center shadow-sm border ${card.border}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className={`text-3xl font-black ${card.color}`}>{card.value}</div>
                <div className="text-xs text-stone-500 font-bold mt-0.5">{card.title}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Totals Aggregation Quick Card (SECTION 12) */}
        <Link
          href="/admin/totals"
          className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-6 text-white hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-6 h-6 text-white" />
              <h3 className="font-black text-lg">إجمالي الطلبات المطلوبة 📊</h3>
            </div>
            <ArrowLeft className="w-5 h-5 text-white/70 group-hover:text-white group-hover:-translate-x-1 transition-transform" />
          </div>
          <p className="text-sm text-orange-100 leading-relaxed">
            اعرف الكمية الإجمالية لكل صنف طعام على حدة من كل الطلبات المعلقة والمسلمة — جاهزة للتجهيز الفوري
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl font-black">{totals.totalActiveItemsCount}</span>
            <span className="text-sm text-orange-100">وجبة قيد الانتظار في {totals.totalActiveOrdersCount} طلب</span>
          </div>
        </Link>

        {/* Delivery Tracking Quick Card (SECTION 13) */}
        <Link
          href="/admin/delivery"
          className="group relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-6 text-white hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Truck className="w-6 h-6 text-white" />
              <h3 className="font-black text-lg">تتبع التسليم 🚚</h3>
            </div>
            <ArrowLeft className="w-5 h-5 text-white/70 group-hover:text-white group-hover:-translate-x-1 transition-transform" />
          </div>
          <p className="text-sm text-emerald-100 leading-relaxed">
            مين استلم فطاره ومين لسه؟ ضغطة زر واحدة تسجل التسليم لكل طالب في فريق التقديمات
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black">{deliveryData.delivered.length}</span>
              <span className="text-sm text-emerald-100">تسلم ✅</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black">{deliveryData.pending.length}</span>
              <span className="text-sm text-emerald-100">لم يتسلم ⏳</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Top Popular Foods Bar Chart */}
      {stats.popularFoods.length > 0 && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h2 className="font-black text-stone-900 dark:text-white">الأصناف الأكثر طلباً</h2>
          </div>
          <BarChart data={stats.popularFoods} />
        </div>
      )}

      {/* Top Active Users */}
      {stats.topActiveUsers.length > 0 && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Crown className="w-5 h-5 text-amber-500" />
            <h2 className="font-black text-stone-900 dark:text-white">أكثر المستخدمين نشاطاً</h2>
          </div>
          <div className="space-y-3">
            {stats.topActiveUsers.map((u, i) => (
              <div key={u.name} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                  i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-stone-200 text-stone-700' : 'bg-stone-100 text-stone-500'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-extrabold text-stone-900 dark:text-stone-100 truncate">{u.name}</div>
                </div>
                <div className="text-xs font-black text-orange-600 dark:text-orange-400">{u.orders} طلب</div>
                <div className="text-xs text-stone-400">{u.items} وجبة</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
