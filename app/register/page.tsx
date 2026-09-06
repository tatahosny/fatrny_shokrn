'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  ShoppingBag,
  Upload,
  CheckCircle2,
  Clock,
  ArrowLeft,
  X,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState<'CUSTOMER' | 'STUDENT'>('CUSTOMER');

  // Student ID upload state
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idImageUrl, setIdImageUrl] = useState<string>('');
  const [uploadingId, setUploadingId] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [loading, setLoading] = useState(false);
  const [isSubmittedPending, setIsSubmittedPending] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  // Handle file selection and upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('يرجى اختيار ملف صورة صالح (JPG أو PNG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت');
      return;
    }

    setUploadError('');
    setIdFile(file);
    setUploadingId(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload/student-id', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setIdImageUrl(data.url);
      } else {
        setUploadError(data.error || 'فشل رفع صورة الكرنيه');
        setIdFile(null);
      }
    } catch {
      setUploadError('حدث خطأ أثناء رفع الصورة');
      setIdFile(null);
    } finally {
      setUploadingId(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    if (role === 'STUDENT' && !idImageUrl) {
      setUploadError('يرجى رفع صورة الكرنيه الجامعي لإتمام تسجيل حساب الطالب');
      return;
    }

    setLoading(true);
    const result = await register(
      name.trim(),
      phone.trim(),
      password || '123456',
      {
        role,
        studentIdImage: role === 'STUDENT' ? idImageUrl : undefined,
      }
    );
    setLoading(false);

    if (result.success) {
      if (result.pendingVerification) {
        setIsSubmittedPending(true);
      } else {
        router.push('/menu');
      }
    }
  };

  // If student submitted and is pending verification
  if (isSubmittedPending) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-b from-orange-50/80 to-transparent dark:from-stone-900/60 dark:to-transparent">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8 text-center shadow-xl space-y-6"
        >
          <div className="w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800">
            <Clock className="w-10 h-10 animate-pulse" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-stone-900 dark:text-white">
              تم استلام طلبك بنجاح!
            </h2>
            <p className="text-xs text-stone-500 mt-2 leading-relaxed">
              تم إرسال بياناتك وصورة الكرنيه الجامعي لمشرفي جامعة برج العرب التكنولوجية.
              سيتم مراجعة الكرنيه والتحقق منه وتفعيل حسابك والخصومات خلال ساعات قليلة.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 text-xs text-stone-600 dark:text-stone-300 font-bold text-right space-y-1">
            <div>• الاسم: {name}</div>
            <div>• الهاتف: {phone}</div>
            <div>• الحالة: بانتظار مراجعة الإدارة للكرنيه ⏳</div>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              href="/"
              className="block w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md shadow-orange-500/20 transition-all"
            >
              العودة إلى الصفحة الرئيسية
            </Link>
            <Link
              href="/login"
              className="block w-full py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-200 transition-all"
            >
              تسجيل الدخول
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-b from-orange-50/80 to-transparent dark:from-stone-900/60 dark:to-transparent">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-orange-100 dark:border-stone-800 shadow-xl shadow-orange-500/10 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-red-500 p-8 text-white text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/20 text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black">انضم لـ فطرني شكراً</h1>
            <p className="text-orange-100 text-xs mt-1.5 font-medium">
              جامعة برج العرب التكنولوجية — اطلب فطارك وسندوتشاتك بكل سهولة
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-7 space-y-4">
            
            {/* Account Type Selector */}
            <div>
              <label className="block text-xs font-black text-stone-700 dark:text-stone-300 mb-2">
                نوع الحساب *
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setRole('CUSTOMER');
                    setUploadError('');
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                    role === 'CUSTOMER'
                      ? 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 font-black shadow-sm'
                      : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 font-bold'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5 mb-1 text-orange-500" />
                  <span className="text-xs">عميل عادي</span>
                  <span className="text-[10px] text-stone-400 mt-0.5">طلب سريع ومباشر</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('STUDENT')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                    role === 'STUDENT'
                      ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-black shadow-sm'
                      : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 font-bold'
                  }`}
                >
                  <GraduationCap className="w-5 h-5 mb-1 text-indigo-600" />
                  <span className="text-xs">طالب بالجامعة 🎓</span>
                  <span className="text-[10px] text-stone-400 mt-0.5">خصومات حصرية للطلاب</span>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-black text-stone-700 dark:text-stone-300 mb-1.5">
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
                  className="w-full pr-11 pl-4 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-black text-stone-700 dark:text-stone-300 mb-1.5">
                رقم الهاتف (الواتساب) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute right-4 top-3.5 text-stone-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01011112222"
                  required
                  className="w-full pr-11 pl-4 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-black text-stone-700 dark:text-stone-300 mb-1.5">
                كلمة المرور (اختياري)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute right-4 top-3.5 text-stone-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="افتراضية: 123456"
                  className="w-full pr-11 pl-11 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-4 top-3 text-stone-400 hover:text-stone-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Student ID Card Upload (If STUDENT selected) */}
            {role === 'STUDENT' && (
              <div className="pt-2">
                <label className="block text-xs font-black text-indigo-700 dark:text-indigo-400 mb-1.5 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  <span>صورة الكرنيه الجامعي (مطلوب للتحقق) *</span>
                </label>

                {!idImageUrl ? (
                  <label className="border-2 border-dashed border-indigo-200 dark:border-indigo-800/80 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50 transition-colors">
                    <Upload className="w-6 h-6 text-indigo-500 mb-2" />
                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      {uploadingId ? 'جاري رفع الصورة...' : 'اضغط لاختيار صورة الكرنيه'}
                    </span>
                    <span className="text-[10px] text-stone-400 mt-1">
                      صيغ مدعومة: JPG, PNG (أقصى حجم 5 ميجا)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploadingId}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-2 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-900 shrink-0">
                        <Image src={idImageUrl} alt="كرنيه الطالب" fill className="object-cover" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>تم رفع صورة الكرنيه بنجاح</span>
                        </div>
                        <span className="text-[10px] text-stone-400">جاهزة للمراجعة من الإدارة</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIdImageUrl('');
                        setIdFile(null);
                      }}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-white dark:hover:bg-stone-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {uploadError && (
                  <p className="text-[11px] text-red-500 font-bold mt-1.5">{uploadError}</p>
                )}

                <p className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80 mt-1.5 leading-relaxed font-medium">
                  💡 يتم التحقق من الكرنيه لضمان استفادة طلاب جامعة برج العرب التكنولوجية فقط من الخصومات الخاصة.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || uploadingId}
              className="w-full mt-2 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
            >
              <span>
                {loading
                  ? 'جاري إنشاء الحساب...'
                  : role === 'STUDENT'
                  ? 'إرسال طلب تسجيل الطالب'
                  : 'إنشاء الحساب وبدء الطلب'}
              </span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </form>

          {/* Footer */}
          <div className="p-4 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-100 dark:border-stone-800 text-center text-xs text-stone-500">
            لديك حساب بالفعل مسبقاً؟{' '}
            <Link href="/login" className="font-black text-orange-600 hover:underline">
              سجل دخولك هنا
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
