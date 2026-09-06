'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Calendar,
  Eye,
  X,
  AlertCircle,
  UserCheck,
  Search,
  RefreshCw,
} from 'lucide-react';
import Image from 'next/image';

interface Student {
  id: string;
  name: string;
  phone: string;
  role: string;
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'REJECTED';
  studentIdImage?: string;
  createdAt: string;
}

export default function AdminStudentsPage() {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace('/login');
    }
  }, [isLoading, isAdmin, router]);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/students?filter=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (isAdmin) {
      fetchStudents();
    }
  }, [fetchStudents, isAdmin]);

  const handleAction = async (userId: string, action: 'approve' | 'reject') => {
    try {
      setProcessingId(userId);
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({
          type: 'success',
          text: action === 'approve' ? 'تم اعتماد الطالب وتفعيل خصوماته بنجاح' : 'تم رفض طلب الطالب',
        });
        // Remove or update student from list
        if (activeTab === 'pending') {
          setStudents((prev) => prev.filter((s) => s.id !== userId));
        } else {
          setStudents((prev) =>
            prev.map((s) => (s.id === userId ? { ...s, status: action === 'approve' ? 'ACTIVE' : 'REJECTED' } : s))
          );
        }
      } else {
        setNotification({ type: 'error', text: data.error || 'فشلت العملية' });
      }
    } catch {
      setNotification({ type: 'error', text: 'حدث خطأ في الاتصال' });
    } finally {
      setProcessingId(null);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery)
  );

  const pendingCount = students.filter((s) => s.status === 'PENDING_VERIFICATION').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-stone-900 dark:text-white">
                طلبات التحقق للطلاب (الكرنيهات)
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                مراجعة صور بطاقات الطلاب واعتماد الحسابات للاستفادة من خصومات المطاعم
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchStudents}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>تحديث</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border shadow-md animate-fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pending'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>بانتظار المراجعة</span>
            {pendingCount > 0 && (
              <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>جميع حسابات الطلاب</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="بحث بالاسم أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Student List */}
      {loading ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
          <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-stone-500">جاري تحميل بيانات الطلاب...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
          <GraduationCap className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
          <h3 className="text-base font-black text-stone-800 dark:text-stone-200">
            {activeTab === 'pending' ? 'لا توجد طلبات معلقة حالياً' : 'لا يوجد طلاب مطابقين للبحث'}
          </h3>
          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
            {activeTab === 'pending'
              ? 'جميع طلبات الطلاب تم فحصها ومراجعتها بنجاح'
              : 'يمكنك تغيير شروط البحث للعثور على طلاب آخرين'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStudents.map((student) => {
            const isPending = student.status === 'PENDING_VERIFICATION';
            const isActive = student.status === 'ACTIVE';
            const isProcessing = processingId === student.id;

            return (
              <div
                key={student.id}
                className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 font-black flex items-center justify-center text-base border border-orange-200 dark:border-orange-800">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-stone-900 dark:text-white">
                          {student.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-stone-500 font-bold">
                          <Phone className="w-3.5 h-3.5 text-stone-400" />
                          <a
                            href={`tel:${student.phone}`}
                            dir="ltr"
                            className="hover:text-orange-600 transition-colors"
                          >
                            {student.phone}
                          </a>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${
                        isPending
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800'
                          : isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800'
                          : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800'
                      }`}
                    >
                      {isPending
                        ? 'قيد المراجعة'
                        : isActive
                        ? 'طالب معتمد 🎓'
                        : 'مرفوض'}
                    </span>
                  </div>

                  {/* ID Image Preview */}
                  <div className="mt-4 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-stone-600 dark:text-stone-300">
                        صورة الكرنيه الجامعي:
                      </span>
                      {student.studentIdImage && (
                        <button
                          onClick={() => setPreviewImage(student.studentIdImage || null)}
                          className="flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>تكبير الصورة</span>
                        </button>
                      )}
                    </div>

                    {student.studentIdImage ? (
                      <div
                        onClick={() => setPreviewImage(student.studentIdImage || null)}
                        className="relative w-full h-36 rounded-xl overflow-hidden cursor-pointer border border-stone-200 dark:border-stone-700 group bg-stone-900"
                      >
                        <Image
                          src={student.studentIdImage}
                          alt={`كرنيه ${student.name}`}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                          <Eye className="w-4 h-4" />
                          <span>عرض بالحجم الكامل</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-center text-xs text-stone-400 font-bold">
                        لم يتم رفع صورة كرنيه
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2.5 text-[11px] text-stone-400 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>تاريخ التسجيل: {new Date(student.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2">
                  <button
                    onClick={() => handleAction(student.id, 'approve')}
                    disabled={isProcessing || isActive}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition-all ${
                      isActive
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 cursor-not-allowed'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{isActive ? 'معتمد بالفعل' : 'قبول واعتماد الطالب'}</span>
                  </button>

                  <button
                    onClick={() => handleAction(student.id, 'reject')}
                    disabled={isProcessing || student.status === 'REJECTED'}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl text-xs font-black transition-all ${
                      student.status === 'REJECTED'
                        ? 'bg-stone-100 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                        : 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 border border-red-200 dark:border-red-900'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>رفض</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal for Student Card Image */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-white dark:bg-stone-900 rounded-3xl overflow-hidden p-4 shadow-2xl border border-stone-200 dark:border-stone-800"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 mb-3">
              <h4 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-orange-500" />
                <span>صورة الكرنيه الجامعي للطالب</span>
              </h4>
              <button
                onClick={() => setPreviewImage(null)}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-900 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative w-full h-[60vh] bg-stone-950 rounded-2xl overflow-hidden">
              <Image
                src={previewImage}
                alt="كرنيه الطالب"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
