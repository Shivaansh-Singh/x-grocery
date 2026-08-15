"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { appConfig } from "@/config/app.config";

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
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl mx-auto">
            🛒
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Your cart is empty
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
              Looks like you haven&apos;t added any groceries to your cart yet.
            </p>
          </div>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md transition-colors"
          >
            Start Shopping Store X
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
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Shopping Cart
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {itemCount} {itemCount === 1 ? "item" : "items"} from {appConfig.defaultStoreName}
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-600 dark:text-rose-400 font-medium hover:underline"
        >
          Clear All
        </button>
      </div>

      {/* Free Delivery Progress Bar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span>
            {amountForFreeDelivery === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400">🎉 FREE Delivery Unlocked!</span>
            ) : (
              <span>Add <strong className="text-emerald-600">₹{amountForFreeDelivery.toFixed(0)}</strong> more for FREE Delivery</span>
            )}
          </span>
          <span className="text-zinc-400">{freeDeliveryProgress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${freeDeliveryProgress}%` }}
          />
        </div>
      </div>

      {/* Itemized Cart List */}
      <div className="space-y-2">
        {items.map(({ product, quantity }) => (
          <div
            key={product.id}
            className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs flex items-center justify-between gap-3"
          >
            {/* Product Image */}
            <div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden shrink-0">
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
                <div className="w-full h-full flex items-center justify-center text-xl">
                  📦
                </div>
              )}
            </div>

            {/* Title & Price */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                {product.name}
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                {product.unitDisplay} • ₹{product.price}
              </p>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mt-1">
                Subtotal: ₹{(product.price * quantity).toFixed(0)}
              </span>
            </div>

            {/* Stepper & Remove */}
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl px-2 py-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="w-5 h-5 flex items-center justify-center font-bold text-sm hover:bg-emerald-700 rounded-md transition-colors"
                >
                  -
                </button>
                <span className="text-xs font-bold w-4 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  disabled={quantity >= product.stock}
                  className="w-5 h-5 flex items-center justify-center font-bold text-sm hover:bg-emerald-700 rounded-md transition-colors disabled:opacity-40"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeItem(product.id)}
                className="text-[10px] text-zinc-400 hover:text-rose-500 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bill Details Summary */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
        <h3 className="font-bold text-xs text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
          Bill Details
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
            <span>Item Total</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">₹{subtotal.toFixed(0)}</span>
          </div>

          <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
            <span>Delivery Fee (Store X Local Rider)</span>
            <span>
              {deliveryFee === 0 ? (
                <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
              ) : (
                <span className="font-medium text-zinc-900 dark:text-zinc-100">₹15</span>
              )}
            </span>
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2 flex items-center justify-between font-bold text-sm text-zinc-900 dark:text-zinc-100">
            <span>To Pay</span>
            <span className="text-emerald-600 dark:text-emerald-400">₹{totalAmount.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Checkout Action Button */}
      <div className="pt-2">
        <Link
          href="/cart/checkout"
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
        >
          <span>Proceed to Checkout • ₹{totalAmount.toFixed(0)}</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
