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
    const { name, slug, price, unit, stock, categoryId, description, imageUrl, isAvailable } = body;

    // Backend validation
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Product name is required." },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category is required." },
        { status: 400 }
      );
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json(
        { error: "Price must be a non-negative number." },
        { status: 400 }
      );
    }

    const parsedStock = parseInt(String(stock ?? 0), 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      return NextResponse.json(
        { error: "Stock must be a non-negative integer." },
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

    // isActive = explicit availability override (default true), independent from stock
    const explicitActive = isAvailable !== undefined ? Boolean(isAvailable) : true;

    const newProductRaw = await prisma.product.create({
      data: {
        storeId: store.id,
        name: name.trim(),
        slug: `${productSlug}-${Date.now().toString().slice(-4)}`,
        price: parsedPrice,
        unitDisplay: unit || "1 pack",
        stock: parsedStock,
        categoryId,
        description: description || null,
        imageUrl: imageUrl || "/images/placeholder.jpg",
        isActive: explicitActive,
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
