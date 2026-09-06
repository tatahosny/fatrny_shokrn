'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Coffee, Shield, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Brand & University Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🍳</span>
              <span className="text-2xl font-black text-white">فطرني شكراً</span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed max-w-md">
              المنظومة الرقمية الذكية لطلبات الإفطار والأطعمة الخاصة بـ{' '}
              <strong className="text-orange-400">جامعة برج العرب التكنولوجية</strong>، مصممة لخدمة{' '}
              <strong className="text-amber-400">فريق إدارة التقديمات</strong> والطلاب لتسهيل تجميع الطلبات وحساب الكميات بدقة وسرعة فائقة.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-800/80 border border-stone-700 text-xs text-orange-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>جامعة برج العرب التكنولوجية (BATU)</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <span>أقسام سريعة</span>
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-orange-400 transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-orange-400 transition-colors">
                  قائمة وجبات الإفطار 🥪
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-orange-400 transition-colors">
                  الأكثر طلباً ولوحة الشرف 🏆
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-orange-400 transition-colors">
                  سلة التسوق 🛒
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Team & System Support */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-400" />
              <span>الإدارة والتشغيل</span>
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed mb-3">
              مخصص لفريق إدارة التقديمات واللجان الطلابية لتنسيق وجبات الإفطار الجماعية وتتبع التسليم الفوري.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/30 text-xs font-bold transition-colors"
            >
              <span>دخول المشرفين (Admin) 🛡️</span>
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>
            جميع الحقوق محفوظة © {new Date().getFullYear()} - فطرني شكراً 🍳 | جامعة برج العرب التكنولوجية
          </p>
          <div className="flex items-center gap-1">
            <span>صُنع بـ</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline mx-0.5" />
            <span>لأجل فريق التقديمات بالجامعة</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
