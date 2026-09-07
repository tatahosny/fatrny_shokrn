import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserFromCookie } from '@/lib/auth';

export async function GET(_req: NextRequest) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً' }, { status: 401 });
    }

    if (session.role !== 'DELIVERY' && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'هذه الصفحة مخصصة لعمال التوصيل (الديلفري)' }, { status: 403 });
    }

    let restaurantId = session.restaurantId;
    if (!restaurantId && session.role !== 'ADMIN') {
      const user = await db.getUserById(session.userId);
      restaurantId = user?.restaurantId;
    }

    // 1. Orders assigned to this delivery driver
    const myOrders = await db.getOrders({
      deliveryPersonId: session.userId,
    });

    // 2. Available unassigned orders from the driver's restaurant (PREPARING or OUT_FOR_DELIVERY without driver, or PENDING)
    let availableOrders: import('@/lib/types').Order[] = [];
    if (restaurantId) {
      const restOrders = await db.getOrders({
        restaurantId,
      });
      availableOrders = restOrders.filter(
        (o) =>
          (!o.deliveryPersonId || o.deliveryPersonId === '') &&
          (o.status === 'PREPARING' || o.status === 'PENDING' || o.status === 'OUT_FOR_DELIVERY')
      );
    }

    const myActiveOrders = myOrders.filter((o) => o.status === 'OUT_FOR_DELIVERY');
    const myCompletedOrders = myOrders.filter((o) => o.status === 'DELIVERED');

    return NextResponse.json({
      myOrders,
      myActiveOrders,
      myCompletedOrders,
      availableOrders,
      stats: {
        activeCount: myActiveOrders.length,
        deliveredCount: myCompletedOrders.length,
        availableCount: availableOrders.length,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل جلب طلبات التوصيل';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
