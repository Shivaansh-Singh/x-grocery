"use client";

import { ProductCard, ProductItem } from "./ProductCard";

interface ProductGridProps {
  products: ProductItem[];
  loading?: boolean;
  cartQuantities?: Record<string, number>;
  onUpdateQuantity?: (product: ProductItem, quantity: number) => void;
  onSelectProduct?: (product: ProductItem) => void;
  searchQuery?: string;
}

export function ProductGrid({
  products,
  loading = false,
  cartQuantities = {},
  onUpdateQuantity,
  onSelectProduct,
  searchQuery = "",
}: ProductGridProps) {
  const safeProducts = Array.isArray(products) ? products : [];

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-56 bg-[#151B24] border border-[#27313D] rounded-2xl"
          />
        ))}
      </div>
    );
  }

  if (safeProducts.length === 0) {
    return (
      <div className="bg-[#151B24] rounded-2xl p-8 border border-[#27313D] text-center space-y-2 my-4 shadow-md">
        <h3 className="font-bold text-sm text-[#FFFFFF]">
          No products found
        </h3>
        <p className="text-xs text-[#A8B0BC] max-w-xs mx-auto">
          {searchQuery
            ? `We couldn't find any items matching "${searchQuery}".`
            : "No active products in this category at RushD."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {safeProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          quantity={cartQuantities[product.id] || 0}
          onUpdateQuantity={onUpdateQuantity}
          onSelectProduct={onSelectProduct}
        />
      ))}
    </div>
  );
}
