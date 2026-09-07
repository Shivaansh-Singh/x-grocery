import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FeedbackType } from "@prisma/client";
import { resolveVerifiedUser } from "@/lib/auth-verifier";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, name, phone, email, type, message, imageUrl } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Please enter your message/feedback." },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const validTypes = ["COMPLAINT", "FEEDBACK", "PRODUCT_REQUEST"] as const;
    type ValidFeedbackType = typeof validTypes[number];

    const rawType = type ? String(type).toUpperCase() : "FEEDBACK";
    const finalType: ValidFeedbackType = validTypes.includes(rawType as ValidFeedbackType)
      ? (rawType as ValidFeedbackType)
      : "FEEDBACK";

    let finalCustomerId: string | null = null;
    let customerName = name ? String(name).trim() : null;
    let customerPhone = phone ? String(phone).trim() : null;
    let customerEmail = email ? String(email).trim() : null;

    // 1. Authoritative Identity Resolution
    const verifiedUser = await resolveVerifiedUser(request);

    if (verifiedUser) {
      // Authenticated caller: prevent cross-user spoofing if customerId was supplied
      if (customerId && typeof customerId === "string" && customerId.trim() !== verifiedUser.id) {
        return NextResponse.json(
          { error: "Forbidden: Cannot submit feedback under another customer ID" },
          { status: 403, headers: NO_CACHE_HEADERS }
        );
      }
      finalCustomerId = verifiedUser.id;
      if (!customerName && verifiedUser.name) customerName = verifiedUser.name;
      if (!customerEmail && verifiedUser.email) customerEmail = verifiedUser.email;
    } else {
      // Unauthenticated caller: reject attempts to link feedback to an account ID
      if (customerId && typeof customerId === "string" && customerId.trim()) {
        return NextResponse.json(
          { error: "Authentication required to associate feedback with an account." },
          { status: 401, headers: NO_CACHE_HEADERS }
        );
      }
      // Genuinely anonymous feedback is preserved
      finalCustomerId = null;
    }

    const feedback = await prisma.customerFeedback.create({
      data: {
        customerId: finalCustomerId,
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        type: finalType,
        message: message.trim(),
        imageUrl: imageUrl && typeof imageUrl === "string" ? imageUrl.trim() : null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you! Your feedback has been submitted.",
        feedback,
      },
      { status: 201, headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error("POST /api/feedback error:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback. Please try again." },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
