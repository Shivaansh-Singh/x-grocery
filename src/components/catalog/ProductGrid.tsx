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
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-56 bg-zinc-200 dark:bg-zinc-800 rounded-2xl"
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 text-center space-y-3 my-4 shadow-xs">
        <span className="text-4xl block">🔍</span>
        <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
          No products found
        </h3>
        <p className="text-xs text-zinc-500 max-w-xs mx-auto">
          {searchQuery
            ? `We couldn't find any grocery items matching "${searchQuery}".`
            : "No active products in this category at Store X."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {products.map((product) => (
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
