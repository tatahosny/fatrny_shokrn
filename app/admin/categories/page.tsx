import React from 'react';
import { db } from '@/lib/db';
import { Layers, Sparkles, Utensils } from 'lucide-react';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const [categories, foods] = await Promise.all([
    db.getCategories(),
    db.getFoodItems(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white flex items-center gap-3">
          <Layers className="w-7 h-7 text-orange-500" />
          <span>إدارة أقسام وتصنيفات الطعام</span>
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          قائمة التصنيفات المعتمدة في النظام ومربوطة بقاعدة بيانات Neon
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const catFoods = foods.filter((f) => f.categoryId === cat.id);

          return (
            <div
              key={cat.id}
              className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm space-y-4 hover:border-orange-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-2xl flex items-center justify-center border border-orange-200 dark:border-orange-900/40">
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-stone-900 dark:text-white">
                      {cat.name}
                    </h3>
                    <span className="text-xs text-stone-400 font-mono">#{cat.slug}</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold">
                  {catFoods.length} أصناف
                </span>
              </div>

              {/* Sample foods chips */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
                {catFoods.slice(0, 4).map((f) => (
                  <span
                    key={f.id}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 font-medium"
                  >
                    {f.name} ({f.price} ج.م)
                  </span>
                ))}
                {catFoods.length > 4 && (
                  <span className="text-[11px] px-2 py-1 rounded-lg bg-orange-50 text-orange-600 font-bold">
                    +{catFoods.length - 4} أخرى
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
