import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserFromCookie } from '@/lib/auth';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentUserFromCookie();
    if (!session) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً' }, { status: 401 });
    }

    if (session.role !== 'DELIVERY' && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك باستلام الطلبات' }, { status: 403 });
    }

    const order = await db.getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
      return NextResponse.json({ error: 'لا يمكن استلام هذا الطلب لأنه مكتمل أو ملغي' }, { status: 400 });
    }

    if (order.deliveryPersonId && order.deliveryPersonId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ error: `الطلب مستلم بالفعل بواسطة مندوب آخر: ${order.deliveryPersonName}` }, { status: 400 });
    }

    const updated = await db.assignOrderDelivery(id, session.userId, session.name);

    return NextResponse.json({
      success: true,
      message: `تم إسناد الطلب #${order.orderNumber} لك بنجاح وبدء التوصيل`,
      order: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل استلام الطلب';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
