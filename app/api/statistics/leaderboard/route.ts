import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const leaderboard = await db.getLeaderboard();
    return NextResponse.json(leaderboard);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل جلب بيانات لوحة الشرف';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
