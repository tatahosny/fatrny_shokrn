import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserFromCookie } from '@/lib/auth';

export async function GET() {
  try {
    const orders = await db.getOrders();
    return NextResponse.json({ orders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل جلب الطلبات';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {

  try {
    const body = await req.json();
    const { items, notes, guestName, guestPhone } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'سلة المشتريات فارغة، يرجى اختيار وجبة أولاً' },
        { status: 400 }
      );
    }

    // التحقق من هوية المستخدم (سواء كان مسجلاً أو زائر بمعلومات سريعة)
    const session = await getCurrentUserFromCookie();
    let userId = session?.userId;
    let userName = session?.name || guestName;
    let userPhone = session?.phone || guestPhone;

    if (!userName || !userPhone) {
      return NextResponse.json(
        { error: 'يرجى تسجيل الدخول أو إدخال الاسم ورقم الهاتف لتأكيد الطلب' },
        { status: 401 }
      );
    }

    // إذا لم يكن مسجلاً، ننشئ له حساب تلقائي فوراً
    if (!userId) {
      const existingUser = await db.getUserByPhone(userPhone);
      if (existingUser) {
        userId = existingUser.id;
        userName = existingUser.name;
      } else {
        const newUser = await db.createUser({
          name: userName,
          phone: userPhone,
          passwordHash: '',
          role: 'USER',
        });
        userId = newUser.id;
      }
    }

    const newOrder = await db.createOrder({
      userId,
      userName,
      userPhone,
      notes: notes || '',
      items,
    });

    return NextResponse.json({
      success: true,
      message: `تم تأكيد طلبك بنجاح! رقم الطلب #${newOrder.orderNumber} - بالهنا والشفا`,
      order: newOrder,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل إرسال الطلب';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
