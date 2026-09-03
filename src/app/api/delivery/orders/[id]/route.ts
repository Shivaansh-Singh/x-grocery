import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { verifyDeliveryOtp } from "@/lib/otp";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus, otp } = body;

    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (status) {
      // 1. Guard against invalid states or already delivered orders
      if (status === OrderStatus.DELIVERED) {
        if (existingOrder.status === OrderStatus.DELIVERED) {
          return NextResponse.json(
            { error: "This order has already been delivered." },
            { status: 400 }
          );
        }

        if (
          existingOrder.status === OrderStatus.CANCELLED ||
          existingOrder.status === OrderStatus.REJECTED
        ) {
          return NextResponse.json(
            { error: "This order cannot be completed at this stage." },
            { status: 400 }
          );
        }

        // 2. Validate OTP format
        if (!otp || typeof otp !== "string" || !/^\d{6}$/.test(otp.trim())) {
          return NextResponse.json(
            { error: "Please enter the 6-digit delivery OTP." },
            { status: 400 }
          );
        }

        // 3. Verify OTP against stored hash or stored OTP
        const isOtpValid = verifyDeliveryOtp(
          otp.trim(),
          existingOrder.deliveryOtpHash,
          existingOrder.deliveryOtp
        );

        if (!isOtpValid) {
          return NextResponse.json(
            { error: "Incorrect OTP. Please ask the customer for the correct delivery OTP." },
            { status: 400 }
          );
        }

        updateData.status = OrderStatus.DELIVERED;
        updateData.paymentStatus = PaymentStatus.COMPLETED;
        updateData.deliveryOtpVerified = true;
        updateData.deliveryOtpVerifiedAt = new Date();
      } else {
        updateData.status = status as OrderStatus;
      }
    }

    if (paymentStatus && status !== OrderStatus.DELIVERED) {
      updateData.paymentStatus = paymentStatus as PaymentStatus;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: existingOrder.id },
      data: updateData,
      include: {
        items: true,
        deliveryPartner: true,
      },
    });

    // Sanitize output
    const { deliveryOtp, deliveryOtpHash, ...safeOrder } = updatedOrder as typeof updatedOrder & {
      deliveryOtp?: string;
      deliveryOtpHash?: string;
    };

    return NextResponse.json({ order: safeOrder, success: true });
  } catch (error) {
    console.error("PATCH /api/delivery/orders/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update delivery task status" },
      { status: 500 }
    );
  }
}
