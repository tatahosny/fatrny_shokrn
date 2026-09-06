'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Order } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Store,
  GraduationCap,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const STATUS_CONFIG = {
  PENDING: {
    label: 'قيد الانتظار والتحضير',
    Icon: Clock,
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800/50',
    dot: 'bg-amber-500 animate-pulse',
  },
  DELIVERED: {
    label: 'تم التسليم بالهنا',
    Icon: CheckCircle2,
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    dot: 'bg-emerald-500',
  },
  CANCELLED: {
    label: 'تم الإلغاء',
    Icon: XCircle,
    color: 'text-rose-700 dark:text-rose-300',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800/50',
    dot: 'bg-rose-500',
  },
};

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const { addToCart } = useCart();
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;

  const handleReorder = async () => {
    const foods = await Promise.all(
      order.items.map((item) =>
        fetch(`/api/foods/${item.foodItemId}`).then((r) => r.json()).catch(() => null)
      )
    );
    foods.forEach((d, i) => {
      if (d?.food) addToCart(d.food, order.items[i].quantity);
    });
  };

  const dateStr = new Date(order.createdAt).toLocaleDateString('ar-EG', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const timeStr = new Date(order.createdAt).toLocaleTimeString('ar-EG', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl border ${cfg.border} ${cfg.bg} overflow-hidden shadow-xs`}
    >
      {/* Order Header */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${cfg.bg} border ${cfg.border} shrink-0 mt-0.5`}>
            <cfg.Icon className={`w-5 h-5 ${cfg.color}`} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-stone-900 dark:text-white text-sm sm:text-base">
                طلب رقم #{order.orderNumber}
              </span>

              {order.restaurantName && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                  <Store className="w-3 h-3 text-orange-500" />
                  <span>{order.restaurantName}</span>
                </span>
              )}

              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                {cfg.label}
              </span>
            </div>

            <div className="text-xs text-stone-500 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              <span>{dateStr} - {timeStr}</span>
            </div>

            {order.notes && (
              <div className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-xl border border-amber-200/60 dark:border-amber-800/40 inline-flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                <span>ملاحظاتك: {order.notes}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-current/10">
          <div className="text-right sm:text-left">
            <div className="font-black text-sm sm:text-base text-orange-600 dark:text-orange-400">
              {order.totalAmount !== undefined && order.totalAmount > 0
                ? `${order.totalAmount} ج.م`
                : `${order.totalItemsCount ?? order.items.reduce((s, i) => s + i.quantity, 0)} قطعة`}
            </div>
            {order.discountAmount && order.discountAmount > 0 ? (
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1 justify-end">
                <GraduationCap className="w-3 h-3" />
                <span>وفرت {order.discountAmount} ج.م (خصم الطلاب)</span>
              </div>
            ) : (
              <div className="text-[11px] text-stone-400">
                {order.items.length} أصناف
              </div>
            )}
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-xl hover:bg-white/60 dark:hover:bg-stone-800 text-stone-500 transition-colors"
            aria-label="عرض تفاصيل الوجبات"
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded Items */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-current/10"
          >
            <div className="p-4 sm:p-5 space-y-3 bg-white/50 dark:bg-stone-900/50">
              <h4 className="text-xs font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                تفاصيل الأصناف والكميات:
              </h4>

              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 py-2.5 first:pt-0">
                    <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-stone-200 shrink-0 mt-0.5">
                      <Image src={item.foodImage || '/images/sandwich-foul.jpg'} alt={item.foodName} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm font-black text-stone-800 dark:text-stone-200">{item.foodName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-600 dark:text-stone-400">
                            {item.price !== undefined && item.price > 0 ? `${item.price * item.quantity} ج.م` : ''}
                          </span>
                          <span className="text-xs font-extrabold text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-lg">
                            × {item.quantity}
                          </span>
                        </div>
                      </div>

                      {item.discountPercent && item.discountPercent > 0 && (
                        <div className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />
                          <span>خصم طلاب {item.discountPercent}% مطبق على هذا الصنف</span>
                        </div>
                      )}

                      {item.notes && (
                        <div className="text-[11px] text-amber-800 dark:text-amber-300 font-bold mt-1 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-200/60 dark:border-amber-800/40 w-fit">
                          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>ملاحظة: {item.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {order.status !== 'PENDING' && (
                <button
                  onClick={handleReorder}
                  className="w-full mt-2 py-2.5 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-700 dark:text-orange-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة طلب نفس الوجبات</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function MyOrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders/my-orders');
      if (res.ok) {
        const d = await res.json();
        setOrders(d.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchOrders();
    }
  }, [user, authLoading, router, fetchOrders]);

  // Polling to update status every 25 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchOrders();
    }, 25000);
    return () => clearInterval(interval);
  }, [user, fetchOrders]);

  const pending = orders.filter((o) => o.status === 'PENDING');
  const delivered = orders.filter((o) => o.status === 'DELIVERED');
  const cancelled = orders.filter((o) => o.status === 'CANCELLED');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Title & Refresh */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white flex items-center gap-3">
            <ClipboardList className="w-7 h-7 sm:w-8 sm:h-8 text-orange-500" />
            <span>طلباتي</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            أهلاً يا <span className="font-black text-orange-600">{user?.name?.split(' ')[0]}</span>! تابع طلباتك ومعرفة حالة تسليمها لحظة بلحظة.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 transition-all border border-stone-200 dark:border-stone-700"
          title="تحديث حالة الطلبات"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">تحديث</span>
        </button>
      </div>

      {/* Orders summary banner */}
      {orders.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-3 text-center">
            <div className="text-xl font-black text-amber-700 dark:text-amber-300">{pending.length}</div>
            <div className="text-[11px] font-bold text-amber-800 dark:text-amber-400">قيد التحضير</div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-3 text-center">
            <div className="text-xl font-black text-emerald-700 dark:text-emerald-300">{delivered.length}</div>
            <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400">تم التسليم</div>
          </div>
          <div className="bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl p-3 text-center">
            <div className="text-xl font-black text-stone-700 dark:text-stone-300">{orders.length}</div>
            <div className="text-[11px] font-bold text-stone-500">إجمالي الطلبات</div>
          </div>
        </div>
      )}

      {/* List of Orders */}
      {loading && orders.length === 0 ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-28 rounded-3xl bg-stone-100 dark:bg-stone-800 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-black text-stone-800 dark:text-stone-200">لا توجد لديك طلبات حتى الآن</h2>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            تصفح قائمة مطاعم ووجبات جامعة برج العرب التكنولوجية واطلب فطارك الآن
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md shadow-orange-500/20 transition-all"
          >
            <span>استعراض المنيو</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

    </div>
  );
}
