import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const searchQuery = searchParams.get("search");

    // Build Prisma query condition directly using store relation (eliminates separate Store query roundtrip)
    const whereCondition: Record<string, unknown> = {
      store: { slug: "store-x" },
      isActive: true,
    };

    if (categorySlug && categorySlug !== "all") {
      whereCondition.category = {
        slug: categorySlug,
      };
    }

    if (searchQuery && searchQuery.trim() !== "") {
      whereCondition.OR = [
        { name: { contains: searchQuery.trim(), mode: "insensitive" } },
        { description: { contains: searchQuery.trim(), mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        unitDisplay: true,
        stock: true,
        isActive: true,
        imageUrl: true,
        storeId: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
