'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Phone, Lock, Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(phone.trim(), password || undefined);
    setLoading(false);
    if (success) router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-b from-amber-50/80 to-transparent dark:from-stone-900/60 dark:to-transparent">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-orange-100 dark:border-stone-800 shadow-xl shadow-orange-500/10 overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 p-8 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/10 pointer-events-none" />
            <div className="relative z-10">
              <div className="text-5xl mb-4">🔐</div>
              <h1 className="text-2xl font-black">مرحباً بعودتك! 👋</h1>
              <p className="text-stone-400 text-sm mt-2">
                سجل دخولك وتابع طلباتك في منظومة فطرني شكراً
              </p>
            </div>
          </div>


          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            <div>
              <label className="block text-xs font-black text-stone-700 dark:text-stone-300 mb-2">
                رقم الهاتف المسجل
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute right-4 top-3.5 text-stone-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01011112222"
                  required
                  className="w-full pr-11 pl-4 py-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                  dir="ltr"
                />
              </div>
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
                  placeholder="كلمة المرور..."
                  className="w-full pr-11 pl-12 py-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-4 top-3.5 text-stone-400 hover:text-stone-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-base shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-60"
            >
              {loading ? <span>جاري تسجيل الدخول... ⏳</span> : <><LogIn className="w-5 h-5" /><span>دخول ومتابعة طلباتي</span></>}
            </button>

            <p className="text-center text-xs text-stone-500">
              مش مسجل؟{' '}
              <Link href="/register" className="font-bold text-orange-600 hover:underline">
                أنشئ حسابك مجاناً الآن
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
