import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateIndianMobileNumber, validateIndianPincode } from "@/lib/validation";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const existingAddress = await prisma.customerAddress.findUnique({
      where: { id },
    });

    if (!existingAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    // Ownership check
    if (userId && existingAddress.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized access to address" }, { status: 403 });
    }

    // Validate phone if provided
    let cleanPhone = existingAddress.phone;
    if (phone !== undefined && phone !== null && phone !== "") {
      cleanPhone = String(phone).trim();
      if (!validateIndianMobileNumber(cleanPhone)) {
        return NextResponse.json(
          { error: "Enter a valid 10-digit mobile number." },
          { status: 400 }
        );
      }
    }

    // Validate pincode if provided
    let cleanPincode = existingAddress.pincode;
    if (pincode !== undefined && pincode !== null && pincode !== "") {
      cleanPincode = String(pincode).trim();
      if (!validateIndianPincode(cleanPincode)) {
        return NextResponse.json(
          { error: "Enter a valid 6-digit Indian pincode." },
          { status: 400 }
        );
      }
    }

    const updatedAddress = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.customerAddress.updateMany({
          where: { userId: existingAddress.userId },
          data: { isDefault: false },
        });
      }

      return tx.customerAddress.update({
        where: { id },
        data: {
          label: label !== undefined ? String(label).trim() : existingAddress.label,
          buildingColony: buildingColony !== undefined ? String(buildingColony).trim() : existingAddress.buildingColony,
          flatRoomNo: flatRoomNo !== undefined ? String(flatRoomNo).trim() : existingAddress.flatRoomNo,
          landmark: landmark !== undefined ? (landmark ? String(landmark).trim() : null) : existingAddress.landmark,
          city: city !== undefined ? String(city).trim() : existingAddress.city,
          state: state !== undefined ? String(state).trim() : existingAddress.state,
          pincode: cleanPincode,
          phone: cleanPhone,
          isDefault: isDefault !== undefined ? Boolean(isDefault) : existingAddress.isDefault,
        },
      });
    });

    return NextResponse.json({ address: updatedAddress });
  } catch (error) {
    console.error("PATCH /api/addresses/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update address" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const existingAddress = await prisma.customerAddress.findUnique({
      where: { id },
    });

    if (!existingAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    // Ownership check
    if (userId && existingAddress.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized address deletion" }, { status: 403 });
    }

    const wasDefault = existingAddress.isDefault;
    const targetUserId = existingAddress.userId;

    await prisma.customerAddress.delete({
      where: { id },
    });

    // If deleted address was default, designate next remaining address as default
    if (wasDefault) {
      const nextRemaining = await prisma.customerAddress.findFirst({
        where: { userId: targetUserId },
        orderBy: { createdAt: "desc" },
      });

      if (nextRemaining) {
        await prisma.customerAddress.update({
          where: { id: nextRemaining.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("DELETE /api/addresses/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 }
    );
  }
}
