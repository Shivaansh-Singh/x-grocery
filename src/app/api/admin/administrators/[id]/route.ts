import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { resolveVerifiedUser } from "@/lib/auth-verifier";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

async function resolveAdminCaller(request: NextRequest) {
  try {
    const user = await resolveVerifiedUser(request);
    if (user && user.role === Role.STORE_ADMIN) {
      return user;
    }
    return null;
  } catch (err) {
    console.error("Error resolving admin caller in /api/admin/administrators/[id]:", err);
    return null;
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const caller = await resolveAdminCaller(request);

    if (!caller) {
      const user = await resolveVerifiedUser(request);
      if (!user) {
        return NextResponse.json(
          { error: "Authentication required. Please log in as an administrator." },
          { status: 401, headers: NO_CACHE_HEADERS }
        );
      }
      return NextResponse.json(
        { error: "Unauthorized. STORE_ADMIN role required to remove administrators." },
        { status: 403, headers: NO_CACHE_HEADERS }
      );
    }

    const { id: targetId } = await params;

    if (!targetId || typeof targetId !== "string" || targetId.trim() === "") {
      return NextResponse.json(
        { error: "Administrator ID is required." },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const cleanTargetId = targetId.trim();

    // 1. Locate target administrator
    const targetAdmin = await prisma.user.findUnique({
      where: { id: cleanTargetId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!targetAdmin) {
      return NextResponse.json(
        { error: "Administrator not found." },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    if (targetAdmin.role !== Role.STORE_ADMIN) {
      return NextResponse.json(
        { error: `User is not a store administrator (current role: ${targetAdmin.role}).` },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // Security Rule 1: A STORE_ADMIN cannot remove themselves
    const isSelfRemoval =
      caller.id === targetAdmin.id ||
      (caller.email && targetAdmin.email && caller.email.toLowerCase().trim() === targetAdmin.email.toLowerCase().trim());

    if (isSelfRemoval) {
      return NextResponse.json(
        { error: "You cannot remove your own admin access." },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // Security Rule 2: The last remaining STORE_ADMIN cannot be removed
    const totalAdmins = await prisma.user.count({
      where: { role: Role.STORE_ADMIN },
    });

    if (totalAdmins <= 1) {
      return NextResponse.json(
        { error: "You cannot remove the last store administrator." },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // Atomic Demotion: STORE_ADMIN -> CUSTOMER
    const updatedUser = await prisma.user.update({
      where: { id: targetAdmin.id },
      data: { role: Role.CUSTOMER },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // Graceful Supabase Auth metadata sync
    try {
      const supabaseAdmin = createAdminClient();
      if (targetAdmin.email) {
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (!listError && users) {
          const authUser = users.find(
            (u) => u.email?.toLowerCase().trim() === targetAdmin.email.toLowerCase().trim()
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
      // Non-fatal
    }

    return NextResponse.json(
      {
        success: true,
        message: `Administrator "${targetAdmin.name || targetAdmin.email}" has been removed and restored to customer access.`,
        administrator: updatedUser,
      },
      { status: 200, headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error("DELETE /api/admin/administrators/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to remove administrator. Please try again." },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
