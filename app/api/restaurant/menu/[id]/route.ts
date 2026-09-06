import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserFromCookie } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session || !["ADMIN", "RESTAURANT"].includes(session.role)) {
      return NextResponse.json({ error: "غير مصرح لك بتعديل الأصناف" }, { status: 403 });
    }

    const { id } = await props.params;
    const existing = await db.getFoodItemById(id);
    if (!existing) {
      return NextResponse.json({ error: "الصنف غير موجود" }, { status: 404 });
    }

    // If restaurant role, can only edit their own items
    if (session.role === "RESTAURANT" && existing.restaurantId !== session.restaurantId) {
      return NextResponse.json({ error: "غير مصرح لك بتعديل أصناف مطعم آخر" }, { status: 403 });
    }

    const body = await req.json();
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) updates.name = String(body.name).trim();
    if (body.description !== undefined) updates.description = String(body.description).trim();
    if (body.price !== undefined) updates.price = parseFloat(body.price) || 0;
    if (body.image !== undefined) updates.image = String(body.image).trim();
    if (body.categoryId !== undefined) updates.categoryId = String(body.categoryId);
    if (body.categoryName !== undefined) updates.categoryName = String(body.categoryName);
    if (body.available !== undefined) updates.available = Boolean(body.available);

    const updatedItem = await db.updateFoodItem(id, updates);
    return NextResponse.json({ success: true, item: updatedItem });
  } catch (err) {
    console.error("Error updating food item:", err);
    return NextResponse.json({ error: "حدث خطأ أثناء تعديل الصنف" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session || !["ADMIN", "RESTAURANT"].includes(session.role)) {
      return NextResponse.json({ error: "غير مصرح لك بحذف الأصناف" }, { status: 403 });
    }

    const { id } = await props.params;
    const existing = await db.getFoodItemById(id);
    if (!existing) {
      return NextResponse.json({ error: "الصنف غير موجود" }, { status: 404 });
    }

    // If restaurant role, can only delete their own items
    if (session.role === "RESTAURANT" && existing.restaurantId !== session.restaurantId) {
      return NextResponse.json({ error: "غير مصرح لك بحذف أصناف مطعم آخر" }, { status: 403 });
    }

    const deleted = await db.deleteFoodItem(id);
    return NextResponse.json({ success: deleted });
  } catch (err) {
    console.error("Error deleting food item:", err);
    return NextResponse.json({ error: "حدث خطأ أثناء حذف الصنف" }, { status: 500 });
  }
}
