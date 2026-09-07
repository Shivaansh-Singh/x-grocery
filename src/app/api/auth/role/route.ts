import { NextRequest, NextResponse } from "next/server";
import { resolveVerifiedUser } from "@/lib/auth-verifier";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

export async function GET(request: NextRequest) {
  try {
    // 1. Authoritative identity verification via Supabase session/token
    const verifiedUser = await resolveVerifiedUser(request);
    if (!verifiedUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    // 2. Optional email query parameter check (prevent cross-user enumeration/spoofing)
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email")?.toLowerCase().trim();

    if (email && email !== verifiedUser.email.toLowerCase().trim()) {
      return NextResponse.json(
        { error: "Forbidden: Cannot query role for another account" },
        { status: 403, headers: NO_CACHE_HEADERS }
      );
    }

    // 3. Return verified user identity and role
    return NextResponse.json(
      {
        user: {
          id: verifiedUser.id,
          email: verifiedUser.email,
          name: verifiedUser.name || verifiedUser.email.split("@")[0],
          role: verifiedUser.role,
        },
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error("GET /api/auth/role error:", error);
    return NextResponse.json(
      { error: "Failed to resolve user role" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
