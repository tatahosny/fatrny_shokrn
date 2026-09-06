import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'فطرني شكراً 🍳 | جامعة برج العرب التكنولوجية - إدارة التقديمات',
  description:
    'نظام طلبات الطعام والإفطار الذكي لطلاب وأعضاء فريق إدارة التقديمات بجامعة برج العرب التكنولوجية (BATU)',
  keywords: [
    'فطرني شكرا',
    'جامعة برج العرب التكنولوجية',
    'فريق التقديمات',
    'إفطار جماعي',
    'فول وطعمية',
    'شاورما',
    'بيتزا',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`dark ${cairo.variable} h-full`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-[#fffdfa] dark:bg-stone-950 text-stone-900 dark:text-stone-100 antialiased selection:bg-orange-500 selection:text-white">
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <CartDrawer />
              <main className="flex-1">{children}</main>
              <Footer />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
