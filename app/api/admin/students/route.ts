import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserFromCookie } from "@/lib/auth";

// GET - list pending students
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "pending";

    let students;
    if (filter === "pending") {
      students = await db.getPendingStudents();
    } else {
      // All students
      const allUsers = await db.getUsers();
      students = allUsers.filter((u) => u.role === "STUDENT");
    }

    return NextResponse.json({ students });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

// POST - approve or reject student
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { userId, action } = await req.json();

    if (!userId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
    }

    if (action === "approve") {
      await db.approveStudent(userId);
      return NextResponse.json({ success: true, message: "تم قبول حساب الطالب بنجاح" });
    } else {
      await db.rejectStudent(userId);
      return NextResponse.json({ success: true, message: "تم رفض حساب الطالب" });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
