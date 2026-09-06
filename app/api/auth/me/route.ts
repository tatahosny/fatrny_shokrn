import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const user = await db.getUserById(session.userId);
    if (!user) {
      return NextResponse.json({ user: null });
    }

    const { passwordHash: _, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json({ user: null });
  }
}
