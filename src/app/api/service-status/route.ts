import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

export async function GET() {
  try {
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
        message: store.isActive
          ? "RushD is operational"
          : "RushD is temporarily unavailable. We're currently taking a short break. Please try again later.",
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error("GET /api/service-status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch service status" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
