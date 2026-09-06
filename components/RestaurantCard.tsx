'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Restaurant } from '@/lib/types';
import { MapPin, Phone, ArrowLeft, CheckCircle2, UtensilsCrossed, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  restaurant: Restaurant;
  onSelect?: (r: Restaurant) => void;
  isSelected?: boolean;
  foodCount?: number;
}

export default function RestaurantCard({ restaurant, onSelect, isSelected, foodCount }: Props) {
  return (
    <Link
      href={`/restaurants/${restaurant.id}`}
      onClick={() => onSelect?.(restaurant)}
      className="block group select-none h-full"
    >
      <motion.div
        whileHover={{ y: -5, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className={`relative h-full flex flex-col rounded-3xl overflow-hidden border-2 transition-all duration-300 shadow-md group-hover:shadow-2xl ${
          isSelected
            ? 'border-orange-500 shadow-orange-500/20 ring-2 ring-orange-400/30'
            : 'border-stone-200 dark:border-stone-800 group-hover:border-orange-400 dark:group-hover:border-orange-500'
        }`}
      >
        {/* Selected Badge */}
        {isSelected && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-orange-500 text-white px-3 py-1 rounded-full text-[11px] font-black shadow-lg">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>المطعم المختار للطلب</span>
          </div>
        )}

        {/* Image */}
        <div className="relative h-44 w-full overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0">
          <Image
            src={restaurant.image || '/images/sandwich-foul.jpg'}
            alt={restaurant.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/sandwich-foul.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {foodCount !== undefined && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20 shadow-sm">
              <UtensilsCrossed className="w-3.5 h-3.5 text-orange-400" />
              <span>{foodCount} صنف متاح</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div
          className={`p-5 flex-1 flex flex-col justify-between space-y-3 transition-colors ${
            isSelected
              ? 'bg-orange-50/70 dark:bg-orange-950/20'
              : 'bg-white dark:bg-stone-900'
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-black text-lg text-stone-900 dark:text-white leading-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                {restaurant.name}
              </h3>
              <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all shrink-0">
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </div>
            </div>

            {restaurant.description && (
              <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                {restaurant.description}
              </p>
            )}

            <div className="flex flex-col gap-1.5 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
              {restaurant.address && (
                <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                  <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span className="truncate">{restaurant.address}</span>
                </div>
              )}
              {restaurant.phone && (
                <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                  <Phone className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span>{restaurant.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div
            className={`w-full py-2.5 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all mt-2 ${
              isSelected
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 group-hover:bg-orange-500 group-hover:text-white shadow-sm'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>استعراض المنيو والأصناف</span>
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
