import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { OrderStatus } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    // التحقق من صلاحية المشرف العام
    const session = await getCurrentUserFromCookie();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك بعرض هذه البيانات' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = (searchParams.get('status') as OrderStatus | 'ALL') || undefined;
    const search = searchParams.get('search') || undefined;
    const todayOnly = searchParams.get('today') === 'true';
    const restaurantId = searchParams.get('restaurantId') || undefined;

    const [orders, restaurants] = await Promise.all([
      db.getOrders({ status, search, todayOnly, restaurantId }),
      db.getRestaurants(false),
    ]);

    return NextResponse.json({ orders, restaurants });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل جلب الطلبات';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
