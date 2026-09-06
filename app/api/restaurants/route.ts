import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserFromCookie } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const restaurants = await db.getRestaurants(activeOnly);
    return NextResponse.json({ restaurants });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل جلب المطاعم';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك بإضافة مطاعم، يرجى تسجيل الدخول كإدارة' }, { status: 403 });
    }

    const body = await req.json();
    const { name, phone, image, description, address, active, managerName, managerPassword } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'اسم المطعم مطلوب' }, { status: 400 });
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: 'رقم هاتف المطعم مطلوب' }, { status: 400 });
    }

    const slug = name.trim().toLowerCase().replace(/\s+/g, '-');
    const newRestaurant = await db.createRestaurant({
      name: name.trim(),
      slug: `${slug}-${Date.now().toString(36)}`,
      image: image || '/images/sandwich-foul.jpg',
      phone: phone.trim(),
      description: description || '',
      address: address || '',
      active: active !== false,
    });

    // إذا تم تزويد كلمة مرور للمدير، ننشئ له حساب دخول تلقائي برول RESTAURANT
    if (managerPassword && managerPassword.trim()) {
      const bcrypt = await import('bcryptjs');
      const passwordHash = bcrypt.default.hashSync(managerPassword.trim(), 8);
      const mName = managerName && managerName.trim() ? managerName.trim() : `إدارة ${newRestaurant.name}`;
      try {
        await db.createUser({
          name: mName,
          phone: phone.trim(),
          passwordHash,
          role: 'RESTAURANT',
          restaurantId: newRestaurant.id,
        });
      } catch (err: unknown) {
        // إذا كان رقم الهاتف موجوداً، نقوم بتحديث الرول وربطه بالمطعم
        const existing = await db.getUserByPhone(phone.trim());
        if (existing) {
          await db.updateUser(existing.id, {
            role: 'RESTAURANT',
            restaurantId: newRestaurant.id,
            passwordHash,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `تم إضافة "${newRestaurant.name}" بنجاح!`,
      restaurant: newRestaurant,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل إضافة المطعم';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
