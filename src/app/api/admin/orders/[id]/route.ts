import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authorization Guard
    const roleCookie = request.cookies.get("rushd_user_role")?.value;
    const authHeader = request.headers.get("x-user-role");
    const userRole = roleCookie || authHeader;

    if (userRole && userRole === "CUSTOMER") {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, deliveryPartnerId, rejectionReason } = body;

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const isIncomingRejectionOrCancellation =
      status === OrderStatus.REJECTED || status === OrderStatus.CANCELLED || Boolean(rejectionReason);

    // 2. Fetch existing order (fetch items only if stock restoration is required)
    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        notes: true,
        deliveryPartnerId: true,
        ...(isIncomingRejectionOrCancellation ? { items: true } : {}),
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 3. Status Transition Guards
    const currentStatus = existingOrder.status;

    // Terminal states cannot be changed
    if (currentStatus === OrderStatus.DELIVERED) {
      return NextResponse.json(
        { error: "Order has already been delivered." },
        { status: 400 }
      );
    }
    if (currentStatus === OrderStatus.REJECTED) {
      return NextResponse.json(
        { error: "Order has already been rejected." },
        { status: 400 }
      );
    }
    if (currentStatus === OrderStatus.CANCELLED) {
      return NextResponse.json(
        { error: "Order has already been cancelled." },
        { status: 400 }
      );
    }

    const targetStatus = status as OrderStatus | undefined;

    // Validate invalid backward transitions
    if (targetStatus) {
      if (currentStatus === OrderStatus.OUT_FOR_DELIVERY && (targetStatus === OrderStatus.PENDING || targetStatus === OrderStatus.ACCEPTED || targetStatus === OrderStatus.PREPARING)) {
        return NextResponse.json(
          { error: "Invalid status transition: Order is already out for delivery." },
          { status: 400 }
        );
      }
      if (currentStatus === OrderStatus.ASSIGNED && targetStatus === OrderStatus.PENDING) {
        return NextResponse.json(
          { error: "Invalid status transition: Order has already been accepted and assigned." },
          { status: 400 }
        );
      }
    }

    // 4. Rejection Reason Validation
    if (targetStatus === OrderStatus.REJECTED && !rejectionReason && !existingOrder.notes) {
      return NextResponse.json(
        { error: "Rejection reason is required." },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (targetStatus) {
      updateData.status = targetStatus;
    }

    if (deliveryPartnerId !== undefined) {
      updateData.deliveryPartnerId = deliveryPartnerId;
      // If assigning a rider and currently ACCEPTED or PREPARING, advance to ASSIGNED (Ready for Pickup)
      if (!targetStatus && (currentStatus === OrderStatus.ACCEPTED || currentStatus === OrderStatus.PREPARING)) {
        updateData.status = OrderStatus.ASSIGNED;
      }
    }

    if (rejectionReason) {
      updateData.notes = `Rejected by Store: ${rejectionReason.trim()}`;
      updateData.status = OrderStatus.REJECTED;
    }

    // 5. Update Execution: Use transaction strictly when stock restoration is required (REJECTED/CANCELLED)
    const isBecomingRejectedOrCancelled =
      updateData.status === OrderStatus.REJECTED || updateData.status === OrderStatus.CANCELLED;

    let updatedOrder;

    if (isBecomingRejectedOrCancelled && "items" in existingOrder && Array.isArray(existingOrder.items)) {
      updatedOrder = await prisma.$transaction(async (tx) => {
        // Restore stock safely for each item in parallel
        await Promise.all(
          existingOrder.items.map(async (item) => {
            const updatedProduct = await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
              select: { id: true, stock: true },
            });

            return tx.inventoryLog.create({
              data: {
                productId: item.productId,
                previousStock: updatedProduct.stock - item.quantity,
                newStock: updatedProduct.stock,
                changeQuantity: item.quantity,
                reason:
                  updateData.status === OrderStatus.REJECTED
                    ? `ORDER_REJECTED:${existingOrder.orderNumber}`
                    : `ORDER_CANCELLED:${existingOrder.orderNumber}`,
              },
            });
          })
        );

        return tx.order.update({
          where: { id: existingOrder.id },
          data: updateData,
          select: {
            id: true,
            orderNumber: true,
            status: true,
            deliveryPartnerId: true,
            notes: true,
            updatedAt: true,
          },
        });
      });
    } else {
      // Normal single-operation status advancement (fast, direct, single SQL query)
      updatedOrder = await prisma.order.update({
        where: { id: existingOrder.id },
        data: updateData,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          deliveryPartnerId: true,
          notes: true,
          updatedAt: true,
        },
      });
    }

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("PATCH /api/admin/orders/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

