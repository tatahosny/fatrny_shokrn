import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const food = await db.getFoodItemById(id);
    if (!food) {
      return NextResponse.json({ error: 'صنف الطعام غير موجود' }, { status: 404 });
    }
    return NextResponse.json({ food });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل جلب الصنف';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
