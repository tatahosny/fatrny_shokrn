'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { FoodItem, Category } from '@/lib/types';
import FoodCard from '@/components/FoodCard';
import { useCart } from '@/context/CartContext';
import { Search, Heart, Sparkles, SlidersHorizontal, Utensils } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function MenuContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [loading, setLoading] = useState(true);

  const { favorites } = useCart();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [foodsRes, catsRes] = await Promise.all([
          fetch('/api/foods'),
          fetch('/api/categories'),
        ]);

        const foodsData = await foodsRes.json();
        const catsData = await catsRes.json();

        setFoods(foodsData.foods || []);
        setCategories(catsData.categories || []);
      } catch (err) {
        console.error('Error fetching menu:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Update selected category when query parameter changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Filter foods by category, search query, and favorites
  const filteredFoods = useMemo(() => {
    return foods.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
        return false;
      }

      // Favorites filter
      if (onlyFavorites && !favorites.includes(item.id)) {
        return false;
      }

      // Search filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = item.name.toLowerCase().includes(q);
        const descMatch = item.description.toLowerCase().includes(q);
        const catMatch = item.categoryName?.toLowerCase().includes(q);
        return nameMatch || descMatch || catMatch;
      }

      return true;
    });
  }, [foods, selectedCategory, searchQuery, onlyFavorites, favorites]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-black">
          <Utensils className="w-3.5 h-3.5" />
          <span>منيو الإفطار الكامل لجامعة برج العرب</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white">
          قائمة الطعام ووجبات الإفطار 🍳
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
          أكثر من 55 صنفاً مصرياً أصيلاً موزعة على 9 تصنيفات مختلفة.. اطلب اللي يفتح نفسك!
        </p>
      </div>

      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
        
        {/* Search Input */}
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
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-3 text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              مسح
            </button>
          )}
        </div>

        {/* Favorites & Results Counter */}
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
            <span>المفضلة ({favorites.length})</span>
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
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold shrink-0 transition-all ${
            selectedCategory === 'all'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
          }`}
        >
          🍳 الكل ({foods.length})
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = foods.filter((f) => f.categoryId === cat.id).length;
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
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/25 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Foods Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-12">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-80 rounded-3xl bg-stone-200 dark:bg-stone-800 animate-pulse" />
          ))}
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center mx-auto text-2xl">
            🔍
          </div>
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">
            لم نجد أي صنف يطابق بحثك!
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً مثل الفول أو الشاورما أو البيتزا
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setOnlyFavorites(false);
            }}
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
