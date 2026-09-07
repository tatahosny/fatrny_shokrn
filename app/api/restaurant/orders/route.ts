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

    // جلب جميع الطلبات للمطعم لحساب الإحصائيات الكاملة
    const allRestaurantOrders = await db.getOrders({ restaurantId });

    // تصفية الطلبات المعروضة بحسب الحالة أو البحث إن وجد
    const filteredOrders = allRestaurantOrders.filter((o) => {
      if (status && status !== 'ALL' && o.status !== status) return false;
      if (search && search.trim() !== '') {
        const q = search.trim().toLowerCase();
        return (
          o.userName.toLowerCase().includes(q) ||
          o.userPhone.includes(q) ||
          String(o.orderNumber).includes(q) ||
          (o.notes && o.notes.toLowerCase().includes(q)) ||
          (o.address && o.address.toLowerCase().includes(q))
        );
      }
      return true;
    });

    const restaurant = await db.getRestaurantById(restaurantId);

    const pendingOrders = allRestaurantOrders.filter((o) => o.status === 'PENDING');
    const preparingOrders = allRestaurantOrders.filter((o) => o.status === 'PREPARING');
    const outForDeliveryOrders = allRestaurantOrders.filter((o) => o.status === 'OUT_FOR_DELIVERY');
    const deliveredOrders = allRestaurantOrders.filter((o) => o.status === 'DELIVERED');
    const cancelledOrders = allRestaurantOrders.filter((o) => o.status === 'CANCELLED');

    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const activeOrdersCount = pendingOrders.length + preparingOrders.length + outForDeliveryOrders.length;
    const pendingItemsCount = [...pendingOrders, ...preparingOrders].reduce(
      (sum, o) => sum + (o.totalItemsCount || o.items.reduce((s, it) => s + it.quantity, 0)),
      0
    );

    return NextResponse.json({
      orders: filteredOrders,
      restaurant,
      stats: {
        totalOrders: allRestaurantOrders.length,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        activeOrdersCount,
        pendingOrders: pendingOrders.length,
        preparingOrders: preparingOrders.length,
        outForDeliveryOrders: outForDeliveryOrders.length,
        deliveredOrders: deliveredOrders.length,
        cancelledOrders: cancelledOrders.length,
        pendingItemsCount,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل جلب طلبات المطعم';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
