import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserFromCookie } from '@/lib/auth';

export async function GET(_req: NextRequest) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول، مخصصة للمدير' }, { status: 403 });
    }

    const analytics = await db.getAdminAnalytics();
    return NextResponse.json({ analytics });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل جلب إحصائيات الإدارة';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
