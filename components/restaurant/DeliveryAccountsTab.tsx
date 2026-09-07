'use client';

import React, { useState, useEffect } from 'react';
import { DeliveryAccount } from '@/lib/types';
import {
  Bike,
  Plus,
  Trash2,
  Phone,
  User,
  Lock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  restaurantId?: string;
  onNotification?: (text: string, type?: 'success' | 'error') => void;
}

export default function DeliveryAccountsTab({ restaurantId, onNotification }: Props) {
  const [accounts, setAccounts] = useState<DeliveryAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const url = restaurantId
        ? `/api/restaurant/delivery/accounts?restaurantId=${restaurantId}`
        : '/api/restaurant/delivery/accounts';
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [restaurantId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !phone.trim() || !password.trim()) {
      setFormError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/restaurant/delivery/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (onNotification) onNotification('تم إنشاء حساب الديلفري بنجاح');
        setName('');
        setPhone('');
        setPassword('');
        setIsCreating(false);
        fetchAccounts();
      } else {
        setFormError(data.error || 'فشل إنشاء الحساب');
      }
    } catch {
      setFormError('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, driverName: string) => {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف حساب المندوب (${driverName})؟`)) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/restaurant/delivery/accounts/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        if (onNotification) onNotification('تم حذف حساب المندوب بنجاح');
        setAccounts((prev) => prev.filter((a) => a.id !== id));
      } else {
        alert(data.error || 'فشل حذف الحساب');
      }
    } catch {
      alert('حدث خطأ أثناء حذف الحساب');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
              <Bike className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black text-white">إدارة حسابات عمال التوصيل (الديلفري)</h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            أنشئ حسابات لمناديب التوصيل لمطعمك ليتمكنوا من استلام ومسك الطلبات والتوصيل لطلاب الجامعة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-lg shadow-orange-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{isCreating ? 'إلغاء' : 'إضافة مندوب توصيل جديد'}</span>
          </button>
        </div>
      </div>

      {/* Info card on how delivery logs in */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-orange-500/30 rounded-3xl p-4 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white block">رابط بوابة مناديب التوصيل:</span>
            <span className="text-stone-400 text-[11px]">
              يمكن للديلفري تسجيل الدخول برقم الهاتف وكلمة المرور عبر رابط البوابة المخصصة
            </span>
          </div>
        </div>

        <a
          href="/delivery/login"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-orange-400 font-bold text-xs shrink-0 transition-colors"
        >
          <span>فتح بوابة الديلفري</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* New Driver Form Modal/Collapse */}
      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-xl"
        >
          <h3 className="font-black text-sm text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-orange-500" />
            <span>تسجيل مندوب جديد</span>
          </h3>

          {formError && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-stone-400" />
                <span>اسم المندوب:</span>
              </label>
              <input
                type="text"
                placeholder="مثال: أحمد محمود"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder-stone-500 focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>رقم هاتف الديلفري (اسم المستخدم):</span>
              </label>
              <input
                type="tel"
                placeholder="01012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder-stone-500 focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-stone-400" />
                <span>كلمة المرور:</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder-stone-500 focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 text-xs font-bold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black shadow-md shadow-orange-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'جاري الإنشاء...' : 'حفظ وإنشاء الحساب'}
            </button>
          </div>
        </form>
      )}

      {/* Drivers List Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-sm text-white">قائمة المناديب المسجلين ({accounts.length})</h3>
          <button
            onClick={fetchAccounts}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            title="تحديث"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <RefreshCw className="w-6 h-6 text-orange-500 animate-spin mx-auto mb-2" />
            <p className="text-xs text-stone-400">جاري تحميل الحسابات...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-stone-800 text-stone-500 flex items-center justify-center mx-auto">
              <Bike className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-stone-300">لم يتم إضافة مناديب توصيل لمطعمك بعد</p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              اضغط على زر &ldquo;إضافة مندوب توصيل جديد&rdquo; بالأعلى لإنشاء حساب لمندوب التوصيل وتوزيع الطلبات عليه
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400 font-black">
                  <th className="py-3 px-4">اسم المندوب</th>
                  <th className="py-3 px-4">رقم الهاتف</th>
                  <th className="py-3 px-4 text-center">الطلبات قيد التوصيل</th>
                  <th className="py-3 px-4">تاريخ التسجيل</th>
                  <th className="py-3 px-4 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-stone-850 transition-colors">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold">
                        {acc.name.charAt(0)}
                      </div>
                      <span>{acc.name}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-300">{acc.phone}</td>
                    <td className="py-3 px-4 text-center">
                      {(acc.activeOrdersCount || 0) > 0 ? (
                        <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold text-[10px]">
                          {acc.activeOrdersCount} طلب بالدرب 🛵
                        </span>
                      ) : (
                        <span className="text-stone-500 text-[11px]">متاح حالياً</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-stone-400 text-[11px] font-mono">
                      {acc.createdAt ? acc.createdAt.split('T')[0] : '—'}
                    </td>
                    <td className="py-3 px-4 text-left">
                      <button
                        onClick={() => handleDelete(acc.id, acc.name)}
                        disabled={deletingId === acc.id}
                        className="p-2 rounded-xl text-stone-400 hover:text-red-400 hover:bg-red-950/40 transition-colors disabled:opacity-50"
                        title="حذف الحساب"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
