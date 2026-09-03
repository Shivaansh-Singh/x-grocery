import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FeedbackStatus } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Role guard: Only admin can update feedback status
    const roleCookie = request.cookies.get("rushd_user_role")?.value;
    const authHeader = request.headers.get("x-user-role");
    const userRole = roleCookie || authHeader;

    if (userRole && userRole === "CUSTOMER") {
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
