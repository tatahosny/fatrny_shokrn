import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, password } = body;

    if (!phone) {
      return NextResponse.json(
        { error: 'يرجى إدخال رقم الهاتف' },
        { status: 400 }
      );
    }

    const user = await db.getUserByPhone(phone);
    if (!user) {
      return NextResponse.json(
        { error: 'رقم الهاتف غير مسجل لدينا، يرجى إنشاء حساب أولاً' },
        { status: 404 }
      );
    }

    // إذا تم تزويد كلمة مرور، نتحقق منها (كلمة المرور الافتراضية للطلاب 123456 وللإدمن admin123)
    if (password && user.passwordHash) {
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json(
          { error: 'كلمة المرور غير صحيحة' },
          { status: 401 }
        );
      }
    }

    const token = createSessionToken(user);

    await db.logActivity(
      `تسجيل دخول المستخدم: ${user.name}`,
      user.id,
      user.name,
      { role: user.role }
    );

    const { passwordHash: _, ...safeUser } = user;

    const response = NextResponse.json({
      success: true,
      message: `أهلاً بك يا ${user.name}`,
      user: safeUser,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'حدث خطأ أثناء تسجيل الدخول';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
