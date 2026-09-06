'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Order, OrderStatus } from '@/lib/types';
import { ClipboardList, Search, CheckCircle2, Clock, XCircle, ChevronDown, ChevronUp, RefreshCw, MapPin } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'قيد الانتظار',
  DELIVERED: 'تم التسليم',
  CANCELLED: 'ملغي',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  CANCELLED: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800',
};

function OrderRow({ order, onStatusChange }: {
  order: Order;
  onStatusChange: (id: string, status: OrderStatus) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleStatus = async (status: OrderStatus) => {
    setUpdating(true);
    await onStatusChange(order.id, status);
    setUpdating(false);
  };

  const date = new Date(order.createdAt).toLocaleString('ar-EG', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden"
    >
      {/* Row Header */}
      <div className="p-4 flex items-center gap-3 flex-wrap">
        
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-orange-500 text-white font-bold flex items-center justify-center text-sm shrink-0">
            {order.userName.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-sm text-stone-900 dark:text-stone-100 truncate">{order.userName}</div>
            <div className="text-xs text-stone-500 flex items-center gap-2 flex-wrap" dir="ltr">
              <span>{order.userPhone}</span>
              <span>•</span>
              <span>#{order.orderNumber}</span>
              <span>•</span>
              <span>{date}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[order.status]}`}>
            {STATUS_LABELS[order.status]}
          </span>
          <span className="text-xs font-bold text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-lg">
            {order.totalItemsCount ?? order.items.reduce((s, i) => s + i.quantity, 0)} قطعة
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Actions & Items */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-stone-100 dark:border-stone-800"
          >
            <div className="p-4 bg-stone-50/50 dark:bg-stone-900/80 space-y-4">
              
              {/* Items list */}
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-stone-200 shrink-0">
                      <Image src={item.foodImage} alt={item.foodName} fill className="object-cover" />
                    </div>
                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex-1 truncate">
                      {item.foodName}
                    </span>
                    <span className="text-xs font-extrabold text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-lg">
                      × {item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {order.notes && (
                <div className="flex items-start gap-1.5 text-xs text-stone-500 bg-white dark:bg-stone-800 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700">
                  <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                  <span>{order.notes}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {order.status !== 'DELIVERED' && (
                  <button
                    onClick={() => handleStatus('DELIVERED')}
                    disabled={updating}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تأكيد التسليم</span>
                  </button>
                )}
                {order.status !== 'PENDING' && (
                  <button
                    onClick={() => handleStatus('PENDING')}
                    disabled={updating}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-colors disabled:opacity-50"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>إعادة للانتظار</span>
                  </button>
                )}
                {order.status !== 'CANCELLED' && (
                  <button
                    onClick={() => handleStatus('CANCELLED')}
                    disabled={updating}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-stone-600 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 font-bold text-xs transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>إلغاء الطلب</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const { showToast } = useToast();

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    const res = await fetch(`/api/admin/orders?${params.toString()}`);
    const data = await res.json();
    setOrders(data.orders ?? []);
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message, 'success');
      await loadOrders();
    } else {
      showToast(data.error || 'خطأ في التحديث', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white flex items-center gap-3">
            <ClipboardList className="w-7 h-7 text-orange-500" />
            <span>إدارة الطلبات</span>
          </h1>
          <p className="text-sm text-stone-500 mt-1">كافة طلبات الإفطار مع إمكانية تعديل الحالة فوراً</p>
        </div>
        <button onClick={loadOrders} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-200 transition-colors">
          <RefreshCw className="w-4 h-4" />
          <span>تحديث</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-4 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="ابحث بالاسم أو رقم الهاتف أو رقم الطلب..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-11 pl-4 py-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'ALL' | OrderStatus)}
          className="px-4 py-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none min-w-[150px]"
        >
          <option value="ALL">كل الحالات</option>
          <option value="PENDING">قيد الانتظار</option>
          <option value="DELIVERED">تم التسليم</option>
          <option value="CANCELLED">ملغي</option>
        </select>
      </div>

      {/* Count */}
      <div className="text-xs text-stone-500 font-bold">
        إجمالي: <span className="text-orange-600 font-black">{orders.length}</span> طلب
      </div>

      {/* Orders */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-stone-200 dark:bg-stone-800 animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-3">
          <ClipboardList className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto" />
          <p className="font-bold text-stone-600 dark:text-stone-400">لا توجد طلبات تطابق بحثك</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}
