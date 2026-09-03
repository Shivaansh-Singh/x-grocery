import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { generateDeliveryOtp } from "@/lib/otp";
import { calculateOrderPricing } from "@/lib/pricing";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    const store = await prisma.store.findUnique({
      where: { slug: "store-x" },
    });

    const whereCondition: Record<string, unknown> = {};
    if (store) {
      whereCondition.storeId = store.id;
    }
    if (customerId) {
      whereCondition.customerId = customerId;
    }

    const orders = await prisma.order.findMany({
      where: whereCondition,
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      deliveryAddress,
      paymentMethod,
      items,
      notes,
    } = body;

    if (!deliveryAddress || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid order payload. Required: deliveryAddress and non-empty items." },
        { status: 400 }
      );
    }

    // 1. Get Store X (select only id to minimize query payload)
    const store = await prisma.store.findUnique({
      where: { slug: "store-x" },
      select: { id: true },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store X default hub not found" },
        { status: 404 }
      );
    }

    // 2. Ensure customer user exists
    const targetCustomerId = customerId || "guest-user-session";
    const customer = await prisma.user.upsert({
      where: { id: targetCustomerId },
      update: {},
      create: {
        id: targetCustomerId,
        email: `student-${Date.now()}@vitbhopal.ac.in`,
        name: "Day Scholar Student",
        phone: "+91 99999 88888",
      },
    });

    // 3. Deduplication Guard: Check for duplicate submission from same customer & address in last 10 seconds
    const tenSecondsAgo = new Date(Date.now() - 10000);
    const existingRecentOrder = await prisma.order.findFirst({
      where: {
        customerId: customer.id,
        deliveryAddress,
        createdAt: { gte: tenSecondsAgo },
      },
      include: { items: true },
    });

    if (existingRecentOrder) {
      console.log("POST /api/orders DUP GUARD: Returning existing recent order", existingRecentOrder.orderNumber);
      return NextResponse.json({ order: existingRecentOrder }, { status: 200 });
    }

    // 4. Pre-validate all items before starting transaction
    const typedItems = items as Array<{
      productId?: string;
      product?: { id: string; name?: string };
      productName?: string;
      quantity?: number;
    }>;

    const productIds = typedItems.map(
      (item) => item.productId || item.product?.id
    ).filter(Boolean) as string[];

    const liveProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true, stock: true, isActive: true },
    });

    const productMap = new Map(liveProducts.map((p) => [p.id, p]));

    // Validate each ordered item
    for (const item of typedItems) {
      const productId = item.productId || item.product?.id;
      const requestedQty = Number(item.quantity || 1);
      const liveProduct = productId ? productMap.get(productId) : undefined;

      if (!liveProduct) {
        return NextResponse.json(
          { error: `Product not found: ${item.productName || productId}` },
          { status: 400 }
        );
      }

      if (!liveProduct.isActive) {
        return NextResponse.json(
          { error: `"${liveProduct.name}" is currently unavailable.` },
          { status: 400 }
        );
      }

      if (liveProduct.stock <= 0) {
        return NextResponse.json(
          { error: `"${liveProduct.name}" is out of stock.` },
          { status: 400 }
        );
      }

      if (requestedQty > liveProduct.stock) {
        return NextResponse.json(
          { error: `Only ${liveProduct.stock} item${liveProduct.stock === 1 ? "" : "s"} of "${liveProduct.name}" available.` },
          { status: 400 }
        );
      }
    }

    // 5. Generate unique order number
    const orderNumber = `XG-${Math.floor(100000 + Math.random() * 900000)}`;

    // 6. Calculate totals using LIVE prices as authoritative snapshot
    let calculatedSubtotal = 0;
    const orderItemsData: {
      productId: string;
      productName: string;
      unitPrice: number;
      quantity: number;
      subtotal: number;
    }[] = [];

    for (const item of typedItems) {
      const productId = (item.productId || item.product?.id) ?? "";
      const liveProduct = productMap.get(productId)!;
      const unitPrice = liveProduct.price;
      const quantity = Number(item.quantity || 1);
      const subtotal = unitPrice * quantity;
      calculatedSubtotal += subtotal;

      orderItemsData.push({
        productId: liveProduct.id,
        productName: liveProduct.name,
        unitPrice,
        quantity,
        subtotal,
      });
    }

    // Pricing calculation via single source of truth (Delivery fee + Platform & Packaging fee)
    const pricing = calculateOrderPricing(calculatedSubtotal, orderItemsData.length);
    const totalAmount = pricing.totalAmount;

    // 7. Atomic transaction: Create order + deduct stock simultaneously (with WAN pooler timeouts)
    const newOrder = await prisma.$transaction(
      async (tx) => {
        // Generate cryptographically secure 6-digit delivery OTP and hash
        const { otp: deliveryOtp, hash: deliveryOtpHash } = generateDeliveryOtp();

        // Create the order with frozen item price snapshots and delivery verification OTP
        const order = await tx.order.create({
          data: {
            orderNumber,
            storeId: store.id,
            customerId: customer.id,
            status: OrderStatus.PENDING,
            paymentMethod: (paymentMethod as PaymentMethod) || PaymentMethod.COD,
            paymentStatus: PaymentStatus.PENDING,
            totalAmount,
            deliveryAddress,
            notes: notes || null,
            deliveryOtp,
            deliveryOtpHash,
            deliveryOtpVerified: false,
            items: {
              create: orderItemsData,
            },
          },
          include: { items: true },
        });

        // Atomically deduct stock and record inventory logs sequentially within the transaction
        for (const item of orderItemsData) {
          const updatedProduct = await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
            select: { id: true, stock: true },
          });

          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              previousStock: updatedProduct.stock + item.quantity,
              newStock: updatedProduct.stock,
              changeQuantity: -item.quantity,
              reason: `ORDER_PLACED:${order.orderNumber}`,
            },
          });
        }

        return order;
      },
      {
        maxWait: 10000,
        timeout: 20000,
      }
    );

    return NextResponse.json({ order: newOrder }, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    // Surface stock validation errors to client
    if (error instanceof Error && (
      error.message.includes("available") ||
      error.message.includes("unavailable") ||
      error.message.includes("out of stock")
    )) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to place order" },
      { status: 500 }
    );
  }
}
