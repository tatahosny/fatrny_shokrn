import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const logs = await db.getActivityLogs(50);
    return NextResponse.json({ logs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل جلب سجل النشاط';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
