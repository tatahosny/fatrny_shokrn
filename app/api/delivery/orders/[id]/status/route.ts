import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { OrderStatus } from '@/lib/types';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentUserFromCookie();
    if (!session) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً' }, { status: 401 });
    }

    if (session.role !== 'DELIVERY' && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك بتحديث حالة التوصيل' }, { status: 403 });
    }

    const body = await req.json();
    const { status } = body as { status: OrderStatus };

    if (!status || (status !== 'DELIVERED' && status !== 'OUT_FOR_DELIVERY')) {
      return NextResponse.json({ error: 'حالة غير صالحة' }, { status: 400 });
    }

    const order = await db.getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    if (session.role !== 'ADMIN' && order.deliveryPersonId !== session.userId) {
      return NextResponse.json({ error: 'هذا الطلب غير مسند إليك' }, { status: 403 });
    }

    const updated = await db.updateOrderStatus(id, status, `المندوب (${session.name})`);

    return NextResponse.json({
      success: true,
      message: status === 'DELIVERED' ? 'تم تسجيل تسليم الطلب بنجاح' : 'تم تحديث الحالة',
      order: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل تحديث حالة الطلب';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
