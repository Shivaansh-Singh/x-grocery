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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 animate-pulse">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="h-56 bg-[#141822] border border-white/8 rounded-2xl"
          />
        ))}
      </div>
    );
  }

  if (safeProducts.length === 0) {
    return (
      <div className="bg-[#141822] rounded-2xl p-8 border border-white/8 text-center space-y-2 my-4 shadow-md">
        <h3 className="font-bold text-sm text-[#F5F6FA]">
          No products found
        </h3>
        <p className="text-xs text-[#8A90A3] max-w-xs mx-auto">
          {searchQuery
            ? `We couldn't find any items matching "${searchQuery}".`
            : "No active products in this category at RushD."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
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
