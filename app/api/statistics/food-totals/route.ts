import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const totals = await db.getAggregatedFoodTotals();
    return NextResponse.json(totals);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل تجميع إحصائيات الأطعمة';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
