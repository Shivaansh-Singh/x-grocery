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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-300">
      {/* Backdrop overlay touch to close */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Close overlay"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-[#FFFFFF] rounded-t-3xl p-5 shadow-2xl z-10 border-t border-[#D9D7D2] max-h-[85vh] overflow-y-auto no-scrollbar">
        {/* Top Handle Indicator */}
        <div className="w-12 h-1 bg-[#D9D7D2] rounded-full mx-auto mb-4" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#ECEAE5] flex items-center justify-center text-[#666A70] hover:text-[#111315] text-sm font-bold transition-colors"
        >
          ✕
        </button>

        {/* Image Display */}
        <div className="relative aspect-4/3 w-full rounded-2xl bg-[#ECEAE5] overflow-hidden mb-4">
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
            <div className="w-full h-full flex items-center justify-center text-[#666A70]">
              <svg className="w-12 h-12 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}

          {/* Stock Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {isOutOfStock ? (
              <span className="px-3 py-1 rounded-lg bg-[#C63D3D] text-white text-xs font-bold shadow-2xs">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="px-3 py-1 rounded-lg bg-[#D9822B] text-white text-xs font-bold shadow-2xs">
                Only {product.stock} Left!
              </span>
            ) : (
              <span className="px-3 py-1 rounded-lg bg-[#168A5B] text-white text-xs font-bold shadow-2xs">
                In Stock ({product.stock})
              </span>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-3">
          <div>
            <span className="text-xs font-semibold text-[#FF5A1F]">
              {product.category?.name || "Grocery"}
            </span>
            <h2 className="text-lg font-bold text-[#111315] mt-0.5">
              {product.name}
            </h2>
            <p className="text-xs font-medium text-[#666A70] mt-0.5">
              Unit: {product.unitDisplay}
            </p>
          </div>

          <div className="flex items-baseline gap-1 py-1">
            <span className="text-sm font-semibold text-[#FF5A1F]">₹</span>
            <span className="text-2xl font-black text-[#111315]">
              {product.price}
            </span>
            <span className="text-xs text-[#666A70] ml-2">Inclusive of all taxes</span>
          </div>

          {/* Description */}
          {product.description && (
            <div className="bg-[#F5F3EE] p-3.5 rounded-2xl border border-[#D9D7D2]">
              <h4 className="text-xs font-bold text-[#111315] mb-1">
                Product Details
              </h4>
              <p className="text-xs text-[#666A70] leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Delivery Note */}
          <div className="flex items-center gap-2 p-3 bg-[#F5F3EE] rounded-2xl border border-[#D9D7D2] text-[#111315] text-xs">
            <span className="w-2 h-2 rounded-full bg-[#168A5B] shrink-0"></span>
            <span>Fast 10-15 Min delivery to VIT Bhopal off-campus flats & rooms.</span>
          </div>

          {/* Footer Action Button */}
          <div className="pt-3 border-t border-[#D9D7D2] flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-[#666A70]">Total Price</span>
              <span className="text-lg font-bold text-[#111315]">
                ₹{quantity > 0 ? (product.price * quantity).toFixed(2) : product.price}
              </span>
            </div>

            {isOutOfStock ? (
              <button
                disabled
                className="w-full py-3 rounded-xl bg-[#ECEAE5] text-[#666A70] text-xs font-bold cursor-not-allowed"
              >
                Currently Out of Stock
              </button>
            ) : quantity > 0 ? (
              <div className="flex items-center justify-between bg-[#FF5A1F] text-white rounded-xl px-4 py-2.5 shadow-2xs flex-1">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="w-8 h-8 flex items-center justify-center font-bold text-lg hover:bg-black/20 rounded-lg transition-colors"
                >
                  -
                </button>
                <span className="text-sm font-bold">{quantity} in cart</span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={quantity >= product.stock}
                  className="w-8 h-8 flex items-center justify-center font-bold text-lg hover:bg-black/20 rounded-lg transition-colors disabled:opacity-40"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 py-3 rounded-xl bg-[#FF5A1F] hover:bg-[#111315] text-white text-xs font-bold shadow-2xs transition-colors"
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
