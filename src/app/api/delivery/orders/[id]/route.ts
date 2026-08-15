import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus } = body;

    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status as OrderStatus;
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus as PaymentStatus;
    }

    // Auto mark payment completed if order status is marked DELIVERED
    if (status === OrderStatus.DELIVERED) {
      updateData.paymentStatus = PaymentStatus.COMPLETED;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        deliveryPartner: true,
      },
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("PATCH /api/delivery/orders/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update delivery task status" },
      { status: 500 }
    );
  }
}
