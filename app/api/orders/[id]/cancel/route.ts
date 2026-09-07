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

    const order = await db.getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    // Must be the owner of the order or ADMIN
    if (order.userId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك بإلغاء هذا الطلب' }, { status: 403 });
    }

    if (order.status === 'DELIVERED') {
      return NextResponse.json({ error: 'لا يمكن إلغاء طلب تم تسليمه بالفعل' }, { status: 400 });
    }

    if (order.status === 'OUT_FOR_DELIVERY') {
      return NextResponse.json({ error: 'الطلب في الطريق مع المندوب حالياً ولا يمكن إلغاؤه' }, { status: 400 });
    }

    if (order.status === 'CANCELLED') {
      return NextResponse.json({ error: 'الطلب ملغي بالفعل' }, { status: 400 });
    }

    const updated = await db.updateOrderStatus(id, 'CANCELLED', `العميل (${session.name})`);

    return NextResponse.json({
      success: true,
      message: `تم إلغاء الطلب #${order.orderNumber} بنجاح`,
      order: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل إلغاء الطلب';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
