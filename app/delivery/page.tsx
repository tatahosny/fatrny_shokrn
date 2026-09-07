'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/lib/types';
import {
  Bike,
  Package,
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  RefreshCw,
  LogOut,
  Navigation,
  UtensilsCrossed,
  User,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function DeliveryDashboard() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myActiveOrders, setMyActiveOrders] = useState<Order[]>([]);
  const [myCompletedOrders, setMyCompletedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [deliveringId, setDeliveringId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    if (!isLoading) {
      if (!user || (user.role !== 'DELIVERY' && user.role !== 'ADMIN')) {
        router.replace('/delivery/login');
      }
    }
  }, [user, isLoading, router]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/delivery/orders', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setAvailableOrders(data.availableOrders || []);
      setMyActiveOrders(data.myActiveOrders || []);
      setMyCompletedOrders(data.myCompletedOrders || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000); // Polling every 15s for live new orders
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Claim Order (مسك الطلب)
  const handleClaimOrder = async (orderId: string, orderNumber: number) => {
    try {
      setClaimingId(orderId);
      const res = await fetch(`/api/delivery/orders/${orderId}/claim`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(`تم إسناد الطلب #${orderNumber} لك بنجاح وبدء التوصيل 🛵`);
        fetchOrders();
      } else {
        showNotification(data.error || 'فشل استلام الطلب', 'error');
      }
    } catch {
      showNotification('حدث خطأ أثناء استلام الطلب', 'error');
    } finally {
      setClaimingId(null);
    }
  };

  // Mark Order as Delivered
  const handleMarkDelivered = async (orderId: string, orderNumber: number) => {
    try {
      setDeliveringId(orderId);
      const res = await fetch(`/api/delivery/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DELIVERED' }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(`تم تسجيل تسليم الطلب #${orderNumber} بنجاح! شكراً لك 🎉`);
        fetchOrders();
      } else {
        showNotification(data.error || 'فشل تسجيل التسليم', 'error');
      }
    } catch {
      showNotification('حدث خطأ أثناء تحديث حالة الطلب', 'error');
    } finally {
      setDeliveringId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/delivery/login');
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-100">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
          <p className="text-xs font-bold text-stone-400">جاري تحميل طلبات الديلفري...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-6 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Driver Bar */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 flex items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-orange-500 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/20">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base text-white">{user?.name}</h1>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  كابتن توصيل 🛵
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {user?.restaurantName ? `مندوب مطعم: ${user.restaurantName}` : 'مندوب فطرني شكراً'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
              title="تحديث الطلبات"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/60 text-xs font-bold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>

        {/* Notification Alert */}
        {notification && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border shadow-lg ${
              notification.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                : 'bg-red-950/80 text-red-300 border-red-800'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{notification.text}</span>
          </div>
        )}

        {/* Counters Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 text-center">
            <span className="text-[11px] text-stone-400 font-bold block mb-1">معي بالدرب 🛵</span>
            <span className="text-2xl font-black text-purple-400">{myActiveOrders.length}</span>
          </div>
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 text-center">
            <span className="text-[11px] text-stone-400 font-bold block mb-1">طلبات متاحة للاستلام</span>
            <span className="text-2xl font-black text-orange-400">{availableOrders.length}</span>
          </div>
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 text-center">
            <span className="text-[11px] text-stone-400 font-bold block mb-1">سلمتها اليوم ✅</span>
            <span className="text-2xl font-black text-emerald-400">{myCompletedOrders.length}</span>
          </div>
        </div>

        {/* SECTION 1: MY ACTIVE ORDERS (قيد التوصيل حالياً) */}
        <div className="space-y-3">
          <h2 className="text-sm font-black text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-purple-400" />
            <span>طلباتي قيد التوصيل الآن ({myActiveOrders.length})</span>
          </h2>

          {myActiveOrders.length === 0 ? (
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 text-center text-xs text-stone-500">
              لا توجد طلبات جارية معك حالياً. اختر طلباً من قسم الطلبات المتاحة بالأسفل لمسكه وتوصيله.
            </div>
          ) : (
            <div className="space-y-4">
              {myActiveOrders.map((order) => {
                const mapLink = order.locationUrl || (order.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}` : null);
                return (
                  <div
                    key={order.id}
                    className="bg-stone-900 border-2 border-purple-500/50 rounded-3xl p-5 space-y-4 shadow-xl shadow-purple-500/5"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-xl bg-purple-500 text-white font-black text-sm">
                          #{order.orderNumber}
                        </span>
                        <span className="text-xs font-bold text-stone-300">
                          {order.restaurantName || 'المطعم'}
                        </span>
                      </div>

                      <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/60">
                        المبلغ المطلوب: {order.totalAmount || 0} ج.م
                      </span>
                    </div>

                    {/* Customer & Address Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-850 p-4 rounded-2xl border border-stone-800">
                      <div className="space-y-1">
                        <span className="text-[11px] text-stone-400 font-bold block">العميل:</span>
                        <div className="font-black text-sm text-white flex items-center gap-2">
                          <span>{order.userName}</span>
                          {order.userRole === 'STUDENT' && (
                            <span className="text-[10px] bg-indigo-900/60 text-indigo-300 px-1.5 py-0.5 rounded-full">
                              طالب 🎓
                            </span>
                          )}
                        </div>
                        <a
                          href={`tel:${order.userPhone}`}
                          className="inline-flex items-center gap-1.5 text-xs text-orange-400 hover:underline font-mono font-bold mt-1"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>اتصال بالعميل: {order.userPhone}</span>
                        </a>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] text-stone-400 font-bold block">مكان وعنوان التسليم:</span>
                        <p className="text-xs font-bold text-stone-200">
                          {order.address || 'استلام داخل الجامعة'}
                        </p>

                        {mapLink && (
                          <a
                            href={mapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>فتح الاتجاهات في Google Maps ↗</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Items preview */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] text-stone-400 font-bold block">محتويات الوجبة:</span>
                      <div className="flex flex-wrap gap-2">
                        {order.items.map((it) => (
                          <span
                            key={it.id}
                            className="px-2.5 py-1 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xs font-bold"
                          >
                            {it.quantity}× {it.foodName}
                            {it.notes ? ` (${it.notes})` : ''}
                          </span>
                        ))}
                      </div>
                      {order.notes && (
                        <p className="text-[11px] text-amber-400 bg-amber-950/40 p-2 rounded-xl border border-amber-800/40">
                          ملاحظة: {order.notes}
                        </p>
                      )}
                    </div>

                    {/* Action button */}
                    <button
                      onClick={() => handleMarkDelivered(order.id, order.orderNumber)}
                      disabled={deliveringId === order.id}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{deliveringId === order.id ? 'جاري التسجيل...' : 'تأكيد تسليم الطلب للعميل واستلام المبلغ ✅'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 2: AVAILABLE ORDERS (طلبات متاحة للاستلام) */}
        <div className="space-y-3 pt-4 border-t border-stone-800">
          <h2 className="text-sm font-black text-white flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-orange-400" />
            <span>طلبات جاهزة للاستلام من المطعم ({availableOrders.length})</span>
          </h2>

          {availableOrders.length === 0 ? (
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 text-center text-xs text-stone-500">
              لا توجد طلبات جديدة بانتظار التوصيل حالياً
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableOrders.map((order) => {
                const mapLink = order.locationUrl || (order.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}` : null);
                return (
                  <div
                    key={order.id}
                    className="bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 font-black text-xs">
                          #{order.orderNumber}
                        </span>
                        <span className="text-xs font-bold text-stone-400">
                          {order.items.reduce((s, it) => s + it.quantity, 0)} أصناف • {order.totalAmount} ج.م
                        </span>
                      </div>

                      <div className="text-xs font-bold text-stone-200">
                        <span className="text-stone-400 block text-[11px]">العميل:</span>
                        <span>{order.userName}</span>
                      </div>

                      <div className="text-xs font-bold text-stone-200">
                        <span className="text-stone-400 block text-[11px]">العنوان:</span>
                        <p className="truncate text-stone-300">{order.address || 'استلام داخل الجامعة'}</p>
                      </div>

                      {mapLink && (
                        <a
                          href={mapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline font-bold"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>معاينة الموقع على الخريطة ↗</span>
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => handleClaimOrder(order.id, order.orderNumber)}
                      disabled={claimingId === order.id}
                      className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Bike className="w-4 h-4" />
                      <span>{claimingId === order.id ? 'جاري الاستلام...' : 'مسك الطلب وبدء التوصيل 🛵'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 3: DELIVERED TODAY */}
        {myCompletedOrders.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-stone-800">
            <h2 className="text-sm font-black text-stone-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>طلبات تم تسليمها بنجاح اليوم ({myCompletedOrders.length})</span>
            </h2>

            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-4 divide-y divide-stone-800 text-xs">
              {myCompletedOrders.map((order) => (
                <div key={order.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-300">#{order.orderNumber}</span>
                    <span className="text-stone-400">{order.userName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-emerald-400 font-bold">{order.totalAmount} ج.م</span>
                    <span className="text-[10px] text-stone-500">
                      {order.deliveredAt ? new Date(order.deliveredAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'مسلّم'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
