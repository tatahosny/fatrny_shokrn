'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Store,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  UtensilsCrossed,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function RestaurantLoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !password.trim()) {
      setErrorMsg('يرجى إدخال رقم الهاتف وكلمة المرور');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'رقم الهاتف أو كلمة المرور غير صحيحة');
        setLoading(false);
        return;
      }

      // التحقق من أن الحساب له صلاحية إدارة مطعم أو أدمن
      const user = data.user;
      if (user && user.role !== 'RESTAURANT' && user.role !== 'ADMIN') {
        setErrorMsg('هذا الحساب غير مصرح له كإدارة مطعم. هذه البوابة مخصصة حصرياً للمطاعم الشريكة.');
        setLoading(false);
        return;
      }

      // تسجيل الدخول بنجاح والتوجيه المباشر للوحة المطعم
      await login(phone.trim(), password.trim());
      router.replace('/restaurant');
    } catch {
      setErrorMsg('حدث خطأ في الاتصال بالخادم، يرجى المحاولة مرة أخرى');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between selection:bg-orange-500 selection:text-white relative overflow-hidden">
      
      {/* Background Decorative Glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <header className="w-full border-b border-stone-800/80 bg-stone-900/60 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                فطرني شكراً
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                بوابة الشركاء
              </span>
            </div>
            <p className="text-[11px] text-stone-400">نظام إدارة طلبات ومينيو المطاعم</p>
          </div>
        </div>

        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-orange-400 transition-colors py-1.5 px-3 rounded-xl hover:bg-stone-800/60"
        >
          <span>بوابة الطلاب والعملاء</span>
          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative"
        >
          {/* Card Badge Icon */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto shadow-inner">
              <UtensilsCrossed className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white">تسجيل دخول المطعم</h1>
            <p className="text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
              أدخل بيانات حساب المطعم الصادرة من الإدارة العليا للوصول للطلبات والمينيو
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 p-3.5 rounded-2xl bg-red-950/50 border border-red-800/80 text-red-300 text-xs font-bold flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-black text-stone-300 block mb-1.5">
                رقم هاتف حساب المطعم
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  dir="ltr"
                  placeholder="01xxxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 rounded-2xl bg-stone-800/80 border border-stone-700 text-white placeholder:text-stone-500 text-sm font-semibold focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-stone-300 block mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10 pl-11 py-3 rounded-2xl bg-stone-800/80 border border-stone-700 text-white placeholder:text-stone-500 text-sm font-semibold focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 p-1"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <span>جاري التحقق والدخول...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>دخول إلى لوحة المطعم</span>
                </>
              )}
            </button>
          </form>

          {/* Partner Info Footer */}
          <div className="mt-6 pt-5 border-t border-stone-800/80 text-center space-y-2 text-xs text-stone-500">
            <p className="flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-orange-400" />
              <span>يتم تزويد حسابات المطاعم حصراً من الإدارة العليا للجامعة</span>
            </p>
            <p className="text-[11px] text-stone-600">
              جامعة برج العرب التكنولوجية — منظومة فطرني شكراً
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-stone-600 border-t border-stone-900">
        بوابة إدارة المطاعم الشريكة © {new Date().getFullYear()} فطرني شكراً
      </footer>

    </div>
  );
}
