import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

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

    return NextResponse.json({ riders });
  } catch (error) {
    console.error("GET /api/admin/delivery-staff error:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery staff" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required fields (name, email, phone)" },
        { status: 400 }
      );
    }

    const newRider = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        role: Role.DELIVERY_PARTNER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ rider: newRider }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/delivery-staff error:", error);
    return NextResponse.json(
      { error: "Failed to onboard delivery staff partner" },
      { status: 500 }
    );
  }
}
