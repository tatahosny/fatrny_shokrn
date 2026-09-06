'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { User, Phone, Lock, Eye, EyeOff, Sparkles, ArrowLeft, CheckCircle2, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setLoading(true);
    const success = await register(name.trim(), phone.trim(), password || '123456');
    setLoading(false);
    if (success) {
      router.push('/menu');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-b from-orange-50/80 to-transparent dark:from-stone-900/60 dark:to-transparent">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-orange-100 dark:border-stone-800 shadow-xl shadow-orange-500/10 overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-red-500 p-8 text-white text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 text-white flex items-center justify-center mx-auto mb-4 shadow-sm">
              <UtensilsCrossed className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black">انضم لـ فطرني شكراً</h1>
            <p className="text-orange-100 text-sm mt-2 font-medium">
              جامعة برج العرب التكنولوجية - فريق إدارة التقديمات
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            
            <div>
              <label className="block text-xs font-black text-stone-700 dark:text-stone-300 mb-2">
                الاسم الكامل (ثلاثي) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute right-4 top-3.5 text-stone-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: مصطفى محمد أحمد"
                  required
                  className="w-full pr-11 pl-4 py-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-stone-700 dark:text-stone-300 mb-2">
                رقم الهاتف *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute right-4 top-3.5 text-stone-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01011112222"
                  required
                  className="w-full pr-11 pl-4 py-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  dir="ltr"
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-1.5 font-medium">سيُستخدم كمعرف وحيد لحسابك في المنظومة</p>
            </div>

            <div>
              <label className="block text-xs font-black text-stone-700 dark:text-stone-300 mb-2">
                كلمة المرور (اختياري)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute right-4 top-3.5 text-stone-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة مرور آمنة أو اتركها فارغة (123456)"
                  className="w-full pr-11 pl-12 py-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-4 top-3.5 text-stone-400 hover:text-stone-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-stone-400 mt-1.5">إذا تركتها فارغة ستكون: <code className="text-orange-500 font-bold">123456</code></p>
            </div>

            {/* Benefits list */}
            <div className="bg-orange-50 dark:bg-orange-950/30 rounded-2xl p-4 space-y-2 border border-orange-100 dark:border-orange-900/40">
              {['ربط طلباتك بحسابك وتتبع حالتها', 'الظهور في لوحة الشرف والحصول على ألقاب', 'إعادة الطلبات السابقة بسرعة'].map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-base shadow-lg shadow-orange-500/25 transition-all active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>جاري إنشاء حسابك...</span>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>إنشاء الحساب ودخول فوري</span>
                </>
              )}
            </button>

            <p className="text-center text-xs text-stone-500">
              عندك حساب؟{' '}
              <Link href="/login" className="font-bold text-orange-600 hover:underline">
                سجل الدخول من هنا
              </Link>
            </p>
          </form>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>الرجوع للصفحة الرئيسية</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
