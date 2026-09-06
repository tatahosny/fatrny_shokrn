'use client';

import React, { useEffect, useState } from 'react';
import { UserRanking } from '@/lib/types';
import { Crown, Flame, Trophy, Medal, Award, Star, TrendingUp, Users, ShoppingBag, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface LeaderboardData {
  rankings: UserRanking[];
  kingOfBreakfast: UserRanking | null;
  totalOrdersInSystem: number;
  totalItemsInSystem: number;
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/statistics/leaderboard')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const podium = data?.rankings.slice(0, 3) ?? [];
  const others = data?.rankings.slice(3) ?? [];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 rounded-3xl bg-stone-200 dark:bg-stone-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      
      {/* Hero Header */}
      <div className="text-center space-y-4 relative">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-black">
          <Flame className="w-4 h-4 text-amber-500" />
          <span>لوحة الشرف والنشاط التنافسية</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white leading-tight">
          الأكثر طلباً في <span className="text-amber-500">جامعة برج العرب</span>
        </h1>
        <p className="text-sm text-stone-500 max-w-xl mx-auto">
          لوحة الشرف التنافسية لفريق إدارة التقديمات. تنافس وارتقِ في الترتيب بكل طلب إفطار جديد!
        </p>

        {/* System Total Stats */}
        {data && (
          <div className="flex items-center justify-center gap-6 flex-wrap pt-2">
            <div className="flex items-center gap-2 text-sm">
              <ShoppingBag className="w-4 h-4 text-orange-500" />
              <span className="text-stone-500">إجمالي الطلبات:</span>
              <span className="font-black text-orange-600 text-base">{data.totalOrdersInSystem}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-stone-500">إجمالي الوجبات:</span>
              <span className="font-black text-emerald-600 text-base">{data.totalItemsInSystem}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-stone-500">المتنافسون:</span>
              <span className="font-black text-blue-600 text-base">{data.rankings.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* King of Breakfast Crown Banner */}
      {data?.kingOfBreakfast && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-6 sm:p-8 text-white shadow-2xl shadow-amber-500/30"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-right">
            <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-xl flex-shrink-0">
              <Crown className="w-12 h-12 text-amber-200" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold text-amber-100 uppercase tracking-wider">ملك الفطار الحالي في الجامعة</p>
              <h2 className="text-3xl sm:text-4xl font-black text-white">{data.kingOfBreakfast.userName}</h2>
              <div className="flex items-center justify-center sm:justify-start gap-4 text-sm flex-wrap">
                <span className="bg-white/20 px-3 py-1 rounded-full font-bold">
                  {data.kingOfBreakfast.totalOrders} طلب إفطار
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full font-bold">
                  {data.kingOfBreakfast.totalItems} وجبة مطلوبة
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full font-bold">
                  {data.kingOfBreakfast.badge}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Top 3 Podium */}
      {podium.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 items-end">
          {[podium[1], podium[0], podium[2]].map((r, i) => {
            const realRank = i === 0 ? 2 : i === 1 ? 1 : 3;
            const height = realRank === 1 ? 'h-40' : realRank === 2 ? 'h-32' : 'h-28';
            const bg = realRank === 1
              ? 'bg-gradient-to-b from-amber-400 to-amber-500 border-amber-300'
              : realRank === 2
              ? 'bg-gradient-to-b from-stone-400 to-stone-500 border-stone-300'
              : 'bg-gradient-to-b from-orange-700 to-orange-800 border-orange-600';

            return (
              <div key={r.userId} className="flex flex-col items-center gap-2 text-center">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 flex items-center justify-center text-2xl font-black text-stone-700 dark:text-stone-200 shadow-md">
                  {r.userName.charAt(0)}
                </div>
                <div className="text-xs font-extrabold text-stone-800 dark:text-stone-200 line-clamp-1">{r.userName}</div>
                <div className="text-[11px] text-stone-500">{r.totalOrders} طلب</div>
                
                {/* Podium Block */}
                <div className={`w-full ${height} ${bg} rounded-t-2xl border-2 flex items-center justify-center shadow-lg`}>
                  {realRank === 1 ? (
                    <Trophy className="w-9 h-9 text-amber-950" />
                  ) : realRank === 2 ? (
                    <Medal className="w-8 h-8 text-stone-900" />
                  ) : (
                    <Award className="w-7 h-7 text-orange-200" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Rankings Table */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h2 className="font-black text-stone-900 dark:text-white">قائمة الترتيب الكاملة</h2>
        </div>

        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {(!data?.rankings || data.rankings.length === 0) ? (
            <div className="p-12 text-center space-y-3">
              <Trophy className="w-12 h-12 text-amber-500/50 mx-auto" />
              <p className="text-base font-bold text-stone-700 dark:text-stone-300">
                لا توجد طلبات مسجلة للطلاب حتى الآن اليوم
              </p>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                لوحة الشرف مخصصة حصرياً للطلاب وأعضاء الجامعة. اطلب وجبتك الآن وكن أول من يحصل على لقب &quot;ملك الفطار&quot;!
              </p>
            </div>
          ) : (
            data.rankings.map((r, idx) => (
            <motion.div
              key={r.userId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="flex items-center gap-4 p-4 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
            >
              {/* Rank Number */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                r.rank === 1 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                r.rank === 2 ? 'bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300' :
                r.rank === 3 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' :
                'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
              }`}>
                {r.rank}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white font-bold flex items-center justify-center text-sm shrink-0">
                {r.userName.charAt(0)}
              </div>

              {/* Name & Badge */}
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-sm text-stone-900 dark:text-stone-100 truncate">{r.userName}</div>
                <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full font-bold mt-0.5 ${r.badgeColor}`}>
                  {r.badge}
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-right shrink-0">
                <div>
                  <div className="text-sm font-black text-orange-600 dark:text-orange-400">{r.totalOrders}</div>
                  <div className="text-[10px] text-stone-400">طلب</div>
                </div>
                <div>
                  <div className="text-sm font-black text-stone-700 dark:text-stone-300">{r.totalItems}</div>
                  <div className="text-[10px] text-stone-400">وجبة</div>
                </div>
              </div>
            </motion.div>
          )))}
        </div>
      </div>

      {/* CTA to order */}
      <div className="text-center py-6 bg-orange-50 dark:bg-orange-950/20 rounded-3xl border border-orange-100 dark:border-orange-900/40 space-y-3">
        <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
          اطلب إفطارك وارتقِ في الترتيب!
        </p>
        <Link href="/restaurants" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm shadow-md shadow-orange-500/25 transition-all">
          <Store className="w-4 h-4" />
          <span>تصفح المطاعم واطلب الآن</span>
        </Link>
      </div>
    </div>
  );
}
