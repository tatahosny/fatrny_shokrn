'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Crown,
  Phone,
  ShoppingBag,
  CheckCircle2,
  Clock,
  Edit3,
  Trash2,
  X,
  Save,
  Eye,
  EyeOff,
  Lock,
  User as UserIcon,
  Shield,
  RefreshCw,
  AlertCircle,
  Store,
  GraduationCap,
  Plus,
  Building2,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type UserRole = 'ADMIN' | 'RESTAURANT' | 'STUDENT' | 'CUSTOMER' | 'USER';

interface UserWithStats {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  status?: string;
  restaurantId?: string;
  restaurantName?: string;
  createdAt: string;
  totalOrders: number;
  pending: number;
  delivered: number;
}

interface EditForm {
  name: string;
  phone: string;
  password: string;
  role: UserRole;
}

interface RestaurantAccountForm {
  restaurantName: string;
  managerName: string;
  phone: string;
  password: string;
  address: string;
  description: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit User State
  const [editingUser, setEditingUser] = useState<UserWithStats | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ name: '', phone: '', password: '', role: 'CUSTOMER' });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);

  // Add Restaurant Account Modal State
  const [showAddRestModal, setShowAddRestModal] = useState(false);
  const [restForm, setRestForm] = useState<RestaurantAccountForm>({
    restaurantName: '',
    managerName: '',
    phone: '',
    password: '',
    address: '',
    description: '',
  });
  const [submittingRest, setSubmittingRest] = useState(false);

  // Delete & Filter States
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserWithStats | null>(null);
  const [filter, setFilter] = useState<'all' | UserRole>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, ordersRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/orders'),
      ]);
      const usersData = await usersRes.json();
      const ordersData = await ordersRes.json();

      const orders = ordersData.orders || [];
      const enriched: UserWithStats[] = (usersData.users || []).map((u: UserWithStats) => {
        const userOrders = orders.filter((o: { userId: string; status: string }) => o.userId === u.id);
        return {
          ...u,
          totalOrders: userOrders.filter((o: { status: string }) => o.status !== 'CANCELLED').length,
          pending: userOrders.filter((o: { status: string }) => o.status === 'PENDING').length,
          delivered: userOrders.filter((o: { status: string }) => o.status === 'DELIVERED').length,
        };
      }).sort((a: UserWithStats, b: UserWithStats) => b.totalOrders - a.totalOrders);

      setUsers(enriched);
    } catch {
      showToast('فشل في تحميل المستخدمين', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openEdit = (user: UserWithStats) => {
    setEditingUser(user);
    setEditForm({ name: user.name, phone: user.phone, password: '', role: user.role });
    setShowPass(false);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const body: Record<string, string> = {};
      if (editForm.name.trim() !== editingUser.name) body.name = editForm.name.trim();
      if (editForm.phone.trim() !== editingUser.phone) body.phone = editForm.phone.trim();
      if (editForm.password.trim()) body.password = editForm.password.trim();
      if (editForm.role !== editingUser.role) body.role = editForm.role;

      if (Object.keys(body).length === 0) {
        showToast('لا يوجد تغييرات للحفظ', 'error');
        setSaving(false);
        return;
      }

      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل التحديث');
      showToast(data.message || 'تم تحديث بيانات المستخدم بنجاح', 'success');
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Submit Add Restaurant Account
  const handleCreateRestaurantAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restForm.restaurantName.trim()) {
      showToast('اسم المطعم مطلوب', 'error');
      return;
    }
    if (!restForm.phone.trim()) {
      showToast('رقم هاتف الدخول مطلوب', 'error');
      return;
    }
    if (!restForm.password.trim() || restForm.password.trim().length < 4) {
      showToast('كلمة المرور يجب أن لا تقل عن 4 خانات', 'error');
      return;
    }

    setSubmittingRest(true);
    try {
      const res = await fetch('/api/admin/restaurants/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(restForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل إنشاء حساب المطعم');
      }

      showToast(data.message || 'تم إنشاء حساب المطعم وإضافته للمطاعم بنجاح!', 'success');
      setShowAddRestModal(false);
      setRestForm({
        restaurantName: '',
        managerName: '',
        phone: '',
        password: '',
        address: '',
        description: '',
      });
      await fetchUsers();
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setSubmittingRest(false);
    }
  };

  const handleDelete = async (user: UserWithStats) => {
    setDeleting(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل الحذف');
      showToast(data.message || 'تم حذف الحساب بنجاح', 'success');
      setConfirmDelete(null);
      await fetchUsers();
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = users.filter((u) => {
    const matchesFilter = filter === 'all' ? true : u.role === filter;
    const matchesSearch = searchQuery
      ? u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone.includes(searchQuery) ||
        (u.restaurantName && u.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: users.length,
    RESTAURANT: users.filter((u) => u.role === 'RESTAURANT').length,
    STUDENT: users.filter((u) => u.role === 'STUDENT').length,
    ADMIN: users.filter((u) => u.role === 'ADMIN').length,
    CUSTOMER: users.filter((u) => u.role === 'CUSTOMER' || u.role === 'USER').length,
  };

  const roleBadge = (role: UserRole, restaurantName?: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
            <Shield className="w-3 h-3 text-amber-500" />
            إدارة عليا
          </span>
        );
      case 'RESTAURANT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30">
            <Store className="w-3 h-3 text-orange-500" />
            <span>إدارة مطعم</span>
            {restaurantName && <span className="font-bold">({restaurantName})</span>}
          </span>
        );
      case 'STUDENT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
            طالب جامعي
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
            <UserIcon className="w-3 h-3" />
            عميل
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl shadow-xl text-white font-bold text-sm flex items-center gap-2 transition-all ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header with Add Restaurant Account Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white flex items-center gap-3">
            <Users className="w-7 h-7 sm:w-8 sm:h-8 text-orange-500" />
            <span>إدارة الحسابات والمستخدمين</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            إجمالي {users.length} حساب مسجل (إدارات المطاعم، الطلاب، المشرفين، والعملاء)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchUsers}
            className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 transition-colors"
            title="تحديث القائمة"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowAddRestModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-xs sm:text-sm shadow-md shadow-orange-500/25 transition-all active:scale-95"
          >
            <Store className="w-4 h-4" />
            <span>+ إضافة حساب مطعم جديد</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { key: 'all', label: 'الكل', count: counts.all },
            { key: 'RESTAURANT', label: 'المطاعم 🍽', count: counts.RESTAURANT },
            { key: 'STUDENT', label: 'الطلاب 🎓', count: counts.STUDENT },
            { key: 'ADMIN', label: 'المشرفين 🛡', count: counts.ADMIN },
            { key: 'CUSTOMER', label: 'العملاء 👤', count: counts.CUSTOMER },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filter === tab.key
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/25'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  filter === tab.key ? 'bg-white/25 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="بحث بالاسم، رقم الهاتف، المطعم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Users List / Table */}
      {loading ? (
        <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
          <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-stone-500">جاري تحميل بيانات الحسابات...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-2">
          <Users className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="font-bold text-stone-700 dark:text-stone-300">لا يوجد حسابات مطابقة</h3>
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm divide-y divide-stone-100 dark:divide-stone-800">
          {filtered.map((u) => (
            <div
              key={u.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md ${
                    u.role === 'RESTAURANT'
                      ? 'bg-gradient-to-tr from-orange-500 to-amber-500 shadow-orange-500/20'
                      : u.role === 'ADMIN'
                      ? 'bg-gradient-to-tr from-amber-500 to-yellow-500 shadow-amber-500/20'
                      : u.role === 'STUDENT'
                      ? 'bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-indigo-500/20'
                      : 'bg-gradient-to-tr from-stone-600 to-stone-700'
                  }`}
                >
                  {u.name.charAt(0)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-sm sm:text-base text-stone-900 dark:text-white">
                      {u.name}
                    </span>
                    {roleBadge(u.role, u.restaurantName)}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-stone-500">
                    <span className="flex items-center gap-1 font-semibold" dir="ltr">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      {u.phone}
                    </span>
                    <span>•</span>
                    <span>{u.totalOrders} طلب منفذ</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => openEdit(u)}
                  className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/30 transition-colors"
                  title="تعديل بيانات الحساب"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setConfirmDelete(u)}
                  className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors"
                  title="حذف الحساب"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ADD RESTAURANT ACCOUNT (AUTOMATICALLY ADDS REST) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showAddRestModal && (
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowAddRestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-lg w-full bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200 dark:border-stone-800 overflow-y-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-stone-900 dark:text-white text-base sm:text-lg">
                      إضافة حساب مطعم شريك جديد
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      يتم إضافة المطعم تلقائياً للمنصة وإنشاء حساب دخول خاص به
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowAddRestModal(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateRestaurantAccount} className="space-y-4 mt-4 text-xs font-bold">
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 mb-1">
                    اسم المطعم *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مطعم عم شكشك، شاورما السلطان..."
                    value={restForm.restaurantName}
                    onChange={(e) => setRestForm({ ...restForm, restaurantName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 mb-1">
                    اسم مسؤول / مدير المطعم
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: الحاج أحمد / إدارة المطعم"
                    value={restForm.managerName}
                    onChange={(e) => setRestForm({ ...restForm, managerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 dark:text-stone-300 mb-1">
                      رقم هاتف الدخول (Username) *
                    </label>
                    <input
                      type="tel"
                      dir="ltr"
                      required
                      placeholder="01xxxxxxxxx"
                      value={restForm.phone}
                      onChange={(e) => setRestForm({ ...restForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 dark:text-stone-300 mb-1">
                      كلمة مرور حساب المطعم *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="كلمة مرور الدخول"
                      value={restForm.password}
                      onChange={(e) => setRestForm({ ...restForm, password: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 mb-1">
                    عنوان ومكان المطعم
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: أمام بوابة جامعة برج العرب التكنولوجية"
                    value={restForm.address}
                    onChange={(e) => setRestForm({ ...restForm, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 mb-1">
                    نبذة / وصف المطعم
                  </label>
                  <textarea
                    rows={2}
                    placeholder="أشهى ساندوتشات الفول والفلافل والمأكولات السريعة..."
                    value={restForm.description}
                    onChange={(e) => setRestForm({ ...restForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/40 text-[11px] text-orange-900 dark:text-orange-300 font-bold leading-relaxed">
                  💡 بمجرد التأكيد: سيتم إنشاء سجل المطعم وإضافته للمنصة، ويمكن للمطعم فوراً تسجيل الدخول عبر بوابة المطاعم برقم الهاتف وكلمة المرور.
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddRestModal(false)}
                    className="flex-1 py-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    disabled={submittingRest}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black shadow-md shadow-orange-500/20 transition-all disabled:opacity-50"
                  >
                    {submittingRest ? 'جاري الإنشاء والربط...' : 'إنشاء وتفعيل حساب المطعم'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 2: EDIT EXISTING USER                               */}
      {/* ========================================================= */}
      <AnimatePresence>
        {editingUser && (
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setEditingUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-md w-full bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                <h3 className="font-black text-stone-900 dark:text-white text-base">
                  تعديل بيانات الحساب: {editingUser.name}
                </h3>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mt-4 text-xs font-bold">
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 mb-1">الاسم</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 mb-1">رقم الهاتف</label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 mb-1">
                    كلمة المرور الجديدة (اتركها فارغة إذا لم ترد التغيير)
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 mb-1">نوع الرول (الدور)</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700"
                  >
                    <option value="CUSTOMER">عميل (CUSTOMER)</option>
                    <option value="STUDENT">طالب جامعي (STUDENT)</option>
                    <option value="RESTAURANT">إدارة مطعم (RESTAURANT)</option>
                    <option value="ADMIN">إدارة عليا (ADMIN)</option>
                  </select>
                </div>

                <div className="flex gap-2.5 pt-3">
                  <button
                    onClick={() => setEditingUser(null)}
                    className="flex-1 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black transition-colors disabled:opacity-50"
                  >
                    {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Dialog */}
      <AnimatePresence>
        {confirmDelete && (
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-sm w-full bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 text-center space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-black text-stone-900 dark:text-white">تأكيد حذف الحساب</h3>
              <p className="text-xs text-stone-500">
                هل أنت متأكد من رغبتك في حذف حساب <strong className="text-stone-800 dark:text-stone-200">{confirmDelete.name}</strong>؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  disabled={deleting === confirmDelete.id}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-colors"
                >
                  {deleting === confirmDelete.id ? 'جاري الحذف...' : 'حذف نهائياً'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
