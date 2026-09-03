import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // 1. Authorization Guard: Admin only
    const roleCookie = request.cookies.get("rushd_user_role")?.value;
    const authHeader = request.headers.get("x-user-role");
    const userRole = roleCookie || authHeader;

    if (userRole !== "STORE_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required to upload product images." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No product image file provided." },
        { status: 400 }
      );
    }

    // 2. Validate File Size (Max 5 MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Product image must be smaller than 5 MB." },
        { status: 400 }
      );
    }

    // 3. Validate MIME Type
    const validMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const fileType = file.type.toLowerCase();
    if (!validMimes.includes(fileType)) {
      return NextResponse.json(
        { error: "Please upload a JPG, PNG, or WEBP image." },
        { status: 400 }
      );
    }

    // 4. Determine file extension
    let ext = "jpg";
    if (fileType.includes("png")) ext = "png";
    else if (fileType.includes("webp")) ext = "webp";
    else if (fileType.includes("jpeg") || fileType.includes("jpg")) ext = "jpg";

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeTimestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const fileName = `product-${safeTimestamp}-${randomSuffix}.${ext}`;

    // 5. Upload directly to Supabase Storage 'products' bucket
    const supabase = createAdminClient();
    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase Storage product upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload product image to storage. Please try again." },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("products").getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
    });
  } catch (error) {
    console.error("POST /api/admin/products/upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload product image. Please try again." },
      { status: 500 }
    );
  }
}
