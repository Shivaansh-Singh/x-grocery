import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const riderId = searchParams.get("riderId");

    const whereCondition: Record<string, unknown> = {};

    if (riderId) {
      whereCondition.OR = [
        { deliveryPartnerId: riderId },
        { status: "ASSIGNED" },
        { status: "OUT_FOR_DELIVERY" },
      ];
    } else {
      whereCondition.OR = [
        { status: "ASSIGNED" },
        { status: "OUT_FOR_DELIVERY" },
      ];
    }

    const orders = await prisma.order.findMany({
      where: whereCondition,
      include: {
        items: true,
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        deliveryPartner: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("GET /api/delivery/orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rider delivery tasks" },
      { status: 500 }
    );
  }
}
