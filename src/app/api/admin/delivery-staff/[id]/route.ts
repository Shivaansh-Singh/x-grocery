import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role, OrderStatus } from "@prisma/client";
import { resolveVerifiedUser } from "@/lib/auth-verifier";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authorization Guard: STORE_ADMIN only
    const user = await resolveVerifiedUser(request);

    const roleCookie = request.cookies.get("rushd_user_role")?.value;
    const authHeader = request.headers.get("x-user-role");
    const userRole = user?.role || roleCookie || authHeader;

    if (!userRole) {
      return NextResponse.json(
        { error: "Authentication required. Please log in as an administrator." },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    if (userRole !== Role.STORE_ADMIN && userRole !== "STORE_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. STORE_ADMIN privileges required to offboard delivery staff." },
        { status: 403, headers: NO_CACHE_HEADERS }
      );
    }

    const { id } = await params;
    const riderId = id ? id.trim() : "";

    if (!riderId) {
      return NextResponse.json(
        { error: "Rider ID is required." },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // 2. Validate Target Delivery Partner
    const existingRider = await prisma.user.findUnique({
      where: { id: riderId },
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
    // If Supabase Admin client is configured, sync app_metadata and user_metadata to CUSTOMER
    // so token refresh or re-login immediately carries CUSTOMER role.
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
      // Non-fatal: DB role is the primary authoritative source of truth in RushD
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
    console.error("DELETE /api/admin/delivery-staff/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to remove delivery partner. Please try again." },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
