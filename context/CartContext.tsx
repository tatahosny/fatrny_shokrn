'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { FoodItem, Order, Restaurant } from '@/lib/types';
import { useToast } from './ToastContext';
import { playCartSound } from '@/lib/sound';
import confetti from 'canvas-confetti';

export interface CartItem {
  id: string;
  food: FoodItem;
  quantity: number;
  notes?: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  selectedRestaurant: Restaurant | null;
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (food: FoodItem, quantity?: number, notes?: string) => void;
  updateQuantity: (identifier: string, quantity: number) => void;
  updateItemNotes: (identifier: string, notes: string) => void;
  removeFromCart: (identifier: string) => void;
  clearCart: () => void;
  favorites: string[];
  toggleFavorite: (foodId: string) => void;
  isFavorite: (foodId: string) => boolean;
  submitOrder: (
    notes?: string,
    guestName?: string,
    guestPhone?: string,
    address?: string,
    locationUrl?: string
  ) => Promise<Order | null>;
  isSubmitting: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  // استرجاع السلة والمفضلة والمطعم المختار من التخزين المحلي
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('fetarni_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setItems(
            parsed.map((it: CartItem, idx: number) => ({
              ...it,
              id: it.id || `cart-${it.food?.id || 'item'}-${idx}`,
              notes: it.notes || '',
            }))
          );
        }
      }
      const savedFavs = localStorage.getItem('fetarni_favs');
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }
      const savedRest = localStorage.getItem('fetarni_restaurant');
      if (savedRest) {
        setSelectedRestaurant(JSON.parse(savedRest));
      }
    } catch {
      // ignore
    }
  }, []);

  // حفظ المطعم المختار
  useEffect(() => {
    try {
      if (selectedRestaurant) {
        localStorage.setItem('fetarni_restaurant', JSON.stringify(selectedRestaurant));
      } else {
        localStorage.removeItem('fetarni_restaurant');
      }
    } catch {
      // ignore
    }
  }, [selectedRestaurant]);

  // حفظ السلة في التخزين المحلي
  useEffect(() => {
    try {
      localStorage.setItem('fetarni_cart', JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  // حفظ المفضلة
  useEffect(() => {
    try {
      localStorage.setItem('fetarni_favs', JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.food.price * item.quantity, 0);

  const addToCart = (food: FoodItem, quantity: number = 1, notes: string = '') => {
    if (quantity <= 0) return;

    // إذا كان للطبق مطعم محدد ولم يتم تحديد مطعم بعد، نحدده تلقائياً
    if (food.restaurantId && !selectedRestaurant) {
      setSelectedRestaurant({
        id: food.restaurantId,
        name: food.restaurantName || 'المطعم المختار',
        slug: '',
        phone: '',
        address: '',
        active: true,
        createdAt: '',
      });
    }

    const cleanNote = (notes || '').trim();

    setItems((prev) => {
      // نبحث عن صنف مطابق لنفس الأكل ونفس الملاحظة الخاصة
      const existingIndex = prev.findIndex(
        (i) => i.food.id === food.id && (i.notes || '').trim() === cleanNote
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        const uniqueId = `cart-${food.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        return [...prev, { id: uniqueId, food, quantity, notes: cleanNote }];
      }
    });

    // تشغيل نغمة الإضافة الخفيفة
    playCartSound();

    if (cleanNote) {
      showToast(`تمت إضافة "${food.name}" (${quantity}) بملاحظة: "${cleanNote}"`, 'success');
    } else {
      showToast(`تمت إضافة "${food.name}" (${quantity}) إلى السلة`, 'success');
    }
  };

  const updateQuantity = (identifier: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(identifier);
      return;
    }

    setItems((prev) => {
      let idx = prev.findIndex((i) => i.id === identifier);
      if (idx === -1) {
        idx = prev.findIndex((i) => i.food.id === identifier);
      }
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity };
        return updated;
      }
      return prev;
    });
  };

  const updateItemNotes = (identifier: string, newNotes: string) => {
    setItems((prev) => {
      let idx = prev.findIndex((i) => i.id === identifier);
      if (idx === -1) {
        idx = prev.findIndex((i) => i.food.id === identifier);
      }
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], notes: newNotes };
        return updated;
      }
      return prev;
    });
  };

  const removeFromCart = (identifier: string) => {
    setItems((prev) => {
      let idx = prev.findIndex((i) => i.id === identifier);
      if (idx === -1) {
        idx = prev.findIndex((i) => i.food.id === identifier);
      }
      if (idx > -1) {
        const itemToRemove = prev[idx];
        showToast(`تم حذف "${itemToRemove.food.name}" من السلة`, 'info');
        return prev.filter((_, i) => i !== idx);
      }
      return prev;
    });
  };

  const clearCart = () => {
    setItems([]);
    showToast('تم تفريغ سلة المشتريات', 'info');
  };

  const toggleFavorite = (foodId: string) => {
    setFavorites((prev) => {
      if (prev.includes(foodId)) {
        showToast('تمت الإزالة من المفضلة', 'info');
        return prev.filter((id) => id !== foodId);
      } else {
        showToast('تمت الإضافة إلى المفضلة', 'success');
        return [...prev, foodId];
      }
    });
  };

  const isFavorite = (foodId: string) => favorites.includes(foodId);

  const submitOrder = async (
    notes?: string,
    guestName?: string,
    guestPhone?: string,
    address?: string,
    locationUrl?: string
  ): Promise<Order | null> => {
    if (items.length === 0) {
      showToast('سلة المشتريات فارغة!', 'error');
      return null;
    }

    try {
      setIsSubmitting(true);
      const primaryRestId = selectedRestaurant?.id || items[0]?.food?.restaurantId || undefined;
      const primaryRestName = selectedRestaurant?.name || items[0]?.food?.restaurantName || undefined;

      const payload = {
        items: items.map((i) => ({
          foodItemId: i.food.id,
          quantity: i.quantity,
          notes: i.notes || '',
        })),
        notes: notes || '',
        address: address || '',
        locationUrl: locationUrl || '',
        guestName,
        guestPhone,
        restaurantId: primaryRestId,
        restaurantName: primaryRestName,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'فشل إرسال الطلب', 'error');
        return null;
      }

      // إطلاق تأثير الاحتفال (Confetti) المبهج
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f97316', '#eab308', '#ef4444', '#10b981'],
        });
      } catch {
        // ignore
      }

      setItems([]);
      setIsCartOpen(false);
      showToast(data.message || 'تم تأكيد طلبك بنجاح!', 'success');
      return data.order;
    } catch {
      showToast('حدث خطأ في الاتصال أثناء تأكيد الطلب', 'error');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        selectedRestaurant,
        setSelectedRestaurant,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        updateItemNotes,
        removeFromCart,
        clearCart,
        favorites,
        toggleFavorite,
        isFavorite,
        submitOrder,
        isSubmitting,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
