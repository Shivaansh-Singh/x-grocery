import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 }
      );
    }

    // 1. Validate File Size (Max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Photo must be smaller than 5 MB." },
        { status: 400 }
      );
    }

    // 2. Validate MIME Type
    const validMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const fileType = file.type.toLowerCase();
    if (!validMimes.includes(fileType)) {
      return NextResponse.json(
        { error: "Please upload a JPG, PNG, or WEBP image." },
        { status: 400 }
      );
    }

    // 3. Determine extension
    let ext = "jpg";
    if (fileType.includes("png")) ext = "png";
    else if (fileType.includes("webp")) ext = "webp";
    else if (fileType.includes("jpeg") || fileType.includes("jpg")) ext = "jpg";

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeTimestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const fileName = `feedback-${safeTimestamp}-${randomSuffix}.${ext}`;

    // 4. Upload to private Supabase Storage 'feedback' bucket
    const supabase = createAdminClient();
    const { error: uploadError } = await supabase.storage
      .from("feedback")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase Storage feedback upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image to storage. Please try again." },
        { status: 500 }
      );
    }

    // Storing unguessable fileName identifier in DB
    return NextResponse.json({
      success: true,
      url: fileName,
      fileName,
    });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image. Please try again." },
      { status: 500 }
    );
  }
}
