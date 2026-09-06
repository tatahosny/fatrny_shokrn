import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await db.updateFoodItem(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'صنف الطعام غير موجود' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث بيانات الصنف بنجاح',
      food: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل تعديل الصنف';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await db.deleteFoodItem(id);
    if (!deleted) {
      return NextResponse.json({ error: 'صنف الطعام غير موجود' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف الصنف بنجاح',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل حذف الصنف';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
