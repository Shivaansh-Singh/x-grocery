import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentMethod, PaymentStatus, Role } from "@prisma/client";
import { generateDeliveryOtp } from "@/lib/otp";
import { calculateOrderPricing } from "@/lib/pricing";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

// Resolve the requesting user from the verified Supabase session (SSR auth cookies).
// The matching DB user is the authoritative source of identity and role. This never
// trusts the client-writable rushd_user_role / rushd_user_email cookies or any
// client-supplied identifier.
async function resolveRequestUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const email = user?.email?.toLowerCase().trim();
    if (!email) return null;

    return await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true },
    });
  } catch (err) {
    console.error("[GET_ORDERS] Auth resolution error:", err);
    return null;
  }
}

export async function GET() {
  const startTime = performance.now();
  try {
    // 1. Authentication: require a verified Supabase session (no anonymous access).
    const user = await resolveRequestUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    // 2. Authorization scope derived ONLY from the authenticated user's DB role.
    //    Client query parameters can never widen the result to other customers' orders.
    const whereCondition: {
      store: { slug: string };
      customerId?: string;
      deliveryPartnerId?: string;
    } = {
      store: { slug: "store-x" },
    };

    if (user.role === Role.STORE_ADMIN) {
      // Store admin: full store order queue (existing intended admin path).
    } else if (user.role === Role.DELIVERY_PARTNER) {
      // Delivery partner: only orders assigned to them.
      whereCondition.deliveryPartnerId = user.id;
    } else {
      // Customer: strictly their own orders.
      whereCondition.customerId = user.id;
    }

    const orders = await prisma.order.findMany({
      where: whereCondition,
      // SECURITY: deliveryOtp and deliveryOtpHash are intentionally omitted here —
      // delivery secrets must never be exposed through the general orders list endpoint.
      select: {
        id: true,
        orderNumber: true,
        storeId: true,
        customerId: true,
        deliveryPartnerId: true,
        status: true,
        paymentMethod: true,
        paymentStatus: true,
        totalAmount: true,
        deliveryAddress: true,
        notes: true,
        deliveryOtpVerified: true,
        deliveryOtpVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
        items: true,
        customer: {
          select: { id: true, name: true, phone: true, email: true },
        },
        deliveryPartner: {
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const elapsed = performance.now() - startTime;
    if (elapsed > 500) {
      console.log(`[PERF][GET_ORDERS] role=${user.role} count=${orders.length} time=${elapsed.toFixed(1)}ms`);
    }

    return NextResponse.json({ orders }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    const elapsed = performance.now() - startTime;
    console.error(`[PERF][GET_ORDERS_ERROR] time=${elapsed.toFixed(1)}ms error:`, error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(request: NextRequest) {
  const placeOrderStart = performance.now();
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

        // Atomically deduct stock and collect inventory logs for batch insert
        const inventoryLogData: {
          productId: string;
          previousStock: number;
          newStock: number;
          changeQuantity: number;
          reason: string;
        }[] = [];

        for (const item of orderItemsData) {
          const updatedProduct = await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
            select: { id: true, stock: true },
          });

          inventoryLogData.push({
            productId: item.productId,
            previousStock: updatedProduct.stock + item.quantity,
            newStock: updatedProduct.stock,
            changeQuantity: -item.quantity,
            reason: `ORDER_PLACED:${order.orderNumber}`,
          });
        }

        if (inventoryLogData.length > 0) {
          await tx.inventoryLog.createMany({
            data: inventoryLogData,
          });
        }

        return order;
      },
      {
        maxWait: 10000,
        timeout: 20000,
      }
    );

    console.log(
      `[PERF][PLACE_ORDER] items=${orderItemsData.length} time=${(performance.now() - placeOrderStart).toFixed(1)}ms`
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
