import React from 'react';
import { db } from '@/lib/db';
import { BarChart3, TrendingUp, Package, Clock, CheckCircle2, Sparkles } from 'lucide-react';
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
      
      <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Item Info: Rank + Name + Category */}
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center font-black text-sm shrink-0 mt-0.5 sm:mt-0 shadow-sm`}>
            {index + 1}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-black text-stone-900 dark:text-stone-100 text-sm sm:text-base leading-snug break-words">
              {item.foodName}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-block text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                {item.categoryName}
              </span>
            </div>
          </div>
        </div>

        {/* Quantities: Mobile Responsive Pill Grid / Desktop Row */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 pt-2.5 sm:pt-0 border-t border-stone-100 dark:border-stone-800 sm:border-0 shrink-0">
          {/* مطلوب */}
          <div className="flex-1 sm:flex-initial text-center sm:text-right bg-orange-50/80 dark:bg-orange-950/30 sm:bg-transparent px-2.5 py-1.5 sm:p-0 rounded-xl sm:rounded-none border border-orange-100 dark:border-orange-900/30 sm:border-0">
            <div className="text-xl sm:text-2xl font-black text-orange-600 dark:text-orange-400 leading-none">
              {item.pendingQuantity}
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-orange-800 dark:text-orange-300 sm:text-stone-400 mt-1">
              مطلوب
            </div>
          </div>

          <div className="hidden sm:block text-stone-200 dark:text-stone-700 text-lg">|</div>

          {/* سُلّم */}
          <div className="flex-1 sm:flex-initial text-center sm:text-right bg-emerald-50/80 dark:bg-emerald-950/30 sm:bg-transparent px-2.5 py-1.5 sm:p-0 rounded-xl sm:rounded-none border border-emerald-100 dark:border-emerald-900/30 sm:border-0">
            <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
              {item.deliveredQuantity}
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-emerald-800 dark:text-emerald-300 sm:text-stone-400 mt-1">
              سُلِّم
            </div>
          </div>

          <div className="hidden sm:block text-stone-200 dark:text-stone-700 text-lg">|</div>

          {/* الإجمالي */}
          <div className="flex-1 sm:flex-initial text-center sm:text-right bg-stone-100/80 dark:bg-stone-800/80 sm:bg-transparent px-2.5 py-1.5 sm:p-0 rounded-xl sm:rounded-none border border-stone-200/60 dark:border-stone-700 sm:border-0">
            <div className="text-lg sm:text-xl font-black text-stone-800 dark:text-stone-200 leading-none">
              {item.totalQuantity}
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-stone-600 dark:text-stone-400 mt-1">
              الإجمالي
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function TotalsPage() {
  const totals = await db.getAggregatedFoodTotals();

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-3xl font-black text-stone-900 dark:text-white flex items-center gap-2.5 sm:gap-3">
          <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-orange-500 shrink-0" />
          <span>إجمالي الطلبات المطلوبة</span>
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
          تجميع ذكي وتلقائي لكميات كل صنف طعام عبر كافة الطلبات — محدث لحظياً مع كل طلب جديد
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-800/50 rounded-2xl sm:rounded-3xl p-3 sm:p-5 text-center flex flex-col items-center justify-center">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-500/20 text-orange-600 flex items-center justify-center mb-1.5 sm:mb-3">
            <Clock className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div className="text-2xl sm:text-4xl font-black text-orange-600 leading-tight">
            {totals.totalActiveItemsCount}
          </div>
          <div className="text-[11px] sm:text-xs font-bold text-stone-700 dark:text-stone-300 mt-0.5">
            وجبة قيد الانتظار
          </div>
          <div className="text-[10px] sm:text-[11px] text-stone-400 mt-0.5">
            من {totals.totalActiveOrdersCount} طلب معلق
          </div>
        </div>

        <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 rounded-2xl sm:rounded-3xl p-3 sm:p-5 text-center flex flex-col items-center justify-center">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center mb-1.5 sm:mb-3">
            <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div className="text-2xl sm:text-4xl font-black text-emerald-600 leading-tight">
            {totals.allTotals.length}
          </div>
          <div className="text-[11px] sm:text-xs font-bold text-stone-700 dark:text-stone-300 mt-0.5">
            صنف مطلوب
          </div>
          <div className="text-[10px] sm:text-[11px] text-stone-400 mt-0.5">
            في كل الأصناف
          </div>
        </div>

        <div className="bg-stone-100/80 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-2xl sm:rounded-3xl p-3 sm:p-5 text-center flex flex-col items-center justify-center">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-stone-500/10 text-stone-500 flex items-center justify-center mb-1.5 sm:mb-3">
            <Package className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div className="text-2xl sm:text-4xl font-black text-stone-700 dark:text-stone-300 leading-tight">
            {totals.allTotals.reduce((s, i) => s + i.totalQuantity, 0)}
          </div>
          <div className="text-[11px] sm:text-xs font-bold text-stone-700 dark:text-stone-300 mt-0.5">
            إجمالي الوجبات
          </div>
          <div className="text-[10px] sm:text-[11px] text-stone-400 mt-0.5">
            الكمية الكلية
          </div>
        </div>
      </div>

      {/* Active Special Notes Section (طحينة، شطة، إلخ) */}
      {totals.activeNotes && totals.activeNotes.length > 0 && (
        <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <h2 className="font-black text-amber-900 dark:text-amber-200 text-sm sm:text-base">
                ملاحظات وتعديلات الوجبات المعلقة للتجهيز
              </h2>
              <p className="text-xs text-amber-700/80 dark:text-amber-400 mt-0.5">
                طلبات خاصة من الطلاب (طحينة زيادة، بدون شطة، تسوية، إلخ)
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {totals.activeNotes.map((noteItem, idx) => (
              <div
                key={idx}
                className="p-3 bg-white dark:bg-stone-900 rounded-2xl border border-amber-200/70 dark:border-amber-800/40 flex items-start gap-3 shadow-xs"
              >
                <span className="px-2.5 py-1 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 font-black text-xs shrink-0">
                  #{noteItem.orderNumber}
                </span>
                <div className="min-w-0 flex-1 text-xs">
                  <div className="font-black text-stone-900 dark:text-stone-100">{noteItem.userName}:</div>
                  <p className="text-amber-800 dark:text-amber-300 font-extrabold mt-1 leading-relaxed text-xs">
                    {noteItem.notes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Orders Food List */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5">
          <div>
            <h2 className="font-black text-stone-900 dark:text-white text-base sm:text-lg">
              قائمة الوجبات المطلوبة للتجهيز
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              الوجبات في الطلبات المعلقة مرتبة تنازلياً من الأكثر للأقل
            </p>
          </div>
          <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 text-xs font-black shrink-0">
            {totals.pendingTotals.length} صنف
          </span>
        </div>

        {totals.pendingTotals.length === 0 ? (
          <div className="text-center py-10 sm:py-12 text-stone-400">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-bold text-sm sm:text-base text-stone-600 dark:text-stone-400">لا توجد طلبات معلقة حالياً! جميع الوجبات قد سُلِّمت.</p>
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
        <div className="bg-white dark:bg-stone-900 rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-5">
            <div>
              <h2 className="font-black text-stone-900 dark:text-white text-base sm:text-lg">
                إجمالي كل الأصناف (مسلمة + قيد الانتظار)
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">السجل التراكمي الكامل لجميع الطلبات</p>
            </div>
            <div className="text-[11px] text-orange-600 dark:text-orange-400 font-bold sm:hidden flex items-center gap-1">
              <span>اسحب الجدول أفقياً لرؤية جميع الأرقام</span>
            </div>
          </div>

          {/* Print-friendly & responsive scrollable table */}
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-xs sm:text-sm min-w-[500px]">
              <thead>
                <tr className="border-b-2 border-stone-100 dark:border-stone-800 text-[11px] sm:text-xs font-black text-stone-500 uppercase tracking-wider">
                  <th className="py-2.5 sm:py-3 text-right w-8">#</th>
                  <th className="py-2.5 sm:py-3 text-right">الصنف</th>
                  <th className="py-2.5 sm:py-3 text-right">القسم</th>
                  <th className="py-2.5 sm:py-3 text-center whitespace-nowrap">قيد الانتظار</th>
                  <th className="py-2.5 sm:py-3 text-center whitespace-nowrap">سُلِّم</th>
                  <th className="py-2.5 sm:py-3 text-center whitespace-nowrap">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {totals.allTotals.map((item, i) => (
                  <tr key={item.foodItemId} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                    <td className="py-2.5 sm:py-3 text-stone-400 text-xs">{i + 1}</td>
                    <td className="py-2.5 sm:py-3 font-extrabold text-stone-900 dark:text-stone-100 leading-tight">
                      {item.foodName}
                    </td>
                    <td className="py-2.5 sm:py-3 text-stone-500 text-xs whitespace-nowrap">{item.categoryName}</td>
                    <td className="py-2.5 sm:py-3 text-center font-black text-amber-600 dark:text-amber-400">{item.pendingQuantity}</td>
                    <td className="py-2.5 sm:py-3 text-center font-black text-emerald-600 dark:text-emerald-400">{item.deliveredQuantity}</td>
                    <td className="py-2.5 sm:py-3 text-center font-black text-orange-600 dark:text-orange-400 text-sm sm:text-base">{item.totalQuantity}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80">
                <tr>
                  <td colSpan={3} className="py-3 px-2 font-black text-stone-900 dark:text-white text-xs sm:text-sm">المجموع الإجمالي</td>
                  <td className="py-3 text-center font-black text-amber-600 dark:text-amber-400 text-sm sm:text-base whitespace-nowrap">
                    {totals.allTotals.reduce((s, i) => s + i.pendingQuantity, 0)}
                  </td>
                  <td className="py-3 text-center font-black text-emerald-600 dark:text-emerald-400 text-sm sm:text-base whitespace-nowrap">
                    {totals.allTotals.reduce((s, i) => s + i.deliveredQuantity, 0)}
                  </td>
                  <td className="py-3 text-center font-black text-orange-600 dark:text-orange-400 text-base sm:text-xl whitespace-nowrap">
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
