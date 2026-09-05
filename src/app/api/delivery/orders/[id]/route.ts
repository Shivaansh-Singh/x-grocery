import { resolveVerifiedUser } from "@/lib/auth-verifier";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentStatus, Role } from "@prisma/client";
import { verifyDeliveryOtp } from "@/lib/otp";
import { createClient } from "@/lib/supabase/server";
import { normalizeRiderId } from "@/app/api/admin/delivery-staff/route";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

// In-memory rate limiting map for failed OTP attempts per order
// Maximum 5 failed attempts per order before locking for 5 minutes
const failedOtpAttempts = new Map<string, { count: number; lockedUntil: number }>();

async function getAuthUserFromToken(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !anonKey || supabaseUrl.includes("placeholder")) {
      return null;
    }

    // 1. Try Authorization header first
    let accessToken: string | null = null;
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      accessToken = authHeader.substring(7).trim();
    }

    // 2. Try Supabase SSR cookie if header is not present
    if (!accessToken) {
      const allCookies = request.cookies.getAll();
      const authCookies = allCookies
        .filter((c) => c.name.includes("auth-token"))
        .sort((a, b) => a.name.localeCompare(b.name));

      if (authCookies.length > 0) {
        const combinedValue = authCookies.map((c) => c.value).join("");
        let parsed: any;
        try {
          parsed = JSON.parse(combinedValue);
        } catch {
          try {
            parsed = JSON.parse(Buffer.from(combinedValue, "base64").toString("utf-8"));
          } catch {
            parsed = null;
          }
        }
        if (parsed?.access_token && typeof parsed.access_token === "string") {
          accessToken = parsed.access_token;
        } else if (typeof parsed === "string" && parsed.includes(".")) {
          accessToken = parsed;
        }
      }
    }

    if (!accessToken) return null;

    // 3. Cryptographically verify token directly with Supabase Auth GoTrue API
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: anonKey,
      },
      cache: "no-store",
    });

    if (res.ok) {
      const user = await res.json();
      if (user?.email) {
        return user;
      }
    }
  } catch (err) {
    console.error("Fast Supabase Auth verification error:", err);
  }
  return null;
}

async function resolveAuthenticatedUser(request: NextRequest) {
  try {
    // 1. Fast 1-shot direct Supabase Auth token verification
    const authUser = await getAuthUserFromToken(request);
    if (authUser?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: authUser.email.toLowerCase().trim() },
      });
      if (dbUser) return dbUser;
    }

    // 2. Fallback to @supabase/ssr createClient session if direct token fetch didn't resolve
    const supabase = await createClient();
    const {
      data: { user: ssrUser },
    } = await supabase.auth.getUser();

    if (ssrUser?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: ssrUser.email.toLowerCase().trim() },
      });
      if (dbUser) return dbUser;
    }

    // 3. Cookie / Header fallback for SSR and hybrid role propagation
    const emailCookie =
      request.cookies.get("rushd_user_email")?.value ||
      request.headers.get("x-user-email");

    if (emailCookie) {
      const dbUser = await prisma.user.findUnique({
        where: { email: emailCookie.toLowerCase().trim() },
      });
      if (dbUser) return dbUser;
    }

    // 4. Fallback check for user role cookie if admin testing
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
