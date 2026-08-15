import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const searchQuery = searchParams.get("search");

    const store = await prisma.store.findUnique({
      where: { slug: "store-x" },
    });

    if (!store) {
      return NextResponse.json({ products: [] }, { status: 200 });
    }

    // Build Prisma query condition
    const whereCondition: Record<string, unknown> = {
      storeId: store.id,
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
      include: {
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

    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
