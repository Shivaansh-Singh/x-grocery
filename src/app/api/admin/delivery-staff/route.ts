import { NextRequest, NextResponse } from "next/server";
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

export async function POST(request: NextRequest) {
  try {
    // 1. Authorization Guard: STORE_ADMIN only
    const roleCookie = request.cookies.get("rushd_user_role")?.value;
    const authHeader = request.headers.get("x-user-role");
    const userRole = roleCookie || authHeader;

    if (userRole !== "STORE_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required to onboard delivery staff." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, phone } = body;

    // 2. Validate Name
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Rider name is required." },
        { status: 400 }
      );
    }
    const cleanName = name.trim();

    // 3. Validate Email
    if (!email || typeof email !== "string" || email.trim() === "") {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 }
      );
    }
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // 4. Validate Phone
    const cleanPhone = typeof phone === "string" ? phone.trim() : "";
    if (cleanPhone && cleanPhone.replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { error: "Please provide a valid 10-digit phone number." },
        { status: 400 }
      );
    }

    // 5. Check for Duplicate Email
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, email: true, role: true, name: true },
    });

    if (existingUser) {
      if (existingUser.role === Role.DELIVERY_PARTNER) {
        return NextResponse.json(
          { error: `A delivery partner with email "${cleanEmail}" already exists.` },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: `A user with email "${cleanEmail}" already exists with role ${existingUser.role}.` },
        { status: 409 }
      );
    }

    // 6. Create Delivery Partner User in Database
    const newRider = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone || null,
        role: Role.DELIVERY_PARTNER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        rider: newRider,
        message: `Delivery partner "${newRider.name}" successfully onboarded.`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/delivery-staff error:", error);
    return NextResponse.json(
      { error: "Failed to onboard delivery staff partner. Please try again." },
      { status: 500 }
    );
  }
}
