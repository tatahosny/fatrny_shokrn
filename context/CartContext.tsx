'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { FoodItem, Order } from '@/lib/types';
import { useToast } from './ToastContext';
import { playCartSound } from '@/lib/sound';
import confetti from 'canvas-confetti';

export interface CartItem {
  food: FoodItem;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (food: FoodItem, quantity?: number) => void;
  updateQuantity: (foodId: string, quantity: number) => void;
  removeFromCart: (foodId: string) => void;
  clearCart: () => void;
  favorites: string[];
  toggleFavorite: (foodId: string) => void;
  isFavorite: (foodId: string) => boolean;
  submitOrder: (notes?: string, guestName?: string, guestPhone?: string) => Promise<Order | null>;
  isSubmitting: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  // استرجاع السلة والمفضلة من التخزين المحلي
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('fetarni_cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      const savedFavs = localStorage.getItem('fetarni_favs');
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }
    } catch {
      // ignore
    }
  }, []);

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

  const addToCart = (food: FoodItem, quantity: number = 1) => {
    if (quantity <= 0) return;

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.food.id === food.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        return [...prev, { food, quantity }];
      }
    });

    // تشغيل نغمة الإضافة الخفيفة
    playCartSound();

    showToast(`تمت إضافة "${food.name}" (${quantity}) إلى السلة 🛒`, 'success');
  };

  const updateQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(foodId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.food.id === foodId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (foodId: string) => {
    setItems((prev) => {
      const itemToRemove = prev.find((i) => i.food.id === foodId);
      if (itemToRemove) {
        showToast(`تم حذف "${itemToRemove.food.name}" من السلة`, 'info');
      }
      return prev.filter((i) => i.food.id !== foodId);
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
        showToast('تمت الإضافة إلى المفضلة ❤️', 'success');
        return [...prev, foodId];
      }
    });
  };

  const isFavorite = (foodId: string) => favorites.includes(foodId);

  const submitOrder = async (
    notes?: string,
    guestName?: string,
    guestPhone?: string
  ): Promise<Order | null> => {
    if (items.length === 0) {
      showToast('سلة المشتريات فارغة!', 'error');
      return null;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        items: items.map((i) => ({
          foodItemId: i.food.id,
          quantity: i.quantity,
        })),
        notes: notes || '',
        guestName,
        guestPhone,
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
      showToast(data.message || 'تم تأكيد طلبك بنجاح! 🍳', 'success');
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
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
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
