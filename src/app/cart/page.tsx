"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/components/providers/CartProvider";

export default function CartPage() {
  const { items, itemCount, subtotal, deliveryFee, totalAmount, updateQuantity, removeItem, clearCart } =
    useCart();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const freeDeliveryThreshold = 199;
  const amountForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  if (itemCount === 0) {
    return (
      <div className="space-y-6 pt-6 text-center">
        <div className="bg-[#151B24] rounded-2xl p-8 border border-[#27313D] shadow-md space-y-4 max-w-md mx-auto text-white">
          <div className="w-14 h-14 rounded-full bg-[#1C2430] text-[#FF5A00] flex items-center justify-center mx-auto border border-[#27313D]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#FFFFFF]">
              Your cart is empty
            </h2>
            <p className="text-xs text-[#A8B0BC] mt-1 max-w-xs mx-auto">
              Add your daily essentials, snacks or drinks to get started.
            </p>
          </div>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[#FF5A00] hover:bg-[#FF6A1A] text-white rounded-xl font-bold text-xs transition-colors shadow-sm"
          >
            Start Shopping RushD
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#FFFFFF] tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs text-[#A8B0BC]">
            {itemCount} {itemCount === 1 ? "item" : "items"} in cart
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-[#FF4D4D] font-bold hover:underline"
        >
          Clear All
        </button>
      </div>

      {/* Free Delivery Progress Bar */}
      <div className="bg-[#151B24] p-4 rounded-2xl border border-[#27313D] shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span>
            {amountForFreeDelivery === 0 ? (
              <span className="text-[#19B978]">⚡ FREE Delivery Unlocked!</span>
            ) : (
              <span>Add <strong className="text-[#FF5A00]">₹{amountForFreeDelivery.toFixed(0)}</strong> more for FREE Delivery</span>
            )}
          </span>
          <span className="text-[#A8B0BC]">{freeDeliveryProgress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-[#1C2430] h-2 rounded-full overflow-hidden border border-[#27313D]">
          <div
            className="bg-[#19B978] h-full transition-all duration-300 rounded-full"
            style={{ width: `${freeDeliveryProgress}%` }}
          />
        </div>
      </div>

      {/* Itemized Cart List */}
      <div className="space-y-2.5">
        {items.map(({ product, quantity }) => (
          <div
            key={product.id}
            className="bg-[#151B24] p-3 rounded-2xl border border-[#27313D] shadow-sm flex items-center justify-between gap-3"
          >
            {/* Product Image */}
            <div className="w-14 h-14 rounded-xl bg-[#1C2430] relative overflow-hidden shrink-0 flex items-center justify-center p-1">
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
                <div className="w-full h-full flex items-center justify-center text-[#737D8B]">
                  <svg className="w-6 h-6 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              )}
            </div>

            {/* Title & Price */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-xs text-[#FFFFFF] truncate">
                {product.name}
              </h3>
              <p className="text-[11px] text-[#A8B0BC] mt-0.5">
                {product.unitDisplay} • ₹{product.price}
              </p>
              <span className="text-xs font-bold text-[#FF5A00] block mt-1">
                Subtotal: ₹{(product.price * quantity).toFixed(0)}
              </span>
            </div>

            {/* Stepper & Remove */}
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-2 bg-[#FF5A00] text-white rounded-xl px-2 py-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="w-5 h-5 flex items-center justify-center font-bold text-sm hover:bg-black/20 rounded-md transition-colors"
                >
                  -
                </button>
                <span className="text-xs font-extrabold w-4 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  disabled={quantity >= product.stock}
                  className="w-5 h-5 flex items-center justify-center font-bold text-sm hover:bg-black/20 rounded-md transition-colors disabled:opacity-40"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeItem(product.id)}
                className="text-[10px] text-[#737D8B] hover:text-[#FF4D4D] transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bill Details Summary */}
      <div className="bg-[#151B24] p-4 rounded-2xl border border-[#27313D] shadow-sm space-y-3">
        <h3 className="font-bold text-xs text-[#FFFFFF] uppercase tracking-wider">
          Bill Details
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-[#A8B0BC]">
            <span>Item Total</span>
            <span className="font-semibold text-[#FFFFFF]">₹{subtotal.toFixed(0)}</span>
          </div>

          <div className="flex items-center justify-between text-[#A8B0BC]">
            <span>Delivery Fee</span>
            <span>
              {deliveryFee === 0 ? (
                <span className="font-bold text-[#19B978]">FREE</span>
              ) : (
                <span className="font-medium text-[#FFFFFF]">₹15</span>
              )}
            </span>
          </div>

          <div className="border-t border-[#27313D] pt-2 flex items-center justify-between font-extrabold text-sm text-[#FFFFFF]">
            <span>To Pay</span>
            <span className="text-[#FF5A00] text-base">₹{totalAmount.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Checkout Action Button */}
      <div className="pt-2">
        <Link
          href="/cart/checkout"
          className="w-full py-3.5 bg-[#FF5A00] hover:bg-[#FF6A1A] text-white rounded-xl font-extrabold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <span>Proceed to Checkout • ₹{totalAmount.toFixed(0)}</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
