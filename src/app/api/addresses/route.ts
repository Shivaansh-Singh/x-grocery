import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ addresses: [] }, { status: 200 });
    }

    const addresses = await prisma.customerAddress.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("GET /api/addresses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, buildingColony, flatRoomNo, landmark, phone, isDefault } = body;

    if (!buildingColony || !flatRoomNo || !phone) {
      return NextResponse.json(
        { error: "Missing required address fields (buildingColony, flatRoomNo, phone)" },
        { status: 400 }
      );
    }

    // Default guest userId if not provided
    const targetUserId = userId || "guest-user-session";

    // Ensure user exists or create guest user entry
    const user = await prisma.user.upsert({
      where: { id: targetUserId },
      update: {},
      create: {
        id: targetUserId,
        email: `student-${Date.now()}@vitbhopal.ac.in`,
        name: "Day Scholar Student",
        phone,
      },
    });

    const newAddress = await prisma.customerAddress.create({
      data: {
        userId: user.id,
        buildingColony: buildingColony.trim(),
        flatRoomNo: flatRoomNo.trim(),
        landmark: landmark ? landmark.trim() : null,
        phone: phone.trim(),
        isDefault: isDefault ?? true,
      },
    });

    return NextResponse.json({ address: newAddress }, { status: 201 });
  } catch (error) {
    console.error("POST /api/addresses error:", error);
    return NextResponse.json(
      { error: "Failed to save delivery address" },
      { status: 500 }
    );
  }
}
