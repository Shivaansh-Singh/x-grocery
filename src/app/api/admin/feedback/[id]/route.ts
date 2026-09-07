import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FeedbackStatus, Role } from "@prisma/client";
import { resolveVerifiedUser } from "@/lib/auth-verifier";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Role guard: STORE_ADMIN only
    const user = await resolveVerifiedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required. Admin privileges required." },
        { status: 401 }
      );
    }
    if (user.role !== Role.STORE_ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, adminNotes } = body;

    const existingFeedback = await prisma.customerFeedback.findUnique({
      where: { id },
    });

    if (!existingFeedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (status) {
      const validStatuses = ["NEW", "IN_PROGRESS", "RESOLVED"] as const;
      type ValidFeedbackStatus = typeof validStatuses[number];
      if (validStatuses.includes(status as ValidFeedbackStatus)) {
        updateData.status = status as ValidFeedbackStatus;
      }
    }

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes ? String(adminNotes).trim() : null;
    }

    const updated = await prisma.customerFeedback.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      feedback: updated,
    });
  } catch (error) {
    console.error("PATCH /api/admin/feedback/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update feedback status" },
      { status: 500 }
    );
  }
}
