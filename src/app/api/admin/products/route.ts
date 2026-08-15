import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const store = await prisma.store.findUnique({
      where: { slug: "store-x" },
    });

    if (!store) {
      return NextResponse.json({ error: "Store X default hub not found" }, { status: 404 });
    }

    const rawProducts = await prisma.product.findMany({
      where: { storeId: store.id },
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Map unitDisplay and isActive for component compatibility
    const products = rawProducts.map((p) => ({
      ...p,
      unit: p.unitDisplay,
      isAvailable: p.isActive,
    }));

    const categories = await prisma.category.findMany({
      where: { storeId: store.id },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ products, categories });
  } catch (error) {
    console.error("GET /api/admin/products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, price, unit, stock, categoryId, description, imageUrl } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: "Missing required product fields (name, price, categoryId)" },
        { status: 400 }
      );
    }

    const store = await prisma.store.findUnique({
      where: { slug: "store-x" },
    });

    if (!store) {
      return NextResponse.json({ error: "Store X not found" }, { status: 404 });
    }

    const productSlug =
      slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const newProductRaw = await prisma.product.create({
      data: {
        storeId: store.id,
        name,
        slug: `${productSlug}-${Date.now().toString().slice(-4)}`,
        price: Number(price),
        unitDisplay: unit || "1 pack",
        stock: Number(stock || 0),
        categoryId,
        description: description || null,
        imageUrl: imageUrl || "/images/placeholder.jpg",
        isActive: Number(stock || 0) > 0,
      },
      include: { category: true },
    });

    // Record initial inventory log
    await prisma.inventoryLog.create({
      data: {
        productId: newProductRaw.id,
        previousStock: 0,
        newStock: newProductRaw.stock,
        changeQuantity: newProductRaw.stock,
        reason: "INITIAL_CATALOG_ADD",
      },
    });

    const newProduct = {
      ...newProductRaw,
      unit: newProductRaw.unitDisplay,
      isAvailable: newProductRaw.isActive,
    };

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/products error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
