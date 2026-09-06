'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Order } from '@/lib/types';
import { Truck, CheckCircle2, Clock, XCircle, RefreshCw, Phone, User, MapPin, Package } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

function DeliveryOrderCard({ order, onStatusChange }: {
  order: Order;
  onStatusChange: (id: string, status: 'DELIVERED' | 'CANCELLED') => Promise<void>;
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDeliver = async () => {
    setIsUpdating(true);
    await onStatusChange(order.id, 'DELIVERED');
    setIsUpdating(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 flex items-center justify-center font-black text-base shrink-0">
          {order.userName.charAt(0)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-extrabold text-sm text-stone-900 dark:text-stone-100">{order.userName}</h3>
              <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span dir="ltr">{order.userPhone}</span>
                </span>
                <span>•</span>
                <span>طلب #{order.orderNumber}</span>
                <span>•</span>
                <span>{order.totalItemsCount ?? order.items.reduce((s, i) => s + i.quantity, 0)} قطعة</span>
              </div>
              {order.notes && (
                <div className="text-xs text-stone-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>{order.notes}</span>
                </div>
              )}
            </div>
            <button
              onClick={handleDeliver}
              disabled={isUpdating}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/25 transition-all disabled:opacity-50 shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isUpdating ? 'جاري...' : 'تم التسليم'}
            </button>
          </div>

          {/* Mini items preview */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {order.items.map((item) => (
              <span key={item.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-[11px] text-stone-600 dark:text-stone-300 font-medium">
                {item.foodName} × {item.quantity}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DeliveredCard({ order }: { order: Order }) {
  const deliveredAt = order.deliveredAt
    ? new Date(order.deliveredAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40"
    >
      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="font-extrabold text-sm text-stone-900 dark:text-stone-100">{order.userName}</span>
        <div className="text-[11px] text-stone-500 flex items-center gap-2 flex-wrap">
          <span>{order.userPhone}</span>
          <span>•</span>
          <span>{order.totalItemsCount ?? order.items.reduce((s, i) => s + i.quantity, 0)} قطعة</span>
          {deliveredAt && <span>• استلم الساعة {deliveredAt}</span>}
        </div>
      </div>
    </motion.div>
  );
}

export default function DeliveryPage() {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    const [pendingRes, deliveredRes] = await Promise.all([
      fetch('/api/admin/orders?status=PENDING'),
      fetch('/api/admin/orders?status=DELIVERED'),
    ]);
    const pendingData = await pendingRes.json();
    const deliveredData = await deliveredRes.json();
    setPendingOrders(pendingData.orders ?? []);
    setDeliveredOrders(deliveredData.orders ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (orderId: string, status: 'DELIVERED' | 'CANCELLED') => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, 'success');
        await loadData();
      } else {
        showToast(data.error || 'فشل تحديث الحالة', 'error');
      }
    } catch {
      showToast('خطأ في الاتصال', 'error');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white flex items-center gap-3">
            <Truck className="w-7 h-7 text-emerald-600" />
            <span>تتبع التسليم</span>
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            اعرف مين استلم وجبته ومين لسه ينتظر — مع ضغطة زر لتأكيد التسليم
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-bold transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>تحديث</span>
        </button>
      </div>

      {/* Summary Header */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-3xl p-5 text-center">
          <div className="text-4xl font-black text-amber-600">{pendingOrders.length}</div>
          <div className="text-sm font-bold text-stone-700 dark:text-stone-300 mt-1 flex items-center justify-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>لم يتم الاستلام بعد</span>
          </div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-3xl p-5 text-center">
          <div className="text-4xl font-black text-emerald-600">{deliveredOrders.length}</div>
          <div className="text-sm font-bold text-stone-700 dark:text-stone-300 mt-1 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>تم الاستلام</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-stone-200 dark:bg-stone-800 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Pending Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
              <Clock className="w-5 h-5 text-amber-600" />
              <h2 className="font-black text-amber-800 dark:text-amber-300">
                لم يتم الاستلام ({pendingOrders.length})
              </h2>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="text-center py-10 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-stone-600 dark:text-stone-400">الكل استلم وجبته!</p>
              </div>
            ) : (
              <AnimatePresence>
                <div className="space-y-3">
                  {pendingOrders.map((order) => (
                    <DeliveryOrderCard
                      key={order.id}
                      order={order}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>

          {/* Delivered Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h2 className="font-black text-emerald-800 dark:text-emerald-300">
                تم الاستلام ({deliveredOrders.length})
              </h2>
            </div>

            {deliveredOrders.length === 0 ? (
              <div className="text-center py-10 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2">
                <Package className="w-10 h-10 text-stone-400 mx-auto" />
                <p className="text-sm font-bold text-stone-600 dark:text-stone-400">لم يتم تسليم أي طلب بعد</p>
              </div>
            ) : (
              <AnimatePresence>
                <div className="space-y-2">
                  {deliveredOrders.map((order) => (
                    <DeliveredCard key={order.id} order={order} />
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
