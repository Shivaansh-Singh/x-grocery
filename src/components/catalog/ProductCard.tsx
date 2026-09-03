"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/components/providers/CartProvider";

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
  quantity,
  onUpdateQuantity,
  onSelectProduct,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const { getQuantity, updateQuantity } = useCart();

  const currentQty = quantity !== undefined ? quantity : getQuantity(product.id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    if (onUpdateQuantity) {
      onUpdateQuantity(product, 1);
    } else {
      updateQuantity(product, 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentQty >= product.stock) return;
    if (onUpdateQuantity) {
      onUpdateQuantity(product, currentQty + 1);
    } else {
      updateQuantity(product, currentQty + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateQuantity) {
      onUpdateQuantity(product, Math.max(0, currentQty - 1));
    } else {
      updateQuantity(product, Math.max(0, currentQty - 1));
    }
  };

  return (
    <div
      onClick={() => onSelectProduct && onSelectProduct(product)}
      className="bg-white rounded-lg border border-[#E5E5E5] p-3 hover:border-[#111111] transition-all duration-150 flex flex-col justify-between cursor-pointer group relative"
    >

      {/* Image & Stock Badges Container */}
      <div className="relative aspect-square w-full rounded-md bg-[#F5F5F5] overflow-hidden mb-2.5 flex items-center justify-center p-2 border border-[#E5E5E5]">
        {product.imageUrl && !imageError ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            unoptimized
            className="object-contain group-hover:scale-105 transition-transform duration-200 p-1"
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 50vw, 200px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#666666]">
            <svg className="w-8 h-8 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}

        {/* Stock Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {isOutOfStock && (
            <span className="px-2 py-0.5 rounded bg-[#D92D3A] text-white text-[10px] font-black uppercase tracking-wide">
              Out of Stock
            </span>
          )}
          {isLowStock && (
            <span className="px-2 py-0.5 rounded bg-[#111111] text-[#DFFF00] text-[10px] font-black border border-[#111111]">
              {product.stock} Left!
            </span>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-[#666666] uppercase tracking-wider block truncate">
            {product.category?.name || "Grocery"}
          </span>
          <h3 className="font-extrabold text-xs text-[#111111] line-clamp-2 leading-snug mt-0.5 group-hover:text-[#000000] transition-colors">
            {product.name}
          </h3>
          <p className="text-[11px] text-[#666666] mt-0.5 font-medium">
            {product.unitDisplay}
          </p>
        </div>

        {/* Price & Action Button */}
        <div className="mt-2.5 pt-2 border-t border-[#E5E5E5] flex items-center justify-between gap-1">
          <div className="flex items-baseline gap-0.5">
            <span className="text-xs font-bold text-[#111111]">₹</span>
            <span className="text-base font-black text-[#111111]">
              {product.price}
            </span>
          </div>

          {/* Stepper / Add Button */}
          {isOutOfStock ? (
            <button
              disabled
              className="px-3 py-1.5 rounded bg-[#F5F5F5] text-[#666666] text-xs font-bold cursor-not-allowed border border-[#E5E5E5]"
            >
              Sold Out
            </button>
          ) : currentQty > 0 ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 bg-[#111111] text-white rounded px-2 py-1 border border-[#111111]"
            >
              <button
                type="button"
                onClick={handleDecrement}
                className="w-5 h-5 flex items-center justify-center font-bold text-sm hover:text-[#DFFF00] transition-colors"
              >
                -
              </button>
              <span className="text-xs font-extrabold w-4 text-center text-[#DFFF00]">{currentQty}</span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={currentQty >= product.stock}
                className="w-5 h-5 flex items-center justify-center font-bold text-sm hover:text-[#DFFF00] transition-colors disabled:opacity-40"
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className="px-3.5 py-1.5 rounded bg-[#111111] hover:bg-[#DFFF00] hover:text-[#000000] text-white text-xs font-extrabold tracking-wide transition-colors border border-[#111111]"
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
