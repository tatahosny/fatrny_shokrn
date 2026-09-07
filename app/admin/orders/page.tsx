'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Order, OrderStatus } from '@/lib/types';
import {
  ClipboardList, Search, CheckCircle2, Clock, XCircle,
  ChevronDown, ChevronUp, RefreshCw, Sparkles, Store,
  Phone, User, BarChart3, Package, Filter, MapPin, ExternalLink,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'قيد الانتظار',
  PREPARING: 'جاري التجهيز',
  OUT_FOR_DELIVERY: 'في الطريق',
  DELIVERED: 'تم التسليم',
  CANCELLED: 'ملغي',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  PREPARING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  CANCELLED: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800',
};

const RESTAURANT_COLORS = [
  'bg-orange-500', 'bg-violet-500', 'bg-sky-500',
  'bg-emerald-500', 'bg-rose-500', 'bg-amber-500',
];

interface RestaurantInfo { id: string; name: string; }

function RestaurantBadge({ name, list }: { name?: string; list: RestaurantInfo[] }) {
  if (!name) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-500 border border-stone-200 dark:border-stone-700">
        <Store className="w-3 h-3" />
        <span>بدون مطعم</span>
      </span>
    );
  }
  const idx = list.findIndex((r) => r.name === name);
  const color = RESTAURANT_COLORS[idx % RESTAURANT_COLORS.length] || 'bg-stone-500';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black text-white ${color}`}>
      <Store className="w-3 h-3" />
      <span>{name}</span>
    </span>
  );
}

function OrderTableRow({ order, onStatusChange, restaurantList }: {
  order: Order;
  onStatusChange: (id: string, status: OrderStatus) => Promise<void>;
  restaurantList: RestaurantInfo[];
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
    <>
      <tr className="hover:bg-orange-50/20 dark:hover:bg-stone-800/40 transition-colors border-b border-stone-100 dark:border-stone-800/60 text-xs">
        {/* 1. Order Number & Time */}
        <td className="py-3.5 px-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 transition-colors"
              title="عرض/إخفاء تفاصيل الوجبات"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <div>
              <span className="font-black text-stone-900 dark:text-white text-sm">
                #{order.orderNumber}
              </span>
              <div className="text-[10px] text-stone-400">{date}</div>
            </div>
          </div>
        </td>

        {/* 2. Customer */}
        <td className="py-3.5 px-4">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-stone-900 dark:text-stone-100">{order.userName}</span>
              {order.userRole === 'STUDENT' && (
                <span className="text-[9px] font-black bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 px-1.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  طالب 🎓
                </span>
              )}
            </div>
            <a
              href={`tel:${order.userPhone}`}
              dir="ltr"
              className="inline-flex items-center gap-1 text-[11px] text-stone-500 hover:text-orange-500 font-semibold"
            >
              <Phone className="w-3 h-3 text-stone-400" />
              <span>{order.userPhone}</span>
            </a>
          </div>
        </td>

        {/* 3. Restaurant */}
        <td className="py-3.5 px-4 whitespace-nowrap">
          <RestaurantBadge name={order.restaurantName} list={restaurantList} />
        </td>

        {/* 4. Items & Summary */}
        <td className="py-3.5 px-4 max-w-[240px]">
          <div className="space-y-1">
            <div className="font-bold text-stone-800 dark:text-stone-200 truncate">
              {order.items.map((it) => `${it.quantity}× ${it.foodName}`).join('، ')}
            </div>
            {order.notes && (
              <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800/50 truncate">
                <Sparkles className="w-3 h-3 inline ml-1 text-amber-500" />
                {order.notes}
              </div>
            )}
          </div>
        </td>

        {/* 5. Location & Google Maps */}
        <td className="py-3.5 px-4 max-w-[200px]">
          <div className="space-y-1">
            {order.locationUrl ? (
              <a
                href={order.locationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 transition-colors"
                title="فتح موقع العميل في خرائط Google مباشرة"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>فتح في Google Maps ↗</span>
              </a>
            ) : null}
            {order.address ? (
              <p className="text-[11px] text-stone-600 dark:text-stone-300 font-medium truncate" title={order.address}>
                {order.address}
              </p>
            ) : !order.locationUrl ? (
              <span className="text-[11px] text-stone-400">لم يحدد</span>
            ) : null}
          </div>
        </td>

        {/* 6. Total Amount */}
        <td className="py-3.5 px-4 whitespace-nowrap text-left">
          <div className="font-black text-stone-900 dark:text-white text-xs sm:text-sm">
            {order.totalAmount !== undefined && order.totalAmount > 0 ? `${order.totalAmount} ج.م` : '—'}
          </div>
          {order.discountAmount && order.discountAmount > 0 ? (
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
              خصم: {order.discountAmount} ج.م
            </div>
          ) : null}
        </td>

        {/* 7. Status */}
        <td className="py-3.5 px-4 whitespace-nowrap">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${STATUS_COLORS[order.status] || STATUS_COLORS.PENDING}`}>
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </td>

        {/* 8. Actions (مراحل الوصول) */}
        <td className="py-3.5 px-4 whitespace-nowrap text-center">
          <div className="flex items-center justify-center gap-1 flex-wrap">
            {order.status !== 'PREPARING' && (
              <button
                onClick={() => handleStatus('PREPARING')}
                disabled={updating}
                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors disabled:opacity-50"
                title="نقل لحالة جاري التجهيز بالمطبخ"
              >
                تجهيز 🍳
              </button>
            )}

            {order.status !== 'OUT_FOR_DELIVERY' && (
              <button
                onClick={() => handleStatus('OUT_FOR_DELIVERY')}
                disabled={updating}
                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-colors disabled:opacity-50"
                title="نقل لحالة في الطريق مع المندوب"
              >
                في الطريق 🛵
              </button>
            )}

            {order.status !== 'DELIVERED' && (
              <button
                onClick={() => handleStatus('DELIVERED')}
                disabled={updating}
                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors disabled:opacity-50"
                title="تأكيد تسليم الطلب"
              >
                تسليم ✅
              </button>
            )}

            {order.status !== 'CANCELLED' && (
              <button
                onClick={() => handleStatus('CANCELLED')}
                disabled={updating}
                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-50"
                title="إلغاء الطلب"
              >
                إلغاء ❌
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Expanded Row details */}
      {expanded && (
        <tr className="bg-stone-50/70 dark:bg-stone-850 border-b border-stone-200 dark:border-stone-800">
          <td colSpan={8} className="p-4">
            <div className="space-y-3 max-w-4xl mr-6">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-600 dark:text-stone-300 flex-wrap">
                <Store className="w-3.5 h-3.5 text-orange-500" />
                <span>المطعم: {order.restaurantName || 'غير محدد'}</span>
                <span>•</span>
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>هاتف العميل: {order.userPhone}</span>
                {order.address && (
                  <>
                    <span>•</span>
                    <MapPin className="w-3.5 h-3.5 text-orange-500" />
                    <span>العنوان: {order.address}</span>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {order.items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700"
                  >
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-stone-200 shrink-0">
                      {it.foodImage ? (
                        <Image src={it.foodImage} alt={it.foodName} fill className="object-cover" />
                      ) : (
                        <Package className="w-4 h-4 text-stone-400 m-auto" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-xs text-stone-900 dark:text-white truncate">
                        {it.foodName}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
                        <span className="font-black text-orange-600">×{it.quantity}</span>
                        {it.price ? <span>({it.price * it.quantity} ج.م)</span> : null}
                      </div>
                      {it.notes && (
                        <div className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded mt-0.5 truncate">
                          {it.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [restaurantFilter, setRestaurantFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'list' | 'stats'>('list');
  const { showToast } = useToast();

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    if (restaurantFilter !== 'ALL') params.set('restaurantId', restaurantFilter);
    const res = await fetch(`/api/admin/orders?${params.toString()}`);
    if (!res.ok) { setLoading(false); return; }
    const data = await res.json();
    setOrders(data.orders ?? []);
    if (data.restaurants) setRestaurants(data.restaurants);
    setLoading(false);
  }, [search, statusFilter, restaurantFilter]);

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

  // Stats per restaurant (using all loaded orders ignoring restaurantFilter for stats tab)
  const statsPerRestaurant = restaurants.map((r) => {
    const rOrders = orders.filter((o) => o.restaurantId === r.id || o.restaurantName === r.name);
    const pending = rOrders.filter((o) => o.status === 'PENDING').length;
    const delivered = rOrders.filter((o) => o.status === 'DELIVERED').length;
    const cancelled = rOrders.filter((o) => o.status === 'CANCELLED').length;
    const totalItems = rOrders.reduce((s, o) => s + (o.totalItemsCount ?? o.items.reduce((ss, i) => ss + i.quantity, 0)), 0);
    return { ...r, total: rOrders.length, pending, delivered, cancelled, totalItems };
  }).filter((r) => r.total > 0);

  const totalPending = orders.filter((o) => o.status === 'PENDING').length;
  const totalDelivered = orders.filter((o) => o.status === 'DELIVERED').length;
  const totalCancelled = orders.filter((o) => o.status === 'CANCELLED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white flex items-center gap-3">
            <ClipboardList className="w-7 h-7 text-orange-500" />
            <span>إدارة الطلبات</span>
          </h1>
          <p className="text-sm text-stone-500 mt-1">كافة طلبات الإفطار من جميع المطاعم — تفاصيل كاملة وتحكم فوري</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'list' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>قائمة الطلبات</span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'stats' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>إحصائيات المطاعم</span>
          </button>
          <button onClick={loadOrders} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-200 transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="text-xs font-bold text-stone-500 mb-1">إجمالي الطلبات</div>
          <div className="text-2xl font-black text-stone-900 dark:text-white">{orders.length}</div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-4 border border-amber-200 dark:border-amber-800/50">
          <div className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 mb-1"><Clock className="w-3 h-3" /> انتظار</div>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-300">{totalPending}</div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800/50">
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1"><CheckCircle2 className="w-3 h-3" /> سُلّم</div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{totalDelivered}</div>
        </div>
        <div className="bg-rose-50 dark:bg-rose-950/30 rounded-2xl p-4 border border-rose-200 dark:border-rose-800/50">
          <div className="flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-400 mb-1"><XCircle className="w-3 h-3" /> ملغي</div>
          <div className="text-2xl font-black text-rose-700 dark:text-rose-300">{totalCancelled}</div>
        </div>
      </div>

      {/* STATS TAB */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          <h2 className="text-base font-black text-stone-800 dark:text-stone-200 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-500" /> إحصائيات الطلبات مقسّمة حسب المطعم
          </h2>
          {loading ? (
            <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-32 rounded-2xl bg-stone-200 dark:bg-stone-800 animate-pulse" />)}</div>
          ) : statsPerRestaurant.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
              <Store className="w-10 h-10 text-stone-300 dark:text-stone-700 mx-auto mb-2" />
              <p className="text-sm font-bold text-stone-500">لا توجد طلبات بعد</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {statsPerRestaurant.map((r, idx) => {
                const colorClass = RESTAURANT_COLORS[idx % RESTAURANT_COLORS.length];
                const deliveryRate = r.total > 0 ? Math.round((r.delivered / r.total) * 100) : 0;
                return (
                  <div key={r.id} className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-2xl ${colorClass} text-white flex items-center justify-center shrink-0`}>
                        <Store className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-black text-sm text-stone-900 dark:text-white">{r.name}</div>
                        <div className="text-xs text-stone-500">{r.total} طلب إجمالي</div>
                      </div>
                      <div className="text-left">
                        <div className="text-[10px] font-bold text-stone-400">معدل التسليم</div>
                        <div className={`text-xl font-black ${ deliveryRate >= 80 ? 'text-emerald-600' : deliveryRate >= 50 ? 'text-amber-600' : 'text-rose-600' }`}>
                          {deliveryRate}%
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div className="text-center bg-stone-50 dark:bg-stone-800 rounded-xl p-2.5">
                        <div className="text-lg font-black text-stone-800 dark:text-white">{r.total}</div>
                        <div className="text-[10px] font-bold text-stone-400">الكل</div>
                      </div>
                      <div className="text-center bg-amber-50 dark:bg-amber-950/30 rounded-xl p-2.5">
                        <div className="text-lg font-black text-amber-700 dark:text-amber-300">{r.pending}</div>
                        <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400">انتظار</div>
                      </div>
                      <div className="text-center bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-2.5">
                        <div className="text-lg font-black text-emerald-700 dark:text-emerald-300">{r.delivered}</div>
                        <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">سُلّم</div>
                      </div>
                      <div className="text-center bg-stone-50 dark:bg-stone-800 rounded-xl p-2.5">
                        <div className="text-lg font-black text-stone-700 dark:text-stone-300 flex items-center justify-center gap-0.5">
                          <Package className="w-3.5 h-3.5 text-stone-400" />{r.totalItems}
                        </div>
                        <div className="text-[10px] font-bold text-stone-400">وجبة</div>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all" style={{ width: `${deliveryRate}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* LIST TAB */}
      {activeTab === 'list' && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-4 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="ابحث بالاسم أو رقم الهاتف أو رقم الطلب أو المطعم..."
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
              <option value="PREPARING">جاري التجهيز بالمطبخ</option>
              <option value="OUT_FOR_DELIVERY">في الطريق مع المندوب</option>
              <option value="DELIVERED">تم التسليم</option>
              <option value="CANCELLED">ملغي</option>
            </select>
            {restaurants.length > 0 && (
              <div className="relative">
                <Filter className="w-4 h-4 absolute right-3 top-3 text-stone-400 pointer-events-none" />
                <select
                  value={restaurantFilter}
                  onChange={(e) => setRestaurantFilter(e.target.value)}
                  className="pr-9 pl-4 py-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none min-w-[160px]"
                >
                  <option value="ALL">كل المطاعم</option>
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="text-xs text-stone-500 font-bold flex items-center gap-2">
            <span>إجمالي:</span>
            <span className="text-orange-600 font-black">{orders.length}</span>
            <span>طلب</span>
            {restaurantFilter !== 'ALL' && (
              <span className="text-stone-400">— مفلتر: <span className="text-orange-500 font-black">{restaurants.find((r) => r.id === restaurantFilter)?.name}</span></span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-stone-200 dark:bg-stone-800 animate-pulse" />)}</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-3">
              <ClipboardList className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto" />
              <p className="font-bold text-stone-600 dark:text-stone-400">لا توجد طلبات تطابق بحثك</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/60 text-stone-500 text-[11px] font-black uppercase tracking-wider">
                      <th className="py-3.5 px-4">رقم الطلب / الوقت</th>
                      <th className="py-3.5 px-4">العميل والهاتف</th>
                      <th className="py-3.5 px-4">المطعم</th>
                      <th className="py-3.5 px-4">الوجبات والملاحظات</th>
                      <th className="py-3.5 px-4">العنوان واللوكيشن</th>
                      <th className="py-3.5 px-4 text-left">الإجمالي</th>
                      <th className="py-3.5 px-4">الحالة</th>
                      <th className="py-3.5 px-4 text-center">مراحل الطلب</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {orders.map((order) => (
                      <OrderTableRow
                        key={order.id}
                        order={order}
                        onStatusChange={handleStatusChange}
                        restaurantList={restaurants}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
