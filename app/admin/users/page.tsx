'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Crown, Phone, ShoppingBag, CheckCircle2, Clock, Edit3, Trash2, X, Save, Eye, EyeOff, Lock, User as UserIcon, Shield, RefreshCw, AlertCircle } from 'lucide-react';

interface UserWithStats {
  id: string;
  name: string;
  phone: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
  totalOrders: number;
  pending: number;
  delivered: number;
}

interface EditForm {
  name: string;
  phone: string;
  password: string;
  role: 'ADMIN' | 'USER';
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserWithStats | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ name: '', phone: '', password: '', role: 'USER' });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserWithStats | null>(null);
  const [filter, setFilter] = useState<'all' | 'ADMIN' | 'USER'>('all');

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
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

  const handleSave = async () => {
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
      showToast(data.message || 'تم التحديث بنجاح', 'success');
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: UserWithStats) => {
    setDeleting(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل الحذف');
      showToast(data.message || 'تم الحذف بنجاح', 'success');
      setConfirmDelete(null);
      await fetchUsers();
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = users.filter(u => filter === 'all' ? true : u.role === filter);
  const adminCount = users.filter(u => u.role === 'ADMIN').length;
  const userCount = users.filter(u => u.role === 'USER').length;

  return (
    <div className="space-y-6 relative">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl shadow-xl text-white font-bold text-sm flex items-center gap-2 transition-all ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-orange-500" />
            <span>إدارة المستخدمين</span>
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            إجمالي {users.length} مستخدم — {adminCount} مشرف — {userCount} طالب
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-orange-50 dark:hover:bg-stone-700 text-sm font-bold transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: `الكل (${users.length})` },
          { key: 'ADMIN', label: `مشرفين (${adminCount})` },
          { key: 'USER', label: `طلاب (${userCount})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as 'all' | 'ADMIN' | 'USER')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filter === tab.key
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:border-orange-300'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-stone-400">
            <RefreshCw className="w-6 h-6 animate-spin ml-2" />
            <span>جاري التحميل...</span>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/80 text-xs font-black text-stone-500 uppercase">
                    <th className="py-3 px-4 text-right">#</th>
                    <th className="py-3 px-4 text-right">المستخدم</th>
                    <th className="py-3 px-4 text-right">الهاتف</th>
                    <th className="py-3 px-4 text-center">الصلاحية</th>
                    <th className="py-3 px-4 text-center">الطلبات</th>
                    <th className="py-3 px-4 text-center">معلق</th>
                    <th className="py-3 px-4 text-center">مسلم</th>
                    <th className="py-3 px-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {filtered.map((user, i) => (
                    <tr key={user.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                      <td className="py-3 px-4 text-stone-400 text-xs">{i + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl text-white font-bold flex items-center justify-center text-xs shrink-0 ${user.role === 'ADMIN' ? 'bg-amber-500' : 'bg-orange-500'}`}>
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-extrabold text-stone-900 dark:text-stone-100 truncate max-w-[150px]">{user.name}</div>
                            <div className="text-[11px] text-stone-400">
                              {new Date(user.createdAt || '').toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-stone-600 dark:text-stone-300 text-xs font-medium" dir="ltr">{user.phone}</td>
                      <td className="py-3 px-4 text-center">
                        {user.role === 'ADMIN' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
                            <Crown className="w-3 h-3 fill-amber-500 text-amber-500" />مشرف
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[11px] font-bold">طالب</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-black text-orange-600 dark:text-orange-400">{user.totalOrders}</td>
                      <td className="py-3 px-4 text-center font-bold text-amber-600 dark:text-amber-400">{user.pending}</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">{user.delivered}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(user)}
                            className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                            title="تعديل"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(user)}
                            className="p-2 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-stone-100 dark:divide-stone-800">
              {filtered.map((user, i) => (
                <div key={user.id} className="p-4 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl text-white font-bold flex items-center justify-center text-sm shrink-0 ${user.role === 'ADMIN' ? 'bg-amber-500' : 'bg-orange-500'}`}>
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-stone-900 dark:text-stone-100 text-sm truncate">{user.name}</div>
                        <div className="text-xs text-stone-400 font-mono" dir="ltr">{user.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => openEdit(user)} className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 hover:bg-blue-100 transition-colors">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setConfirmDelete(user)} className="p-2 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 hover:bg-red-100 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3 flex-wrap">
                    {user.role === 'ADMIN' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 text-[11px] font-bold">
                        <Crown className="w-3 h-3 fill-amber-500 text-amber-500" />مشرف
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 text-[11px] font-bold">طالب</span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-orange-600 font-bold">
                      <ShoppingBag className="w-3.5 h-3.5" />{user.totalOrders} طلب
                    </span>
                    <span className="flex items-center gap-1 text-xs text-amber-600 font-bold">
                      <Clock className="w-3.5 h-3.5" />{user.pending} معلق
                    </span>
                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />{user.delivered} مسلم
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-1">
                    #{i + 1} · انضم {new Date(user.createdAt || '').toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && !loading && (
              <div className="py-16 text-center text-stone-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-bold">لا يوجد مستخدمون</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-br from-stone-900 to-stone-800 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-black text-white text-sm">تعديل بيانات المستخدم</h3>
                  <p className="text-stone-400 text-xs mt-0.5">{editingUser.name}</p>
                </div>
              </div>
              <button onClick={() => setEditingUser(null)} className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-black text-stone-700 dark:text-stone-300 mb-1.5">الاسم الكامل</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute right-3 top-3 text-stone-400" />
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full pr-10 pl-4 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-black text-stone-700 dark:text-stone-300 mb-1.5">رقم الهاتف (للدخول)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute right-3 top-3 text-stone-400" />
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full pr-10 pl-4 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-black text-stone-700 dark:text-stone-300 mb-1.5">
                  كلمة المرور الجديدة <span className="text-stone-400 font-normal">(اتركها فاضية لو مش هتغيرها)</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute right-3 top-3 text-stone-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={editForm.password}
                    onChange={e => setEditForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="كلمة مرور جديدة..."
                    className="w-full pr-10 pl-10 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-3 text-stone-400 hover:text-stone-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-black text-stone-700 dark:text-stone-300 mb-1.5">الصلاحية</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setEditForm(p => ({ ...p, role: 'USER' }))}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-2xl border text-xs font-bold transition-all ${editForm.role === 'USER'
                      ? 'bg-stone-800 text-white border-stone-800'
                      : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-400'
                      }`}
                  >
                    <UserIcon className="w-4 h-4" />طالب
                  </button>
                  <button
                    onClick={() => setEditForm(p => ({ ...p, role: 'ADMIN' }))}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-2xl border text-xs font-bold transition-all ${editForm.role === 'ADMIN'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-amber-400'
                      }`}
                  >
                    <Shield className="w-4 h-4" />مشرف
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 pb-5 flex gap-3">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 py-3 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 font-bold text-sm hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm flex items-center justify-center gap-2 hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 transition-all shadow-lg shadow-orange-500/25"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-black text-stone-900 dark:text-white mb-1">تأكيد الحذف</h3>
            <p className="text-sm text-stone-500 mb-1">هتحذف المستخدم:</p>
            <p className="font-black text-orange-600 mb-1">{confirmDelete.name}</p>
            <p className="text-xs text-stone-400 font-mono mb-5" dir="ltr">{confirmDelete.phone}</p>
            <p className="text-xs text-red-500 font-bold mb-5 flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>العملية دي مش ممكن تتراجع فيها!</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-600 font-bold text-sm hover:bg-stone-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deleting === confirmDelete.id}
                className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
              >
                {deleting === confirmDelete.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                نعم، احذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
