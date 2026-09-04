import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email")?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: "Email query parameter is required" }, { status: 400 });
    }

    // 1. Query Prisma Database for user by email
    const dbUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (dbUser) {
      return NextResponse.json({
        user: {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name || dbUser.email.split("@")[0],
          role: dbUser.role, // "STORE_ADMIN", "DELIVERY_PARTNER", or "CUSTOMER"
        },
      });
    }

    // No user found in database — return null so the caller handles defaults
    return NextResponse.json({ user: null });
  } catch (error) {
    console.error("GET /api/auth/role error:", error);
    return NextResponse.json({ error: "Failed to resolve user role" }, { status: 500 });
  }
}
