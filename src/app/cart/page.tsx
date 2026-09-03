"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { FREE_DELIVERY_THRESHOLD } from "@/lib/pricing";

export default function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    platformPackagingFee,
    totalAmount,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const freeDeliveryThreshold = FREE_DELIVERY_THRESHOLD;
  const amountForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  if (itemCount === 0) {
    return (
      <div className="space-y-6 pt-6 text-center text-[#111111]">
        <div className="bg-white border border-[#E5E5E5] rounded-lg p-8 space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-[#111111] text-[#DFFF00] flex items-center justify-center mx-auto border border-[#111111]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-[#111111]">
              Your cart is empty
            </h2>
            <p className="text-xs text-[#666666] mt-1 max-w-xs mx-auto font-medium">
              Add your daily essentials, snacks or drinks to get started.
            </p>
          </div>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] rounded font-black text-xs transition-colors border border-[#111111]"
          >
            Start Shopping RushD →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4 text-[#111111]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-extrabold text-xl text-[#111111] tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs text-[#666666] font-medium">
            {itemCount} {itemCount === 1 ? "item" : "items"} in cart
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-[#D92D3A] font-bold hover:underline"
        >
          Clear All
        </button>
      </div>

      {/* Free Delivery Progress Bar */}
      <div className="bg-white border border-[#E5E5E5] p-4 rounded-lg space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span>
            {amountForFreeDelivery === 0 ? (
              <span className="text-[#168A55] font-black">FREE Delivery Unlocked!</span>
            ) : (
              <span>Add <strong className="text-[#111111]">₹{amountForFreeDelivery.toFixed(0)}</strong> more for FREE Delivery</span>
            )}
          </span>
          <span className="text-[#666666]">{freeDeliveryProgress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-[#F5F5F5] h-2 rounded-full overflow-hidden border border-[#E5E5E5]">
          <div
            className="bg-[#DFFF00] h-full transition-all duration-300 rounded-full border-r border-[#111111]"
            style={{ width: `${freeDeliveryProgress}%` }}
          />
        </div>
      </div>

      {/* Itemized Cart List */}
      <div className="space-y-2.5">
        {items.map(({ product, quantity }) => (
          <div
            key={product.id}
            className="bg-white border border-[#E5E5E5] p-3.5 rounded-lg flex items-center justify-between gap-3"
          >
            {/* Product Image */}
            <div className="w-14 h-14 rounded bg-[#F5F5F5] border border-[#E5E5E5] relative overflow-hidden shrink-0 flex items-center justify-center p-1">
              {product.imageUrl && !imageErrors[product.id] ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  unoptimized
                  className="object-contain p-1"
                  onError={() => setImageErrors((prev) => ({ ...prev, [product.id]: true }))}
                  sizes="60px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#666666]">
                  <svg className="w-6 h-6 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              )}
            </div>

            {/* Title & Price */}
            <div className="flex-1 min-w-0">
              <h3 className="font-extrabold text-xs text-[#111111] truncate">
                {product.name}
              </h3>
              <p className="text-[11px] text-[#666666] mt-0.5 font-medium">
                {product.unitDisplay} • ₹{product.price}
              </p>
              <span className="text-xs font-black text-[#111111] block mt-1">
                Subtotal: ₹{(product.price * quantity).toFixed(0)}
              </span>
            </div>

            {/* Stepper & Remove */}
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-2 bg-[#111111] text-white rounded px-2 py-1 border border-[#111111]">
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="w-5 h-5 flex items-center justify-center font-bold text-sm hover:text-[#DFFF00] transition-colors"
                >
                  -
                </button>
                <span className="text-xs font-extrabold w-4 text-center text-[#DFFF00]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  disabled={quantity >= product.stock}
                  className="w-5 h-5 flex items-center justify-center font-bold text-sm hover:text-[#DFFF00] transition-colors disabled:opacity-40"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeItem(product.id)}
                className="text-[10px] text-[#666666] hover:text-[#D92D3A] transition-colors font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bill Details Summary */}
      <div className="bg-white border border-[#E5E5E5] p-4 rounded-lg space-y-3">
        <h3 className="font-extrabold text-xs text-[#111111] uppercase tracking-wider">
          Bill Details
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-[#666666]">
            <span>Item Total</span>
            <span className="font-bold text-[#111111]">₹{subtotal.toFixed(0)}</span>
          </div>

          <div className="flex items-center justify-between text-[#666666]">
            <span>Delivery Charge</span>
            <span>
              {deliveryFee === 0 ? (
                <span className="font-black text-[#168A55]">FREE (₹0)</span>
              ) : (
                <span className="font-bold text-[#111111]">₹{deliveryFee.toFixed(0)}</span>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between text-[#666666]">
            <span>Platform & Packaging Fee</span>
            <span className="font-bold text-[#111111]">₹{platformPackagingFee.toFixed(0)}</span>
          </div>

          <div className="border-t border-[#E5E5E5] pt-2 flex items-center justify-between font-extrabold text-sm text-[#111111]">
            <span>To Pay</span>
            <span className="text-[#111111] text-base font-black">₹{totalAmount.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Checkout Action Button */}
      <div className="pt-2">
        <Link
          href="/cart/checkout"
          className="w-full py-3.5 bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] rounded font-black text-xs transition-colors flex items-center justify-center gap-2 border border-[#111111]"
        >
          <span>PROCEED TO CHECKOUT • ₹{totalAmount.toFixed(0)}</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
