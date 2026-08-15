"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { ProductItem } from "./ProductCard";

interface ProductDetailModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  quantity?: number;
  onUpdateQuantity?: (product: ProductItem, quantity: number) => void;
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  quantity = 0,
  onUpdateQuantity,
}: ProductDetailModalProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAdd = () => {
    if (isOutOfStock) return;
    if (onUpdateQuantity) {
      onUpdateQuantity(product, 1);
    }
  };

  const handleIncrement = () => {
    if (quantity >= product.stock) return;
    if (onUpdateQuantity) {
      onUpdateQuantity(product, quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (onUpdateQuantity) {
      onUpdateQuantity(product, Math.max(0, quantity - 1));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn">
      {/* Backdrop overlay touch to close */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Close overlay"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl p-5 shadow-2xl z-10 border-t border-zinc-200 dark:border-zinc-800 max-h-[85vh] overflow-y-auto no-scrollbar animate-slideUp">
        {/* Top Handle Indicator */}
        <div className="w-12 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 text-sm font-bold transition-colors"
        >
          ✕
        </button>

        {/* Image Display */}
        <div className="relative aspect-4/3 w-full rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden mb-4">
          {product.imageUrl && !imageError ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              sizes="(max-width: 640px) 100vw, 400px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              📦
            </div>
          )}

          {/* Stock Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {isOutOfStock ? (
              <span className="px-3 py-1 rounded-lg bg-rose-500 text-white text-xs font-bold shadow-md">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="px-3 py-1 rounded-lg bg-amber-500 text-white text-xs font-bold shadow-md">
                Only {product.stock} Left!
              </span>
            ) : (
              <span className="px-3 py-1 rounded-lg bg-emerald-500 text-white text-xs font-bold shadow-md">
                In Stock ({product.stock})
              </span>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-3">
          <div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {product.category?.name || "Grocery"}
            </span>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {product.name}
            </h2>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
              Unit: {product.unitDisplay}
            </p>
          </div>

          <div className="flex items-baseline gap-1 py-1">
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">₹</span>
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {product.price}
            </span>
            <span className="text-xs text-zinc-400 ml-2">Inclusive of all taxes</span>
          </div>

          {/* Description */}
          {product.description && (
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3.5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800">
              <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Product Details
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Delivery Note */}
          <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/50 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs">
            <span>⚡</span>
            <span>Instant 10-15 Min delivery to VIT Bhopal off-campus flats & rooms.</span>
          </div>

          {/* Footer Action Button */}
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-400">Total Price</span>
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                ₹{quantity > 0 ? (product.price * quantity).toFixed(2) : product.price}
              </span>
            </div>

            {isOutOfStock ? (
              <button
                disabled
                className="w-full py-3 rounded-2xl bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 text-xs font-bold cursor-not-allowed"
              >
                Currently Out of Stock
              </button>
            ) : quantity > 0 ? (
              <div className="flex items-center justify-between bg-emerald-600 dark:bg-emerald-500 text-white rounded-2xl px-4 py-2.5 shadow-md flex-1">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="w-8 h-8 flex items-center justify-center font-bold text-lg hover:bg-emerald-700 rounded-xl transition-colors"
                >
                  -
                </button>
                <span className="text-sm font-bold">{quantity} in cart</span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={quantity >= product.stock}
                  className="w-8 h-8 flex items-center justify-center font-bold text-lg hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-40"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition-colors"
              >
                Add to Cart • ₹{product.price}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
