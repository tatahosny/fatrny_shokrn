'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Order, Restaurant, FoodItem, Category, StudentDiscount } from '@/lib/types';
import {
  Store,
  ClipboardList,
  CheckCircle2,
  Clock,
  Package,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  User,
  Phone,
  MessageSquare,
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  Power,
  GraduationCap,
  Percent,
  Save,
  AlertCircle,
  X,
  XCircle,
  StickyNote,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  pendingItemsCount: number;
}

export default function RestaurantDashboard() {
  const { user, isRestaurant, isAdmin, isLoading, logout } = useAuth();
  const router = useRouter();

  // Navigation Tab
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'discounts'>('orders');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'DELIVERED' | 'CANCELLED'>('ALL');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Menu State
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    image: '',
    available: true,
  });

  // Student Discounts State
  const [discountPercent, setDiscountPercent] = useState<number>(15);
  const [discountActive, setDiscountActive] = useState<boolean>(true);
  const [loadingDiscount, setLoadingDiscount] = useState(false);
  const [savingDiscount, setSavingDiscount] = useState(false);

  // General Notification
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    if (!isLoading && !isRestaurant && !isAdmin) {
      router.replace('/restaurant/login');
    }
  }, [isLoading, isRestaurant, isAdmin, router]);

  // Fetch Orders
  const fetchOrders = useCallback(async () => {
    try {
      const url = statusFilter !== 'ALL'
        ? `/api/restaurant/orders?status=${statusFilter}`
        : '/api/restaurant/orders';
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setOrders(data.orders || []);
      setRestaurant(data.restaurant || null);
      setStats(data.stats || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  }, [statusFilter]);

  // Fetch Menu
  const fetchMenu = useCallback(async () => {
    try {
      setLoadingMenu(true);
      const [menuRes, catsRes] = await Promise.all([
        fetch('/api/restaurant/menu', { cache: 'no-store' }),
        fetch('/api/categories', { cache: 'no-store' }),
      ]);
      if (menuRes.ok) {
        const data = await menuRes.json();
        setMenuItems(data.items || []);
      }
      if (catsRes.ok) {
        const catData = await catsRes.json();
        setCategories(catData.categories || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMenu(false);
    }
  }, []);

  // Fetch Student Discount
  const fetchDiscount = useCallback(async () => {
    try {
      setLoadingDiscount(true);
      const res = await fetch('/api/restaurant/discounts', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.discount) {
          setDiscountPercent(data.discount.discountPercent);
          setDiscountActive(data.discount.active);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDiscount(false);
    }
  }, []);

  useEffect(() => {
    if (isRestaurant || isAdmin) {
      fetchOrders();
    }
  }, [fetchOrders, isRestaurant, isAdmin]);

  useEffect(() => {
    if ((isRestaurant || isAdmin) && activeTab === 'menu') {
      fetchMenu();
    }
  }, [fetchMenu, isRestaurant, isAdmin, activeTab]);

  useEffect(() => {
    if ((isRestaurant || isAdmin) && activeTab === 'discounts') {
      fetchDiscount();
    }
  }, [fetchDiscount, isRestaurant, isAdmin, activeTab]);

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    if (activeTab !== 'orders') return;
    const interval = setInterval(() => {
      if (isRestaurant || isAdmin) fetchOrders();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders, isRestaurant, isAdmin, activeTab]);

  const updateOrderStatus = async (orderId: string, newStatus: 'DELIVERED' | 'PENDING' | 'CANCELLED') => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/restaurant/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        fetchOrders();
        showNotification('تم تحديث حالة الطلب بنجاح');
      }
    } finally {
      setUpdatingId(null);
    }
  };

  // Toggle item availability
  const toggleItemAvailability = async (item: FoodItem) => {
    try {
      const newAvailable = !item.available;
      const res = await fetch(`/api/restaurant/menu/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: newAvailable }),
      });
      if (res.ok) {
        setMenuItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, available: newAvailable } : it))
        );
        showNotification(newAvailable ? `تم تنشيط صنف "${item.name}"` : `تم تعطيل صنف "${item.name}"`);
      }
    } catch {
      showNotification('فشل تعديل حالة الصنف', 'error');
    }
  };

  // Delete item
  const handleDeleteItem = async (itemId: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف صنف "${name}" نهائياً من المينيو؟`)) return;
    try {
      const res = await fetch(`/api/restaurant/menu/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        setMenuItems((prev) => prev.filter((it) => it.id !== itemId));
        showNotification(`تم حذف صنف "${name}" بنجاح`);
      } else {
        showNotification('فشل حذف الصنف', 'error');
      }
    } catch {
      showNotification('حدث خطأ أثناء الحذف', 'error');
    }
  };

  // Open add/edit modal
  const openModal = (item?: FoodItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        description: item.description || '',
        price: String(item.price),
        categoryId: item.categoryId || (categories[0]?.id || ''),
        image: item.image || '',
        available: item.available,
      });
    } else {
      setEditingItem(null);
      setItemForm({
        name: '',
        description: '',
        price: '',
        categoryId: categories[0]?.id || '',
        image: '',
        available: true,
      });
    }
    setIsModalOpen(true);
  };

  // Save Item
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name || !itemForm.price) {
      showNotification('يرجى ملء اسم الصنف والسعر', 'error');
      return;
    }

    try {
      const selectedCat = categories.find((c) => c.id === itemForm.categoryId);
      const payload = {
        name: itemForm.name,
        description: itemForm.description,
        price: parseFloat(itemForm.price),
        categoryId: itemForm.categoryId,
        categoryName: selectedCat?.name || '',
        image: itemForm.image || '/images/sandwich-foul.jpg',
        available: itemForm.available,
      };

      if (editingItem) {
        const res = await fetch(`/api/restaurant/menu/${editingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          setMenuItems((prev) =>
            prev.map((it) => (it.id === editingItem.id ? data.item : it))
          );
          showNotification('تم تحديث الصنف بنجاح');
          setIsModalOpen(false);
        } else {
          showNotification('فشل تحديث الصنف', 'error');
        }
      } else {
        const res = await fetch('/api/restaurant/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          setMenuItems((prev) => [data.item, ...prev]);
          showNotification('تم إضافة الصنف الجديد للمينيو بنجاح');
          setIsModalOpen(false);
        } else {
          showNotification('فشل إضافة الصنف', 'error');
        }
      }
    } catch {
      showNotification('حدث خطأ في الاتصال بالخادم', 'error');
    }
  };

  // Save Student Discount
  const handleSaveDiscount = async () => {
    try {
      setSavingDiscount(true);
      const res = await fetch('/api/restaurant/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discountPercent,
          active: discountActive,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(`تم حفظ خصم الطلاب بنجاح (${discountPercent}%)`);
      } else {
        showNotification(data.error || 'فشل حفظ الخصم', 'error');
      }
    } catch {
      showNotification('حدث خطأ أثناء حفظ الخصم', 'error');
    } finally {
      setSavingDiscount(false);
    }
  };

  const statusConfig = {
    PENDING: { label: 'قيد التحضير', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: Clock },
    DELIVERED: { label: 'تم التسليم', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', icon: CheckCircle2 },
    CANCELLED: { label: 'ملغي', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', icon: XCircle },
  };

  if (isLoading || loadingOrders) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-3" />
          <p className="text-stone-600 dark:text-stone-400 font-bold">جاري تحميل لوحة تحكم المطعم...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.replace('/restaurant/login');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-6 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-5">
        
        {/* Standalone Partner Portal Topbar */}
        <div className="w-full bg-stone-900 border border-stone-800 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-white">فطرني شكراً</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  لوحة الشركاء المستقلة
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                {restaurant?.name || user?.restaurantName || 'إدارة المطعم'} {user?.phone ? `(${user.phone})` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            {restaurant?.id && (
              <Link
                href={`/restaurants/${restaurant.id}`}
                target="_blank"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
                <span className="hidden sm:inline">معاينة صفحة المنيو للزبائن</span>
                <span className="sm:hidden">معاينة</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/60 text-xs font-bold transition-colors"
              title="تسجيل الخروج من لوحة المطعم"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
        
        {/* Header Banner */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
              <Store className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white">
                  {restaurant?.name || user?.restaurantName || 'لوحة تحكم المطعم'}
                </h1>
                <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-black">
                  مباشر 🟢
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                تحكم كامل في الطلبات، أسعار وأصناف المينيو، وخصومات طلاب جامعة برج العرب
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'orders'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>الطلبات</span>
              {(stats?.pendingOrders || 0) > 0 && (
                <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
                  {stats?.pendingOrders}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'menu'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>قائمة المينيو</span>
            </button>

            <button
              onClick={() => setActiveTab('discounts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'discounts'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>خصم الطلاب</span>
            </button>
          </div>
        </div>

        {/* Notification Alert */}
        {notification && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border shadow-sm ${
              notification.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{notification.text}</span>
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 1: ORDERS                                                 */}
        {/* ============================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-sm">
                  <div className="flex items-center justify-between text-stone-500 mb-2">
                    <span className="text-xs font-bold">إجمالي الطلبات</span>
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-stone-900 dark:text-white">{stats.totalOrders}</div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-4 border border-amber-200 dark:border-amber-800/50">
                  <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-2">
                    <span className="text-xs font-bold">قيد التحضير</span>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-amber-700 dark:text-amber-300">{stats.pendingOrders}</div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800/50">
                  <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-2">
                    <span className="text-xs font-bold">تم التسليم</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{stats.deliveredOrders}</div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/30 rounded-2xl p-4 border border-purple-200 dark:border-purple-800/50">
                  <div className="flex items-center justify-between text-purple-700 dark:text-purple-400 mb-2">
                    <span className="text-xs font-bold">وجبات مطلوبة الآن</span>
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-purple-700 dark:text-purple-300">{stats.pendingItemsCount}</div>
                </div>
              </div>
            )}

            {/* Filter Bar */}
            <div className="flex items-center justify-between gap-3 bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {(['ALL', 'PENDING', 'DELIVERED', 'CANCELLED'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                      statusFilter === filter
                        ? 'bg-orange-500 text-white'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                    }`}
                  >
                    {filter === 'ALL' && 'الكل'}
                    {filter === 'PENDING' && 'قيد التحضير'}
                    {filter === 'DELIVERED' && 'تم التسليم'}
                    {filter === 'CANCELLED' && 'ملغي'}
                  </button>
                ))}
              </div>

              <button
                onClick={fetchOrders}
                className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-orange-500 font-bold px-3 py-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>تحديث</span>
              </button>
            </div>

            {/* Orders List */}
            {orders.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
                <ClipboardList className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
                <h3 className="text-base font-black text-stone-800 dark:text-stone-200">لا توجد طلبات في هذا القسم</h3>
                <p className="text-xs text-stone-400 mt-1">الطلبات الجديدة الموجهة لمطعمك ستظهر هنا فور إرسالها من العملاء</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const isExpanded = expandedOrder === order.id;
                  const config = statusConfig[order.status] || statusConfig.PENDING;
                  const StatusIcon = config.icon;

                  return (
                    <div
                      key={order.id}
                      className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden"
                    >
                      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-black flex items-center justify-center text-sm">
                            #{order.orderNumber}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm">{order.userName}</span>
                              {order.userRole === 'STUDENT' && (
                                <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                                  طالب 🎓
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-stone-400 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                <a href={`tel:${order.userPhone}`} dir="ltr" className="hover:text-orange-500">
                                  {order.userPhone}
                                </a>
                              </span>
                              <span>•</span>
                              <span>{new Date(order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                          {order.totalAmount !== undefined && (
                            <div className="text-right">
                              <span className="text-[10px] text-stone-400 block font-bold">الإجمالي</span>
                              <span className="font-black text-sm text-stone-900 dark:text-white">
                                {order.totalAmount} ج.م
                              </span>
                            </div>
                          )}

                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${config.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            <span>{config.label}</span>
                          </span>

                          <button
                            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                            className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600"
                          >
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Order Items */}
                      {isExpanded && (
                        <div className="border-t border-stone-100 dark:border-stone-800 p-4 bg-stone-50/50 dark:bg-stone-800/30 space-y-3">
                          <div className="space-y-2">
                            {order.items.map((it) => (
                              <div key={it.id} className="flex items-center justify-between text-xs py-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-orange-600">{it.quantity}×</span>
                                  <span className="font-bold text-stone-800 dark:text-stone-200">{it.foodName}</span>
                                  {it.notes && (
                                    <span className="text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md font-bold">
                                      {it.notes}
                                    </span>
                                  )}
                                </div>
                                <span className="font-bold text-stone-600 dark:text-stone-400">
                                  {it.price ? `${it.price * it.quantity} ج.م` : ''}
                                </span>
                              </div>
                            ))}
                          </div>

                          {order.notes && (
                            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300">
                              <StickyNote className="w-4 h-4 shrink-0 mt-0.5" />
                              <span>{order.notes}</span>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200/60 dark:border-stone-700/60">
                            {order.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                                  disabled={updatingId === order.id}
                                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>تم التسليم</span>
                                </button>
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                                  disabled={updatingId === order.id}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900"
                                >
                                  <XCircle className="w-4 h-4" />
                                  <span>إلغاء الطلب</span>
                                </button>
                              </>
                            )}

                            {order.status === 'DELIVERED' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'PENDING')}
                                disabled={updatingId === order.id}
                                className="text-xs text-stone-500 hover:text-stone-700 underline"
                              >
                                إعادة كقيد التحضير
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 2: MENU MANAGEMENT                                        */}
        {/* ============================================================= */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800">
              <div>
                <h2 className="text-base font-black text-stone-900 dark:text-white">
                  أصناف وقائمة طعام مطعمك
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  تحكم كامل في الأسعار، التنشيط والتعطيل، وإضافة أصناف جديدة مباشرة
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchMenu}
                  className="p-2.5 rounded-xl text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingMenu ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => openModal()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black bg-orange-500 text-white hover:bg-orange-600 shadow-md shadow-orange-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة صنف جديد</span>
                </button>
              </div>
            </div>

            {loadingMenu ? (
              <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
                <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
                <p className="text-sm font-bold text-stone-500">جاري تحميل قائمة المينيو...</p>
              </div>
            ) : menuItems.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
                <UtensilsCrossed className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
                <h3 className="text-base font-black text-stone-800 dark:text-stone-200">لا توجد أصناف في المينيو حتى الآن</h3>
                <p className="text-xs text-stone-400 mt-1 mb-4">ابدأ بإضافة أول صنف لمطعمك ليتمكن الطلاب والعملاء من طلبه</p>
                <button
                  onClick={() => openModal()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-orange-500 text-white"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة صنف الآن</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white dark:bg-stone-900 rounded-3xl border p-4 shadow-sm flex flex-col justify-between transition-all ${
                      item.available
                        ? 'border-stone-200 dark:border-stone-800 hover:border-orange-300'
                        : 'border-stone-200 dark:border-stone-800 opacity-60 bg-stone-50/70'
                    }`}
                  >
                    <div>
                      {/* Image and badges */}
                      <div className="relative w-full h-36 rounded-2xl overflow-hidden mb-3 bg-stone-100 dark:bg-stone-800">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400 font-bold text-xs">
                            بدون صورة
                          </div>
                        )}
                        <span className="absolute top-2 right-2 bg-stone-900/80 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                          {item.categoryName || 'طعام'}
                        </span>

                        <span
                          className={`absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-full border ${
                            item.available
                              ? 'bg-emerald-500 text-white border-emerald-400'
                              : 'bg-stone-600 text-stone-200 border-stone-500'
                          }`}
                        >
                          {item.available ? 'نشط ومتاح' : 'معطل مؤقتاً'}
                        </span>
                      </div>

                      {/* Name & description */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-black text-base text-stone-900 dark:text-white line-clamp-1">
                          {item.name}
                        </h3>
                        <span className="font-black text-base text-orange-600 shrink-0">
                          {item.price} ج.م
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 min-h-[2rem]">
                        {item.description || 'وجبة طازجة وشهية يتم تحضيرها يومياً'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 mt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                      {/* Toggle Active Button */}
                      <button
                        onClick={() => toggleItemAvailability(item)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          item.available
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100'
                            : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-300'
                        }`}
                        title={item.available ? 'تعطيل الصنف' : 'تنشيط الصنف'}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{item.available ? 'نشط' : 'معطل'}</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openModal(item)}
                          className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                          title="تعديل الصنف والسعر"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          className="p-2 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/30 hover:bg-red-100 transition-colors"
                          title="حذف الصنف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 3: STUDENT DISCOUNTS                                      */}
        {/* ============================================================= */}
        {activeTab === 'discounts' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-stone-900 dark:text-white">
                    إدارة عروض وخصومات طلاب الجامعة
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    حدد نسبة الخصم الممنوحة لطلاب جامعة برج العرب التكنولوجية المعتمدين
                  </p>
                </div>
              </div>

              {loadingDiscount ? (
                <div className="text-center py-10">
                  <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-stone-400">جاري تحميل إعدادات الخصم...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Status Toggle Switch */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                    <div>
                      <div className="text-sm font-black text-stone-900 dark:text-white">
                        حالة عرض الطلاب
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        {discountActive ? 'العرض مفعل ومتاح لجميع الطلاب المعتمدين' : 'العرض متوقف مؤقتاً'}
                      </div>
                    </div>

                    <button
                      onClick={() => setDiscountActive(!discountActive)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        discountActive ? 'bg-orange-500' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          discountActive ? 'translate-x-1' : 'translate-x-6'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Percentage Slider & Input */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-stone-700 dark:text-stone-300">
                        نسبة الخصم المئوية (%):
                      </label>
                      <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-950/40 text-orange-600 px-3 py-1 rounded-xl font-black text-base border border-orange-200 dark:border-orange-800">
                        <span>%{discountPercent}</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min="5"
                      max="50"
                      step="5"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />

                    {/* Quick percentage buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      {[10, 15, 20, 25, 30].map((pct) => (
                        <button
                          key={pct}
                          onClick={() => setDiscountPercent(pct)}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                            discountPercent === pct
                              ? 'bg-orange-500 text-white shadow-sm'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                          }`}
                        >
                          %{pct}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Explanation Info */}
                  <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-300 space-y-1.5 leading-relaxed">
                    <div className="font-black flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>كيف يعمل خصم الطلاب؟</span>
                    </div>
                    <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80">
                      • يظهر بادج الخصم الخاص بمطعمك على الصفحة الرئيسية وفي قائمة المينيو.
                      <br />
                      • يطبق الخصم تلقائياً وبشكل حصري على حسابات الطلاب الذين تم التحقق من كرنيهاتهم من قبل إدارة الجامعة.
                      <br />
                      • الزبائن العاديين لا يستفيدون من هذا الخصم ويشترون بالأسعار الأصلية.
                    </p>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSaveDiscount}
                    disabled={savingDiscount}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm shadow-lg shadow-orange-500/20 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingDiscount ? 'جاري الحفظ...' : 'حفظ ونشر الخصم للطلاب'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ============================================================= */}
      {/* MODAL: ADD / EDIT FOOD ITEM                                   */}
      {/* ============================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative max-w-lg w-full bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800 mb-4">
              <h3 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-orange-500" />
                <span>{editingItem ? 'تعديل صنف في المينيو' : 'إضافة صنف جديد للمينيو'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-900 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  اسم الصنف *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ساندوتش فول إسكندراني بالزيت الحار"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    السعر (ج.م) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="مثال: 15"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    التصنيف
                  </label>
                  <select
                    value={itemForm.categoryId}
                    onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  رابط الصورة (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="https://... أو مسار الصورة"
                  value={itemForm.image}
                  onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  الوصف أو المكونات
                </label>
                <textarea
                  rows={2}
                  placeholder="مكونات الوجبة، طريقة التقديم، إلخ..."
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="availableCheck"
                  checked={itemForm.available}
                  onChange={(e) => setItemForm({ ...itemForm, available: e.target.checked })}
                  className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="availableCheck" className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  الصنف متاح وجاهز للطلب الفوري في المينيو
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20"
                >
                  {editingItem ? 'حفظ التعديلات' : 'إضافة الصنف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
