'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/lib/types';
import { useToast } from './ToastContext';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  isRestaurant: boolean;
  isStudent: boolean;
  isStudentVerified: boolean;
  restaurantId?: string;
  login: (phone: string, password?: string) => Promise<User | null>;
  register: (
    name: string,
    phone: string,
    password?: string,
    options?: { role?: 'CUSTOMER' | 'STUDENT'; studentIdImage?: string }
  ) => Promise<{ success: boolean; pendingVerification?: boolean }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (phone: string, password?: string): Promise<User | null> => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'فشل تسجيل الدخول', 'error');
        return null;
      }

      setUser(data.user);
      showToast(data.message || `أهلاً بك يا ${data.user.name}`, 'success');
      return data.user;
    } catch {
      showToast('حدث خطأ في الاتصال بالخادم', 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    phone: string,
    password?: string,
    options?: { role?: 'CUSTOMER' | 'STUDENT'; studentIdImage?: string }
  ): Promise<{ success: boolean; pendingVerification?: boolean }> => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          password,
          role: options?.role || 'CUSTOMER',
          studentIdImage: options?.studentIdImage,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'فشل إنشاء الحساب', 'error');
        return { success: false };
      }

      if (data.pendingVerification) {
        showToast(data.message, 'info');
        return { success: true, pendingVerification: true };
      }

      setUser(data.user);
      showToast(data.message || 'تم إنشاء الحساب وتأكيد الدخول بنجاح', 'success');
      return { success: true };
    } catch {
      showToast('حدث خطأ في الاتصال بالخادم', 'error');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      showToast('تم تسجيل الخروج بنجاح. نراك قريباً', 'info');
      router.push('/');
    } catch {
      setUser(null);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isRestaurant = user?.role === 'RESTAURANT';
  const isStudent = user?.role === 'STUDENT';
  const isStudentVerified = user?.role === 'STUDENT' && user?.status === 'ACTIVE';
  const restaurantId = user?.restaurantId;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        isRestaurant,
        isStudent,
        isStudentVerified,
        restaurantId,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
