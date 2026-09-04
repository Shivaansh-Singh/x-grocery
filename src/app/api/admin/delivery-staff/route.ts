import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

export function normalizeRiderId(rider: { id: string; email?: string | null; name?: string | null }): string {
  return rider.id;
}

function extractEmailFromSupabaseCookie(request: NextRequest): string | null {
  try {
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
      const accessToken = parsed?.access_token || (typeof parsed === "string" ? parsed : null);
      if (accessToken && typeof accessToken === "string" && accessToken.includes(".")) {
        const parts = accessToken.split(".");
        if (parts.length === 3) {
          const payloadJson = Buffer.from(parts[1], "base64").toString("utf-8");
          const payload = JSON.parse(payloadJson);
          const nowSeconds = Math.floor(Date.now() / 1000);
          if (payload.exp && payload.exp > nowSeconds && payload.email) {
            return payload.email.toLowerCase().trim();
          }
        }
      }
    }
  } catch {
    // ignore
  }
  return null;
}

async function resolveAuthenticatedUser(request: NextRequest) {
  try {
    // 1. Fast zero-latency local JWT extraction from Supabase auth cookie
    const fastEmail = extractEmailFromSupabaseCookie(request);
    if (fastEmail) {
      const dbUser = await prisma.user.findUnique({
        where: { email: fastEmail },
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

    // 3. Fallback to Supabase Auth API if local cookie is missing or expired
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
    const roleCookie = request.cookies.get("rushd_user_role")?.value;
    const authHeader = request.headers.get("x-user-role");
    const userRole = roleCookie || authHeader;

    if (userRole !== "STORE_ADMIN") {
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

    // 5. Check for Duplicate Email
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, email: true, role: true, name: true },
    });

    if (existingUser) {
      if (existingUser.role === Role.DELIVERY_PARTNER) {
        return NextResponse.json(
          { error: `A delivery partner with email "${cleanEmail}" already exists.` },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: `A user with email "${cleanEmail}" already exists with role ${existingUser.role}.` },
        { status: 409 }
      );
    }

    // 6. Create Delivery Partner User in Database
    const newRider = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone || null,
        role: Role.DELIVERY_PARTNER,
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

    return NextResponse.json(
      {
        success: true,
        rider: newRider,
        message: `Delivery partner "${newRider.name}" successfully onboarded.`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/delivery-staff error:", error);
    return NextResponse.json(
      { error: "Failed to onboard delivery staff partner. Please try again." },
      { status: 500 }
    );
  }
}
