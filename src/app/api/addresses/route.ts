import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateIndianMobileNumber, validateIndianPincode } from "@/lib/validation";
import { resolveVerifiedUser } from "@/lib/auth-verifier";

export async function GET(request: NextRequest) {
  try {
    const verifiedUser = await resolveVerifiedUser(request);
    if (!verifiedUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId");

    // Cross-user IDOR guard: If another user's ID is requested, block it
    if (queryUserId && queryUserId !== verifiedUser.id) {
      return NextResponse.json(
        { error: "Forbidden: You cannot access another user's addresses" },
        { status: 403 }
      );
    }

    const addresses = await prisma.customerAddress.findMany({
      where: { userId: verifiedUser.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
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
    const verifiedUser = await resolveVerifiedUser(request);
    if (!verifiedUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      userId: bodyUserId,
      label,
      buildingColony,
      flatRoomNo,
      landmark,
      city,
      state,
      pincode,
      phone,
      isDefault,
    } = body;

    // Cross-user IDOR guard: Cannot create address for another user
    if (bodyUserId && bodyUserId !== verifiedUser.id) {
      return NextResponse.json(
        { error: "Forbidden: You cannot create an address for another user" },
        { status: 403 }
      );
    }

    if (!buildingColony || !flatRoomNo || !phone) {
      return NextResponse.json(
        { error: "Missing required address fields (buildingColony, flatRoomNo, phone)" },
        { status: 400 }
      );
    }

    // Validate phone number
    const cleanPhone = String(phone).trim();
    if (!validateIndianMobileNumber(cleanPhone)) {
      return NextResponse.json(
        { error: "Enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    // Validate pincode if provided
    const cleanPincode = pincode ? String(pincode).trim() : "466114";
    if (pincode && !validateIndianPincode(cleanPincode)) {
      return NextResponse.json(
        { error: "Enter a valid 6-digit Indian pincode." },
        { status: 400 }
      );
    }

    // Target user is strictly the authenticated caller
    const targetUserId = verifiedUser.id;

    // Ensure user entry exists in PostgreSQL for foreign key reference
    await prisma.user.upsert({
      where: { id: targetUserId },
      update: {},
      create: {
        id: targetUserId,
        email: verifiedUser.email.toLowerCase().trim(),
        name: verifiedUser.name || "RushD Customer",
        phone: cleanPhone,
        role: verifiedUser.role,
      },
    });

    // Check existing addresses for user
    const existingCount = await prisma.customerAddress.count({
      where: { userId: targetUserId },
    });

    // First address automatically becomes default
    const shouldBeDefault = Boolean(isDefault || existingCount === 0);

    // Transaction: If setting as default, unset previous default addresses
    const newAddress = await prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.customerAddress.updateMany({
          where: { userId: targetUserId },
          data: { isDefault: false },
        });
      }

      return tx.customerAddress.create({
        data: {
          userId: targetUserId,
          label: label ? String(label).trim() : "Home",
          buildingColony: String(buildingColony).trim(),
          flatRoomNo: String(flatRoomNo).trim(),
          landmark: landmark ? String(landmark).trim() : null,
          city: city ? String(city).trim() : "Bhopal",
          state: state ? String(state).trim() : "Madhya Pradesh",
          pincode: cleanPincode,
          phone: cleanPhone,
          isDefault: shouldBeDefault,
        },
      });
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
