'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Order, OrderStatus } from '@/lib/types';
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
  MapPin,
  ExternalLink,
  UtensilsCrossed,
  Bike,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    sublabel: string;
    Icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
    border: string;
    dot: string;
  }
> = {
  PENDING: {
    label: 'قيد الانتظار',
    sublabel: 'تم استلام طلبك وجاري تحويله للمطعم',
    Icon: Clock,
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800/50',
    dot: 'bg-amber-500 animate-pulse',
  },
  PREPARING: {
    label: 'جاري التجهيز بالمطبخ 🍳',
    sublabel: 'المطعم يقوم بتحضير وجباتك طازجة الآن',
    Icon: UtensilsCrossed,
    color: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800/50',
    dot: 'bg-blue-500 animate-pulse',
  },
  OUT_FOR_DELIVERY: {
    label: 'في الطريق إليك 🛵',
    sublabel: 'الطلب مع المندوب وفي الطريق لموقعك',
    Icon: Bike,
    color: 'text-purple-700 dark:text-purple-300',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-800/50',
    dot: 'bg-purple-500 animate-pulse',
  },
  DELIVERED: {
    label: 'تم التسليم بالهنا ✅',
    sublabel: 'ألف هنا وشفا، شكراً لاختيارك فطرني شكراً',
    Icon: CheckCircle2,
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    dot: 'bg-emerald-500',
  },
  CANCELLED: {
    label: 'تم الإلغاء ❌',
    sublabel: 'تم إلغاء هذا الطلب',
    Icon: XCircle,
    color: 'text-rose-700 dark:text-rose-300',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800/50',
    dot: 'bg-rose-500',
  },
};

const TRACKING_STEPS: { key: OrderStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'PENDING', label: 'تم الاستلام', icon: Clock },
  { key: 'PREPARING', label: 'قيد التجهيز', icon: UtensilsCrossed },
  { key: 'OUT_FOR_DELIVERY', label: 'في الطريق', icon: Bike },
  { key: 'DELIVERED', label: 'تم التسليم', icon: CheckCircle2 },
];

function getStepIndex(status: OrderStatus): number {
  switch (status) {
    case 'PENDING':
      return 0;
    case 'PREPARING':
      return 1;
    case 'OUT_FOR_DELIVERY':
      return 2;
    case 'DELIVERED':
      return 3;
    default:
      return -1;
  }
}

function OrderCard({ order, onOrderCancelled }: { order: Order; onOrderCancelled?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { addToCart } = useCart();
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const currentStep = getStepIndex(order.status);

  const handleCancelOrder = async () => {
    if (!confirm(`هل أنت متأكد من رغبتك في إلغاء طلبك رقم #${order.orderNumber}؟`)) {
      return;
    }
    try {
      setIsCancelling(true);
      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        if (onOrderCancelled) onOrderCancelled();
      } else {
        alert(data.error || 'تعذر إلغاء الطلب');
      }
    } catch {
      alert('حدث خطأ أثناء محاولة إلغاء الطلب');
    } finally {
      setIsCancelling(false);
    }
  };

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
      className={`rounded-3xl border ${cfg.border} ${cfg.bg} overflow-hidden shadow-xs space-y-3`}
    >
      {/* Order Header */}
      <div className="p-4 sm:p-5 pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

              {order.status === 'PENDING' && (
                <button
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/50 hover:bg-red-200 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800 transition-colors disabled:opacity-50"
                  title="إلغاء الطلب"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{isCancelling ? 'جاري الإلغاء...' : 'إلغاء الطلب'}</span>
                </button>
              )}
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

      {/* Visual Live Order Tracker Stepper (For non-cancelled orders) */}
      {order.status !== 'CANCELLED' && (
        <div className="px-4 sm:px-5 py-3">
          <div className="bg-white/70 dark:bg-stone-900/70 rounded-2xl p-3.5 border border-stone-200/80 dark:border-stone-800">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-black text-stone-700 dark:text-stone-300">متابعة مسار طلبك:</span>
              <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400">{cfg.sublabel}</span>
            </div>

            {/* Stepper Bar */}
            <div className="relative flex items-center justify-between">
              {TRACKING_STEPS.map((step, idx) => {
                const isPassed = currentStep >= idx;
                const isCurrent = currentStep === idx;
                const StepIcon = step.icon;

                return (
                  <div key={step.key} className="flex-1 flex flex-col items-center relative z-10">
                    {/* Connector line behind */}
                    {idx < TRACKING_STEPS.length - 1 && (
                      <div
                        className={`absolute top-4 right-[50%] left-[-50%] h-1 -z-1 transition-all ${
                          currentStep > idx ? 'bg-orange-500' : 'bg-stone-200 dark:bg-stone-800'
                        }`}
                      />
                    )}

                    {/* Step Circle */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-orange-500 text-white ring-4 ring-orange-500/20 shadow-md shadow-orange-500/30'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-400'
                      }`}
                    >
                      <StepIcon className="w-4 h-4" />
                    </div>

                    <span
                      className={`text-[10px] sm:text-[11px] mt-1.5 font-black text-center ${
                        isCurrent
                          ? 'text-orange-600 dark:text-orange-400 font-extrabold'
                          : isPassed
                          ? 'text-stone-800 dark:text-stone-200'
                          : 'text-stone-400 dark:text-stone-600'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Address & Google Maps Location Link */}
      {(order.address || order.locationUrl) && (
        <div className="px-4 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-white/60 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-800 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-bold text-stone-700 dark:text-stone-300">
                {order.address ? `عنوان التوصيل: ${order.address}` : 'تم إرفاق الموقع الجغرافي بالـ GPS'}
              </span>
            </div>
            {order.locationUrl && (
              <a
                href={order.locationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black border border-emerald-500/30 transition-all text-xs"
              >
                <span>Google Maps ↗</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      )}

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

  const pendingOrPreparing = orders.filter((o) => o.status === 'PENDING' || o.status === 'PREPARING');
  const outForDelivery = orders.filter((o) => o.status === 'OUT_FOR_DELIVERY');
  const delivered = orders.filter((o) => o.status === 'DELIVERED');

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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-3 text-center">
            <div className="text-xl font-black text-amber-700 dark:text-amber-300">{pendingOrPreparing.length}</div>
            <div className="text-[11px] font-bold text-amber-800 dark:text-amber-400">قيد التحضير والتجهيز</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 rounded-2xl p-3 text-center">
            <div className="text-xl font-black text-purple-700 dark:text-purple-300">{outForDelivery.length}</div>
            <div className="text-[11px] font-bold text-purple-800 dark:text-purple-400">في الطريق إليك 🛵</div>
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
            href="/restaurants"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md shadow-orange-500/20 transition-all"
          >
            <span>استعراض المطاعم</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onOrderCancelled={fetchOrders} />
          ))}
        </div>
      )}

    </div>
  );
}
