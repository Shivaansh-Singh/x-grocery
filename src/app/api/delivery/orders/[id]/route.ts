import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentStatus, Role } from "@prisma/client";
import { verifyDeliveryOtp } from "@/lib/otp";
import { createClient } from "@/lib/supabase/server";
import { normalizeRiderId } from "@/app/api/admin/delivery-staff/route";

// In-memory rate limiting map for failed OTP attempts per order
// Maximum 5 failed attempts per order before locking for 5 minutes
const failedOtpAttempts = new Map<string, { count: number; lockedUntil: number }>();

async function resolveAuthenticatedUser(request: NextRequest) {
  try {
    // 1. Check Supabase Auth Session
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (authUser?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: authUser.email.toLowerCase().trim() },
      });
      if (dbUser) return dbUser;
    }

    // 2. Cookie / Header fallback for SSR and hybrid role propagation
    const emailCookie =
      request.cookies.get("rushd_user_email")?.value ||
      request.headers.get("x-user-email");

    if (emailCookie) {
      const dbUser = await prisma.user.findUnique({
        where: { email: emailCookie.toLowerCase().trim() },
      });
      if (dbUser) return dbUser;
    }

    // 3. Fallback check for user role cookie if admin testing
    const roleCookie =
      request.cookies.get("rushd_user_role")?.value ||
      request.headers.get("x-user-role");

    if (roleCookie === "STORE_ADMIN") {
      return { id: "admin-session", email: "admin@rushd.com", role: Role.STORE_ADMIN, name: "Store Admin" };
    }

    return null;
  } catch (err) {
    console.error("Error resolving authenticated user:", err);
    return null;
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication Check
    const user = await resolveAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401 }
      );
    }

    // 2. Role Authorization: Customer accounts cannot update delivery tasks
    if (user.role === Role.CUSTOMER) {
      return NextResponse.json(
        { error: "Forbidden. Customer accounts cannot update delivery tasks." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus, otp } = body;

    // 3. Fetch existing order
    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 4. Ownership Check: DELIVERY_PARTNER may only modify orders assigned to them
    if (user.role === Role.DELIVERY_PARTNER) {
      const canonicalUserId = normalizeRiderId({
        id: user.id,
        email: user.email,
        name: user.name,
      });
      const allowedRiderIds = Array.from(new Set([user.id, canonicalUserId])).filter(Boolean);

      const orderRiderId = existingOrder.deliveryPartnerId;
      const isAssignedToThisRider = orderRiderId && allowedRiderIds.includes(orderRiderId);

      if (!isAssignedToThisRider) {
        return NextResponse.json(
          { error: "Forbidden. You are not assigned to this delivery task." },
          { status: 403 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};

    if (status) {
      // 5. Guard against invalid states or already delivered orders
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

        // 6. Validate OTP format (must be exactly 6 numeric digits)
        if (!otp || typeof otp !== "string" || !/^\d{6}$/.test(otp.trim())) {
          return NextResponse.json(
            { error: "Please enter the 6-digit delivery OTP." },
            { status: 400 }
          );
        }

        // 7. OTP Brute-Force Rate Limiting (in-memory)
        const now = Date.now();
        const attemptRecord = failedOtpAttempts.get(existingOrder.id);
        if (attemptRecord && attemptRecord.lockedUntil > now) {
          const remainingSec = Math.ceil((attemptRecord.lockedUntil - now) / 1000);
          return NextResponse.json(
            { error: `Too many incorrect OTP attempts. Please wait ${remainingSec} seconds before trying again.` },
            { status: 429 }
          );
        }

        // 8. Verify OTP against stored hash or stored OTP
        const isOtpValid = verifyDeliveryOtp(
          otp.trim(),
          existingOrder.deliveryOtpHash,
          existingOrder.deliveryOtp
        );

        if (!isOtpValid) {
          const currentAttempts = (attemptRecord?.count || 0) + 1;
          const lockedUntil = currentAttempts >= 5 ? now + 5 * 60 * 1000 : 0;
          failedOtpAttempts.set(existingOrder.id, { count: currentAttempts, lockedUntil });

          if (currentAttempts >= 5) {
            return NextResponse.json(
              { error: "Too many incorrect OTP attempts. Delivery verification locked for 5 minutes." },
              { status: 429 }
            );
          }

          return NextResponse.json(
            { error: `Incorrect OTP. ${5 - currentAttempts} attempt(s) remaining.` },
            { status: 400 }
          );
        }

        // Reset failed attempts counter on successful verification
        failedOtpAttempts.delete(existingOrder.id);

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

    // Sanitize output to ensure OTP values are never exposed in response
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
