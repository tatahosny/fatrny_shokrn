import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserFromCookie } from "@/lib/auth";

// GET - get restaurant menu items
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const restaurantId = session.role === "ADMIN"
      ? (new URL(req.url).searchParams.get("restaurantId") || undefined)
      : session.restaurantId;

    if (!restaurantId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "لا يوجد مطعم مرتبط بهذا الحساب" }, { status: 403 });
    }

    const items = await db.getFoodItems({ restaurantId });
    return NextResponse.json({ items });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

// POST - create new food item
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session || !["ADMIN", "RESTAURANT"].includes(session.role)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, price, image, categoryId, categoryName, available } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: "يرجى ملء جميع الحقول المطلوبة" }, { status: 400 });
    }

    const restaurantId = session.role === "ADMIN" ? body.restaurantId : session.restaurantId;
    if (!restaurantId) return NextResponse.json({ error: "معرف المطعم مطلوب" }, { status: 400 });

    const restaurant = await db.getRestaurantById(restaurantId);
    const restaurantName = restaurant?.name || "";

    const newItem = await db.createFoodItem({
      name,
      description: description || "",
      price: parseFloat(price),
      image: image || "",
      categoryId,
      categoryName: categoryName || "",
      restaurantId,
      restaurantName,
      available: available !== false,
    });

    return NextResponse.json({ success: true, item: newItem });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "حدث خطأ أثناء إضافة الصنف" }, { status: 500 });
  }
}
