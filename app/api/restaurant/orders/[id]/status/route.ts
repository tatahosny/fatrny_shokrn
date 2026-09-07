import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { OrderStatus } from '@/lib/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session || (session.role !== 'RESTAURANT' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بتعديل حالة الطلب' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status || !['PENDING', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: 'حالة الطلب غير صالحة' }, { status: 400 });
    }

    // التحقق من أن الطلب يخص هذا المطعم
    const existingOrder = await db.getOrderById(id);
    if (!existingOrder) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    if (session.role === 'RESTAURANT') {
      let restaurantId = session.restaurantId;
      if (!restaurantId) {
        const u = await db.getUserById(session.userId);
        restaurantId = u?.restaurantId;
      }
      if (restaurantId && existingOrder.restaurantId && existingOrder.restaurantId !== restaurantId) {
        return NextResponse.json({ error: 'غير مصرح لك بتعديل طلب تابع لمطعم آخر' }, { status: 403 });
      }
    }

    await db.updateOrderStatus(id, status as OrderStatus, session.name);

    return NextResponse.json({
      success: true,
      message: `تم تحديث حالة الطلب #${existingOrder.orderNumber} بنجاح`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل تحديث حالة الطلب';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
