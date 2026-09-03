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

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "") {
        return NextResponse.json({ error: "Product name cannot be empty." }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return NextResponse.json({ error: "Price must be a non-negative number." }, { status: 400 });
      }
      updateData.price = parsedPrice;
    }

    if (unit !== undefined) updateData.unitDisplay = unit;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (categoryId !== undefined) updateData.categoryId = categoryId;

    // Explicit availability toggle (independent from stock)
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (isAvailable !== undefined) updateData.isActive = Boolean(isAvailable);

    // Stock update with inventory audit logging
    let stockChanged = false;
    let newStockValue = existingProduct.stock;
    let changeQty = 0;

    if (stock !== undefined) {
      const parsedStock = parseInt(String(stock), 10);
      if (isNaN(parsedStock) || parsedStock < 0) {
        return NextResponse.json({ error: "Stock must be a non-negative integer." }, { status: 400 });
      }
      if (parsedStock !== existingProduct.stock) {
        stockChanged = true;
        newStockValue = parsedStock;
        changeQty = newStockValue - existingProduct.stock;
        updateData.stock = newStockValue;
        // NOTE: We do NOT auto-set isActive based on stock.
        // Availability is controlled exclusively by the admin toggle.
      }
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

    // Check if product has historical order references
    const orderItemCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderItemCount > 0) {
      // Soft-delete: deactivate product to protect historical order data
      const deactivated = await prisma.product.update({
        where: { id },
        data: { isActive: false, stock: 0 },
        select: { id: true, name: true, isActive: true },
      });
      return NextResponse.json({
        success: true,
        softDeleted: true,
        message: `"${deactivated.name}" has been deactivated (has ${orderItemCount} historical order reference${orderItemCount === 1 ? "" : "s"}).`,
      });
    }

    // Hard delete only if no order references exist
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true, softDeleted: false });
  } catch (error) {
    console.error("DELETE /api/admin/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

