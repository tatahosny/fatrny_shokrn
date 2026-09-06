'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FoodItem } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { Plus, Minus, ShoppingCart, Heart, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface FoodCardProps {
  food: FoodItem;
}

export default function FoodCard({ food }: FoodCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart, isFavorite, toggleFavorite } = useCart();
  const favorite = isFavorite(food.id);

  const handleAdd = () => {
    addToCart(food, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
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

        {/* Price Tag (Optional / Present) */}
        {food.price > 0 && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-stone-950/80 backdrop-blur-md border border-white/10 text-white text-xs font-black">
            {food.price} ج.م
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-grow p-5 justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-stone-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug">
            {food.name}
          </h3>
          <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
            {food.description}
          </p>
        </div>

        {/* Actions: Quantity Selector & Add Button */}
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
                <span>تمت الإضافة! 🍳</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>أضف للعربة 🛒</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
