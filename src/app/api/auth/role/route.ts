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

    // 2. Fallback resolution rules for demo emails if DB record not found
    let role = "CUSTOMER";
    let name = email.split("@")[0];
    let id = `user-${email.replace(/[^a-z0-9]/g, "-")}`;

    if (email.includes("admin") || email === "store@rushd.com") {
      role = "STORE_ADMIN";
      name = "Store Admin X";
    } else if (email.includes("delivery1") || email.includes("rider1")) {
      role = "DELIVERY_PARTNER";
      name = "Ramesh Kumar (Rider 1)";
      id = "rider-1";
    } else if (email.includes("delivery2") || email.includes("rider2")) {
      role = "DELIVERY_PARTNER";
      name = "Suresh Singh (Rider 2)";
      id = "rider-2";
    } else if (email.includes("delivery3") || email.includes("rider3")) {
      role = "DELIVERY_PARTNER";
      name = "Vikas Sharma (Rider 3)";
      id = "rider-3";
    } else if (email.includes("delivery") || email.includes("rider")) {
      role = "DELIVERY_PARTNER";
      name = "Rider Partner";
    }

    return NextResponse.json({
      user: {
        id,
        email,
        name,
        role,
      },
    });
  } catch (error) {
    console.error("GET /api/auth/role error:", error);
    return NextResponse.json({ error: "Failed to resolve user role" }, { status: 500 });
  }
}
