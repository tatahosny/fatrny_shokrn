import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const stats = await db.getDashboardStats();
    return NextResponse.json(stats);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل جلب التحليلات الإحصائية';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
