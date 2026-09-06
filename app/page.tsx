import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import {
  Store,
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
  GraduationCap,
  MapPin,
  Phone,
  UtensilsCrossed,
} from 'lucide-react';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getCurrentUserFromCookie();
  if (session?.role === 'ADMIN') {
    redirect('/admin');
  }
  if (session?.role === 'RESTAURANT') {
    redirect('/restaurant');
  }
  const [restaurants, discounts, foodCounts, leaderboard, totals] = await Promise.all([
    db.getRestaurants(true),
    db.getStudentDiscounts(),
    db.getRestaurantFoodCounts(),
    db.getLeaderboard(),
    db.getAggregatedFoodTotals(),
  ]);

  const discountMap = new Map(
    discounts.filter((d) => d.active).map((d) => [d.restaurantId, d.discountPercent])
  );

  const totalDishes = Object.values(foodCounts).reduce((acc, c) => acc + c, 0);

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
                <GraduationCap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span>جامعة برج العرب التكنولوجية (BATU)</span>
                <span className="text-orange-400">•</span>
                <span className="font-bold">فريق إدارة التقديمات</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 dark:text-white leading-[1.15] tracking-tight">
                فطرني شكراً
                <span className="block mt-2 text-2xl sm:text-3xl lg:text-4xl bg-gradient-to-r from-orange-600 via-amber-500 to-red-500 bg-clip-text text-transparent">
                  مطاعم الحرم الجامعي في منصة واحدة!
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                المنصة الرسمية المعتمدة لتجميع وتنظيم طلبات الإفطار لطلاب وأعضاء هيئة التدريس بجامعة برج العرب التكنولوجية. اختر مطعمك المفضل، تصفح قائمته الخاصة، واستمتع بخصومات حصرية تصل لـ 25%!
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#restaurants-section"
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black text-base sm:text-lg shadow-xl shadow-orange-500/30 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
                >
                  <Store className="w-5 h-5" />
                  <span>استكشف المطاعم المتاحة ({restaurants.length})</span>
                </a>

                <Link
                  href="/leaderboard"
                  className="px-7 py-4 rounded-2xl bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 hover:text-orange-600 dark:hover:text-orange-400 font-extrabold text-base border border-stone-200 dark:border-stone-700 shadow-md hover:border-orange-300 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2.5"
                >
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span>لوحة الشرف والأكثر طلباً</span>
                </Link>
              </div>

              {/* Quick Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-3 border-t border-orange-100 dark:border-stone-800/80 max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-right">
                  <div className="text-xl sm:text-2xl font-black text-orange-600">{restaurants.length}</div>
                  <div className="text-xs text-stone-500 font-bold">مطاعم شريكة معتمدة</div>
                </div>
                <div className="text-center lg:text-right">
                  <div className="text-xl sm:text-2xl font-black text-amber-500">{totalDishes}+</div>
                  <div className="text-xs text-stone-500 font-bold">صنف إفطار متاح</div>
                </div>
                <div className="text-center lg:text-right">
                  <div className="text-xl sm:text-2xl font-black text-emerald-600">100%</div>
                  <div className="text-xs text-stone-500 font-bold">توصيل وتنسيق فوري</div>
                </div>
              </div>

            </div>

            {/* Left Column: Featured Restaurant Spotlight */}
            <div className="lg:col-span-5 relative flex justify-center">
              {(() => {
                const featured = restaurants[0];
                const secondary = restaurants[1] || restaurants[0];

                if (!featured) {
                  return (
                    <div className="w-full max-w-md aspect-square rounded-3xl bg-stone-100 dark:bg-stone-800/60 border-2 border-dashed border-stone-300 dark:border-stone-700 flex flex-col items-center justify-center p-8 text-center text-stone-400">
                      <Store className="w-16 h-16 mb-3 text-stone-300" />
                      <p className="font-bold">جاري إضافة المطاعم الشريكة...</p>
                    </div>
                  );
                }

                const featuredDiscount = discountMap.get(featured.id);

                return (
                  <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/20 border-4 border-white dark:border-stone-800 group">
                    <Image
                      src={featured.image || '/images/sandwich-foul.jpg'}
                      alt={featured.name}
                      fill
                      priority
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/40 to-stone-950/30" />

                    {/* Top Floating Badge: Verified Campus Partner */}
                    <div className="absolute top-4 right-4 bg-stone-900/90 backdrop-blur-md border border-amber-500/40 px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-[10px] text-amber-300 font-bold">شريك معتمد</div>
                        <div className="text-xs font-black text-white">جامعة برج العرب</div>
                      </div>
                    </div>

                    {/* Secondary Restaurant Floating Chip */}
                    {secondary && secondary.id !== featured.id && (
                      <Link
                        href={`/restaurants/${secondary.id}`}
                        className="absolute top-4 left-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200 dark:border-stone-700/80 p-2 rounded-2xl shadow-lg flex items-center gap-2.5 max-w-[170px] hover:scale-105 transition-all"
                      >
                        <div className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-orange-200 dark:border-stone-700">
                          <Image
                            src={secondary.image || '/images/sandwich-foul.jpg'}
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
                            {foodCounts[secondary.id] || 0} صنف
                          </div>
                        </div>
                      </Link>
                    )}

                    {/* Bottom Details Card for Featured Restaurant */}
                    <div className="absolute bottom-4 left-4 right-4 bg-stone-900/95 backdrop-blur-md p-4 rounded-2xl border border-stone-800 shadow-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-extrabold border border-orange-500/30">
                            {foodCounts[featured.id] || 0} صنف متاح
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            مفتوح للطلب الآن
                          </span>
                        </div>
                        {featuredDiscount && (
                          <div className="text-xs font-black text-indigo-400 flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5" />
                            خصم {featuredDiscount}%
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="min-w-0 pr-2">
                          <h3 className="text-base font-black text-white truncate">{featured.name}</h3>
                          <p className="text-[11px] text-stone-400 truncate">
                            {featured.address || 'الحرم الجامعي - جامعة برج العرب'}
                          </p>
                        </div>
                        <Link
                          href={`/restaurants/${featured.id}`}
                          className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shrink-0 transition-colors shadow-md shadow-orange-500/30 flex items-center gap-1.5"
                        >
                          <span>تصفح المنيو</span>
                          <ChevronLeft className="w-3.5 h-3.5" />
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

      {/* 2. RESTAURANTS SECTION (MAIN HIGHLIGHT) */}
      <section id="restaurants-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full scroll-mt-24">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-2">
              <Store className="w-4 h-4" />
              <span>المطاعم الشريكة في جامعة برج العرب</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white">
              اختر مطعمك وابدأ طلبك 🍴
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              جميع المطاعم مسجلة ومعتمدة لدى إدارة التقديمات. اختر المطعم لتصفح أصنافه وأسعاره بعد الخصم الطلابي.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3.5 py-1.5 rounded-xl bg-orange-50 dark:bg-stone-800 text-orange-600 dark:text-orange-400 text-xs font-black border border-orange-200 dark:border-stone-700">
              {restaurants.length} مطاعم متاحة الآن
            </span>
          </div>
        </div>

        {/* Restaurants Grid */}
        {restaurants.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-4">
            <Store className="w-16 h-16 text-stone-300 mx-auto" />
            <h3 className="text-xl font-black text-stone-800 dark:text-white">لا توجد مطاعم متاحة حالياً</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
              سيتم إضافة المطاعم الشريكة قريباً لتتمكن من تصفح المنيو والطلب مباشرة.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => {
              const discount = discountMap.get(restaurant.id);
              const count = foodCounts[restaurant.id] || 0;

              return (
                <div
                  key={restaurant.id}
                  className="group rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-orange-300 dark:hover:border-orange-500/50 shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1.5 transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Restaurant Cover Image */}
                    <div className="relative w-full h-48 bg-stone-100 dark:bg-stone-800 overflow-hidden">
                      <Image
                        src={restaurant.image || '/images/sandwich-foul.jpg'}
                        alt={restaurant.name}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                      {/* Student Discount Tag */}
                      {discount ? (
                        <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg flex items-center gap-1.5 border border-white/20">
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>خصم للطلاب %{discount}</span>
                        </span>
                      ) : (
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/50 backdrop-blur-md text-white/90 border border-white/10">
                          مطعم شريك
                        </span>
                      )}

                      {/* Available Count Badge */}
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 dark:bg-stone-900/90 backdrop-blur-md text-stone-800 dark:text-stone-200 border border-white/20">
                        {count} صنف
                      </span>

                      {/* Restaurant Name & Location in Banner */}
                      <div className="absolute bottom-3 right-3 left-3 text-white">
                        <h3 className="text-xl font-black leading-tight drop-shadow-md">
                          {restaurant.name}
                        </h3>
                        {restaurant.address && (
                          <div className="flex items-center gap-1.5 text-xs text-stone-300 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                            <span className="line-clamp-1">{restaurant.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Restaurant Body Description */}
                    <div className="p-5 space-y-3">
                      <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                        {restaurant.description || 'يقدم أشهى وجبات الإفطار الصباحية الطازجة يومياً لطلاب ومنسوبي الجامعة'}
                      </p>

                      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-stone-800">
                        {restaurant.phone && (
                          <div className="flex items-center gap-1.5 font-medium">
                            <Phone className="w-3.5 h-3.5 text-stone-400" />
                            <span dir="ltr">{restaurant.phone}</span>
                          </div>
                        )}
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mr-auto">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          متاح للطلب الآن
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Link to Restaurant Menu */}
                  <div className="p-5 pt-0">
                    <Link
                      href={`/restaurants/${restaurant.id}`}
                      className="w-full py-3 px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-sm shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2 group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-amber-500"
                    >
                      <UtensilsCrossed className="w-4 h-4" />
                      <span>تصفح منيو المطعم واطلب الآن</span>
                      <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. STUDENT CALLOUT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-orange-500 p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black">
              <Sparkles className="w-3.5 h-3.5" />
              <span>مبادرة دعم الطلاب — جامعة برج العرب التكنولوجية</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black leading-snug">
              أنت طالب بالجامعة؟ احصل على خصومات حصرية تصل لـ 25%!
            </h3>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-xl leading-relaxed">
              سجل حسابك كطالب وارفع صورة كرنيهك الجامعي. بعد اعتماد الكرنيه، ستظهر لك أسعار الوجبات المخفضة تلقائياً في منيو جميع المطاعم الشريكة.
            </p>
          </div>

          <Link
            href="/register"
            className="px-7 py-4 rounded-2xl bg-white text-indigo-950 hover:bg-indigo-50 font-black text-sm shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0 flex items-center gap-2"
          >
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <span>سجل كطالب واحصل على الخصم 🎓</span>
          </Link>
        </div>
      </section>

      {/* 4. HOW IT WORKS (3 STEPS) */}
      <section className="bg-gradient-to-br from-amber-500/5 via-orange-500/10 to-red-500/5 dark:from-stone-900/60 dark:to-stone-900/40 py-16 border-y border-orange-100 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="max-w-2xl mx-auto space-y-3 mb-12">
            <span className="px-3.5 py-1 rounded-full bg-orange-500/10 text-orange-600 text-xs font-bold">
              خطوات الطلب البسيطة
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
              <div className="w-16 h-16 rounded-2xl bg-orange-500/15 text-orange-600 flex items-center justify-center text-2xl font-black">
                01
              </div>
              <h3 className="text-lg font-black text-stone-900 dark:text-white">اختر مطعمك المفضل</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-xs">
                تصفح قائمة المطاعم الشريكة في الحرم الجامعي وافتح منيو المطعم الذي يناسب ذوقك اليوم
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-3xl bg-white dark:bg-stone-800 shadow-sm border border-orange-100 dark:border-stone-700 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center text-2xl font-black">
                02
              </div>
              <h3 className="text-lg font-black text-stone-900 dark:text-white">حدد أصنافك وسجل طلبك</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-xs">
                أضف الوجبات التي تفضلها إلى سلة التسوق، واستفد من خصم الطلاب التلقائي المعتمد
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-3xl bg-white dark:bg-stone-800 shadow-sm border border-orange-100 dark:border-stone-700 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center text-2xl font-black">
                03
              </div>
              <h3 className="text-lg font-black text-stone-900 dark:text-white">استلم فطارك طازجاً</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-xs">
                تابع حالة طلبك لحظة بلحظة واستلمه ساخناً وطازجاً في نقطة التسليم بالجامعة
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. LEADERBOARD PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 p-6 sm:p-10 text-white shadow-2xl border border-stone-800 relative overflow-hidden">
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>لوحة الشرف التنافسية للجامعة</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black leading-tight">
                من يتصدر قائمة الأكثر طلباً اليوم؟
              </h2>
              <p className="text-stone-400 text-xs sm:text-sm leading-relaxed max-w-xl">
                تنافس بين أعضاء فريق إدارة التقديمات والطلاب. احصل على ألقاب مميزة مثل &quot;ملك الفطار&quot; مع كل طلب إفطار تقدمه!
              </p>
              
              <div className="pt-2">
                <Link
                  href="/leaderboard"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-sm shadow-lg shadow-amber-500/25 transition-all"
                >
                  <span>شاهد لوحة الشرف الكاملة والمتصدرين</span>
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Top 3 Podium Preview */}
            <div className="lg:col-span-5 bg-stone-800/80 backdrop-blur-md p-5 rounded-2xl border border-stone-700/60 space-y-3">
              <h3 className="text-xs font-black text-stone-400 uppercase tracking-wider mb-2">
                المراكز الثلاثة الأولى حالياً:
              </h3>

              {leaderboard.rankings.length > 0 ? (
                leaderboard.rankings.slice(0, 3).map((r, i) => (
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
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                        i === 0
                          ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                          : i === 1
                          ? 'bg-stone-300 text-stone-900'
                          : 'bg-amber-700/60 text-amber-100'
                      }`}>
                        {i + 1}
                      </div>
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
                ))
              ) : (
                <div className="text-center py-6 px-4 rounded-xl bg-stone-900/50 border border-stone-700/40 text-stone-400 space-y-2">
                  <Sparkles className="w-6 h-6 text-amber-400 mx-auto opacity-80" />
                  <p className="font-bold text-sm text-stone-200">كن أول المتصدرين اليوم!</p>
                  <p className="text-xs text-stone-400">
                    اطلب إفطارك الآن وتصدّر لوحة الشرف التنافسية للجامعة.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
