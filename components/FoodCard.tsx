'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FoodItem, FoodVariant } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { Plus, Minus, ShoppingCart, Heart, Check, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FoodCardProps {
  food: FoodItem;
}

const QUICK_FOOD_NOTES = [
  'طحينة زيادة',
  'منغير سلطة',
  'بدون شطة',
  'شطة زيادة',
  'ليمون زيادة',
  'العيش محمص',
];

export default function FoodCard({ food }: FoodCardProps) {
  const [selectedVariant, setSelectedVariant] = useState<FoodVariant | null>(() => {
    if (food.variants && food.variants.length > 0) {
      return food.variants.find((v) => v.isDefault) || food.variants[0];
    }
    return null;
  });

  useEffect(() => {
    if (food.variants && food.variants.length > 0) {
      setSelectedVariant(food.variants.find((v) => v.isDefault) || food.variants[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [food]);

  const currentPrice = selectedVariant ? selectedVariant.price : food.price;

  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart, isFavorite, toggleFavorite } = useCart();
  const favorite = isFavorite(food.id);

  const handleToggleNote = (preset: string) => {
    setNotes((prev) => {
      const parts = prev
        .split(/[,،]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.includes(preset)) {
        return parts.filter((p) => p !== preset).join('، ');
      } else {
        return [...parts, preset].join('، ');
      }
    });
    if (!showNotes) setShowNotes(true);
  };

  const handleAdd = () => {
    const itemToAdd: FoodItem = selectedVariant
      ? {
          ...food,
          id: `${food.id}-${selectedVariant.name.replace(/\s+/g, '_')}`,
          name: `${food.name} (${selectedVariant.name})`,
          price: selectedVariant.price,
        }
      : food;

    addToCart(itemToAdd, quantity, notes);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setNotes('');
      setShowNotes(false);
    }, 1500);
  };

  const increment = () => setQuantity((q) => q + 1);
  const decrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col bg-white dark:bg-stone-800/90 rounded-3xl overflow-hidden border border-orange-100/80 dark:border-stone-700/60 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300"
    >
      {/* Food Image & Badges */}
      <div className="relative w-full h-48 overflow-hidden bg-stone-100 dark:bg-stone-900">
        <Image
          src={food.image}
          alt={food.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Category Badge */}
        {food.categoryName && (
          <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-orange-600/90 text-white backdrop-blur-md shadow-md">
            {food.categoryName}
          </span>
        )}

        {/* Favorite Button */}
        <button
          onClick={() => toggleFavorite(food.id)}
          className={`absolute top-3 left-3 p-2 rounded-full backdrop-blur-md transition-all active:scale-90 ${
            favorite
              ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
              : 'bg-white/80 dark:bg-stone-900/80 text-stone-600 dark:text-stone-300 hover:text-red-500'
          }`}
          aria-label="إضافة للمفضلة"
        >
          <Heart className={`w-4 h-4 ${favorite ? 'fill-white' : ''}`} />
        </button>

        {/* Price Tag */}
        {currentPrice > 0 && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-stone-950/80 backdrop-blur-md border border-white/10 text-white text-xs font-black shadow-md">
            {currentPrice} ج.م
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-grow p-5 justify-between gap-3">
        <div className="space-y-2">
          <div>
            <h3 className="text-lg font-black text-stone-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug">
              {food.name}
            </h3>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
              {food.description}
            </p>
          </div>

          {/* Variants Selector (نوع العيش / الحجم / الوزن) */}
          {food.variants && food.variants.length > 1 && (
            <div className="pt-2 border-t border-dashed border-stone-200 dark:border-stone-700/60 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 dark:text-stone-400">
                <span>
                  {food.categoryName?.includes('كيلو') || food.name.includes('كيلو')
                    ? 'الوزن / الكمية:'
                    : 'نوع العيش / الحجم:'}
                </span>
                <span className="text-orange-600 dark:text-orange-400 font-black">
                  {selectedVariant?.name} ({selectedVariant?.price} ج.م)
                </span>
              </div>
              <div className={`grid gap-1.5 ${food.variants.length > 2 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'}`}>
                {food.variants.map((v) => {
                  const isSelected = selectedVariant?.name === v.name;
                  const getVariantIcon = (name: string) => {
                    if (name.includes('بلدي')) return '🫓';
                    if (name.includes('فينو')) return '🥖';
                    if (name.includes('ملفوف') || name.includes('سوري')) return '🌯';
                    if (name.includes('كيلو') || name.includes('ربع') || name.includes('نص') || name.includes('ثمن')) return '⚖️';
                    return '✨';
                  };
                  return (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500 shadow-sm shadow-orange-500/20'
                          : 'bg-stone-50 dark:bg-stone-900/60 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-orange-400'
                      }`}
                    >
                      <span className="flex items-center gap-1 min-w-0">
                        <span className="shrink-0">{getVariantIcon(v.name)}</span>
                        <span className="truncate">{v.name}</span>
                      </span>
                      <span className={`text-[11px] font-extrabold shrink-0 mr-1 ${isSelected ? 'text-white' : 'text-orange-600 dark:text-orange-400'}`}>
                        {v.price}ج
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Single variant badge */}
          {food.variants && food.variants.length === 1 && (
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 text-[11px] font-bold border border-orange-200 dark:border-orange-900/40">
                <span>{food.variants[0].name}</span>
              </span>
            </div>
          )}
        </div>

        {/* Actions & Note under the order */}
        <div className="pt-2 flex flex-col gap-2.5 border-t border-stone-100 dark:border-stone-700/50">
          
          {/* Quantity Selector: [-] count [+] */}
          <div className="flex items-center justify-between bg-stone-100 dark:bg-stone-900/60 p-1 rounded-2xl">
            <button
              onClick={decrement}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-xl bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center font-bold hover:bg-orange-50 hover:text-orange-600 disabled:opacity-40 disabled:hover:bg-white transition-colors"
              aria-label="تقليل الكمية"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-extrabold text-sm text-stone-800 dark:text-stone-100 px-3">
              {quantity}
            </span>
            <button
              onClick={increment}
              className="w-8 h-8 rounded-xl bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center font-bold hover:bg-orange-50 hover:text-orange-600 transition-colors"
              aria-label="زيادة الكمية"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Note Under Food Item (ملاحظة تحت الطلب) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowNotes(!showNotes)}
                className="text-[11px] font-extrabold text-orange-600 dark:text-orange-400 hover:text-orange-700 flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-orange-500 shrink-0" />
                <span>{notes ? `ملاحظة: ${notes}` : 'ملاحظة خاصة بالطلب (طحينة، سلطة...)'}</span>
                {showNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {notes && (
                <button
                  type="button"
                  onClick={() => setNotes('')}
                  className="text-[10px] text-stone-400 hover:text-red-500 font-bold"
                >
                  مسح
                </button>
              )}
            </div>

            {/* Quick chips (Always visible compact or expandable) */}
            <div className="flex flex-wrap gap-1">
              {QUICK_FOOD_NOTES.slice(0, showNotes ? 6 : 3).map((preset) => {
                const isSelected = notes.includes(preset);
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleToggleNote(preset)}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all border ${
                      isSelected
                        ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-900/60 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-orange-300'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}{preset}
                  </button>
                );
              })}
            </div>

            {/* Expandable Custom Note Input */}
            <AnimatePresence>
              {showNotes && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden pt-1"
                >
                  <input
                    type="text"
                    placeholder="مثال: طحينة زيادة، منغير سلطة، بدون شطة..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-xl border border-orange-200 dark:border-stone-700 bg-orange-50/50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-orange-500 placeholder:text-stone-400"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAdd}
            className={`w-full py-2.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 ${
              isAdded
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>تمت الإضافة بنجاح</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>أضف إلى السلة</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
