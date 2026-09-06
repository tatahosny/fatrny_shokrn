import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { OrderStatus } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = (searchParams.get('status') as OrderStatus | 'ALL') || undefined;
    const search = searchParams.get('search') || undefined;
    const todayOnly = searchParams.get('today') === 'true';

    const orders = await db.getOrders({
      status,
      search,
      todayOnly,
    });

    return NextResponse.json({ orders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل جلب الطلبات';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
