'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Trash2, Plus, Minus, CheckCircle2, ShoppingBag, ArrowRight, User, Phone, MapPin, Sparkles, GraduationCap, Lock, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

const QUICK_NOTES = [
  'طحينة زيادة',
  'بدون شطة',
  'شطة زيادة',
  'ليمون زيادة',
  'كاتشب إضافي',
  'بدون مخلل',
  'العيش محمص',
];

export default function CartPage() {
  const {
    items,
    totalItems,
    totalPrice,
    updateQuantity,
    updateItemNotes,
    removeFromCart,
    clearCart,
    submitOrder,
    isSubmitting,
  } = useCart();

  const { user } = useAuth();
  const router = useRouter();

  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');
  const [locationUrl, setLocationUrl] = useState('');
  const [locationMode, setLocationMode] = useState<'auto' | 'manual'>('auto');
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

  const handleGetLocation = async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setErrorMsg('تحديد الموقع عبر المتصفح غير مدعوم في جهازك');
      return;
    }

    setIsLocating(true);
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
        setLocationUrl(mapsLink);

        // Reverse Geocoding to get human-readable Arabic address
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`,
            { headers: { 'User-Agent': 'Fatrny-Delivery-App' } }
          );
          if (res.ok) {
            const data = await res.json();
            const displayName = data.display_name || '';
            if (displayName) {
              setAddress(displayName);
            } else {
              setAddress(`موقع دقيق: (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
            }
          } else {
            setAddress(`موقع دقيق: (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
          }
        } catch {
          setAddress(`موقع دقيق: (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
        }

        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setErrorMsg('يرجى السماح بصلاحية الموقع من إعدادات المتصفح أو اختيار كتابة العنوان يدوياً');
        } else {
          setErrorMsg('تعذر الوصول للموقع تلقائياً، يمكنك كتابة العنوان وتفاصيل مكانك يدوياً');
        }
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const handleCheckout = async () => {
    setErrorMsg('');
    if (!user) {
      setErrorMsg('يجب تسجيل الدخول بحسابك أولاً لتأكيد طلبك');
      router.push('/login');
      return;
    }

    const order = await submitOrder(notes, undefined, undefined, address, locationUrl);
    if (order) {
      router.push('/my-orders');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 rounded-3xl bg-orange-100 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-12 h-12 text-orange-500" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">
          عربة التسوق فارغة حالياً
        </h1>
        <p className="text-sm text-stone-500 max-w-md mx-auto">
          لم تقم بإضافة أي وجبة إلى عربة التسوق بعد. تصفح مطاعم جامعة برج العرب واختر وجبتك المفضلة!
        </p>
        <div>
          <Link
            href="/restaurants"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm shadow-lg shadow-orange-500/25 transition-all active:scale-95"
          >
            <span>استعراض المطاعم</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white flex items-center gap-3">
            <span>عربة التسوق</span>
            <span className="text-sm px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 font-bold">
              {totalItems} أصناف
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            راجع تفاصيل طلبك وحدد مكان التواجد بالجامعة لتسهيل الاستلام
          </p>
        </div>

        <button
          onClick={clearCart}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-stone-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>تفريغ السلة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Items List (Table style) */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden divide-y divide-stone-100 dark:divide-stone-800">
          <div className="p-4 bg-stone-50 dark:bg-stone-850 text-xs font-black text-stone-600 dark:text-stone-300 grid grid-cols-12 gap-2">
            <span className="col-span-6">المنتج والملاحظات</span>
            <span className="col-span-3 text-center">الكمية</span>
            <span className="col-span-3 text-left">الإجمالي</span>
          </div>

          {items.map((item) => {
            const { id, food, quantity, notes: itemNote } = item;
            return (
              <div key={id} className="p-4 space-y-3">
                <div className="grid grid-cols-12 gap-2 items-center">
                  {/* Product Info */}
                  <div className="col-span-6 flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-stone-100 shrink-0">
                      <Image src={food.image} alt={food.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate">
                        {food.name}
                      </h3>
                      <span className="text-[11px] text-orange-600 font-semibold">
                        {food.price > 0 ? `${food.price} ج.م` : 'مجاني'}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="col-span-3 flex items-center justify-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(id, quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-orange-600"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-1 text-xs font-black text-stone-800 dark:text-stone-100">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(id, quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-orange-600"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Price & Delete */}
                  <div className="col-span-3 flex items-center justify-end gap-2 text-left">
                    <span className="font-black text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                      {food.price > 0 ? `${food.price * quantity} ج.م` : '—'}
                    </span>
                    <button
                      onClick={() => removeFromCart(id)}
                      className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Note under item (ملاحظة تحت الصنف) */}
                <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200/80 dark:border-stone-700/60 space-y-2">
                  <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-stone-700 dark:text-stone-300">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span>ملاحظة خاصة بالوجبة:</span>
                    </span>
                    {itemNote && (
                      <button
                        type="button"
                        onClick={() => updateItemNotes(id, '')}
                        className="text-[10px] text-stone-400 hover:text-red-500"
                      >
                        مسح الملاحظة
                      </button>
                    )}
                  </div>

                  {/* Preset chips */}
                  <div className="flex flex-wrap gap-1">
                    {['طحينة زيادة', 'منغير سلطة', 'بدون شطة', 'شطة زيادة', 'ليمون زيادة', 'العيش محمص'].map((preset) => {
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
                          className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-all border ${
                            isSelected
                              ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                              : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-orange-300'
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
                    className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Checkout Summary Card */}
        <div className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-stone-900 dark:text-white pb-3 border-b border-stone-100 dark:border-stone-800">
            تأكيد وبيانات الطلب
          </h2>

          {/* Student Profile / Account requirement */}
          {!user ? (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-stone-800 dark:to-orange-950/30 border border-orange-200 dark:border-orange-900/50 space-y-3 text-center">
              <div className="w-11 h-11 rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-stone-900 dark:text-white">
                  يلزم تسجيل الدخول بحساب لتأكيد الطلب
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                  الطلب متاح حصرياً للطلاب وأعضاء جامعة برج العرب التكنولوجية المسجلين لضمان دقة الاستلام.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  className="py-2.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>تسجيل الدخول</span>
                </Link>
                <Link
                  href="/register"
                  className="py-2.5 px-3 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs border border-stone-200 dark:border-stone-700 flex items-center justify-center gap-1 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>إنشاء حساب</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black text-stone-900 dark:text-white truncate">{user.name}</div>
                <div className="text-[11px] text-stone-500">{user.phone}</div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                حساب مسجل ✓
              </span>
            </div>
          )}

          {/* Location & Delivery Details (تحديد اللوكيشن وربطه بخرائط جوجل والتنقل بين يدوي وتلقائي) */}
          <div className="space-y-4 p-4 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-900/40">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <label className="text-xs font-black text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                <span>عنوان ومكان استلام الطلب:</span>
              </label>

              {/* Mode Toggle (تلقائي / يدوي) */}
              <div className="flex items-center bg-white dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700 text-[11px] font-black">
                <button
                  type="button"
                  onClick={() => setLocationMode('auto')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    locationMode === 'auto'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  📍 تلقائي (GPS)
                </button>
                <button
                  type="button"
                  onClick={() => setLocationMode('manual')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    locationMode === 'manual'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  ✏️ كتابة يدوية
                </button>
              </div>
            </div>

            {locationMode === 'auto' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 bg-white dark:bg-stone-900 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
                  <div className="text-xs text-stone-600 dark:text-stone-300">
                    {address ? (
                      <div className="space-y-1">
                        <span className="font-bold text-stone-900 dark:text-white block">العنوان المكتشف:</span>
                        <span className="text-[11px] text-stone-600 dark:text-stone-300 line-clamp-2">{address}</span>
                      </div>
                    ) : (
                      <span>اضغط زر التحديد لجلب مكانك وعنوانك بدقة عبر الأقمار الصناعية</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-orange-500 hover:bg-orange-600 text-white shadow-xs transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isLocating ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>جاري التحديد...</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{address ? 'تحديث الموقع' : 'تحديد موقعي الآن'}</span>
                      </>
                    )}
                  </button>
                </div>

                {locationUrl && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold truncate">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span className="truncate">تم ربط مكانك بخرائط Google بدقة!</span>
                    </div>
                    <a
                      href={locationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-black text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 shrink-0 bg-white dark:bg-stone-900 px-2.5 py-1 rounded-lg border border-orange-200 dark:border-orange-800/60 shadow-xs"
                    >
                      <span>عرض في Google Maps ↗</span>
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="مثال: مبنى كلية تكنولوجيا الصناعة، الدور الثاني، قاعة 204..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 outline-none"
                />
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  اكتب اسم المبنى والقاعة أو المعلم المميز لتسليم الوجبة بسهولة
                </p>
              </div>
            )}
          </div>

          {/* Location & Food Customization Notes */}
          <div className="space-y-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
                <span>ملاحظات وتعديل الوجبات (اختياري):</span>
              </label>
            </div>

            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              اضغط على أي إضافة سريعة أو اكتب طلبك الخاص (طحينة، شطة، تسوية، مكانك...):
            </p>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_NOTES.map((preset) => {
                const isSelected = notes.includes(preset);
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => toggleNote(preset)}
                    className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all border ${
                      isSelected
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/25'
                        : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-orange-300'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}{preset}
                  </button>
                );
              })}
            </div>

            <textarea
              rows={3}
              placeholder="اكتب أي ملاحظة إضافية هنا (مثال: طحينة زيادة في سندوتش الفول، أو مكان التواجد بالجامعة)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          {errorMsg && (
            <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl">{errorMsg}</p>
          )}

          {/* Student discount active badge */}
          {user?.role === 'STUDENT' && user?.status === 'ACTIVE' && (
            <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>خصم الطلاب الجامعي:</span>
              </span>
              <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                مفعّل تلقائياً 🎓
              </span>
            </div>
          )}

          {/* Order Summary */}
          <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
            <div className="flex justify-between text-stone-500">
              <span>إجمالي عدد الوجبات:</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">{totalItems} قطعة</span>
            </div>
            <div className="flex justify-between text-stone-500">
              <span>تكلفة التوصيل في الحرم الجامعي:</span>
              <span className="font-bold text-emerald-600">مجاناً</span>
            </div>
            <div className="flex justify-between text-base font-black text-stone-900 dark:text-white pt-2 border-t border-stone-100 dark:border-stone-800">
              <span>الإجمالي الكلي:</span>
              <span className="text-orange-600 dark:text-orange-400">
                {totalPrice > 0 ? `${totalPrice} ج.م` : 'مجاني'}
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          {!user ? (
            <Link
              href="/login"
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-base shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Lock className="w-5 h-5" />
              <span>سجل دخولك لتأكيد الطلب</span>
            </Link>
          ) : (
            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black text-base shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>جاري تسجيل وتأكيد الطلب...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>تأكيد الطلب الآن</span>
                </>
              )}
            </button>
          )}

          <p className="text-[11px] text-center text-stone-400 leading-tight">
            بمجرد التأكيد سيتم إرسال الطلب فوراً لمشرفي إدارة التقديمات للبدء في تجميع الوجبات
          </p>
        </div>

      </div>

    </div>
  );
}
