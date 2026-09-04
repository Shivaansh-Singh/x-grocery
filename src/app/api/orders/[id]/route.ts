import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";

// Resolve the requesting user from the verified Supabase session (SSR auth cookies).
// The matching DB user is the authoritative source of identity and role. This never
// trusts the client-writable rushd_user_role / rushd_user_email cookies or any
// client-supplied identifier (query params, body, path id).
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
    console.error("[GET_ORDER_BY_ID] Auth resolution error:", err);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication: require a verified Supabase session (no anonymous access).
    const user = await resolveRequestUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Query order by UUID id or unique orderNumber (e.g. XG-849201)
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
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
        store: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
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

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 2. Authorization: ownership / assignment scope derived ONLY from the DB role.
    //    - CUSTOMER may read only their own order (order.customerId === their DB id)
    //    - DELIVERY_PARTNER may read only orders assigned to them
    //    - STORE_ADMIN may read any order (existing admin workflow)
    //    Any other role is denied.
    if (user.role === Role.CUSTOMER && order.customerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden. You can only view your own orders." },
        { status: 403 }
      );
    }
    if (
      user.role === Role.DELIVERY_PARTNER &&
      order.deliveryPartnerId !== user.id
    ) {
      return NextResponse.json(
        { error: "Forbidden. You are not assigned to this order." },
        { status: 403 }
      );
    }
    if (
      user.role !== Role.CUSTOMER &&
      user.role !== Role.DELIVERY_PARTNER &&
      user.role !== Role.STORE_ADMIN
    ) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    // 3. Response secrecy controls:
    //    - deliveryOtpHash is internal and is NEVER returned to any client.
    //    - deliveryOtp (plaintext) is returned ONLY to the owning customer, who must
    //      read it to hand to the rider at the doorstep. It is withheld from riders and
    //      admins so that OTP-verified delivery cannot be bypassed.
    const { deliveryOtpHash, deliveryOtp, ...rest } = order as typeof order & {
      deliveryOtpHash?: string | null;
      deliveryOtp?: string | null;
    };

    const safeOrder =
      user.role === Role.CUSTOMER ? { ...rest, deliveryOtp } : rest;

    return NextResponse.json({ order: safeOrder });
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order tracking details" },
      { status: 500 }
    );
  }
}
