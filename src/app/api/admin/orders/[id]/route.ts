import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus, Role } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = performance.now();
  let orderLookupTime = 0;
  let dbUpdateTime = 0;

  try {
    // 1. Authorization Guard
    const roleCookie = request.cookies.get("rushd_user_role")?.value;
    const authHeader = request.headers.get("x-user-role");
    const userRole = roleCookie || authHeader;

    if (userRole && userRole === "CUSTOMER") {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403, headers: NO_CACHE_HEADERS }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, deliveryPartnerId, rejectionReason } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const isIncomingRejectionOrCancellation =
      status === OrderStatus.REJECTED || status === OrderStatus.CANCELLED || Boolean(rejectionReason);

    // 2. Fetch existing order (fetch items only if stock restoration is required)
    const lookupStart = performance.now();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const selectFields = {
      id: true,
      orderNumber: true,
      status: true,
      notes: true,
      deliveryPartnerId: true,
      ...(isIncomingRejectionOrCancellation ? { items: true } : {}),
    };

    const existingOrder = isUuid
      ? await prisma.order.findUnique({
          where: { id },
          select: selectFields,
        })
      : await prisma.order.findUnique({
          where: { orderNumber: id },
          select: selectFields,
        });
    orderLookupTime = performance.now() - lookupStart;

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    // 3. Status Transition Guards
    const currentStatus = existingOrder.status;

    // Terminal states cannot be changed
    if (currentStatus === OrderStatus.DELIVERED) {
      return NextResponse.json(
        { error: "Order has already been delivered." },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }
    if (currentStatus === OrderStatus.REJECTED) {
      return NextResponse.json(
        { error: "Order has already been rejected." },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }
    if (currentStatus === OrderStatus.CANCELLED) {
      return NextResponse.json(
        { error: "Order has already been cancelled." },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const targetStatus = status as OrderStatus | undefined;

    // Validate invalid backward transitions
    if (targetStatus) {
      if (
        currentStatus === OrderStatus.OUT_FOR_DELIVERY &&
        (targetStatus === OrderStatus.PENDING ||
          targetStatus === OrderStatus.ACCEPTED ||
          targetStatus === OrderStatus.PREPARING)
      ) {
        return NextResponse.json(
          { error: "Invalid status transition: Order is already out for delivery." },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }
      if (currentStatus === OrderStatus.ASSIGNED && targetStatus === OrderStatus.PENDING) {
        return NextResponse.json(
          { error: "Invalid status transition: Order has already been accepted and assigned." },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }
    }

    // 4. Rejection Reason Validation
    if (targetStatus === OrderStatus.REJECTED && !rejectionReason && !existingOrder.notes) {
      return NextResponse.json(
        { error: "Rejection reason is required." },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (targetStatus) {
      updateData.status = targetStatus;
    }

    // 5. Authoritative Delivery Partner Validation
    if (deliveryPartnerId !== undefined) {
      if (deliveryPartnerId) {
        const riderUser = await prisma.user.findUnique({
          where: { id: deliveryPartnerId },
          select: { id: true, role: true, name: true },
        });

        if (!riderUser || riderUser.role !== Role.DELIVERY_PARTNER) {
          return NextResponse.json(
            { error: "Invalid delivery partner. Selected user is not an active delivery partner." },
            { status: 400, headers: NO_CACHE_HEADERS }
          );
        }
        updateData.deliveryPartnerId = riderUser.id;
      } else {
        updateData.deliveryPartnerId = null;
      }

      // If assigning a rider and currently ACCEPTED or PREPARING, advance to ASSIGNED (Ready for Pickup)
      if (!targetStatus && (currentStatus === OrderStatus.ACCEPTED || currentStatus === OrderStatus.PREPARING)) {
        updateData.status = OrderStatus.ASSIGNED;
      }
    }

    if (rejectionReason) {
      updateData.notes = `Rejected by Store: ${rejectionReason.trim()}`;
      updateData.status = OrderStatus.REJECTED;
    }

    // 6. Update Execution: Use transaction strictly when stock restoration is required (REJECTED/CANCELLED)
    const isBecomingRejectedOrCancelled =
      updateData.status === OrderStatus.REJECTED || updateData.status === OrderStatus.CANCELLED;

    const dbStart = performance.now();
    let updatedOrder;

    if (isBecomingRejectedOrCancelled && "items" in existingOrder && Array.isArray(existingOrder.items)) {
      updatedOrder = await prisma.$transaction(async (tx) => {
        const productIds = existingOrder.items.map((i) => i.productId);
        const products = await tx.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, stock: true },
        });
        const productMap = new Map(products.map((p) => [p.id, p]));

        for (const item of existingOrder.items) {
          const product = productMap.get(item.productId);
          if (!product) {
            throw new Error(`Product not found: "${item.productName}" (${item.productId})`);
          }
        }

        const inventoryLogData: {
          productId: string;
          previousStock: number;
          newStock: number;
          changeQuantity: number;
          reason: string;
        }[] = [];

        for (const item of existingOrder.items) {
          const product = productMap.get(item.productId)!;
          const previousStock = product.stock;
          const newStock = previousStock + item.quantity;
          product.stock = newStock;

          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });

          inventoryLogData.push({
            productId: item.productId,
            previousStock,
            newStock,
            changeQuantity: item.quantity,
            reason:
              updateData.status === OrderStatus.REJECTED
                ? `ORDER_REJECTED:${existingOrder.orderNumber}`
                : `ORDER_CANCELLED:${existingOrder.orderNumber}`,
          });
        }

        if (inventoryLogData.length > 0) {
          await tx.inventoryLog.createMany({
            data: inventoryLogData,
          });
        }

        return tx.order.update({
          where: { id: existingOrder.id },
          data: updateData,
          include: {
            items: true,
            customer: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
              },
            },
            deliveryPartner: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        });
      });
    } else {
      // Normal single-operation status advancement with full relations
      updatedOrder = await prisma.order.update({
        where: { id: existingOrder.id },
        data: updateData,
        include: {
          items: true,
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
          deliveryPartner: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      });
    }
    dbUpdateTime = performance.now() - dbStart;

    const totalTime = performance.now() - startTime;
    console.log(
      `[PERF][ADMIN_ORDER_UPDATE] order=${existingOrder.orderNumber} status=${updateData.status || existingOrder.status} lookup=${orderLookupTime.toFixed(1)}ms db=${dbUpdateTime.toFixed(1)}ms total=${totalTime.toFixed(1)}ms`
    );

    return NextResponse.json({ order: updatedOrder }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    const totalTime = performance.now() - startTime;
    console.error(`[PERF][ADMIN_ORDER_UPDATE_ERROR] total=${totalTime.toFixed(1)}ms error:`, error);
    const errorMessage = error instanceof Error ? error.message : "";
    if (errorMessage.startsWith("Product not found:")) {
      return NextResponse.json(
        { error: `Cannot reject order: ${errorMessage}` },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

