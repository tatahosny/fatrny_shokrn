import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserFromCookie } from '@/lib/auth';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentUserFromCookie();
    if (!session) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً' }, { status: 401 });
    }

    let restaurantId = session.restaurantId;
    if (session.role === 'ADMIN') {
      // Admin can delete for any restaurant
      restaurantId = undefined;
    } else if (session.role !== 'RESTAURANT') {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 403 });
    }

    const success = await db.deleteDeliveryAccount(id, restaurantId);
    if (!success) {
      return NextResponse.json({ error: 'لم يتم العثور على الحساب أو لا تملك صلاحية حذفه' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'تم حذف حساب المندوب بنجاح' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل حذف الحساب';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
