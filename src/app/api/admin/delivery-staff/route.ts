import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role, OrderStatus } from "@prisma/client";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { resolveVerifiedUser } from "@/lib/auth-verifier";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

export function normalizeRiderId(rider: { id: string; email?: string | null; name?: string | null }): string {
  return rider.id;
}

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  try {
    const user = await resolveVerifiedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    if (user.role !== Role.STORE_ADMIN && user.role !== Role.DELIVERY_PARTNER) {
      return NextResponse.json(
        { error: "Unauthorized. Delivery staff access requires STORE_ADMIN or DELIVERY_PARTNER role." },
        { status: 403, headers: NO_CACHE_HEADERS }
      );
    }

    const riders = await prisma.user.findMany({
      where: { role: Role.DELIVERY_PARTNER },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
      orderBy: { name: "asc" },
    });

    const elapsed = performance.now() - startTime;
    if (elapsed > 500) {
      console.log(`[PERF][GET_DELIVERY_STAFF] count=${riders.length} time=${elapsed.toFixed(1)}ms`);
    }

    return NextResponse.json({ riders }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    const elapsed = performance.now() - startTime;
    console.error(`[PERF][GET_DELIVERY_STAFF_ERROR] time=${elapsed.toFixed(1)}ms error:`, error);
    return NextResponse.json(
      { error: "Failed to fetch delivery staff" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authorization Guard: STORE_ADMIN only
    const user = await resolveVerifiedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required. Please log in as an administrator." },
        { status: 401 }
      );
    }

    if (user.role !== Role.STORE_ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required to onboard delivery staff." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, phone } = body;

    // 2. Validate Name
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Rider name is required." },
        { status: 400 }
      );
    }
    const cleanName = name.trim();

    // 3. Validate Email
    if (!email || typeof email !== "string" || email.trim() === "") {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 }
      );
    }
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // 4. Validate Phone
    const cleanPhone = typeof phone === "string" ? phone.trim() : "";
    if (cleanPhone && cleanPhone.replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { error: "Please provide a valid 10-digit phone number." },
        { status: 400 }
      );
    }

    // 5. Find Existing RushD User
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, email: true, role: true, name: true, phone: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "This person must sign in to RushD once before they can be onboarded as a rider." },
        { status: 404 }
      );
    }

    if (existingUser.role === Role.DELIVERY_PARTNER) {
      return NextResponse.json(
        { error: "This user is already a rider." },
        { status: 409 }
      );
    }

    if (existingUser.role === Role.STORE_ADMIN) {
      return NextResponse.json(
        { error: "This user is currently registered as a store administrator and cannot be converted directly to a rider." },
        { status: 400 }
      );
    }

    // 6. Promote CUSTOMER -> DELIVERY_PARTNER
    const updatedRider = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        role: Role.DELIVERY_PARTNER,
        name: cleanName || existingUser.name,
        phone: cleanPhone || existingUser.phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // Graceful Supabase Auth metadata sync
    try {
      const supabaseAdmin = createAdminClient();
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (!listError && users) {
        const authUser = users.find(
          (u) => u.email?.toLowerCase().trim() === cleanEmail
        );
        if (authUser) {
          await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
            user_metadata: { ...authUser.user_metadata, role: "DELIVERY_PARTNER" },
            app_metadata: { ...authUser.app_metadata, role: "DELIVERY_PARTNER" },
          });
        }
      }
    } catch {
      // Non-fatal: DB role is the primary authoritative source of truth in RushD
    }

    return NextResponse.json(
      {
        success: true,
        rider: updatedRider,
        message: `Delivery partner "${updatedRider.name || updatedRider.email}" successfully onboarded.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/admin/delivery-staff error:", error);
    return NextResponse.json(
      { error: "Failed to onboard delivery staff partner. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 1. Authorization Guard: STORE_ADMIN only
    const user = await resolveVerifiedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required. Please log in as an administrator." },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    if (user.role !== Role.STORE_ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized. STORE_ADMIN privileges required to offboard delivery staff." },
        { status: 403, headers: NO_CACHE_HEADERS }
      );
    }

    // Extract rider ID from search params or body
    const { searchParams } = new URL(request.url);
    let riderId = searchParams.get("id");

    if (!riderId) {
      try {
        const body = await request.json();
        riderId = body?.id || body?.riderId;
      } catch {
        // No body provided
      }
    }

    if (!riderId || typeof riderId !== "string" || riderId.trim() === "") {
      return NextResponse.json(
        { error: "Rider ID is required." },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const cleanRiderId = riderId.trim();

    // 2. Validate Target Delivery Partner
    const existingRider = await prisma.user.findUnique({
      where: { id: cleanRiderId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!existingRider) {
      return NextResponse.json(
        { error: "Delivery partner not found." },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    if (existingRider.role !== Role.DELIVERY_PARTNER) {
      return NextResponse.json(
        { error: `User is not registered as a delivery partner (current role: ${existingRider.role}).` },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // 3. Atomic Database Transaction:
    // a) Demote User role to CUSTOMER (Preserves User row, customer orders, addresses, consents, feedbacks)
    // b) Unassign active non-terminal orders:
    //    - ASSIGNED or OUT_FOR_DELIVERY -> unassign rider and revert status to ACCEPTED (re-assignable)
    //    - other non-terminal statuses -> unassign rider
    // c) Historical orders (DELIVERED, CANCELLED, REJECTED) are untouched for audit/reporting integrity.
    const [updatedUser, assignedActiveOrdersUpdated, otherActiveOrdersUpdated] = await prisma.$transaction([
      prisma.user.update({
        where: { id: existingRider.id },
        data: { role: Role.CUSTOMER },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      }),
      prisma.order.updateMany({
        where: {
          deliveryPartnerId: existingRider.id,
          status: {
            in: [OrderStatus.ASSIGNED, OrderStatus.OUT_FOR_DELIVERY],
          },
        },
        data: {
          deliveryPartnerId: null,
          status: OrderStatus.ACCEPTED,
        },
      }),
      prisma.order.updateMany({
        where: {
          deliveryPartnerId: existingRider.id,
          status: {
            notIn: [
              OrderStatus.DELIVERED,
              OrderStatus.CANCELLED,
              OrderStatus.REJECTED,
              OrderStatus.ASSIGNED,
              OrderStatus.OUT_FOR_DELIVERY,
            ],
          },
        },
        data: {
          deliveryPartnerId: null,
        },
      }),
    ]);

    // 4. Supabase Auth sync (Optional/Graceful)
    try {
      const supabaseAdmin = createAdminClient();
      if (existingRider.email) {
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (!listError && users) {
          const authUser = users.find(
            (u) => u.email?.toLowerCase().trim() === existingRider.email.toLowerCase().trim()
          );
          if (authUser) {
            await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
              user_metadata: { ...authUser.user_metadata, role: "CUSTOMER" },
              app_metadata: { ...authUser.app_metadata, role: "CUSTOMER" },
            });
          }
        }
      }
    } catch {
      // Non-fatal: DB role is primary source of truth in RushD
    }

    return NextResponse.json(
      {
        success: true,
        message: `Delivery partner "${existingRider.name || existingRider.email}" successfully removed and converted to customer.`,
        rider: updatedUser,
        unassignedOrdersCount: assignedActiveOrdersUpdated.count + otherActiveOrdersUpdated.count,
      },
      { status: 200, headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error("DELETE /api/admin/delivery-staff error:", error);
    return NextResponse.json(
      { error: "Failed to remove delivery partner. Please try again." },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
