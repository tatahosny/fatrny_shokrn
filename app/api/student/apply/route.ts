import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserFromCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً' }, { status: 401 });
    }

    const body = await req.json();
    const { studentIdImage } = body;

    if (!studentIdImage || typeof studentIdImage !== 'string') {
      return NextResponse.json({ error: 'يرجى رفع صورة الكرنيه أولاً' }, { status: 400 });
    }

    // تحديث بيانات المستخدم لرول STUDENT وحالة PENDING_VERIFICATION
    await db.updateUser(session.userId, {
      role: 'STUDENT',
      status: 'PENDING_VERIFICATION',
      studentIdImage,
    });

    await db.logActivity(
      `تقديم طلب توثيق كرنيه طالب: ${session.name}`,
      session.userId,
      session.name,
      { studentIdImage }
    );

    return NextResponse.json({
      success: true,
      message: 'تم إرسال صورة الكرنيه بنجاح! جاري مراجعتها واعتمادها من قبل إدارة الجامعة.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل إرسال طلب التوثيق';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
