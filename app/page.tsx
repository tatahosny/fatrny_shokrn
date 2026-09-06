import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import FoodCard from '@/components/FoodCard';
import {
  Utensils,
  Flame,
  Clock,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowLeft,
  Crown,
  ChevronLeft,
  CheckCircle2,
  Users,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const categories = await db.getCategories();
  const allFoods = await db.getFoodItems();
  const popularFoods = allFoods.slice(0, 8);
  const leaderboard = await db.getLeaderboard();
  const totals = await db.getAggregatedFoodTotals();

  return (
    <div className="flex flex-col gap-16 pb-20 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-orange-50/80 via-amber-50/40 to-transparent dark:from-stone-900/80 dark:via-stone-950/40 dark:to-transparent">
        {/* Background decorative glows */}
        <div className="absolute top-1/4 right-5 w-72 h-72 bg-orange-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-5 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Right text column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-right">
              
              {/* University Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-orange-400 text-xs sm:text-sm font-black shadow-sm">
                <span className="text-base">🎓</span>
                <span>جامعة برج العرب التكنولوجية (BATU)</span>
                <span className="text-orange-400">•</span>
                <span className="font-bold">فريق إدارة التقديمات</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 dark:text-white leading-[1.15] tracking-tight">
                فطرني شكراً <span className="inline-block animate-bounce">🍳</span>
                <span className="block mt-2 text-2xl sm:text-3xl lg:text-4xl bg-gradient-to-r from-orange-600 via-amber-500 to-red-500 bg-clip-text text-transparent">
                  اطلب فطارك وسيب الباقي على فريق التقديمات!
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                المنصة الرسمية لتنظيم وتجميع طلبات الفطار الصباحي في الجامعة. فول، فلافل، شاورما، فطير فلاحي، وبيتزا طازة.. اطلب في ثوانٍ وتابع تسليم طلبك خطوة بخطوة.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/menu"
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black text-base sm:text-lg shadow-xl shadow-orange-500/30 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
                >
                  <Utensils className="w-5 h-5" />
                  <span>اطلب دلوقتي 🍽️</span>
                </Link>

                <Link
                  href="/leaderboard"
                  className="px-7 py-4 rounded-2xl bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 hover:text-orange-600 dark:hover:text-orange-400 font-extrabold text-base border border-stone-200 dark:border-stone-700 shadow-md hover:border-orange-300 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2.5"
                >
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span>شوف الأكثر طلباً 🔥</span>
                </Link>
              </div>

              {/* Quick Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-3 border-t border-orange-100 dark:border-stone-800/80 max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-right">
                  <div className="text-xl sm:text-2xl font-black text-orange-600">55+</div>
                  <div className="text-xs text-stone-500 font-bold">صنف إفطار مصري</div>
                </div>
                <div className="text-center lg:text-right">
                  <div className="text-xl sm:text-2xl font-black text-amber-500">{totals.totalActiveItemsCount}+</div>
                  <div className="text-xs text-stone-500 font-bold">وجبة مطلوبة اليوم</div>
                </div>
                <div className="text-center lg:text-right">
                  <div className="text-xl sm:text-2xl font-black text-emerald-600">100%</div>
                  <div className="text-xs text-stone-500 font-bold">تنسيق وتتبع فوري</div>
                </div>
              </div>

            </div>

            {/* Left image / graphic column - مربوط مباشرة بقاعدة بيانات Neon */}
            <div className="lg:col-span-5 relative flex justify-center">
              {(() => {
                const featured = allFoods.find((f) => f.available && f.image) || allFoods[0];
                const secondary = allFoods.find((f) => f.id !== featured?.id && f.available) || allFoods[1];

                return (
                  <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/20 border-4 border-white dark:border-stone-800 group">
                    {/* Real Food Image from Neon Database */}
                    <Image
                      src={featured?.image || '/images/sandwich-foul.jpg'}
                      alt={featured?.name || 'فطار مصري طازج'}
                      fill
                      priority
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-stone-950/40" />

                    {/* Floating Badge: King of Breakfast */}
                    {leaderboard.kingOfBreakfast && (
                      <div className="absolute top-4 right-4 bg-stone-900/90 backdrop-blur-md border border-amber-500/40 p-3 rounded-2xl shadow-xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
                          👑
                        </div>
                        <div>
                          <div className="text-[10px] text-amber-300 font-bold">ملك الفطار اليوم</div>
                          <div className="text-xs font-black text-white">{leaderboard.kingOfBreakfast.userName}</div>
                        </div>
                      </div>
                    )}

                    {/* Floating Chip: Secondary Real Food from Database */}
                    {secondary && (
                      <div className="absolute top-4 left-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200 dark:border-stone-700/80 p-2 rounded-2xl shadow-lg flex items-center gap-2 max-w-[160px]">
                        <div className="relative w-8 h-8 rounded-xl overflow-hidden shrink-0 border border-orange-200 dark:border-stone-700">
                          <Image
                            src={secondary.image}
                            alt={secondary.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div className="truncate">
                          <div className="text-[10px] font-extrabold text-stone-900 dark:text-white truncate">
                            {secondary.name}
                          </div>
                          <div className="text-[10px] font-black text-orange-600">
                            {secondary.price} ج.م
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Featured Dish Details Card at Bottom */}
                    <div className="absolute bottom-4 left-4 right-4 bg-stone-900/95 backdrop-blur-md p-4 rounded-2xl border border-stone-800 shadow-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-extrabold border border-orange-500/30">
                            {featured?.categoryName || 'إفطار مصري'}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            متاح للطلب الآن
                          </span>
                        </div>
                        <div className="text-sm font-black text-orange-400">
                          {featured?.price} <span className="text-[10px] text-stone-400 font-normal">ج.م</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-black text-white">{featured?.name}</h3>
                          <p className="text-[11px] text-stone-400 truncate max-w-[220px]">
                            {featured?.description || 'تجهيز سريع وطازج في الحرم الجامعي'}
                          </p>
                        </div>
                        <Link
                          href="/menu"
                          className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] shrink-0 transition-colors shadow-md shadow-orange-500/30"
                        >
                          اطلب الصنف
                        </Link>
                      </div>
                    </div>

                  </div>
                );
              })()}
            </div>

          </div>
        </div>
      </section>

      {/* 2. THE 9 CATEGORIES BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>الأقسام الرئيسية الـ 9</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">
              كل اللي نفسك فيه للإفطار 🥪
            </h2>
          </div>
          <Link
            href="/menu"
            className="flex items-center gap-1 text-sm font-bold text-orange-600 hover:text-orange-700 group"
          >
            <span>عرض كل الأصناف</span>
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/menu?category=${cat.id}`}
              className="group flex flex-col items-center p-3 sm:p-4 rounded-2xl bg-white dark:bg-stone-800/80 border border-orange-100 dark:border-stone-800 hover:border-orange-300 dark:hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-1 transition-all text-center"
            >
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden mb-2.5 shadow-sm group-hover:scale-105 transition-transform bg-stone-100">
                <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                <span className="absolute inset-0 flex items-center justify-center text-xl bg-black/25">
                  {cat.icon}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-black text-stone-800 dark:text-stone-200 group-hover:text-orange-600 transition-colors line-clamp-1">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. HOW IT WORKS (SECTION 23) */}
      <section className="bg-gradient-to-br from-amber-500/5 via-orange-500/10 to-red-500/5 dark:from-stone-900/60 dark:to-stone-900/40 py-16 border-y border-orange-100 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="max-w-2xl mx-auto space-y-3 mb-12">
            <span className="px-3.5 py-1 rounded-full bg-orange-500/10 text-orange-600 text-xs font-bold">
              إزاي السيستم بيشتغل؟ 🚀
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">
              اطلب فطارك في 3 خطوات بسيطة
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              وفر وقتك ومجهودك وركز في يومك بالجامعة، وإحنا هنوصل طلبك في أسرع وقت
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="relative p-6 rounded-3xl bg-white dark:bg-stone-800 shadow-sm border border-orange-100 dark:border-stone-700 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/15 text-orange-600 flex items-center justify-center text-3xl font-black">
                1️⃣
              </div>
              <h3 className="text-lg font-black text-stone-900 dark:text-white">سجل حسابك</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-xs">
                سجل باسمك ورقم تليفونك في ثوانٍ، لربط طلباتك وحفظ نقاطك في لوحة النشاط
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-3xl bg-white dark:bg-stone-800 shadow-sm border border-orange-100 dark:border-stone-700 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center text-3xl font-black">
                2️⃣
              </div>
              <h3 className="text-lg font-black text-stone-900 dark:text-white">اختار أكلك</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-xs">
                اختار اللي نفسك فيه من المنيو وحدد الكميات وحطه في عربة التسوق بضغطة زر
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-3xl bg-white dark:bg-stone-800 shadow-sm border border-orange-100 dark:border-stone-700 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center text-3xl font-black">
                3️⃣
              </div>
              <h3 className="text-lg font-black text-stone-900 dark:text-white">استلم طلبك</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-xs">
                تابع حالة طلبك لحظياً (قيد الانتظار ⏳ / تم التسليم ✅) واستلم فطارك سخن وبالهنا والشفا
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. POPULAR FOODS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4" />
              <span>أصناف مفضلة لدى الطلاب</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">
              الأكثر طلباً على سفرة الإفطار 🍽️
            </h2>
          </div>
          <Link
            href="/menu"
            className="px-4 py-2 rounded-xl bg-orange-50 dark:bg-stone-800 text-orange-600 dark:text-orange-400 font-bold text-xs hover:bg-orange-100 transition-colors"
          >
            تصفح كل الـ 55 صنفاً ←
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {popularFoods.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      </section>

      {/* 5. LEADERBOARD PREVIEW (SECTION 14) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 p-6 sm:p-10 text-white shadow-2xl border border-stone-800 relative overflow-hidden">
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>لوحة الشرف التنافسية للجامعة 🏆</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black leading-tight">
                مين متصدر قائمة الأكثر طلباً النهاردة؟ 🔥
              </h2>
              <p className="text-stone-400 text-xs sm:text-sm leading-relaxed max-w-xl">
                تنافس بين أعضاء فريق إدارة التقديمات والطلاب. احصل على ألقاب مميزة مثل &quot;ملك الفطار 👑&quot; و &quot;عاشق البيتزا 🍕&quot; مع كل طلب إفطار تقدمه!
              </p>
              
              <div className="pt-2">
                <Link
                  href="/leaderboard"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-sm shadow-lg shadow-amber-500/25 transition-all"
                >
                  <span>شاهد لوحة الشرف الكاملة والمتصدرين 🏆</span>
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Top 3 Podium Preview */}
            <div className="lg:col-span-5 bg-stone-800/80 backdrop-blur-md p-5 rounded-2xl border border-stone-700/60 space-y-3">
              <h3 className="text-xs font-black text-stone-400 uppercase tracking-wider mb-2">
                المراكز الثلاثة الأولى حالياً:
              </h3>

              {leaderboard.rankings.slice(0, 3).map((r, i) => (
                <div
                  key={r.userId}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    i === 0
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                      : i === 1
                      ? 'bg-stone-700/50 border-stone-600 text-stone-200'
                      : 'bg-stone-700/30 border-stone-700 text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                    </span>
                    <div>
                      <div className="font-black text-sm text-white">{r.userName}</div>
                      <div className="text-[11px] text-stone-400">{r.badge}</div>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-amber-400">{r.totalOrders} طلب</div>
                    <div className="text-[10px] text-stone-400">{r.totalItems} صنف</div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
