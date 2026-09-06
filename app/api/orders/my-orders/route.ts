import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserFromCookie } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session) {
      return NextResponse.json(
        { error: 'يرجى تسجيل الدخول لعرض سجل طلباتك' },
        { status: 401 }
      );
    }

    const orders = await db.getOrders({ userId: session.userId });
    return NextResponse.json({ orders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل جلب الطلبات السابقة';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
