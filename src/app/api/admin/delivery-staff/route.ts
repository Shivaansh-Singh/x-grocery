import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export function normalizeRiderId(rider: { id: string; email?: string | null; name?: string | null }): string {
  if (rider.email === "delivery1@x-grocery.com" || rider.name?.includes("Rider 1") || rider.name?.includes("Ramesh")) {
    return "rider-1";
  }
  if (rider.email === "delivery2@x-grocery.com" || rider.name?.includes("Rider 2") || rider.name?.includes("Suresh")) {
    return "rider-2";
  }
  if (rider.email === "delivery3@x-grocery.com" || rider.name?.includes("Rider 3") || rider.name?.includes("Vikas")) {
    return "rider-3";
  }
  return rider.id;
}

export async function GET() {
  try {
    const riders = await prisma.user.findMany({
      where: { role: Role.DELIVERY_PARTNER },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
      orderBy: { name: "asc" },
    });

    const normalizedRiders = riders.map((r) => ({
      ...r,
      id: normalizeRiderId(r),
    }));

    // Deduplicate by ID
    const uniqueRiders = normalizedRiders.filter(
      (rider, index, self) => index === self.findIndex((x) => x.id === rider.id)
    );

    return NextResponse.json({ riders: uniqueRiders });
  } catch (error) {
    console.error("GET /api/admin/delivery-staff error:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery staff" },
      { status: 500 }
    );
  }
}
