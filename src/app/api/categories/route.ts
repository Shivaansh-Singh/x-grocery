import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

const DEFAULT_CATEGORIES = [
  { name: "Fresh Produce", slug: "fresh-produce", icon: "carrot", sortOrder: 1 },
  { name: "Dairy & Eggs", slug: "dairy-eggs", icon: "milk", sortOrder: 2 },
  { name: "Snacks & Munchies", slug: "snacks-munchies", icon: "cookie", sortOrder: 3 },
  { name: "Instant Noodles & Ready Meals", slug: "instant-food", icon: "utensils", sortOrder: 4 },
  { name: "Beverages & Drinks", slug: "beverages-drinks", icon: "cup-soda", sortOrder: 5 },
  { name: "Hostel Essentials", slug: "hostel-essentials", icon: "package", sortOrder: 6 },
];

export async function GET() {
  try {
    let categories = await prisma.category.findMany({
      where: { store: { slug: "store-x" } },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    if (categories.length === 0) {
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

      for (const cat of DEFAULT_CATEGORIES) {
        await prisma.category.upsert({
          where: {
            storeId_slug: {
              storeId: store.id,
              slug: cat.slug,
            },
          },
          update: {},
          create: {
            storeId: store.id,
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon,
            sortOrder: cat.sortOrder,
          },
        });
      }

      categories = await prisma.category.findMany({
        where: { storeId: store.id },
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: { sortOrder: "asc" },
      });
    }

    return NextResponse.json({ categories }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

