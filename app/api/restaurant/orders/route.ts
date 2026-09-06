import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { OrderStatus } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً' }, { status: 401 });
    }

    let restaurantId = session.restaurantId;

    // إذا كان الحساب ADMIN، يمكنه التصفح لأي مطعم أو تمرير restaurantId
    if (session.role === 'ADMIN') {
      const { searchParams } = new URL(req.url);
      const queryRestId = searchParams.get('restaurantId');
      if (queryRestId) {
        restaurantId = queryRestId;
      }
    } else if (session.role !== 'RESTAURANT') {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول، هذه اللوحة مخصصة لإدارات المطاعم' }, { status: 403 });
    }

    // إذا لم يكن هناك restaurantId في الجلسة، نبحث في قاعدة البيانات
    if (!restaurantId) {
      const user = await db.getUserById(session.userId);
      restaurantId = user?.restaurantId;
    }

    if (!restaurantId) {
      return NextResponse.json({ error: 'حسابك غير مرتبط بأي مطعم حالياً، يرجى التواصل مع الإدارة' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const status = (searchParams.get('status') as OrderStatus | 'ALL') || undefined;
    const search = searchParams.get('search') || undefined;

    // جلب الطلبات الموجهة فقط لهذا المطعم
    const orders = await db.getOrders({
      restaurantId,
      status,
      search,
    });

    const restaurant = await db.getRestaurantById(restaurantId);

    const pendingOrders = orders.filter((o) => o.status === 'PENDING');
    const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED');
    const pendingItemsCount = pendingOrders.reduce(
      (sum, o) => sum + (o.totalItemsCount || o.items.reduce((s, it) => s + it.quantity, 0)),
      0
    );

    return NextResponse.json({
      orders,
      restaurant,
      stats: {
        totalOrders: orders.length,
        pendingOrders: pendingOrders.length,
        deliveredOrders: deliveredOrders.length,
        pendingItemsCount,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل جلب طلبات المطعم';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
