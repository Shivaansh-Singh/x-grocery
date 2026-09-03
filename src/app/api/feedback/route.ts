import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FeedbackType } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, name, phone, email, type, message, imageUrl } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Please enter your message/feedback." },
        { status: 400 }
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

    if (customerId) {
      const user = await prisma.user.findUnique({
        where: { id: customerId },
        select: { id: true, name: true, phone: true, email: true },
      });

      if (user) {
        finalCustomerId = user.id;
        if (!customerName && user.name) customerName = user.name;
        if (!customerPhone && user.phone) customerPhone = user.phone;
        if (!customerEmail && user.email) customerEmail = user.email;
      }
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
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/feedback error:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback. Please try again." },
      { status: 500 }
    );
  }
}
