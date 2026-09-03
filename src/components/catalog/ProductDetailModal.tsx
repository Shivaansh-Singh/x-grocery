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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs transition-opacity duration-200">
      {/* Backdrop overlay touch to close */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Close overlay"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-white border-t border-[#111111] rounded-t-xl p-5 shadow-2xl z-10 max-h-[85vh] overflow-y-auto no-scrollbar text-[#111111]">
        {/* Top Handle Indicator */}
        <div className="w-12 h-1 bg-[#E5E5E5] rounded-full mx-auto mb-4" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#666666] hover:text-[#111111] text-sm font-bold transition-colors border border-[#E5E5E5]"
        >
          ✕
        </button>

        {/* Image Display */}
        <div className="relative aspect-4/3 w-full rounded-lg bg-[#F5F5F5] border border-[#E5E5E5] overflow-hidden mb-4 p-2 flex items-center justify-center">
          {product.imageUrl && !imageError ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              unoptimized
              className="object-contain p-2"
              onError={() => setImageError(true)}
              sizes="(max-width: 640px) 100vw, 400px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#666666]">
              <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}

          {/* Stock Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {isOutOfStock ? (
              <span className="px-3 py-1 rounded bg-[#D92D3A] text-white text-xs font-black uppercase">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="px-3 py-1 rounded bg-[#111111] text-[#DFFF00] text-xs font-black border border-[#111111]">
                Only {product.stock} Left!
              </span>
            ) : (
              <span className="px-3 py-1 rounded bg-[#168A55] text-white text-xs font-black">
                In Stock ({product.stock})
              </span>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-3">
          <div>
            <span className="text-xs font-bold text-[#666666] uppercase tracking-wider">
              {product.category?.name || "Grocery"}
            </span>
            <h2 className="font-extrabold text-lg text-[#111111] mt-0.5">
              {product.name}
            </h2>
            <p className="text-xs font-medium text-[#666666] mt-0.5">
              Unit: {product.unitDisplay}
            </p>
          </div>

          <div className="flex items-baseline gap-1 py-1">
            <span className="text-sm font-bold text-[#111111]">₹</span>
            <span className="text-2xl font-black text-[#111111]">
              {product.price}
            </span>
            <span className="text-xs text-[#666666] ml-2">Inclusive of all taxes</span>
          </div>

          {/* Description */}
          {product.description && (
            <div className="bg-[#F5F5F5] p-3.5 rounded-lg border border-[#E5E5E5]">
              <h4 className="font-extrabold text-xs text-[#111111] mb-1">
                Product Details
              </h4>
              <p className="text-xs text-[#666666] leading-relaxed font-medium">
                {product.description}
              </p>
            </div>
          )}

          {/* Delivery Note */}
          <div className="flex items-center gap-2 p-3 bg-[#000000] text-white rounded-lg border border-[#111111] text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-[#DFFF00] shrink-0"></span>
            <span>Instant 10-Min delivery to your doorstep.</span>
          </div>

          {/* Footer Action Button */}
          <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-[#666666] font-bold">Total Price</span>
              <span className="text-lg font-black text-[#111111]">
                ₹{quantity > 0 ? (product.price * quantity).toFixed(2) : product.price}
              </span>
            </div>

            {isOutOfStock ? (
              <button
                disabled
                className="w-full py-3 rounded bg-[#F5F5F5] text-[#666666] text-xs font-bold cursor-not-allowed border border-[#E5E5E5]"
              >
                Currently Out of Stock
              </button>
            ) : quantity > 0 ? (
              <div className="flex items-center justify-between bg-[#111111] text-white rounded px-4 py-2.5 flex-1 border border-[#111111]">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="w-8 h-8 flex items-center justify-center font-extrabold text-lg hover:text-[#DFFF00] transition-colors"
                >
                  -
                </button>
                <span className="text-sm font-extrabold text-[#DFFF00]">{quantity} in cart</span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={quantity >= product.stock}
                  className="w-8 h-8 flex items-center justify-center font-extrabold text-lg hover:text-[#DFFF00] transition-colors disabled:opacity-40"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 py-3 rounded bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] text-xs font-black border border-[#111111] transition-colors"
              >
                ADD TO CART • ₹{product.price}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
