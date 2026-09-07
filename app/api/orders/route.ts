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
    const { items, notes, guestName, guestPhone, restaurantId, restaurantName, address, locationUrl } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'سلة المشتريات فارغة، يرجى اختيار وجبة أولاً' },
        { status: 400 }
      );
    }

    // التحقق الصارم من وجود حساب وجلسة دخول نشطة
    const session = await getCurrentUserFromCookie();
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول بحسابك أولاً لإتمام الطلب. إرسال الطلبات متاح حصرياً للحسابات المسجلة.' },
        { status: 401 }
      );
    }

    const userId = session.userId;
    const userName = session.name;
    const userPhone = session.phone;

    const sanitizedItems = items.map((it: { foodItemId: string; quantity: number; notes?: string }) => ({
      foodItemId: it.foodItemId,
      quantity: Number(it.quantity) || 1,
      notes: typeof it.notes === 'string' ? it.notes.trim() : '',
    }));

    const newOrder = await db.createOrder({
      userId,
      userName,
      userPhone,
      restaurantId: typeof restaurantId === 'string' ? restaurantId : undefined,
      restaurantName: typeof restaurantName === 'string' ? restaurantName : undefined,
      notes: notes || '',
      address: typeof address === 'string' ? address : undefined,
      locationUrl: typeof locationUrl === 'string' ? locationUrl : undefined,
      items: sanitizedItems,
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
