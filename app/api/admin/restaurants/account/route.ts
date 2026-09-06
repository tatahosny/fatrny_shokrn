import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserFromCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// POST: إنشاء حساب مطعم جديد تلقائياً مع إضافة المطعم إلى قائمة المطاعم
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح لك بهذه العملية، يجب أن تكون بحساب إدارة عليا' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      restaurantName,
      managerName,
      phone,
      password,
      address,
      description,
      image,
    } = body;

    // التحقق من الحقول الإجبارية
    if (!restaurantName || !restaurantName.trim()) {
      return NextResponse.json({ error: 'اسم المطعم مطلوب' }, { status: 400 });
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: 'رقم هاتف الدخول مطلوب' }, { status: 400 });
    }
    if (!password || password.trim().length < 4) {
      return NextResponse.json({ error: 'كلمة المرور يجب ألا تقل عن 4 خانات' }, { status: 400 });
    }

    const cleanPhone = phone.trim();
    const cleanRestName = restaurantName.trim();
    const cleanManagerName = managerName && managerName.trim() ? managerName.trim() : `إدارة ${cleanRestName}`;

    // التحقق من عدم تكرار رقم الهاتف
    const existingUser = await db.getUserByPhone(cleanPhone);
    if (existingUser) {
      return NextResponse.json(
        { error: `رقم الهاتف (${cleanPhone}) مسجل بالفعل مسبقاً في النظام باسم: ${existingUser.name}` },
        { status: 409 }
      );
    }

    // 1. إنشاء المطعم في جدول المطاعم
    const slug = cleanRestName.toLowerCase().replace(/\s+/g, '-');
    const newRestaurant = await db.createRestaurant({
      name: cleanRestName,
      slug: `${slug}-${Date.now().toString(36)}`,
      image: image?.trim() || '/images/sandwich-foul.jpg',
      phone: cleanPhone,
      description: description?.trim() || 'مطعم شريك بجامعة برج العرب التكنولوجية',
      address: address?.trim() || 'الحرم الجامعي - برج العرب',
      active: true,
    });

    // 2. تشفير كلمة المرور
    const passwordHash = bcrypt.hashSync(password.trim(), 8);

    // 3. إنشاء حساب المستخدم برول RESTAURANT وربطه بمعرف المطعم
    const newUser = await db.createUser({
      name: cleanManagerName,
      phone: cleanPhone,
      passwordHash,
      role: 'RESTAURANT',
      restaurantId: newRestaurant.id,
      status: 'ACTIVE',
    });

    // 4. تسجيل النشاط في سجل النظام
    await db.logActivity(
      `إضافة حساب مطعم شريك جديد: ${cleanRestName} (${cleanPhone})`,
      session.userId,
      session.name,
      { restaurantId: newRestaurant.id, userId: newUser.id }
    );

    return NextResponse.json({
      success: true,
      message: `تم إنشاء حساب مطعم "${cleanRestName}" بنجاح وإضافته إلى قائمة المطاعم!`,
      restaurant: newRestaurant,
      user: {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        role: newUser.role,
        restaurantId: newUser.restaurantId,
      },
    });
  } catch (error: unknown) {
    console.error('Error creating restaurant account:', error);
    const message = error instanceof Error ? error.message : 'فشل إنشاء حساب المطعم';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH: إعادة تعيين كلمة مرور أو تحديث بيانات حساب المطعم
export async function PATCH(req: NextRequest) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, restaurantId, newPassword, managerName, phone } = body;

    if (!userId && !restaurantId) {
      return NextResponse.json({ error: 'معرف المستخدم أو المطعم مطلوب' }, { status: 400 });
    }

    // العثور على المستخدم المستهدف
    let targetUser = userId ? await db.getUserById(userId) : null;
    if (!targetUser && restaurantId) {
      const allUsers = await db.getUsers();
      targetUser = allUsers.find((u) => u.restaurantId === restaurantId && u.role === 'RESTAURANT') || null;
    }

    if (!targetUser) {
      return NextResponse.json({ error: 'لم يتم العثور على حساب المدير لهذا المطعم' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    if (newPassword && newPassword.trim()) {
      updates.passwordHash = bcrypt.hashSync(newPassword.trim(), 8);
    }
    if (managerName && managerName.trim()) {
      updates.name = managerName.trim();
    }
    if (phone && phone.trim()) {
      updates.phone = phone.trim();
    }

    await db.updateUser(targetUser.id, updates);

    return NextResponse.json({
      success: true,
      message: 'تم تحديث بيانات دخول المطعم بنجاح',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل تحديث الحساب';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
