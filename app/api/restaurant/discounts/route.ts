import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserFromCookie } from "@/lib/auth";

// GET - get student discount for restaurant
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paramRestaurantId = searchParams.get("restaurantId");

    let restaurantId = paramRestaurantId;

    if (!restaurantId) {
      const session = await getCurrentUserFromCookie();
      if (session?.restaurantId) {
        restaurantId = session.restaurantId;
      }
    }

    if (!restaurantId) {
      return NextResponse.json({ error: "معرف المطعم مطلوب" }, { status: 400 });
    }

    const discount = await db.getActiveStudentDiscount(restaurantId);
    return NextResponse.json({ discount });
  } catch (err) {
    console.error("Error fetching student discount:", err);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

// POST - save/update student discount
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session || !["ADMIN", "RESTAURANT"].includes(session.role)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json();
    const { discountPercent, active } = body;

    const restaurantId = session.role === "ADMIN" ? body.restaurantId : session.restaurantId;
    if (!restaurantId) {
      return NextResponse.json({ error: "معرف المطعم مطلوب" }, { status: 400 });
    }

    const percent = Math.min(100, Math.max(1, parseInt(discountPercent) || 10));
    const isActive = active !== false;

    const discount = await db.upsertStudentDiscount(restaurantId, percent, isActive);

    return NextResponse.json({
      success: true,
      message: `تم تحديث خصم الطلاب (${percent}%) بنجاح`,
      discount,
    });
  } catch (err) {
    console.error("Error saving student discount:", err);
    return NextResponse.json({ error: "حدث خطأ أثناء حفظ الخصم" }, { status: 500 });
  }
}
