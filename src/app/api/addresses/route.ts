import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateIndianMobileNumber, validateIndianPincode } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ addresses: [] }, { status: 200 });
    }

    const addresses = await prisma.customerAddress.findMany({
      where: { userId },
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
    const body = await request.json();
    const {
      userId,
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

    const targetUserId = userId || "guest-user-session";

    // Ensure user entry exists
    const user = await prisma.user.upsert({
      where: { id: targetUserId },
      update: {},
      create: {
        id: targetUserId,
        email: `student-${Date.now()}@vitbhopal.ac.in`,
        name: "Day Scholar Student",
        phone: cleanPhone,
      },
    });

    // Check existing addresses for user
    const existingCount = await prisma.customerAddress.count({
      where: { userId: user.id },
    });

    // First address automatically becomes default
    const shouldBeDefault = Boolean(isDefault || existingCount === 0);

    // Transaction: If setting as default, unset previous default addresses
    const newAddress = await prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.customerAddress.updateMany({
          where: { userId: user.id },
          data: { isDefault: false },
        });
      }

      return tx.customerAddress.create({
        data: {
          userId: user.id,
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
