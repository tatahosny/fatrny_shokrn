import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getCurrentUserFromCookie } from '@/lib/auth';

// PATCH /api/admin/users/[id] - تعديل بيانات مستخدم
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح — يجب أن تكون مشرفاً' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { phone, password, name, role } = body;

    const users = await db.getUsers();
    const user = users.find((u) => u.id === id);
    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    // بناء التحديثات
    const updates: Record<string, unknown> = {};

    if (name && name.trim()) {
      updates.name = name.trim();
    }

    if (phone && phone.trim()) {
      // التحقق من أن الرقم غير مستخدم من مستخدم آخر
      const existingUser = users.find((u) => u.phone === phone.trim() && u.id !== id);
      if (existingUser) {
        return NextResponse.json({ error: 'رقم الهاتف مستخدم بالفعل من قِبل مستخدم آخر' }, { status: 409 });
      }
      updates.phone = phone.trim();
    }

    if (password && password.trim().length >= 4) {
      updates.passwordHash = await bcrypt.hash(password.trim(), 8);
    }

    if (role && (role === 'ADMIN' || role === 'USER')) {
      updates.role = role;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'لا توجد بيانات للتحديث' }, { status: 400 });
    }

    await db.updateUser(id, updates);

    await db.logActivity(
      `تعديل بيانات المستخدم: ${user.name} — بواسطة المشرف: ${session.name}`,
      session.userId,
      session.name,
      { targetUserId: id, updatedFields: Object.keys(updates) }
    );

    return NextResponse.json({ success: true, message: 'تم تحديث البيانات بنجاح' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'حدث خطأ أثناء التحديث';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - حذف مستخدم
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح — يجب أن تكون مشرفاً' }, { status: 403 });
    }

    const { id } = await params;

    // لا يمكن حذف نفسك
    if (session.userId === id) {
      return NextResponse.json({ error: 'لا يمكنك حذف حسابك الخاص' }, { status: 400 });
    }

    const users = await db.getUsers();
    const user = users.find((u) => u.id === id);
    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    await db.deleteUser(id);

    await db.logActivity(
      `حذف المستخدم: ${user.name} (${user.phone}) — بواسطة المشرف: ${session.name}`,
      session.userId,
      session.name,
      { deletedUserId: id }
    );

    return NextResponse.json({ success: true, message: `تم حذف المستخدم ${user.name} بنجاح` });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'حدث خطأ أثناء الحذف';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
