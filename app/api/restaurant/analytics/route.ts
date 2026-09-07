import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserFromCookie } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً' }, { status: 401 });
    }

    let restaurantId = session.restaurantId;
    if (session.role === 'ADMIN') {
      const { searchParams } = new URL(req.url);
      const queryRestId = searchParams.get('restaurantId');
      if (queryRestId) restaurantId = queryRestId;
    } else if (session.role !== 'RESTAURANT') {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 403 });
    }

    if (!restaurantId) {
      const user = await db.getUserById(session.userId);
      restaurantId = user?.restaurantId;
    }

    if (!restaurantId) {
      return NextResponse.json({ error: 'حسابك غير مرتبط بمطعم' }, { status: 400 });
    }

    const analytics = await db.getRestaurantAnalytics(restaurantId);
    return NextResponse.json({ analytics });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل جلب إحصائيات وتحليلات المطعم';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
