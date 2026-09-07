import { resolveVerifiedUser } from "@/lib/auth-verifier";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentStatus, Role } from "@prisma/client";
import { verifyDeliveryOtp } from "@/lib/otp";
import { normalizeRiderId } from "@/app/api/admin/delivery-staff/route";
import {
  getClientIp,
  checkRateLimit,
  resetRateLimitKey,
  createRateLimitResponse,
} from "@/lib/rate-limit";

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
  let authTime = 0;
  let dbUpdateTime = 0;

  try {
    // 1. Authentication Check
    const authStart = performance.now();
    const user = await resolveVerifiedUser(request);
    authTime = performance.now() - authStart;

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    // 2. Role Authorization: Customer accounts cannot update delivery tasks
    if (user.role === Role.CUSTOMER) {
      return NextResponse.json(
        { error: "Forbidden. Customer accounts cannot update delivery tasks." },
        { status: 403, headers: NO_CACHE_HEADERS }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus, otp } = body;

    // 3. Fetch existing order (select minimal required fields for validation & OTP check)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const selectFields = {
      id: true,
      orderNumber: true,
      status: true,
      deliveryPartnerId: true,
      deliveryOtp: true,
      deliveryOtpHash: true,
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

        // 7. Distributed OTP Brute-Force Protection
        const clientIp = getClientIp(request);
        const globalOtpIpKey = `rl:otp:ip:${clientIp}`;
        const orderOtpKey = `rl:otp:order:${existingOrder.id}:ip:${clientIp}`;

        // Pre-check global IP throttle (20 attempts per 5 mins per IP)
        const globalCheck = await checkRateLimit({
          key: globalOtpIpKey,
          limit: 20,
          windowMs: 5 * 60 * 1000,
          increment: false,
        });
        if (!globalCheck.allowed || globalCheck.count >= 20) {
          const retryAfter = globalCheck.retryAfterSeconds > 0 ? globalCheck.retryAfterSeconds : 300;
          return createRateLimitResponse(
            retryAfter,
            "Too many OTP verification attempts from this network. Please try again later."
          );
        }

        // Pre-check per-order OTP lock (5 failed attempts per 5 mins)
        const orderCheck = await checkRateLimit({
          key: orderOtpKey,
          limit: 5,
          windowMs: 5 * 60 * 1000,
          increment: false,
        });
        if (!orderCheck.allowed || orderCheck.count >= 5) {
          const retryAfter = orderCheck.retryAfterSeconds > 0 ? orderCheck.retryAfterSeconds : 300;
          return createRateLimitResponse(
            retryAfter,
            "Too many incorrect OTP attempts. Delivery verification locked for 5 minutes."
          );
        }

        // 8. Verify OTP against stored hash or stored OTP
        const isOtpValid = verifyDeliveryOtp(
          otp.trim(),
          existingOrder.deliveryOtpHash,
          existingOrder.deliveryOtp
        );

        if (!isOtpValid) {
          // Increment global IP attempts
          await checkRateLimit({
            key: globalOtpIpKey,
            limit: 20,
            windowMs: 5 * 60 * 1000,
            increment: true,
          });

          // Increment order OTP failed attempts
          const failResult = await checkRateLimit({
            key: orderOtpKey,
            limit: 5,
            windowMs: 5 * 60 * 1000,
            increment: true,
          });

          if (!failResult.allowed || failResult.count >= 5) {
            const retryAfter = failResult.retryAfterSeconds > 0 ? failResult.retryAfterSeconds : 300;
            return createRateLimitResponse(
              retryAfter,
              "Too many incorrect OTP attempts. Delivery verification locked for 5 minutes."
            );
          }

          const remaining = Math.max(0, 5 - failResult.count);
          return NextResponse.json(
            { error: `Incorrect OTP. ${remaining} attempt(s) remaining.` },
            { status: 400, headers: NO_CACHE_HEADERS }
          );
        }

        // Reset failed attempts counter on successful verification
        await resetRateLimitKey(orderOtpKey);

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

    const dbStart = performance.now();
    const updatedOrder = await prisma.order.update({
      where: { id: existingOrder.id },
      data: updateData,
      include: {
        items: true,
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        deliveryPartner: true,
      },
    });
    dbUpdateTime = performance.now() - dbStart;

    const totalTime = performance.now() - startTime;
    console.log(
      `[PERF][RIDER_DELIVERY_UPDATE] order=${existingOrder.orderNumber} status=${updateData.status || existingOrder.status} auth=${authTime.toFixed(1)}ms db=${dbUpdateTime.toFixed(1)}ms total=${totalTime.toFixed(1)}ms`
    );

    // Sanitize output to ensure OTP values are never exposed in response
    const { deliveryOtp, deliveryOtpHash, ...safeOrder } = updatedOrder as typeof updatedOrder & {
      deliveryOtp?: string;
      deliveryOtpHash?: string;
    };

    return NextResponse.json({ order: safeOrder, success: true }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    const totalTime = performance.now() - startTime;
    console.error(`[PERF][RIDER_DELIVERY_UPDATE_ERROR] total=${totalTime.toFixed(1)}ms error:`, error);
    return NextResponse.json(
      { error: "Failed to update delivery task status" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
