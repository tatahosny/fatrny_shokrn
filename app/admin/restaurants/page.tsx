'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Restaurant } from '@/lib/types';
import {
  Store, Plus, Pencil, Trash2, CheckCircle2, XCircle, Phone,
  MapPin, UtensilsCrossed, X, Save, AlertTriangle, RefreshCw, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface RestaurantWithCount extends Restaurant {
  foodCount?: number;
}

export default function AdminRestaurantsPage() {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<RestaurantWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    image: '',
    description: '',
    address: '',
    active: true,
    managerName: '',
    managerPassword: '',
  });

  useEffect(() => {
    if (!isLoading && !isAdmin) router.replace('/');
  }, [isLoading, isAdmin, router]);

  const fetchRestaurants = useCallback(async () => {
    try {
      const res = await fetch('/api/restaurants');
      const data = await res.json();
      const rests: Restaurant[] = data.restaurants || [];

      // Get food counts
      const withCounts = await Promise.all(
        rests.map(async (r) => {
          try {
            const fr = await fetch(`/api/foods?restaurantId=${r.id}`);
            const fd = await fr.json();
            return { ...r, foodCount: (fd.foods || []).length };
          } catch {
            return { ...r, foodCount: 0 };
          }
        })
      );
      setRestaurants(withCounts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchRestaurants();
  }, [isAdmin, fetchRestaurants]);

  const resetForm = () => {
    setForm({ name: '', phone: '', image: '', description: '', address: '', active: true, managerName: '', managerPassword: '' });
    setEditingId(null);
  };

  const openAdd = () => { resetForm(); setShowModal(true); };
  const openEdit = (r: Restaurant) => {
    setForm({
      name: r.name,
      phone: r.phone,
      image: r.image || '',
      description: r.description || '',
      address: r.address || '',
      active: r.active,
      managerName: '',
      managerPassword: '',
    });
    setEditingId(r.id);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    setSubmitting(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/restaurants/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          if (form.managerPassword && form.managerPassword.trim()) {
            await fetch('/api/admin/restaurants/account', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                restaurantId: editingId,
                newPassword: form.managerPassword,
                managerName: form.managerName,
                phone: form.phone,
              }),
            });
          }
          setShowModal(false);
          fetchRestaurants();
        } else {
          const errData = await res.json();
          alert(errData.error || 'فشل تعديل المطعم');
        }
      } else {
        const res = await fetch('/api/admin/restaurants/account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            restaurantName: form.name,
            managerName: form.managerName,
            phone: form.phone,
            password: form.managerPassword || '123456',
            address: form.address,
            description: form.description,
            image: form.image,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setShowModal(false);
          fetchRestaurants();
        } else {
          alert(data.error || 'فشل إضافة المطعم');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/restaurants/${id}`, { method: 'DELETE' });
      if (res.ok) { setDeleteConfirmId(null); fetchRestaurants(); }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleActive = async (r: Restaurant) => {
    await fetch(`/api/restaurants/${r.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...r, active: !r.active }),
    });
    fetchRestaurants();
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2">
              <Store className="w-6 h-6 text-orange-500" />
              إدارة المطاعم
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              {restaurants.length} مطعم مسجل في المنصة
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchRestaurants}
              className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm shadow-md shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              إضافة مطعم جديد
            </button>
          </div>
        </div>

        {/* Restaurants Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-64 rounded-3xl bg-stone-200 dark:bg-stone-800 animate-pulse" />)}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
            <Store className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-600 dark:text-stone-400 font-bold">لا توجد مطاعم بعد</p>
            <p className="text-xs text-stone-500 mt-1">ابدأ بإضافة أول مطعم شريك</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((r) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="relative h-36 overflow-hidden">
                  <Image
                    src={r.image || '/images/sandwich-foul.jpg'}
                    alt={r.name}
                    fill
                    className="object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/sandwich-foul.jpg'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {/* Active Badge */}
                  <button
                    onClick={() => toggleActive(r)}
                    className={`absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black shadow-md transition-colors ${
                      r.active
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'bg-stone-500 text-white hover:bg-stone-600'
                    }`}
                  >
                    {r.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {r.active ? 'نشط' : 'مغلق'}
                  </button>
                  <div className="absolute bottom-2 left-2 text-white font-black text-base">{r.name}</div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {r.description && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2">{r.description}</p>
                  )}
                  <div className="flex flex-col gap-1.5">
                    {r.address && (
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
                        <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                        {r.address}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
                      <Phone className="w-3 h-3 text-orange-500 shrink-0" />
                      {r.phone}
                    </div>
                    {r.foodCount !== undefined && (
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
                        <UtensilsCrossed className="w-3 h-3 text-orange-500 shrink-0" />
                        {r.foodCount} صنف في القائمة
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1 border-t border-stone-100 dark:border-stone-800">
                    <Link
                      href={`/restaurants/${r.id}`}
                      target="_blank"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-bold hover:bg-orange-500 hover:text-white transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      عرض
                    </Link>
                    <button
                      onClick={() => openEdit(r)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-500 hover:text-white transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      تعديل
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(r.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      حذف
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 border-b border-stone-200 dark:border-stone-800 sticky top-0 bg-white dark:bg-stone-900 z-10">
                  <h3 className="font-black text-stone-900 dark:text-white">
                    {editingId ? 'تعديل بيانات المطعم' : 'إضافة مطعم جديد'}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  >
                    <X className="w-5 h-5 text-stone-500" />
                  </button>
                </div>

                {/* Form */}
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-xs font-black text-stone-700 dark:text-stone-300 mb-1.5 block">اسم المطعم *</label>
                      <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="مثال: مطعم البركة"
                        className="w-full px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-sm font-medium border-0 focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-stone-700 dark:text-stone-300 mb-1.5 block">رقم الهاتف *</label>
                      <input
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="01xxxxxxxxx"
                        className="w-full px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-sm font-medium border-0 focus:ring-2 focus:ring-orange-500 outline-none"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-stone-700 dark:text-stone-300 mb-1.5 block">الحالة</label>
                      <button
                        onClick={() => setForm({ ...form, active: !form.active })}
                        className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors ${
                          form.active
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-500/30'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-500 border-2 border-transparent'
                        }`}
                      >
                        {form.active ? '✓ نشط ومتاح' : '✕ مغلق مؤقتاً'}
                      </button>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-black text-stone-700 dark:text-stone-300 mb-1.5 block">العنوان</label>
                      <input
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        placeholder="مثال: أمام بوابة الجامعة"
                        className="w-full px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-sm font-medium border-0 focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-black text-stone-700 dark:text-stone-300 mb-1.5 block">وصف المطعم</label>
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="وصف قصير عن المطعم ومميزاته..."
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-sm font-medium border-0 focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-black text-stone-700 dark:text-stone-300 mb-1.5 block">رابط صورة المطعم</label>
                      <input
                        value={form.image}
                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                        placeholder="/images/restaurant.jpg"
                        className="w-full px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-sm font-medium border-0 focus:ring-2 focus:ring-orange-500 outline-none"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Manager Credentials (only for new restaurants or password reset) */}
                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800">
                    <p className="text-xs font-black text-stone-700 dark:text-stone-300 mb-3">
                      {editingId ? 'تحديث بيانات دخول المدير (اتركها فارغة إذا لم تريد التغيير)' : 'بيانات دخول مدير المطعم'}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-stone-500 dark:text-stone-400 mb-1 block">اسم المدير</label>
                        <input
                          value={form.managerName}
                          onChange={(e) => setForm({ ...form, managerName: e.target.value })}
                          placeholder={`إدارة ${form.name || 'المطعم'}`}
                          className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-sm font-medium border-0 focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-stone-500 dark:text-stone-400 mb-1 block">كلمة المرور</label>
                        <input
                          type="password"
                          value={form.managerPassword}
                          onChange={(e) => setForm({ ...form, managerPassword: e.target.value })}
                          placeholder="كلمة مرور قوية"
                          className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-sm font-medium border-0 focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-2">
                      رقم الهاتف أعلاه سيستخدم كـ username لتسجيل الدخول
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold text-sm"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || !form.name.trim() || !form.phone.trim()}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:from-orange-600 hover:to-amber-600 transition-all"
                    >
                      {submitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {editingId ? 'حفظ التعديلات' : 'إضافة المطعم'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirm Modal */}
        <AnimatePresence>
          {deleteConfirmId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl shadow-2xl p-6 text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="font-black text-stone-900 dark:text-white">حذف المطعم</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  هل أنت متأكد من حذف هذا المطعم؟ لن يمكن التراجع عن هذا الإجراء.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="flex-1 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirmId)}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors"
                  >
                    نعم، احذف
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}
