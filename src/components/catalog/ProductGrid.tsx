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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4.5 animate-pulse">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="h-56 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (safeProducts.length === 0) {
    return (
      <div className="bg-white border border-[#E5E5E5] rounded-lg p-8 text-center space-y-2 my-4">
        <h3 className="font-extrabold text-sm text-[#111111]">
          No products found
        </h3>
        <p className="text-xs text-[#666666] max-w-xs mx-auto font-medium">
          {searchQuery
            ? `We couldn't find any items matching "${searchQuery}".`
            : "No active products in this category at RushD."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4.5 items-stretch">
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
