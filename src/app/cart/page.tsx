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
        <div className="bg-[#FFFFFF] rounded-2xl p-8 border border-[#D9D7D2] shadow-2xs space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-[#ECEAE5] text-[#111315] flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-[#666A70]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#111315]">
              Your cart is empty
            </h2>
            <p className="text-xs text-[#666A70] mt-1 max-w-xs mx-auto">
              Add your daily essentials, snacks or drinks to get started.
            </p>
          </div>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[#FF5A1F] hover:bg-[#111315] text-white rounded-xl font-bold text-xs transition-colors shadow-2xs"
          >
            Start Shopping RushD
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#111315]">
            Shopping Cart
          </h1>
          <p className="text-xs text-[#666A70]">
            {itemCount} {itemCount === 1 ? "item" : "items"} in cart
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-[#C63D3D] font-medium hover:underline"
        >
          Clear All
        </button>
      </div>

      {/* Free Delivery Progress Bar */}
      <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#D9D7D2] shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span>
            {amountForFreeDelivery === 0 ? (
              <span className="text-[#168A5B]">FREE Delivery Unlocked!</span>
            ) : (
              <span>Add <strong className="text-[#FF5A1F]">₹{amountForFreeDelivery.toFixed(0)}</strong> more for FREE Delivery</span>
            )}
          </span>
          <span className="text-[#666A70]">{freeDeliveryProgress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-[#F5F3EE] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#168A5B] h-full transition-all duration-300 rounded-full"
            style={{ width: `${freeDeliveryProgress}%` }}
          />
        </div>
      </div>

      {/* Itemized Cart List */}
      <div className="space-y-2">
        {items.map(({ product, quantity }) => (
          <div
            key={product.id}
            className="bg-[#FFFFFF] p-3 rounded-2xl border border-[#D9D7D2] shadow-2xs flex items-center justify-between gap-3"
          >
            {/* Product Image */}
            <div className="w-14 h-14 rounded-xl bg-[#ECEAE5] relative overflow-hidden shrink-0">
              {product.imageUrl && !imageErrors[product.id] ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onError={() => setImageErrors((prev) => ({ ...prev, [product.id]: true }))}
                  sizes="60px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#666A70]">
                  <svg className="w-6 h-6 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              )}
            </div>

            {/* Title & Price */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xs text-[#111315] truncate">
                {product.name}
              </h3>
              <p className="text-[11px] text-[#666A70] mt-0.5">
                {product.unitDisplay} • ₹{product.price}
              </p>
              <span className="text-xs font-bold text-[#FF5A1F] block mt-1">
                Subtotal: ₹{(product.price * quantity).toFixed(0)}
              </span>
            </div>

            {/* Stepper & Remove */}
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-2 bg-[#FF5A1F] text-white rounded-xl px-2 py-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="w-5 h-5 flex items-center justify-center font-bold text-sm hover:bg-black/20 rounded-md transition-colors"
                >
                  -
                </button>
                <span className="text-xs font-bold w-4 text-center">{quantity}</span>
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
                className="text-[10px] text-[#666A70] hover:text-[#C63D3D] transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bill Details Summary */}
      <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#D9D7D2] shadow-2xs space-y-3">
        <h3 className="font-bold text-xs text-[#111315] uppercase tracking-wider">
          Bill Details
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-[#666A70]">
            <span>Item Total</span>
            <span className="font-medium text-[#111315]">₹{subtotal.toFixed(0)}</span>
          </div>

          <div className="flex items-center justify-between text-[#666A70]">
            <span>Delivery Fee</span>
            <span>
              {deliveryFee === 0 ? (
                <span className="font-bold text-[#168A5B]">FREE</span>
              ) : (
                <span className="font-medium text-[#111315]">₹15</span>
              )}
            </span>
          </div>

          <div className="border-t border-[#D9D7D2] pt-2 flex items-center justify-between font-bold text-sm text-[#111315]">
            <span>To Pay</span>
            <span className="text-[#FF5A1F]">₹{totalAmount.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Checkout Action Button */}
      <div className="pt-2">
        <Link
          href="/cart/checkout"
          className="w-full py-3.5 bg-[#FF5A1F] hover:bg-[#111315] text-white rounded-xl font-bold text-xs shadow-2xs transition-colors flex items-center justify-center gap-2"
        >
          <span>Proceed to Checkout • ₹{totalAmount.toFixed(0)}</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
