import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateIndianMobileNumber } from "@/lib/validation";
import { resolveVerifiedUser } from "@/lib/auth-verifier";

export async function GET(request: NextRequest) {
  try {
    const verifiedUser = await resolveVerifiedUser(request);
    if (!verifiedUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId");
    const queryEmail = searchParams.get("email");

    // Cross-user IDOR guard: If another user's ID or email is requested, block it
    if (queryUserId && queryUserId !== verifiedUser.id) {
      return NextResponse.json(
        { error: "Forbidden: You cannot access another user's profile" },
        { status: 403 }
      );
    }
    if (
      queryEmail &&
      queryEmail.toLowerCase().trim() !== verifiedUser.email.toLowerCase().trim()
    ) {
      return NextResponse.json(
        { error: "Forbidden: You cannot access another user's profile" },
        { status: 403 }
      );
    }

    // Always fetch profile of the cryptographically verified user
    const cleanEmail = verifiedUser.email.toLowerCase().trim();
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ id: verifiedUser.id }, { email: cleanEmail }],
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

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: verifiedUser.id,
          email: cleanEmail,
          name: verifiedUser.name || "RushD Customer",
          role: verifiedUser.role,
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
    const verifiedUser = await resolveVerifiedUser(request);
    if (!verifiedUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId: bodyUserId, email: bodyEmail, name, phone } = body;

    // Cross-user BOLA/IDOR guard: Cannot target another user's profile
    if (bodyUserId && bodyUserId !== verifiedUser.id) {
      return NextResponse.json(
        { error: "Forbidden: You cannot modify another user's profile" },
        { status: 403 }
      );
    }
    if (
      bodyEmail &&
      bodyEmail.toLowerCase().trim() !== verifiedUser.email.toLowerCase().trim()
    ) {
      return NextResponse.json(
        { error: "Forbidden: You cannot modify another user's profile" },
        { status: 403 }
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

    const cleanEmail = verifiedUser.email.toLowerCase().trim();
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: verifiedUser.id }, { email: cleanEmail }],
      },
    });

    if (!existingUser) {
      const cleanPhone = phone !== undefined && phone !== null && phone !== "" ? String(phone).trim() : null;
      const newUser = await prisma.user.create({
        data: {
          id: verifiedUser.id,
          email: cleanEmail,
          name: name !== undefined ? String(name).trim() : verifiedUser.name || "RushD Customer",
          phone: cleanPhone,
          role: verifiedUser.role,
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

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = String(name).trim();
    if (phone !== undefined) {
      updateData.phone = phone && String(phone).trim() ? String(phone).trim() : null;
    }

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
