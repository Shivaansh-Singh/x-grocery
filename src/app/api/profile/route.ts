import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateIndianMobileNumber } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");

    if (!userId && !email) {
      return NextResponse.json({ error: "userId or email query parameter is required" }, { status: 400 });
    }

    const whereCondition = userId ? { id: userId } : { email: email as string };

    const user = await prisma.user.findFirst({
      where: whereCondition,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, name, phone } = body;

    if (!userId && !email) {
      return NextResponse.json(
        { error: "userId or email is required to update profile" },
        { status: 400 }
      );
    }

    // Validate phone number if provided
    if (phone !== undefined && phone !== null && phone !== "") {
      const cleanPhone = String(phone).trim();
      if (!validateIndianMobileNumber(cleanPhone)) {
        return NextResponse.json(
          { error: "Enter a valid 10-digit mobile number." },
          { status: 400 }
        );
      }
    }

    const whereCondition = userId ? { id: userId } : { email: email as string };

    const existingUser = await prisma.user.findFirst({
      where: whereCondition,
    });

    if (!existingUser) {
      if (userId) {
        const newUser = await prisma.user.create({
          data: {
            id: userId,
            email: email || `student-${Date.now()}@vitbhopal.ac.in`,
            name: name !== undefined ? String(name).trim() : "RushD Customer",
            phone: phone !== undefined && phone !== null && phone !== "" ? String(phone).trim() : null,
          },
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        return NextResponse.json({ user: newUser });
      }
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = String(name).trim();
    if (phone !== undefined) updateData.phone = String(phone).trim();

    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("PATCH /api/profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
