'use client';

import React, { useState, useEffect, useMemo, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FoodItem, Category, Restaurant } from '@/lib/types';
import FoodCard from '@/components/FoodCard';
import CategoryIcon from '@/components/CategoryIcon';
import { useCart } from '@/context/CartContext';
import { Search, Heart, Sparkles, Store, ArrowRight, ShoppingBag, MapPin, Phone, UtensilsCrossed, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  params: Promise<{ id: string }>;
}

export default function RestaurantMenuPage({ params }: Props) {
  const { id } = use(params);

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [studentDiscount, setStudentDiscount] = useState<{ discountPercent: number; active: boolean } | null>(null);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const { favorites, selectedRestaurant, setSelectedRestaurant, setIsCartOpen, totalItems } = useCart();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [restRes, foodsRes, catsRes] = await Promise.all([
          fetch(`/api/restaurants/${id}`),
          fetch(`/api/foods?restaurantId=${id}`),
          fetch('/api/categories'),
        ]);

        if (!restRes.ok) { setNotFound(true); return; }

        const restData = await restRes.json();
        const foodsData = await foodsRes.json();
        const catsData = await catsRes.json();

        setRestaurant(restData.restaurant);
        setStudentDiscount(restData.studentDiscount || null);
        setFoods(foodsData.foods || []);
        setCategories(catsData.categories || []);

        // Auto-select this restaurant in cart context
        if (restData.restaurant) {
          setSelectedRestaurant(restData.restaurant);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const filteredFoods = useMemo(() => {
    return foods.filter((item) => {
      if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) return false;
      if (onlyFavorites && !favorites.includes(item.id)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [foods, selectedCategory, searchQuery, onlyFavorites, favorites]);

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <Store className="w-16 h-16 text-stone-300 mx-auto" />
        <h2 className="text-2xl font-black text-stone-800 dark:text-white">المطعم غير موجود</h2>
        <p className="text-stone-500">لم يتم العثور على هذا المطعم أو أنه غير متاح حالياً</p>
        <Link href="/restaurants" className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-orange-500 text-white font-bold text-sm">
          <ArrowRight className="w-4 h-4" />
          العودة للمطاعم
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Back Button */}
      <Link
        href="/restaurants"
        className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-orange-600 dark:text-stone-400 dark:hover:text-orange-400 font-semibold transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        العودة لقائمة المطاعم
      </Link>

      {/* Restaurant Hero */}
      {loading ? (
        <div className="h-56 rounded-3xl bg-stone-200 dark:bg-stone-800 animate-pulse" />
      ) : restaurant && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-lg"
        >
          {/* Background image */}
          <div className="relative h-44 sm:h-56">
            <Image
              src={restaurant.image || '/images/sandwich-foul.jpg'}
              alt={restaurant.name}
              fill
              className="object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = '/images/sandwich-foul.jpg'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-4 right-4 sm:right-6 text-white">
              <h1 className="text-2xl sm:text-3xl font-black">{restaurant.name}</h1>
              {restaurant.description && (
                <p className="text-sm text-white/80 mt-1 max-w-sm">{restaurant.description}</p>
              )}
            </div>
          </div>

          {/* Info Bar */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-stone-900">
            {restaurant.address && (
              <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                {restaurant.address}
              </div>
            )}
            {restaurant.phone && (
              <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                <Phone className="w-3.5 h-3.5 text-orange-500" />
                {restaurant.phone}
              </div>
            )}
            <div className="mr-auto flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              <UtensilsCrossed className="w-3.5 h-3.5 text-orange-500" />
              {foods.length} صنف متاح
            </div>

            {/* Student Discount Banner */}
            {studentDiscount && studentDiscount.active && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-emerald-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-black">
                <GraduationCap className="w-4 h-4 text-orange-500" />
                <span>خصم خاص للطلاب المعتمدين: {studentDiscount.discountPercent}% على جميع الأصناف 🎓</span>
              </div>
            )}

            {/* Cart quick access */}
            {totalItems > 0 && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                السلة ({totalItems})
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute right-4 top-3.5 text-stone-400" />
          <input
            type="text"
            placeholder={`ابحث في منيو ${restaurant?.name || 'المطعم'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-11 pl-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 text-sm font-medium border-0 focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-stone-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute left-3 top-3 text-xs text-stone-400 hover:text-stone-600">مسح</button>
          )}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
              onlyFavorites
                ? 'bg-red-500 text-white border-red-500 shadow-md'
                : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
            }`}
          >
            <Heart className={`w-4 h-4 ${onlyFavorites ? 'fill-white' : 'text-red-500'}`} />
            المفضلة ({favorites.length})
          </button>
          <span className="text-xs font-bold text-stone-500 bg-stone-100 dark:bg-stone-800 px-3 py-2 rounded-xl">
            {filteredFoods.length} صنف
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-extrabold shrink-0 transition-all ${
            selectedCategory === 'all'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          الكل ({foods.length})
        </button>
        {categories.filter(c => foods.some(f => f.categoryId === c.id)).map((cat) => {
          const count = foods.filter((f) => f.categoryId === cat.id).length;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-extrabold shrink-0 transition-all ${
                isSelected
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
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

      {/* Foods Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-80 rounded-3xl bg-stone-200 dark:bg-stone-800 animate-pulse" />
          ))}
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
          <Search className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="font-bold text-stone-700 dark:text-stone-300">لم نجد أصناف تطابق بحثك</p>
          <button
            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); setOnlyFavorites(false); }}
            className="mt-3 px-5 py-2.5 rounded-2xl bg-orange-500 text-white font-bold text-xs"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredFoods.map((food) => (
              <motion.div
                key={food.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <FoodCard food={food} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
