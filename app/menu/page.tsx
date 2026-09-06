'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { FoodItem, Category, Restaurant } from '@/lib/types';
import FoodCard from '@/components/FoodCard';
import CategoryIcon from '@/components/CategoryIcon';
import { useCart } from '@/context/CartContext';
import { Search, Heart, Sparkles, Store, X, ChevronDown } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

function MenuContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedRestaurantFilter, setSelectedRestaurantFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRestaurantPicker, setShowRestaurantPicker] = useState(false);

  const { favorites, selectedRestaurant, setSelectedRestaurant } = useCart();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [foodsRes, catsRes, restsRes] = await Promise.all([
          fetch('/api/foods'),
          fetch('/api/categories'),
          fetch('/api/restaurants?activeOnly=true'),
        ]);

        const foodsData = await foodsRes.json();
        const catsData = await catsRes.json();
        const restsData = await restsRes.json();

        setFoods(foodsData.foods || []);
        setCategories(catsData.categories || []);
        setRestaurants(restsData.restaurants || []);
      } catch (err) {
        console.error('Error fetching menu:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  const filteredFoods = useMemo(() => {
    return foods.filter((item) => {
      if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) return false;
      if (onlyFavorites && !favorites.includes(item.id)) return false;
      if (selectedRestaurantFilter !== 'all' && item.restaurantId !== selectedRestaurantFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.categoryName?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [foods, selectedCategory, searchQuery, onlyFavorites, favorites, selectedRestaurantFilter]);

  const activeRestaurant = restaurants.find(r => r.id === selectedRestaurantFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-black">
          <Sparkles className="w-3.5 h-3.5" />
          قائمة الطعام الشاملة
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white">
          قائمة الطعام ووجبات الإفطار
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
          اطلب من مطعم محدد أو استعرض جميع الأصناف من كل المطاعم
        </p>
      </div>

      {/* Restaurant Filter Banner */}
      <div className="relative">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {/* All restaurants option */}
          <button
            onClick={() => setSelectedRestaurantFilter('all')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold shrink-0 transition-all ${
              selectedRestaurantFilter === 'all'
                ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-md'
                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            كل المطاعم ({foods.length})
          </button>

          {restaurants.map((r) => {
            const count = foods.filter(f => f.restaurantId === r.id).length;
            const isActive = selectedRestaurantFilter === r.id;
            return (
              <button
                key={r.id}
                onClick={() => {
                  setSelectedRestaurantFilter(r.id);
                  setSelectedRestaurant(r);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold shrink-0 transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-stone-700'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                {r.name}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/25 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}

          <Link
            href="/restaurants"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold shrink-0 transition-all bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 hover:bg-orange-100"
          >
            <Store className="w-3.5 h-3.5" />
            عرض صفحة المطاعم
          </Link>
        </div>
      </div>

      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute right-4 top-3.5 text-stone-400" />
          <input
            type="text"
            placeholder="ابحث عن فول، شاورما، فطير، بيتزا، طعمية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-11 pl-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 text-sm font-medium border-0 focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-stone-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute left-3 top-3 text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">مسح</button>
          )}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
              onlyFavorites
                ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/25'
                : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-red-300'
            }`}
          >
            <Heart className={`w-4 h-4 ${onlyFavorites ? 'fill-white' : 'text-red-500'}`} />
            المفضلة ({favorites.length})
          </button>
          <span className="text-xs font-bold text-stone-500 bg-stone-100 dark:bg-stone-800 px-3 py-2 rounded-xl">
            {filteredFoods.length} صنف متاح
          </span>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-extrabold shrink-0 transition-all ${
            selectedCategory === 'all'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          الكل ({filteredFoods.length})
        </button>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = filteredFoods.filter((f) => f.categoryId === cat.id).length;
          if (count === 0 && selectedRestaurantFilter !== 'all') return null;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-extrabold shrink-0 transition-all ${
                isSelected
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
              }`}
            >
              <CategoryIcon slug={cat.slug} name={cat.name} className="w-4 h-4" />
              {cat.name}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/25 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Restaurant Badge */}
      <AnimatePresence>
        {activeRestaurant && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800"
          >
            <div className="flex items-center gap-2 text-sm">
              <Store className="w-4 h-4 text-orange-500" />
              <span className="font-bold text-stone-800 dark:text-stone-200">تعرض منيو:</span>
              <span className="font-black text-orange-600 dark:text-orange-400">{activeRestaurant.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/restaurants/${activeRestaurant.id}`}
                className="text-[11px] font-bold text-orange-600 dark:text-orange-400 underline"
              >
                صفحة المطعم
              </Link>
              <button
                onClick={() => { setSelectedRestaurantFilter('all'); }}
                className="p-1 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
              >
                <X className="w-4 h-4 text-orange-500" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Foods Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-12">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-80 rounded-3xl bg-stone-200 dark:bg-stone-800 animate-pulse" />
          ))}
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center mx-auto">
            <Search className="w-7 h-7 text-stone-400" />
          </div>
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">لم نجد أي صنف يطابق بحثك!</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            جرب البحث بكلمات أخرى أو اختر تصنيفاً أو مطعماً مختلفاً
          </p>
          <button
            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); setOnlyFavorites(false); setSelectedRestaurantFilter('all'); }}
            className="px-5 py-2.5 rounded-2xl bg-orange-500 text-white font-bold text-xs shadow-md"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredFoods.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-12 text-center text-stone-500">جاري تحميل قائمة الطعام...</div>}>
      <MenuContent />
    </Suspense>
  );
}
