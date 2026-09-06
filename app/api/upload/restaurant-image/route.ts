import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getCurrentUserFromCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك برفع صور المطاعم" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "لم يتم رفع أي ملف" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "يرجى رفع صورة بصيغة JPG أو PNG أو WEBP فقط" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "حجم الصورة يجب أن يكون أقل من 10 ميجابايت" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `restaurant-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

    const uploadDir = join(process.cwd(), "public", "uploads", "restaurants");
    await mkdir(uploadDir, { recursive: true });
    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/restaurants/${filename}`;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err) {
    console.error("Restaurant image upload error:", err);
    return NextResponse.json({ error: "حدث خطأ أثناء رفع صورة المطعم" }, { status: 500 });
  }
}
