'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Restaurant, FoodItem } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import RestaurantCard from '@/components/RestaurantCard';
import { Store, ArrowLeft, UtensilsCrossed, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [foodCounts, setFoodCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { selectedRestaurant, setSelectedRestaurant } = useCart();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/restaurants?activeOnly=true');
        const data = await res.json();
        const rests: Restaurant[] = data.restaurants || [];
        setRestaurants(rests);

        // جلب عدد أصناف كل مطعم
        const counts: Record<string, number> = {};
        await Promise.all(
          rests.map(async (r) => {
            const fr = await fetch(`/api/foods?restaurantId=${r.id}`);
            const fd = await fr.json();
            counts[r.id] = (fd.foods || []).length;
          })
        );
        setFoodCounts(counts);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSelect = (r: Restaurant) => {
    setSelectedRestaurant(r.id === selectedRestaurant?.id ? null : r);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-black">
          <Store className="w-4 h-4" />
          المطاعم الشريكة
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white">
          اختار مطعمك المفضل
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 max-w-lg mx-auto leading-relaxed">
          اضغط على أي مطعم لاستعراض أصناف الإفطار، الأسعار والخصومات، والطلب مباشرة!
        </p>
      </div>

      {/* Selected Banner */}
      <AnimatePresence>
        {selectedRestaurant && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />
              <div>
                <p className="text-xs text-stone-500 dark:text-stone-400">المطعم المختار حالياً</p>
                <p className="font-black text-stone-900 dark:text-white">{selectedRestaurant.name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/restaurants/${selectedRestaurant.id}`}
                className="px-4 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold flex items-center gap-2 hover:bg-orange-600 transition-colors"
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                عرض المنيو
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs font-bold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                تغيير
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Restaurants Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 rounded-3xl bg-stone-200 dark:bg-stone-800 animate-pulse" />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
          <Store className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500 font-bold">لا توجد مطاعم متاحة حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((r) => (
            <RestaurantCard
              key={r.id}
              restaurant={r}
              onSelect={handleSelect}
              isSelected={selectedRestaurant?.id === r.id}
              foodCount={foodCounts[r.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
