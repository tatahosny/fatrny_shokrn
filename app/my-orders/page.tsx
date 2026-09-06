'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Order } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ClipboardList, Clock, CheckCircle2, XCircle, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const STATUS_CONFIG = {
  PENDING: {
    label: 'قيد الانتظار',
    icon: '⏳',
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800/50',
    dot: 'bg-amber-500 animate-pulse',
  },
  DELIVERED: {
    label: 'تم التسليم ✅',
    icon: '✅',
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    dot: 'bg-emerald-500',
  },
  CANCELLED: {
    label: 'تم الإلغاء',
    icon: '❌',
    color: 'text-rose-700 dark:text-rose-300',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800/50',
    dot: 'bg-rose-500',
  },
};

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const { addToCart } = useCart();
  const cfg = STATUS_CONFIG[order.status];

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
      className={`rounded-3xl border ${cfg.border} ${cfg.bg} overflow-hidden`}
    >
      {/* Order Header */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${cfg.bg} border ${cfg.border} shrink-0`}>
            {cfg.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-stone-900 dark:text-white text-sm">
                طلب رقم #{order.orderNumber}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                {cfg.label}
              </span>
            </div>
            <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              <span>{dateStr} - الساعة {timeStr}</span>
            </div>
            {order.notes && (
              <div className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                <span>📍</span>
                <span>{order.notes}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-left text-xs">
            <div className="font-black text-stone-900 dark:text-white">
              {order.totalItemsCount ?? order.items.reduce((s, i) => s + i.quantity, 0)} قطعة
            </div>
            <div className="text-stone-400">{order.items.length} صنف</div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-xl hover:bg-white/60 dark:hover:bg-stone-800 text-stone-500 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
            <div className="p-5 space-y-3 bg-white/50 dark:bg-stone-900/50">
              <h4 className="text-xs font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                تفاصيل الوجبات المطلوبة:
              </h4>
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-stone-200 shrink-0">
                    <Image src={item.foodImage} alt={item.foodName} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex justify-between items-center">
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200">{item.foodName}</span>
                    <span className="text-xs font-extrabold text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-2 py-1 rounded-lg">
                      × {item.quantity}
                    </span>
                  </div>
                </div>
              ))}

              {order.status !== 'PENDING' && (
                <button
                  onClick={handleReorder}
                  className="w-full mt-2 py-2.5 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-700 dark:text-orange-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة نفس الطلب</span>
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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetch('/api/orders/my-orders')
        .then((r) => r.json())
        .then((d) => setOrders(d.orders || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  const pending = orders.filter((o) => o.status === 'PENDING');
  const delivered = orders.filter((o) => o.status === 'DELIVERED');
  const cancelled = orders.filter((o) => o.status === 'CANCELLED');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-stone-900 dark:text-white flex items-center gap-3">
          <ClipboardList className="w-8 h-8 text-orange-500" />
          <span>طلباتي 📋</span>
        </h1>
        <p className="text-sm text-stone-500">
          أهلاً يا <span className="font-black text-orange-600">{user?.name?.split(' ')[0]}</span>! تابع طلباتك ومعرفة حالة التسليم الآن.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'طلبات قيد الانتظار', count: pending.length, emoji: '⏳', color: 'text-amber-600' },
          { label: 'طلبات تم تسليمها', count: delivered.length, emoji: '✅', color: 'text-emerald-600' },
          { label: 'طلبات ملغاة', count: cancelled.length, emoji: '❌', color: 'text-rose-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 text-center">
            <div className="text-2xl">{stat.emoji}</div>
            <div className={`text-2xl font-black ${stat.color}`}>{stat.count}</div>
            <div className="text-[11px] text-stone-500 leading-tight">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-3xl bg-stone-200 dark:bg-stone-800 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-4">
          <div className="text-5xl">🍳</div>
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">لم تقدم أي طلب إفطار بعد!</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">تصفح المنيو الشامل واطلب فطارك المفضل من أقسام الفول والشاورما والفطير والبيتزا</p>
          <Link href="/menu" className="inline-block px-6 py-2.5 rounded-2xl bg-orange-500 text-white font-bold text-sm shadow-md">
            اطلب الآن 🍽️
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
