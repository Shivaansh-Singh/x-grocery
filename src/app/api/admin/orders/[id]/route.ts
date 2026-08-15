import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, deliveryPartnerId, rejectionReason } = body;

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status as OrderStatus;
    }

    if (deliveryPartnerId !== undefined) {
      updateData.deliveryPartnerId = deliveryPartnerId;
      if (!status && existingOrder.status === OrderStatus.PREPARING) {
        updateData.status = OrderStatus.ASSIGNED;
      }
    }

    if (rejectionReason) {
      updateData.notes = `Rejected by Store: ${rejectionReason}`;
      updateData.status = OrderStatus.REJECTED;
    }

    // Automated Stock Decrement on Order Acceptance (if moving from PENDING -> ACCEPTED)
    if (status === OrderStatus.ACCEPTED && existingOrder.status === OrderStatus.PENDING) {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Update Order status
        const updatedOrder = await tx.order.update({
          where: { id },
          data: updateData,
          include: {
            items: true,
            deliveryPartner: true,
          },
        });

        // 2. Decrement product stock & log InventoryLog for each item
        for (const item of existingOrder.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (product) {
            const previousStock = product.stock;
            const newStock = Math.max(0, previousStock - item.quantity);

            await tx.product.update({
              where: { id: product.id },
              data: {
                stock: newStock,
                isActive: newStock > 0,
              },
            });

            await tx.inventoryLog.create({
              data: {
                productId: product.id,
                previousStock,
                newStock,
                changeQuantity: -item.quantity,
                reason: "ORDER_FULFILLED",
              },
            });
          }
        }

        return updatedOrder;
      });

      return NextResponse.json({ order: result });
    }

    // Regular status/rider update
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
    console.error("PATCH /api/admin/orders/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
