import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserFromCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً' }, { status: 401 });
    }

    let restaurantId = session.restaurantId;
    if (session.role === 'ADMIN') {
      const { searchParams } = new URL(req.url);
      const queryRestId = searchParams.get('restaurantId');
      if (queryRestId) restaurantId = queryRestId;
    } else if (session.role !== 'RESTAURANT') {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 403 });
    }

    if (!restaurantId) {
      const user = await db.getUserById(session.userId);
      restaurantId = user?.restaurantId;
    }

    if (!restaurantId) {
      return NextResponse.json({ error: 'حسابك غير مرتبط بمطعم' }, { status: 400 });
    }

    const accounts = await db.getDeliveryAccounts(restaurantId);
    return NextResponse.json({ accounts });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل جلب حسابات الديلفري';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً' }, { status: 401 });
    }

    let restaurantId = session.restaurantId;
    if (session.role === 'ADMIN') {
      const { searchParams } = new URL(req.url);
      const queryRestId = searchParams.get('restaurantId');
      if (queryRestId) restaurantId = queryRestId;
    } else if (session.role !== 'RESTAURANT') {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 403 });
    }

    if (!restaurantId) {
      const user = await db.getUserById(session.userId);
      restaurantId = user?.restaurantId;
    }

    if (!restaurantId) {
      return NextResponse.json({ error: 'حسابك غير مرتبط بمطعم' }, { status: 400 });
    }

    const body = await req.json();
    const { name, phone, password } = body;

    if (!name || !phone || !password) {
      return NextResponse.json({ error: 'يرجى إدخال اسم المندوب، رقم الهاتف، وكلمة المرور' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await db.createUser({
      name: name.trim(),
      phone: phone.trim(),
      passwordHash,
      role: 'DELIVERY',
      restaurantId,
      status: 'ACTIVE',
    });

    return NextResponse.json({
      success: true,
      message: `تم إنشاء حساب المندوب ${newUser.name} بنجاح`,
      account: {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        restaurantId: newUser.restaurantId,
        createdAt: newUser.createdAt,
        activeOrdersCount: 0,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل إنشاء حساب الديلفري';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
