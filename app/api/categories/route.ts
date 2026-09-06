import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const categories = await db.getCategories();
    return NextResponse.json({ categories });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل جلب الأقسام';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug, icon, image } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'يرجى إدخال اسم وقسم التصنيف' }, { status: 400 });
    }

    const newCat = await db.createCategory({
      name: name.trim(),
      slug: slug.trim(),
      icon: icon || '🍽️',
      image: image || '/images/sandwich-foul.jpg',
    });

    return NextResponse.json({ success: true, category: newCat });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل إضافة التصنيف';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
