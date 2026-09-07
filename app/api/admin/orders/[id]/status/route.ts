import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { OrderStatus } from '@/lib/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body as { status: OrderStatus };

    if (!['PENDING', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: 'حالة الطلب غير صالحة' }, { status: 400 });
    }

    const session = await getCurrentUserFromCookie();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك بتعديل هذا الطلب' }, { status: 403 });
    }
    const adminName = session.name || 'الإدارة';

    const updated = await db.updateOrderStatus(id, status, adminName);
    if (!updated) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message:
        status === 'DELIVERED'
          ? `تم تأكيد تسليم الطلب #${updated.orderNumber} للطالب ${updated.userName} بنجاح`
          : `تم تحديث حالة الطلب #${updated.orderNumber} إلى ${status}`,
      order: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل تحديث حالة الطلب';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
