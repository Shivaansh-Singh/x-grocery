import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FeedbackStatus, FeedbackType } from "@prisma/client";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    // Role guard: Only admin can view customer feedback
    const roleCookie = request.cookies.get("rushd_user_role")?.value;
    const authHeader = request.headers.get("x-user-role");
    const userRole = roleCookie || authHeader;

    if (userRole && userRole === "CUSTOMER") {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get("type");
    const statusFilter = searchParams.get("status");
    const searchQuery = searchParams.get("q")?.toLowerCase();

    const whereClause: Record<string, unknown> = {};

    if (typeFilter && typeFilter !== "ALL") {
      whereClause.type = typeFilter as FeedbackType;
    }

    if (statusFilter && statusFilter !== "ALL") {
      whereClause.status = statusFilter as FeedbackStatus;
    }

    const feedbacks = await prisma.customerFeedback.findMany({
      where: whereClause,
      include: {
        customer: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const filtered = searchQuery
      ? feedbacks.filter((f) => {
          const name = (f.customer?.name || f.name || "").toLowerCase();
          const phone = (f.customer?.phone || f.phone || "").toLowerCase();
          const email = (f.customer?.email || f.email || "").toLowerCase();
          const msg = f.message.toLowerCase();
          return (
            name.includes(searchQuery) ||
            phone.includes(searchQuery) ||
            email.includes(searchQuery) ||
            msg.includes(searchQuery)
          );
        })
      : feedbacks;

    // Generate signed URLs for private storage items
    const supabase = createAdminClient();
    const feedbacksWithSignedUrls = await Promise.all(
      filtered.map(async (f) => {
        if (!f.imageUrl) return f;
        // If already full external URL or legacy local path, return as is
        if (f.imageUrl.startsWith("http://") || f.imageUrl.startsWith("https://") || f.imageUrl.startsWith("/uploads/")) {
          return f;
        }
        try {
          const { data } = await supabase.storage
            .from("feedback")
            .createSignedUrl(f.imageUrl, 3600);
          return {
            ...f,
            imageUrl: data?.signedUrl || f.imageUrl,
          };
        } catch {
          return f;
        }
      })
    );

    const counts = {
      total: feedbacks.length,
      newCount: feedbacks.filter((f) => f.status === "NEW").length,
      inProgressCount: feedbacks.filter((f) => f.status === "IN_PROGRESS").length,
      resolvedCount: feedbacks.filter((f) => f.status === "RESOLVED").length,
      complaintsCount: feedbacks.filter((f) => f.type === "COMPLAINT").length,
      feedbackCount: feedbacks.filter((f) => f.type === "FEEDBACK").length,
      productRequestsCount: feedbacks.filter((f) => f.type === "PRODUCT_REQUEST").length,
    };

    return NextResponse.json({
      feedbacks: feedbacksWithSignedUrls,
      counts,
    });
  } catch (error) {
    console.error("GET /api/admin/feedback error:", error);
    return NextResponse.json(
      { error: "Failed to load customer feedback" },
      { status: 500 }
    );
  }
}
