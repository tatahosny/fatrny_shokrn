'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Crown,
  ShoppingBag,
  ClipboardList,
  Star,
  LogOut,
  Settings,
  UtensilsCrossed,
  GraduationCap,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
  Store,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePage() {
  const { user, isLoading, logout, refreshUser, isAdmin, isRestaurant } = useAuth();
  const router = useRouter();

  // Student upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('يرجى اختيار ملف صورة صالح (JPG أو PNG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('حجم الصورة يجب ألا يتجاوز 5 ميجابايت');
      return;
    }

    setUploadError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUploadStudentCard = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadSuccess(null);

      // 1. Upload the image file
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadRes = await fetch('/api/upload/student-id', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.url) {
        throw new Error(uploadData.error || 'فشل رفع صورة الكرنيه');
      }

      // 2. Submit application to update user role to STUDENT and status to PENDING_VERIFICATION
      const applyRes = await fetch('/api/student/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIdImage: uploadData.url }),
      });

      const applyData = await applyRes.json();
      if (!applyRes.ok) {
        throw new Error(applyData.error || 'فشل تسجيل طلب التوثيق');
      }

      setUploadSuccess('تم رفع صورة الكرنيه بنجاح! طلبك قيد المراجعة الآن من إدارة الجامعة.');
      setSelectedFile(null);
      setPreviewUrl(null);
      await refreshUser();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء رفع الكرنيه';
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 flex items-center justify-center">
          <UtensilsCrossed className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  const isStudent = user.role === 'STUDENT';
  const isPendingStudent = isStudent && user.status === 'PENDING_VERIFICATION';
  const isActiveStudent = isStudent && user.status === 'ACTIVE';
  const isRejectedStudent = isStudent && user.status === 'REJECTED';
  const canApplyForStudent = !isStudent || isRejectedStudent;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      
      {/* Profile Hero */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-stone-800">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/10 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-right">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-orange-500/30 shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h1 className="text-2xl font-black">{user.name}</h1>

              {isAdmin && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  إدارة عليا
                </span>
              )}

              {isRestaurant && (
                <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 text-xs font-bold flex items-center gap-1">
                  <Store className="w-3 h-3 text-orange-400" />
                  إدارة مطعم
                </span>
              )}

              {isActiveStudent && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  طالب معتمد 🎓
                </span>
              )}

              {isPendingStudent && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  الكرنيه قيد المراجعة
                </span>
              )}

              {isRejectedStudent && (
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                  الكرنيه مرفوض
                </span>
              )}
            </div>

            <p className="text-stone-300 text-sm mt-1" dir="ltr">{user.phone}</p>
            <p className="text-xs text-stone-400 mt-1">
              جامعة برج العرب التكنولوجية — إدارة التقديمات وخدمات الطلبة
            </p>
          </div>
        </div>
      </div>

      {/* Student ID Card Verification Section */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-stone-900 dark:text-white">
              توثيق هوية الطالب الجامعي
            </h2>
            <p className="text-xs text-stone-500">
              ارفع صورة الكرنيه للاستفادة من خصومات الطلاب في جميع المطاعم
            </p>
          </div>
        </div>

        {/* State 1: Active verified student */}
        {isActiveStudent && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-black text-emerald-900 dark:text-emerald-200">
                  أنت طالب معتمد رسمياً في المنصة!
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5 leading-relaxed">
                  يتم تطبيق خصم الطلاب التلقائي على جميع طلباتك من المطاعم الشريكة بالجامعة. بالهنا والشفا!
                </p>
              </div>
            </div>

            {user.studentIdImage && (
              <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  صورة الكرنيه المعتمد:
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewModalImg(user.studentIdImage || null)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 underline"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>معاينة الكرنيه</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* State 2: Pending student verification */}
        {isPendingStudent && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h3 className="text-sm font-black text-amber-900 dark:text-amber-200">
                  طلب التوثيق قيد المراجعة حالياً ⏳
                </h3>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
                  تم استلام صورة الكرنيه بنجاح وهي قيد الفحص من الإدارة العليا. سيتم تفعيل خصومات الطلاب فور مراجعة الصورة.
                </p>
              </div>
            </div>

            {user.studentIdImage && (
              <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  الصورة المرفوعة:
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewModalImg(user.studentIdImage || null)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 underline"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>معاينة الصورة المرفوعة</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* State 3: Rejected */}
        {isRejectedStudent && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 space-y-2">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-black text-red-900 dark:text-red-200">
                  تم رفض صورة الكرنيه السابقة
                </h3>
                <p className="text-xs text-red-700 dark:text-red-400 mt-0.5 leading-relaxed">
                  الصورة لم تكن واضحة أو غير مطابقة لبيانات الطالب. يمكنك إعادة تصوير ورفع صورة واضحة للكرنيه الآن بالأسفل.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* State 4: Can Apply (Customer or Rejected) */}
        {canApplyForStudent && (
          <div className="space-y-4 pt-1">
            <p className="text-xs text-stone-600 dark:text-stone-300 font-medium leading-relaxed">
              إذا كنت طالباً بجامعة برج العرب التكنولوجية، قم برفع صورة واضحة لكرنيه الجامعة الخاص بك للحصول على خصومات فورية على الأكلات والوجبات:
            </p>

            {uploadError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2 border border-red-200 dark:border-red-800">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <label
                htmlFor="student-card-file"
                className="cursor-pointer border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-orange-500 rounded-2xl p-4 text-center bg-stone-50/60 dark:bg-stone-850 hover:bg-orange-50/20 transition-all flex flex-col items-center justify-center gap-2"
              >
                <Upload className="w-6 h-6 text-stone-400" />
                <span className="text-xs font-black text-stone-700 dark:text-stone-300">
                  {selectedFile ? selectedFile.name : 'اضغط لاختيار صورة الكرنيه (JPG أو PNG)'}
                </span>
                <span className="text-[11px] text-stone-400">الحد الأقصى للحجم: 5 ميجابايت</span>
              </label>
              <input
                id="student-card-file"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {previewUrl && (
                <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-stone-900 border border-stone-300 dark:border-stone-700">
                  <Image src={previewUrl} alt="معاينة الكرنيه" fill className="object-contain" />
                </div>
              )}

              {selectedFile && (
                <button
                  type="button"
                  onClick={handleUploadStudentCard}
                  disabled={isUploading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري الرفع والإرسال...</span>
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-4 h-4" />
                      <span>إرسال صورة الكرنيه للتحقق</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Nav Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Link
          href="/my-orders"
          className="group bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-orange-400 hover:shadow-md transition-all flex flex-col gap-2"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <div className="font-black text-stone-900 dark:text-white text-xs sm:text-sm">طلباتي</div>
            <div className="text-[11px] text-stone-500">سجل ومتابعة كل طلباتك</div>
          </div>
        </Link>

        <Link
          href="/restaurants"
          className="group bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-orange-400 hover:shadow-md transition-all flex flex-col gap-2"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="font-black text-stone-900 dark:text-white text-xs sm:text-sm">المطاعم الشريكة</div>
            <div className="text-[11px] text-stone-500">تصفح المطاعم واطلب وجبتك</div>
          </div>
        </Link>

        {isRestaurant && (
          <Link
            href="/restaurant"
            className="group bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-orange-200 dark:border-orange-800 hover:border-orange-500 hover:shadow-md transition-all flex flex-col gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-stone-900 dark:text-white text-xs sm:text-sm">لوحة المطعم</div>
              <div className="text-[11px] text-stone-500">إدارة الطلبات والمينيو والخصم</div>
            </div>
          </Link>
        )}

        {isAdmin && (
          <Link
            href="/admin"
            className="group bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-amber-200 dark:border-amber-800 hover:border-amber-500 hover:shadow-md transition-all flex flex-col gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-stone-900 dark:text-white text-xs sm:text-sm">لوحة الإدارة العليا</div>
              <div className="text-[11px] text-stone-500">الأرباح والمطاعم والطلاب</div>
            </div>
          </Link>
        )}

        <Link
          href="/leaderboard"
          className="group bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-amber-400 hover:shadow-md transition-all flex flex-col gap-2"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="font-black text-stone-900 dark:text-white text-xs sm:text-sm">لوحة الشرف</div>
            <div className="text-[11px] text-stone-500">ترتيب الطلبات بالجامعة</div>
          </div>
        </Link>
      </div>

      {/* Logout Button */}
      <button
        type="button"
        onClick={() => logout()}
        className="w-full py-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-stone-700 dark:text-stone-300 hover:text-red-600 dark:hover:text-red-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-stone-200 dark:border-stone-700 hover:border-red-200 transition-all"
      >
        <LogOut className="w-4 h-4" />
        <span>تسجيل الخروج</span>
      </button>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewModalImg && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewModalImg(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-lg w-full bg-stone-900 rounded-3xl p-4 overflow-hidden border border-stone-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-800 text-white">
                <span className="text-xs font-bold">صورة الكرنيه الجامعي</span>
                <button
                  onClick={() => setPreviewModalImg(null)}
                  className="text-stone-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>
              <div className="relative w-full h-72 sm:h-96 mt-3 rounded-2xl overflow-hidden bg-black">
                <Image
                  src={previewModalImg}
                  alt="كرنيه الطالب"
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
