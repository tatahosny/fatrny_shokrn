import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const restaurantId = searchParams.get('restaurantId') || undefined;
    const search = searchParams.get('search') || undefined;

    const foods = await db.getFoodItems({ categoryId: category, restaurantId, search });
    return NextResponse.json({ foods });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل جلب قائمة الطعام';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
