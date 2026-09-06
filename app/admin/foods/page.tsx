'use client';

import React, { useState, useEffect } from 'react';
import { FoodItem, Category } from '@/lib/types';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  DollarSign,
  Layers,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Image from 'next/image';

export default function AdminFoodsPage() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // New Item Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFood, setNewFood] = useState({
    name: '',
    categoryId: '',
    price: '',
    description: '',
    image: '',
    available: true,
  });

  // Quick Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editName, setEditName] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  async function loadData() {
    try {
      setLoading(true);
      const [foodsRes, catsRes] = await Promise.all([
        fetch('/api/foods'),
        fetch('/api/categories'),
      ]);
      const foodsData = await foodsRes.json();
      const catsData = await catsRes.json();
      setFoods(foodsData.foods || []);
      setCategories(catsData.categories || []);
      if (catsData.categories?.length > 0 && !newFood.categoryId) {
        setNewFood((prev) => ({ ...prev, categoryId: catsData.categories[0].id }));
      }
    } catch (err) {
      console.error('Error loading foods:', err);
      showToast('خطأ في تحميل البيانات من الخادم');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Filter foods
  const filteredFoods = foods.filter((f) => {
    const matchesCat = selectedCategory === 'all' || f.categoryId === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      f.name.toLowerCase().includes(q) ||
      (f.categoryName && f.categoryName.toLowerCase().includes(q)) ||
      (f.description && f.description.toLowerCase().includes(q));
    return matchesCat && matchesQuery;
  });

  // Start Quick Edit
  const startEditing = (food: FoodItem) => {
    setEditingId(food.id);
    setEditPrice(food.price.toString());
    setEditName(food.name);
  };

  // Save Quick Edit (Name / Price)
  const saveQuickEdit = async (id: string) => {
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/foods/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          price: parseFloat(editPrice) || 0,
        }),
      });

      if (!res.ok) throw new Error('فشل حفظ التعديل');

      const data = await res.json();
      setFoods((prev) => prev.map((f) => (f.id === id ? data.food : f)));
      setEditingId(null);
      showToast('تم تحديث السعر والاسم بنجاح');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء تعديل الصنف');
    } finally {
      setSaving(false);
    }
  };

  // Toggle Availability
  const toggleAvailability = async (food: FoodItem) => {
    try {
      const res = await fetch(`/api/admin/foods/${food.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          available: !food.available,
        }),
      });

      if (!res.ok) throw new Error('فشل تغيير الحالة');
      const data = await res.json();
      setFoods((prev) => prev.map((f) => (f.id === food.id ? data.food : f)));
      showToast(food.available ? 'تم جعل الصنف غير متاح' : 'تم جعل الصنف متاحاً للطلب');
    } catch (err) {
      console.error(err);
      showToast('خطأ في تحديث الحالة');
    }
  };

  // Delete Food Item
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف صنف "${name}" نهائياً من قاعدة البيانات؟`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/foods/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('فشل حذف الصنف');
      setFoods((prev) => prev.filter((f) => f.id !== id));
      showToast(`تم حذف صنف "${name}" بنجاح`);
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء حذف الصنف');
    }
  };

  // Add New Item
  const handleCreateFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFood.name.trim() || !newFood.categoryId) {
      showToast('يرجى ملء اسم الصنف واختيار التصنيف');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/admin/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFood.name.trim(),
          categoryId: newFood.categoryId,
          price: parseFloat(newFood.price) || 0,
          description: newFood.description.trim(),
          image: newFood.image.trim() || 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80',
          available: newFood.available,
        }),
      });

      if (!res.ok) throw new Error('فشل إضافة الصنف');
      const data = await res.json();
      setFoods((prev) => [data.food, ...prev]);
      setIsAddModalOpen(false);
      setNewFood({
        name: '',
        categoryId: categories[0]?.id || '',
        price: '',
        description: '',
        image: '',
        available: true,
      });
      showToast('تمت إضافة الصنف الجديد إلى المنيو بنجاح');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء إضافة الصنف');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:left-6 z-50 bg-stone-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-orange-500/40 max-w-sm mx-auto sm:mx-0 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-stone-900 dark:text-white flex items-center gap-2.5 sm:gap-3">
            <UtensilsCrossed className="w-6 h-6 sm:w-7 sm:h-7 text-orange-500 shrink-0" />
            <span>إدارة قائمة الأطعمة والأصناف</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
            إضافة وجبات جديدة، تعديل الأسعار مباشرة، وحذف الأصناف من قاعدة بيانات Neon
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>إضافة صنف جديد للمنيو</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-stone-900 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row items-center gap-3 sm:gap-4 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالاسم أو الوصف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 sm:py-2 text-sm sm:text-xs rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full pb-1 -mx-1 px-1 scrollbar-none touch-pan-x">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
              selectedCategory === 'all'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            الكل ({foods.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Foods List: Mobile Cards + Desktop Table */}
      {loading ? (
        <div className="text-center py-20 text-stone-500 text-sm">
          جاري تحميل قائمة الأطعمة من Neon Database...
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8 space-y-3">
          <UtensilsCrossed className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto" />
          <h3 className="font-bold text-stone-800 dark:text-stone-200">لا توجد أصناف مطابقة للبحث</h3>
          <p className="text-xs text-stone-500">جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً</p>
        </div>
      ) : (
        <>
          {/* Mobile View: Responsive Food Cards (md:hidden) */}
          <div className="md:hidden space-y-3">
            {filteredFoods.map((food) => {
              const isEditing = editingId === food.id;

              return (
                <div
                  key={food.id}
                  className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-3.5 shadow-sm space-y-3 transition-shadow hover:shadow-md"
                >
                  {/* Card Top: Image + Info + Price */}
                  <div className="flex items-start gap-3">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0 border border-stone-200 dark:border-stone-700">
                      <Image
                        src={food.image}
                        alt={food.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-stone-500">اسم الصنف:</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-stone-50 dark:bg-stone-800 border border-orange-400 font-bold text-stone-900 dark:text-white"
                          />
                          <label className="block text-[10px] font-bold text-stone-500">السعر الجديد (ج.م):</label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="0.5"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-24 px-2.5 py-1.5 text-xs rounded-lg bg-stone-50 dark:bg-stone-800 border border-orange-400 font-black text-orange-600"
                            />
                            <span className="text-xs text-stone-500 font-bold">ج.م</span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-extrabold text-stone-900 dark:text-white text-sm leading-snug break-words">
                              {food.name}
                            </h3>
                            <div className="shrink-0 text-left bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-lg border border-orange-100 dark:border-orange-900/40">
                              <span className="font-black text-orange-600 dark:text-orange-400 text-sm">
                                {food.price}
                              </span>
                              <span className="text-[10px] text-stone-500 mr-1 font-medium">ج.م</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold text-[10px]">
                              {food.categoryName || 'عام'}
                            </span>
                          </div>

                          {food.description && (
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 mt-1 leading-tight">
                              {food.description}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom: Status & Quick Action Buttons */}
                  <div className="pt-2.5 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-2 w-full justify-end">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-bold"
                        >
                          إلغاء
                        </button>
                        <button
                          disabled={saving}
                          onClick={() => saveQuickEdit(food.id)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{saving ? 'حفظ...' : 'حفظ التعديل'}</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Availability Toggle */}
                        <button
                          onClick={() => toggleAvailability(food)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                            food.available
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-stone-100 text-stone-500 border-stone-300 dark:bg-stone-800 dark:text-stone-400'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${food.available ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`}></span>
                          <span>{food.available ? 'متاح للطلب' : 'غير متاح'}</span>
                        </button>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => startEditing(food)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-orange-100 text-stone-700 hover:text-orange-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 text-xs font-bold transition-colors"
                            title="تعديل السعر والاسم"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>تعديل</span>
                          </button>
                          <button
                            onClick={() => handleDelete(food.id, food.name)}
                            className="p-2 rounded-xl bg-stone-100 hover:bg-red-100 text-stone-600 hover:text-red-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 transition-colors"
                            title="حذف الصنف نهائياً"
                            aria-label="حذف الصنف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View: Full Data Table (hidden on mobile, visible on md+) */}
          <div className="hidden md:block bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-stone-50 dark:bg-stone-800/70 text-stone-500 font-bold border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="p-4">الصنف</th>
                    <th className="p-4">التصنيف</th>
                    <th className="p-4">السعر الحالي</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4 text-center">إجراءات سريعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {filteredFoods.map((food) => {
                    const isEditing = editingId === food.id;

                    return (
                      <tr key={food.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                        {/* Item details */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0 border border-stone-200 dark:border-stone-700">
                              <Image
                                src={food.image}
                                alt={food.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <div>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="px-2 py-1 text-xs rounded bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-600 font-bold text-stone-900 dark:text-white"
                                />
                              ) : (
                                <div className="font-extrabold text-stone-900 dark:text-white text-sm">
                                  {food.name}
                                </div>
                              )}
                              <div className="text-[11px] text-stone-500 truncate max-w-xs mt-0.5">
                                {food.description || 'لا يوجد وصف'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 font-bold text-[11px] border border-orange-200 dark:border-orange-900/40">
                            {food.categoryName || 'عام'}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="p-4">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                step="0.5"
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                                className="w-20 px-2 py-1 text-xs rounded bg-stone-100 dark:bg-stone-800 border border-orange-400 font-black text-orange-600"
                              />
                              <span className="text-stone-500 font-bold">ج.م</span>
                            </div>
                          ) : (
                            <div className="font-black text-stone-900 dark:text-white text-sm">
                              {food.price} <span className="text-[10px] text-stone-500 font-normal">ج.م</span>
                            </div>
                          )}
                        </td>

                        {/* Availability */}
                        <td className="p-4">
                          <button
                            onClick={() => toggleAvailability(food)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors inline-flex items-center gap-1.5 ${
                              food.available
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : 'bg-stone-100 text-stone-500 border-stone-300 dark:bg-stone-800 dark:text-stone-400'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${food.available ? 'bg-emerald-500' : 'bg-stone-400'}`} />
                            <span>{food.available ? 'متاح للطلب' : 'غير متاح'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  disabled={saving}
                                  onClick={() => saveQuickEdit(food.id)}
                                  className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
                                  title="حفظ التعديلات"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="p-1.5 rounded-lg bg-stone-200 text-stone-700 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-200"
                                  title="إلغاء"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditing(food)}
                                  className="p-2 rounded-xl bg-stone-100 hover:bg-orange-100 text-stone-600 hover:text-orange-600 dark:bg-stone-800 dark:hover:bg-stone-700 transition-colors"
                                  title="تعديل السعر والاسم"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(food.id, food.name)}
                                  className="p-2 rounded-xl bg-stone-100 hover:bg-red-100 text-stone-600 hover:text-red-600 dark:bg-stone-800 dark:hover:bg-stone-700 transition-colors"
                                  title="حذف الصنف نهائياً"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal: Add New Food Item */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-7 space-y-4 sm:space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3 sm:pb-4">
              <h2 className="text-base sm:text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500 shrink-0" />
                <span>إضافة صنف طعام جديد إلى المنيو</span>
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFood} className="space-y-3.5 text-xs sm:text-sm">
              {/* Name */}
              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1 text-xs">
                  اسم الصنف <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: سندوتش فول مخصوص بالزيت الحار"
                  value={newFood.name}
                  onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500 text-sm"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1 text-xs">
                    التصنيف <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newFood.categoryId}
                    onChange={(e) => setNewFood({ ...newFood, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500 text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1 text-xs">
                    السعر (ج.م) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="مثال: 15"
                    value={newFood.price}
                    onChange={(e) => setNewFood({ ...newFood, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500 text-sm"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1 text-xs">
                  رابط صورة الصنف (اختياري)
                </label>
                <input
                  type="url"
                  placeholder="https://... أو /images/..."
                  value={newFood.image}
                  onChange={(e) => setNewFood({ ...newFood, image: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500 text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1 text-xs">
                  وصف الصنف والمكونات
                </label>
                <textarea
                  rows={2}
                  placeholder="مكونات السندوتش أو الوجبة..."
                  value={newFood.description}
                  onChange={(e) => setNewFood({ ...newFood, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500 text-sm"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 sm:pt-4 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 font-bold hover:bg-stone-100 dark:hover:bg-stone-800 text-xs sm:text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md shadow-orange-500/25 disabled:opacity-50 flex items-center gap-1.5 text-xs sm:text-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'جاري الحفظ...' : 'حفظ الصنف'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
