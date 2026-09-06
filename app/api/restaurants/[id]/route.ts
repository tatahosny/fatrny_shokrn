import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserFromCookie } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const restaurant = await db.getRestaurantById(id);
    if (!restaurant) {
      return NextResponse.json({ error: 'المطعم غير موجود' }, { status: 404 });
    }
    const studentDiscount = await db.getActiveStudentDiscount(restaurant.id);
    return NextResponse.json({ restaurant, studentDiscount });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ في جلب بيانات المطعم';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك بالتعديل' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const updated = await db.updateRestaurant(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'المطعم غير موجود' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث بيانات المطعم بنجاح',
      restaurant: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل تعديل المطعم';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك بالحذف' }, { status: 403 });
    }

    const { id } = await params;
    const success = await db.deleteRestaurant(id);
    if (!success) {
      return NextResponse.json({ error: 'تعذر حذف المطعم أو أنه غير موجود' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف المطعم بنجاح',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل حذف المطعم';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
