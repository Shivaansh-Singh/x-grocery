import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getOrCreateDefaultStore() {
  let store = await prisma.store.findUnique({
    where: { slug: "store-x" },
  });

  if (!store) {
    store = await prisma.store.create({
      data: {
        name: "Store X (VIT Bhopal Off-Campus Hub)",
        slug: "store-x",
        address: "Kotri Kalan, Near VIT Bhopal Campus Road, Bhopal, MP",
        phone: "+91 9244302120",
        isActive: true,
      },
    });
  }

  return store;
}

export async function GET() {
  try {
    const store = await getOrCreateDefaultStore();
    const categories = await prisma.category.findMany({
      where: { storeId: store.id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("GET /api/admin/categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Role Guard: Admin only
    const roleCookie = request.cookies.get("rushd_user_role")?.value;
    const authHeader = request.headers.get("x-user-role");
    const userRole = roleCookie || authHeader;

    if (userRole !== "STORE_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required to manage categories." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required." },
        { status: 400 }
      );
    }

    const store = await getOrCreateDefaultStore();
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // 2. Check if category with this slug already exists for this store
    const existing = await prisma.category.findUnique({
      where: {
        storeId_slug: {
          storeId: store.id,
          slug,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ category: existing, alreadyExisted: true }, { status: 200 });
    }

    // 3. Find highest sortOrder
    const highest = await prisma.category.findFirst({
      where: { storeId: store.id },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const nextSortOrder = (highest?.sortOrder ?? 0) + 1;

    const category = await prisma.category.create({
      data: {
        storeId: store.id,
        name,
        slug,
        sortOrder: nextSortOrder,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/categories error:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
