'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Bike, Phone, Lock, LogIn, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function DeliveryLoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && (user.role === 'DELIVERY' || user.role === 'ADMIN')) {
      router.replace('/delivery');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone.trim() || !password.trim()) {
      setError('يرجى إدخال رقم الهاتف وكلمة المرور');
      return;
    }

    try {
      setIsSubmitting(true);
      const loggedInUser = await login(phone.trim(), password.trim());
      if (loggedInUser) {
        if (loggedInUser.role === 'DELIVERY' || loggedInUser.role === 'ADMIN') {
          router.replace('/delivery');
        } else {
          setError('هذا الحساب ليس مسجلاً كحساب ديلفري');
        }
      } else {
        setError('رقم الهاتف أو كلمة المرور غير صحيحة');
      }
    } catch {
      setError('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 text-stone-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 to-orange-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-purple-500/20">
          <Bike className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-white">بوابة كابتن التوصيل (الديلفري)</h1>
        <p className="text-xs text-stone-400">
          سجل دخولك لاستلام وتوصيل طلبات الإفطار لطلاب جامعة برج العرب التكنولوجية
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-stone-900 py-8 px-6 shadow-2xl border border-stone-800 rounded-3xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-950/50 border border-red-800 text-red-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>رقم هاتف المندوب:</span>
              </label>
              <input
                type="tel"
                dir="ltr"
                required
                placeholder="01012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder-stone-500 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-stone-400" />
                <span>كلمة المرور:</span>
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder-stone-500 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-black text-sm shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري التحقق...' : 'تسجيل دخول كابتن التوصيل'}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-stone-800 text-center space-y-2">
            <p className="text-[11px] text-stone-500">
              يتم إنشاء حسابات المناديب حصرياً من خلال لوحة إدارة المطعم التابع له
            </p>
            <div>
              <Link
                href="/restaurant/login"
                className="text-xs font-bold text-orange-400 hover:underline inline-flex items-center gap-1"
              >
                <span>العودة لدخول إدارة المطعم</span>
                <ArrowRight className="w-3 h-3 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
