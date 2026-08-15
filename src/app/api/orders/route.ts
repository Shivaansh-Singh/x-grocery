import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

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

    // 1. Get or create Store X
    const store = await prisma.store.findUnique({
      where: { slug: "store-x" },
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

    // 3. Generate unique order code (e.g. XG-849201)
    const orderNumber = `XG-${Math.floor(100000 + Math.random() * 900000)}`;

    // 4. Calculate total amount & prepare frozen item snapshots
    let calculatedSubtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const unitPrice = Number(item.unitPrice || item.product?.price || 0);
      const quantity = Number(item.quantity || 1);
      const subtotal = unitPrice * quantity;
      calculatedSubtotal += subtotal;

      orderItemsData.push({
        productId: item.productId || item.product?.id || "product-item",
        productName: item.productName || item.product?.name || "Grocery Product",
        unitPrice,
        quantity,
        subtotal,
      });
    }

    // Delivery fee rule: flat ₹15, waived (FREE) for subtotal >= 199
    const deliveryFee = calculatedSubtotal >= 199 ? 0 : 15;
    const totalAmount = calculatedSubtotal + deliveryFee;

    // 5. Create Order transaction with nested OrderItems
    const newOrder = await prisma.order.create({
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
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ order: newOrder }, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { error: "Failed to place order" },
      { status: 500 }
    );
  }
}
