import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, password, role } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'يرجى إدخال الاسم ورقم الهاتف بالكامل' },
        { status: 400 }
      );
    }

    if (phone.trim().length < 8) {
      return NextResponse.json(
        { error: 'يرجى إدخال رقم هاتف صحيح' },
        { status: 400 }
      );
    }

    const existing = await db.getUserByPhone(phone);
    if (existing) {
      return NextResponse.json(
        { error: 'رقم الهاتف مسجل مسبقاً، يمكنك تسجيل الدخول به مباشرة' },
        { status: 409 }
      );
    }

    const passwordHash = password ? await bcrypt.hash(password, 8) : await bcrypt.hash('123456', 8);

    const newUser = await db.createUser({
      name: name.trim(),
      phone: phone.trim(),
      passwordHash,
      role: role === 'ADMIN' ? 'ADMIN' : 'USER',
    });

    const token = createSessionToken(newUser);

    const response = NextResponse.json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح، أهلاً بك في فطرني شكراً 🍳',
      user: newUser,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء الحساب';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
