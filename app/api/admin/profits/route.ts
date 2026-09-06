import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserFromCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const stats = await db.getProfitStats();
    return NextResponse.json({ stats });
  } catch (err) {
    console.error("Error fetching profit stats:", err);
    return NextResponse.json({ error: "حدث خطأ في جلب بيانات الأرباح" }, { status: 500 });
  }
}
