'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowLeft, CheckCircle2, User, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const {
    items,
    totalItems,
    totalPrice,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    submitOrder,
    isSubmitting,
  } = useCart();

  const { user } = useAuth();
  const router = useRouter();

  const [notes, setNotes] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleConfirm = async () => {
    setErrorMsg('');
    if (!user && (!guestName.trim() || !guestPhone.trim())) {
      setErrorMsg('يرجى إدخال اسمك ورقم هاتفك أو تسجيل الدخول لتأكيد الطلب');
      return;
    }

    const order = await submitOrder(notes, guestName, guestPhone);
    if (order) {
      setNotes('');
      setGuestName('');
      setGuestPhone('');
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
                      عربة التسوق 🛒
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      إجمالي الأصناف: <span className="font-bold text-orange-600">{totalItems}</span>
                    </p>
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
                    <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center text-3xl">
                      🍳
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">
                        عربتك لسه فاضية!
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs">
                        اختار فطارك المفضل من أقسام الفول والشاورما والفطير والبيتزا وضيفه هنا
                      </p>
                    </div>
                    <Link
                      href="/menu"
                      onClick={() => setIsCartOpen(false)}
                      className="px-6 py-2.5 rounded-2xl bg-orange-500 text-white font-bold text-sm shadow-md shadow-orange-500/25 hover:bg-orange-600 transition-all"
                    >
                      تصفح المنيو دلوقتي 🍽️
                    </Link>
                  </div>
                ) : (
                  items.map(({ food, quantity }) => (
                    <div key={food.id} className="pt-4 first:pt-0 flex items-center gap-3">
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
                              onClick={() => updateQuantity(food.id, quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-orange-600"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                              {quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(food.id, quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-orange-600"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(food.id)}
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
                  ))
                )}
              </div>

              {/* Footer Checkout Form */}
              {items.length > 0 && (
                <div className="p-5 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/90 space-y-4">
                  
                  {/* Guest details if not logged in */}
                  {!user && (
                    <div className="space-y-2 p-3 rounded-2xl bg-orange-50/80 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/40">
                      <p className="text-xs font-bold text-orange-800 dark:text-orange-300">
                        بيانات استلام الطلب السريع (أو{' '}
                        <Link
                          href="/login"
                          onClick={() => setIsCartOpen(false)}
                          className="underline hover:text-orange-600"
                        >
                          سجل دخول
                        </Link>
                        ):
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <User className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-stone-400" />
                          <input
                            type="text"
                            placeholder="الاسم ثلاثي"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            className="w-full text-xs pr-8 pl-2 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-stone-400" />
                          <input
                            type="tel"
                            placeholder="رقم الهاتف (010...)"
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            className="w-full text-xs pr-8 pl-2 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delivery Location / Notes */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      ملاحظات أو مكان التواجد بالجامعة (اختياري):
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: مكتب إدارة التقديمات - الدور الثاني / صالة الاستقبال"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-xs text-red-600 dark:text-red-400 font-bold">{errorMsg}</p>
                  )}

                  {/* Summary & Submit Button */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-500">إجمالي الأصناف ({totalItems} قطعة):</span>
                    <span className="font-extrabold text-stone-900 dark:text-white text-base">
                      {totalPrice > 0 ? `${totalPrice} ج.م` : 'مجاني'}
                    </span>
                  </div>

                  <button
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black text-base shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>جاري تأكيد الطلب... ⏳</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>تأكيد الطلب الآن 🍳</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
