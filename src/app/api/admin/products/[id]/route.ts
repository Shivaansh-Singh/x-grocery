import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, price, unit, stock, isAvailable, isActive, description, imageUrl, categoryId } = body;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = Number(price);
    if (unit !== undefined) updateData.unitDisplay = unit;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (isActive !== undefined || isAvailable !== undefined) {
      updateData.isActive = Boolean(isActive ?? isAvailable);
    }

    // Stock Override & Inventory Audit Logging
    let stockChanged = false;
    let newStockValue = existingProduct.stock;
    let changeQty = 0;

    if (stock !== undefined && Number(stock) !== existingProduct.stock) {
      stockChanged = true;
      newStockValue = Number(stock);
      changeQty = newStockValue - existingProduct.stock;
      updateData.stock = newStockValue;
      updateData.isActive = newStockValue > 0;
    }

    const updatedRaw = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    if (stockChanged) {
      await prisma.inventoryLog.create({
        data: {
          productId: id,
          previousStock: existingProduct.stock,
          newStock: newStockValue,
          changeQuantity: changeQty,
          reason: "MANUAL_OVERRIDE",
        },
      });
    }

    const updatedProduct = {
      ...updatedRaw,
      unit: updatedRaw.unitDisplay,
      isAvailable: updatedRaw.isActive,
    };

    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    console.error("PATCH /api/admin/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete product from catalog
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
