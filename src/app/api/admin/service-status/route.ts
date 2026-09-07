import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { resolveVerifiedUser } from "@/lib/auth-verifier";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

export async function GET(request: NextRequest) {
  try {
    const user = await resolveVerifiedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    if (user.role !== Role.STORE_ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized. STORE_ADMIN role required." },
        { status: 403, headers: NO_CACHE_HEADERS }
      );
    }

    const store = await prisma.store.findUnique({
      where: { slug: "store-x" },
      select: { id: true, name: true, isActive: true },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        isActive: store.isActive,
        isPaused: !store.isActive,
        storeName: store.name,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error("GET /api/admin/service-status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch service status" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await resolveVerifiedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    if (user.role !== Role.STORE_ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized. STORE_ADMIN role required." },
        { status: 403, headers: NO_CACHE_HEADERS }
      );
    }

    const body = await request.json();
    let newIsActive: boolean;

    if (typeof body.isPaused === "boolean") {
      newIsActive = !body.isPaused;
    } else if (typeof body.isActive === "boolean") {
      newIsActive = body.isActive;
    } else {
      return NextResponse.json(
        { error: "Invalid payload. Either 'isPaused' or 'isActive' boolean is required." },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const updatedStore = await prisma.store.update({
      where: { slug: "store-x" },
      data: { isActive: newIsActive },
      select: { id: true, name: true, isActive: true, updatedAt: true },
    });

    return NextResponse.json(
      {
        isActive: updatedStore.isActive,
        isPaused: !updatedStore.isActive,
        storeName: updatedStore.name,
        message: updatedStore.isActive
          ? "RushD services resumed. New orders are now active."
          : "RushD services paused. New orders are temporarily disabled.",
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error("PATCH /api/admin/service-status error:", error);
    return NextResponse.json(
      { error: "Failed to update service status" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
