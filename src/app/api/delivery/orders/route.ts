import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Role } from "@prisma/client";
import { normalizeRiderId } from "@/app/api/admin/delivery-staff/route";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

async function getAuthUserFromToken(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !anonKey || supabaseUrl.includes("placeholder")) {
      return null;
    }

    let accessToken: string | null = null;
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      accessToken = authHeader.substring(7).trim();
    }

    if (!accessToken) return null;

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
    console.error("Fast Supabase Auth verification error in /api/delivery/orders:", err);
  }
  return null;
}

async function resolveAuthenticatedUser(request: NextRequest) {
  try {
    // 1. Fast 1-shot direct Supabase Auth token verification
    const tokenUser = await getAuthUserFromToken(request);
    if (tokenUser?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: tokenUser.email.toLowerCase().trim() },
      });
      if (dbUser) return dbUser;
    }

    // 2. Check Supabase Auth Session
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

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  try {
    const user = await resolveAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    if (user.role === Role.CUSTOMER) {
      return NextResponse.json(
        { error: "Unauthorized. Customer accounts cannot access delivery tasks." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestedRiderId = searchParams.get("riderId");

    let whereCondition: Record<string, unknown> = {};

    if (user.role === Role.STORE_ADMIN) {
      // Store Admin can view all active deliveries or inspect a specific rider's orders
      if (requestedRiderId) {
        whereCondition = {
          deliveryPartnerId: requestedRiderId,
          status: { in: ["ASSIGNED", "OUT_FOR_DELIVERY", "DELIVERED"] },
        };
      } else {
        whereCondition = {
          status: { in: ["ASSIGNED", "OUT_FOR_DELIVERY", "DELIVERED"] },
        };
      }
    } else if (user.role === Role.DELIVERY_PARTNER) {
      // STRICT SCOPING: DELIVERY_PARTNER is strictly locked to their own ID
      const canonicalId = normalizeRiderId({
        id: user.id,
        email: user.email,
        name: user.name,
      });

      const allowedIds = Array.from(new Set([user.id, canonicalId])).filter(Boolean);

      whereCondition = {
        deliveryPartnerId: { in: allowedIds },
        status: { in: ["ASSIGNED", "OUT_FOR_DELIVERY", "DELIVERED"] },
      };
    } else {
      return NextResponse.json(
        { error: "Unauthorized. Delivery partner role required." },
        { status: 403, headers: NO_CACHE_HEADERS }
      );
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

    const sanitizedOrders = orders.map((order) => {
      const { deliveryOtp, deliveryOtpHash, ...safeOrder } = order as typeof order & {
        deliveryOtp?: string;
        deliveryOtpHash?: string;
      };
      return safeOrder;
    });

    const elapsed = performance.now() - startTime;
    if (elapsed > 500) {
      console.log(`[PERF][GET_RIDER_ORDERS] count=${sanitizedOrders.length} time=${elapsed.toFixed(1)}ms`);
    }

    return NextResponse.json({ orders: sanitizedOrders }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    const elapsed = performance.now() - startTime;
    console.error(`[PERF][GET_RIDER_ORDERS_ERROR] time=${elapsed.toFixed(1)}ms error:`, error);
    return NextResponse.json(
      { error: "Failed to fetch rider delivery tasks" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
