import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const store = await prisma.store.findUnique({
      where: { slug: "store-x" },
    });

    if (!store) {
      return NextResponse.json(
        { categories: [], message: "Store X default catalog" },
        { status: 200 }
      );
    }

    const categories = await prisma.category.findMany({
      where: { storeId: store.id },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
