import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, categoryId, description, price, image, available } = body;

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: 'يرجى إدخال اسم الصنف والقسم' },
        { status: 400 }
      );
    }

    const newItem = await db.createFoodItem({
      name: name.trim(),
      categoryId,
      description: description || '',
      price: Number(price) || 0,
      image: image || 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80',
      available: available !== undefined ? available : true,
    });

    return NextResponse.json({
      success: true,
      message: 'تم إضافة الصنف بنجاح',
      food: newItem,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل إضافة الصنف';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
