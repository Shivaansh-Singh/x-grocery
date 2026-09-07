import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateIndianMobileNumber, validateIndianPincode } from "@/lib/validation";
import { resolveVerifiedUser } from "@/lib/auth-verifier";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const verifiedUser = await resolveVerifiedUser(request);
    if (!verifiedUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
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

    // Cross-user IDOR guard: Cannot specify another user's ID
    if (bodyUserId && bodyUserId !== verifiedUser.id) {
      return NextResponse.json(
        { error: "Forbidden: You cannot modify another user's address" },
        { status: 403 }
      );
    }

    const existingAddress = await prisma.customerAddress.findUnique({
      where: { id },
    });

    if (!existingAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    // Server-derived ownership verification: MUST match the authenticated user's ID
    if (existingAddress.userId !== verifiedUser.id) {
      return NextResponse.json(
        { error: "Forbidden: You do not own this address" },
        { status: 403 }
      );
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
          where: { userId: verifiedUser.id },
          data: { isDefault: false },
        });
      }

      return tx.customerAddress.update({
        where: { id },
        data: {
          label: label !== undefined ? String(label).trim() : existingAddress.label,
          buildingColony:
            buildingColony !== undefined
              ? String(buildingColony).trim()
              : existingAddress.buildingColony,
          flatRoomNo:
            flatRoomNo !== undefined
              ? String(flatRoomNo).trim()
              : existingAddress.flatRoomNo,
          landmark:
            landmark !== undefined
              ? landmark
                ? String(landmark).trim()
                : null
              : existingAddress.landmark,
          city: city !== undefined ? String(city).trim() : existingAddress.city,
          state:
            state !== undefined ? String(state).trim() : existingAddress.state,
          pincode: cleanPincode,
          phone: cleanPhone,
          isDefault:
            isDefault !== undefined
              ? Boolean(isDefault)
              : existingAddress.isDefault,
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
    const verifiedUser = await resolveVerifiedUser(request);
    if (!verifiedUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId");

    // Cross-user IDOR guard: Cannot specify another user's ID
    if (queryUserId && queryUserId !== verifiedUser.id) {
      return NextResponse.json(
        { error: "Forbidden: You cannot delete another user's address" },
        { status: 403 }
      );
    }

    const existingAddress = await prisma.customerAddress.findUnique({
      where: { id },
    });

    if (!existingAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    // Server-derived ownership verification: MUST match the authenticated user's ID
    if (existingAddress.userId !== verifiedUser.id) {
      return NextResponse.json(
        { error: "Forbidden: You do not own this address" },
        { status: 403 }
      );
    }

    const wasDefault = existingAddress.isDefault;

    await prisma.customerAddress.delete({
      where: { id },
    });

    // If deleted address was default, designate next remaining address as default
    if (wasDefault) {
      const nextRemaining = await prisma.customerAddress.findFirst({
        where: { userId: verifiedUser.id },
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
