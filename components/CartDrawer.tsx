'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowLeft, CheckCircle2, User, Phone, Sparkles, Check, GraduationCap, Lock, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';

const QUICK_NOTES = [
  'طحينة زيادة',
  'بدون شطة',
  'شطة زيادة',
  'ليمون زيادة',
  'كاتشب إضافي',
  'بدون مخلل',
  'العيش محمص',
];

export default function CartDrawer() {
  const {
    items,
    totalItems,
    totalPrice,
    selectedRestaurant,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    updateItemNotes,
    removeFromCart,
    clearCart,
    submitOrder,
    isSubmitting,
  } = useCart();

  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isDashboardRoute =
    pathname.startsWith('/admin') ||
    pathname === '/restaurant' ||
    pathname.startsWith('/restaurant/') ||
    pathname.startsWith('/restaurant-dashboard');

  if (isDashboardRoute) {
    return null;
  }

  const toggleNote = (preset: string) => {
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
  };

  const handleConfirm = async () => {
    setErrorMsg('');
    if (!user) {
      setErrorMsg('يجب تسجيل الدخول بحسابك أولاً لتأكيد طلبك');
      setIsCartOpen(false);
      router.push('/login');
      return;
    }

    const order = await submitOrder(notes);
    if (order) {
      setNotes('');
      router.push('/my-orders');
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 pr-0 sm:pl-10">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="w-screen max-w-md bg-white dark:bg-stone-900 shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-800/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-stone-900 dark:text-white">
                      عربة التسوق
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      إجمالي الأصناف: <span className="font-bold text-orange-600">{totalItems}</span>
                    </p>
                    {selectedRestaurant && (
                      <p className="text-[11px] text-orange-600 dark:text-orange-400 font-black mt-0.5">
                        🍽 طلب من: {selectedRestaurant.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {items.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="text-xs text-stone-400 hover:text-red-500 flex items-center gap-1 p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                      title="تفريغ السلة"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>مسح</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body: Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-stone-100 dark:divide-stone-800">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                    <div className="w-20 h-20 rounded-3xl bg-orange-100 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center">
                      <ShoppingBag className="w-10 h-10 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">
                        عربتك فارغة حالياً
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs">
                        اختار وجباتك المفضلة من مطاعم الجامعة وأضفها إلى السلة لتأكيد طلبك
                      </p>
                    </div>
                    <Link
                      href="/restaurants"
                      onClick={() => setIsCartOpen(false)}
                      className="px-6 py-2.5 rounded-2xl bg-orange-500 text-white font-bold text-sm shadow-md shadow-orange-500/25 hover:bg-orange-600 transition-all"
                    >
                      تصفح المطاعم الآن
                    </Link>
                  </div>
                ) : (
                  items.map((item) => {
                    const { id, food, quantity, notes: itemNote } = item;
                    return (
                      <div key={id} className="pt-4 first:pt-0 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 shrink-0">
                            <Image src={food.image} alt={food.name} fill className="object-cover" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100 truncate">
                              {food.name}
                            </h4>
                            <div className="text-xs text-orange-600 font-semibold mt-0.5">
                              {food.price > 0 ? `${food.price} ج.م` : 'مجاني/مشترك'}
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5">
                                <button
                                  onClick={() => updateQuantity(id, quantity - 1)}
                                  className="w-6 h-6 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-orange-600"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="px-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                                  {quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(id, quantity + 1)}
                                  className="w-6 h-6 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-orange-600"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <button
                                onClick={() => removeFromCart(id)}
                                className="text-stone-400 hover:text-red-500 p-1"
                                title="حذف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {food.price > 0 && (
                            <div className="font-black text-sm text-stone-800 dark:text-stone-200 shrink-0">
                              {food.price * quantity} ج.م
                            </div>
                          )}
                        </div>

                        {/* Note under item (ملاحظة تحت الطلب) */}
                        <div className="bg-orange-50/60 dark:bg-stone-850/80 p-2.5 rounded-2xl border border-orange-100 dark:border-stone-800 space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-orange-500 shrink-0" />
                              <span>ملاحظة تحت الوجبة:</span>
                            </span>
                            {itemNote && (
                              <button
                                type="button"
                                onClick={() => updateItemNotes(id, '')}
                                className="text-[10px] text-stone-400 hover:text-red-500"
                              >
                                مسح
                              </button>
                            )}
                          </div>

                          {/* Quick Chips for this item */}
                          <div className="flex flex-wrap gap-1">
                            {['طحينة زيادة', 'منغير سلطة', 'بدون شطة', 'شطة زيادة', 'ليمون زيادة'].map((preset) => {
                              const isSelected = (itemNote || '').includes(preset);
                              return (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => {
                                    const parts = (itemNote || '')
                                      .split(/[,،]+/)
                                      .map((s) => s.trim())
                                      .filter(Boolean);
                                    let newNote = '';
                                    if (parts.includes(preset)) {
                                      newNote = parts.filter((p) => p !== preset).join('، ');
                                    } else {
                                      newNote = [...parts, preset].join('، ');
                                    }
                                    updateItemNotes(id, newNote);
                                  }}
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all border ${
                                    isSelected
                                      ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                                      : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-orange-300'
                                  }`}
                                >
                                  {isSelected ? '✓ ' : '+ '}{preset}
                                </button>
                              );
                            })}
                          </div>

                          <input
                            type="text"
                            placeholder="مثال: طحينة زيادة، منغير سلطة..."
                            value={itemNote || ''}
                            onChange={(e) => updateItemNotes(id, e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-orange-500 placeholder:text-stone-400"
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer Checkout Form */}
              {items.length > 0 && (
                <div className="p-5 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/90 space-y-4">
                  
                  {/* Must Login Card if guest */}
                  {!user ? (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-stone-800 dark:to-orange-950/30 border border-orange-200 dark:border-orange-900/50 space-y-3 text-center">
                      <div className="w-10 h-10 rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto shadow-xs">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black text-stone-900 dark:text-white">
                          يلزم تسجيل الدخول لتأكيد الطلب
                        </p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                          الطلب متاح حصرياً للطلاب وأعضاء الجامعة المسجلين بحساب لتسليم الطلب ومتابعته.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Link
                          href="/login"
                          onClick={() => setIsCartOpen(false)}
                          className="py-2.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>تسجيل الدخول</span>
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setIsCartOpen(false)}
                          className="py-2.5 px-3 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs border border-stone-200 dark:border-stone-700 flex items-center justify-center gap-1 transition-colors"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>حساب جديد</span>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 shadow-xs">
                      <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-stone-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                          {user.phone}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        حساب مسجل ✓
                      </span>
                    </div>
                  )}

                  {/* Delivery Location / Special Notes */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span>ملاحظات خاصة بالأكل (طحينة، شطة...):</span>
                      </label>
                    </div>

                    {/* Quick Preset Chips */}
                    <div className="flex flex-wrap gap-1">
                      {QUICK_NOTES.map((preset) => {
                        const isSelected = notes.includes(preset);
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => toggleNote(preset)}
                            className={`text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full font-bold transition-all border inline-flex items-center gap-1 ${
                              isSelected
                                ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/20'
                                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-orange-300'
                            }`}
                          >
                            {isSelected ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : '+'}
                            <span>{preset}</span>
                          </button>
                        );
                      })}
                    </div>

                    <textarea
                      rows={2}
                      placeholder="مثال: طحينة زيادة، بدون شطة، أو مكان التواجد بالجامعة..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-orange-500 resize-none transition-colors"
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-xs text-red-600 dark:text-red-400 font-bold">{errorMsg}</p>
                  )}

                  {/* Student discount active indicator */}
                  {user?.role === 'STUDENT' && user?.status === 'ACTIVE' && (
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-emerald-600" />
                        <span>خصم الطلاب:</span>
                      </span>
                      <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                        مفعّل تلقائياً 🎓
                      </span>
                    </div>
                  )}

                  {/* Summary & Submit Button */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-500">إجمالي الأصناف ({totalItems} قطعة):</span>
                    <span className="font-extrabold text-stone-900 dark:text-white text-base">
                      {totalPrice > 0 ? `${totalPrice} ج.م` : 'مجاني'}
                    </span>
                  </div>

                  {!user ? (
                    <Link
                      href="/login"
                      onClick={() => setIsCartOpen(false)}
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
                    >
                      <Lock className="w-4 h-4" />
                      <span>سجل دخولك لتأكيد الطلب</span>
                    </Link>
                  ) : (
                    <button
                      onClick={handleConfirm}
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black text-base shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>جاري تأكيد الطلب...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          <span>تأكيد الطلب الآن</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
