"use client";

import Image from "next/image";
import { useState } from "react";

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  unitDisplay: string;
  unit?: string;
  stock: number;
  categoryId?: string;
  isActive?: boolean;
  isAvailable?: boolean;
  category?: {
    id?: string;
    name: string;
    slug: string;
  };
}

interface ProductCardProps {
  product: ProductItem;
  quantity?: number;
  onUpdateQuantity?: (product: ProductItem, quantity: number) => void;
  onSelectProduct?: (product: ProductItem) => void;
}

export function ProductCard({
  product,
  quantity = 0,
  onUpdateQuantity,
  onSelectProduct,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    if (onUpdateQuantity) {
      onUpdateQuantity(product, 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity >= product.stock) return;
    if (onUpdateQuantity) {
      onUpdateQuantity(product, quantity + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateQuantity) {
      onUpdateQuantity(product, Math.max(0, quantity - 1));
    }
  };

  return (
    <div
      onClick={() => onSelectProduct && onSelectProduct(product)}
      className="bg-[#141822] rounded-2xl border border-white/8 p-3 shadow-md hover:border-[#2D6CFF]/50 hover:shadow-[0_0_16px_rgba(45,108,255,0.15)] transition-all duration-200 flex flex-col justify-between cursor-pointer group relative"
    >
      {/* Image & Stock Badges Container */}
      <div className="relative aspect-square w-full rounded-xl bg-[#1A1F2C] overflow-hidden mb-2.5 flex items-center justify-center p-2">
        {product.imageUrl && !imageError ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            unoptimized
            className="object-contain group-hover:scale-105 transition-transform duration-300 p-1"
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 50vw, 200px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#8A90A3]">
            <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}

        {/* Stock Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {isOutOfStock && (
            <span className="px-2 py-0.5 rounded-md bg-[#FF4D4D] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
              Out of Stock
            </span>
          )}
          {isLowStock && (
            <span className="px-2 py-0.5 rounded-md bg-[#FF6B1A] text-white text-[10px] font-extrabold shadow-xs">
              {product.stock} Left!
            </span>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-black text-[#2D6CFF] uppercase tracking-wider block truncate">
            {product.category?.name || "Grocery"}
          </span>
          <h3 className="font-semibold text-xs text-[#F5F6FA] line-clamp-2 leading-snug mt-0.5 group-hover:text-[#FF6B1A] transition-colors">
            {product.name}
          </h3>
          <p className="text-[11px] text-[#8A90A3] mt-1 font-medium">
            {product.unitDisplay}
          </p>
        </div>

        {/* Price & Action Button */}
        <div className="mt-3 pt-2 border-t border-white/8 flex items-center justify-between gap-1">
          <div className="flex items-baseline gap-0.5">
            <span className="text-xs font-bold text-[#FF6B1A]">₹</span>
            <span className="text-base font-black text-[#F5F6FA]">
              {product.price}
            </span>
          </div>

          {/* Stepper / Add Button */}
          {isOutOfStock ? (
            <button
              disabled
              className="px-3 py-1.5 rounded-xl bg-[#1A1F2C] text-[#8A90A3] text-xs font-semibold cursor-not-allowed border border-white/8"
            >
              Sold Out
            </button>
          ) : quantity > 0 ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] text-white rounded-xl px-2 py-1 shadow-sm"
            >
              <button
                type="button"
                onClick={handleDecrement}
                className="w-5 h-5 flex items-center justify-center font-bold text-sm hover:bg-black/20 rounded-md transition-colors"
              >
                -
              </button>
              <span className="text-xs font-black w-4 text-center">{quantity}</span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={quantity >= product.stock}
                className="w-5 h-5 flex items-center justify-center font-bold text-sm hover:bg-black/20 rounded-md transition-colors disabled:opacity-40"
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] hover:opacity-90 active:scale-95 text-white text-xs font-black tracking-wide transition-all shadow-sm"
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
