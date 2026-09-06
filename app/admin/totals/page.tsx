import React from 'react';
import { db } from '@/lib/db';
import { BarChart3, TrendingUp, Package, Clock } from 'lucide-react';
import { AggregatedFoodTotal } from '@/lib/types';

export const dynamic = 'force-dynamic';

function FoodTotalCard({ item, index }: { item: AggregatedFoodTotal; index: number }) {
  const rankColors = [
    'from-orange-500 to-amber-500',
    'from-red-500 to-orange-500',
    'from-amber-500 to-yellow-500',
    'from-emerald-500 to-teal-500',
    'from-blue-500 to-indigo-500',
  ];
  const gradient = rankColors[index % rankColors.length];

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden hover:shadow-md transition-shadow">
      <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
      <div className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center font-black text-sm shrink-0`}>
            {index + 1}
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-sm text-stone-900 dark:text-stone-100 truncate">{item.foodName}</div>
            <div className="text-[11px] text-stone-500 font-medium">{item.categoryName}</div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-right shrink-0">
          <div>
            <div className="text-2xl font-black text-orange-600 dark:text-orange-400 leading-none">{item.pendingQuantity}</div>
            <div className="text-[10px] text-stone-400 mt-0.5">مطلوب ⏳</div>
          </div>
          <div className="text-stone-200 dark:text-stone-700 text-lg">|</div>
          <div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 leading-none">{item.deliveredQuantity}</div>
            <div className="text-[10px] text-stone-400 mt-0.5">سُلِّم ✅</div>
          </div>
          <div className="text-stone-200 dark:text-stone-700 text-lg">|</div>
          <div>
            <div className="text-xl font-black text-stone-700 dark:text-stone-300 leading-none">{item.totalQuantity}</div>
            <div className="text-[10px] text-stone-400 mt-0.5">الإجمالي</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function TotalsPage() {
  const totals = await db.getAggregatedFoodTotals();

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-orange-500" />
          <span>إجمالي الطلبات المطلوبة 📊</span>
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          تجميع ذكي وتلقائي لكميات كل صنف طعام عبر كافة الطلبات — محدث لحظياً مع كل طلب جديد
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/50 rounded-3xl p-5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-600 flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <div className="text-4xl font-black text-orange-600">{totals.totalActiveItemsCount}</div>
          <div className="text-xs font-bold text-stone-600 dark:text-stone-400 mt-1">وجبة قيد الانتظار 🍳</div>
          <div className="text-[11px] text-stone-400 mt-0.5">من {totals.totalActiveOrdersCount} طلب معلق</div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-3xl p-5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="text-4xl font-black text-emerald-600">{totals.allTotals.length}</div>
          <div className="text-xs font-bold text-stone-600 dark:text-stone-400 mt-1">صنف طعام مطلوب 🥙</div>
        </div>

        <div className="bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-3xl p-5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-stone-500/10 text-stone-500 flex items-center justify-center mx-auto mb-3">
            <Package className="w-6 h-6" />
          </div>
          <div className="text-4xl font-black text-stone-700 dark:text-stone-300">
            {totals.allTotals.reduce((s, i) => s + i.totalQuantity, 0)}
          </div>
          <div className="text-xs font-bold text-stone-600 dark:text-stone-400 mt-1">إجمالي كل الوجبات</div>
        </div>
      </div>

      {/* Pending Orders Food List (Main Section 12) */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-black text-stone-900 dark:text-white text-lg">قائمة الوجبات المطلوبة للتجهيز ⏳</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              الوجبات المطلوبة في الطلبات المعلقة مرتبة تنازلياً من الأكثر للأقل
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 text-xs font-black">
            {totals.pendingTotals.length} صنف
          </span>
        </div>

        {totals.pendingTotals.length === 0 ? (
          <div className="text-center py-12 text-stone-400">
            <div className="text-5xl mb-4">🎉</div>
            <p className="font-bold">لا توجد طلبات معلقة حالياً! جميع الطلبات قد سُلِّمت.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {totals.pendingTotals.map((item, i) => (
              <FoodTotalCard key={item.foodItemId} item={item} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* All Foods Totals (including delivered) */}
      {totals.allTotals.length > 0 && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-black text-stone-900 dark:text-white text-lg">إجمالي كل الأصناف (مسلمة + قيد الانتظار)</h2>
              <p className="text-xs text-stone-500 mt-0.5">السجل التراكمي الكامل لجميع الطلبات</p>
            </div>
          </div>

          {/* Print-friendly table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-stone-100 dark:border-stone-800 text-xs font-black text-stone-500 uppercase tracking-wider">
                  <th className="py-3 text-right">#</th>
                  <th className="py-3 text-right">الصنف</th>
                  <th className="py-3 text-right">القسم</th>
                  <th className="py-3 text-center">قيد الانتظار ⏳</th>
                  <th className="py-3 text-center">مسلم ✅</th>
                  <th className="py-3 text-center">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {totals.allTotals.map((item, i) => (
                  <tr key={item.foodItemId} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                    <td className="py-3 text-stone-400 text-xs">{i + 1}</td>
                    <td className="py-3 font-extrabold text-stone-900 dark:text-stone-100">{item.foodName}</td>
                    <td className="py-3 text-stone-500 text-xs">{item.categoryName}</td>
                    <td className="py-3 text-center font-black text-amber-600 dark:text-amber-400">{item.pendingQuantity}</td>
                    <td className="py-3 text-center font-black text-emerald-600 dark:text-emerald-400">{item.deliveredQuantity}</td>
                    <td className="py-3 text-center font-black text-orange-600 dark:text-orange-400 text-base">{item.totalQuantity}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
                <tr>
                  <td colSpan={3} className="py-3 font-black text-stone-900 dark:text-white text-sm">المجموع الإجمالي</td>
                  <td className="py-3 text-center font-black text-amber-600 dark:text-amber-400 text-base">
                    {totals.allTotals.reduce((s, i) => s + i.pendingQuantity, 0)}
                  </td>
                  <td className="py-3 text-center font-black text-emerald-600 dark:text-emerald-400 text-base">
                    {totals.allTotals.reduce((s, i) => s + i.deliveredQuantity, 0)}
                  </td>
                  <td className="py-3 text-center font-black text-orange-600 dark:text-orange-400 text-xl">
                    {totals.allTotals.reduce((s, i) => s + i.totalQuantity, 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
