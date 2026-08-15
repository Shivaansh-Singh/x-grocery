"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { OffCampusAddressForm, AddressDetails } from "@/components/checkout/OffCampusAddressForm";
import { PaymentMethodSelector, PaymentChoice } from "@/components/checkout/PaymentMethodSelector";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, itemCount, subtotal, deliveryFee, totalAmount, clearCart } = useCart();

  const [address, setAddress] = useState<AddressDetails>({
    buildingColony: "Royal City Flats, Block B",
    flatRoomNo: "",
    landmark: "Near VIT Bhopal Main Gate Area",
    phone: "+91 ",
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentChoice>("COD");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (itemCount === 0) {
    return (
      <div className="space-y-6 pt-6 text-center">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <span className="text-4xl block">🛒</span>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            No items in cart for checkout
          </h2>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Please add grocery items to your cart before proceeding to checkout.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!address.flatRoomNo.trim()) {
      setErrorMessage("Please enter your Flat or Room Number");
      return;
    }

    if (!address.phone.trim() || address.phone.trim().length < 8) {
      setErrorMessage("Please enter a valid contact phone number");
      return;
    }

    setSubmitting(true);

    try {
      const formattedAddress = `${address.flatRoomNo}, ${address.buildingColony}${
        address.landmark ? ` (Landmark: ${address.landmark})` : ""
      } • Phone: ${address.phone}`;

      // Prepare frozen item snapshots
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        unitPrice: item.product.price,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity,
      }));

      // Submit Order API
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: user?.id || "guest-user-session",
          deliveryAddress: formattedAddress,
          paymentMethod,
          items: orderItems,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Order placement failed");
      }

      // Save order to localStorage backup for tracking fallback
      if (data.order) {
        localStorage.setItem("x_grocery_last_order", JSON.stringify(data.order));
      }

      // Clear cart & navigate to live tracking
      clearCart();
      const targetOrderId = data.order?.id || "latest";
      router.push(`/orders/${targetOrderId}?newOrder=true`);
    } catch (err) {
      console.error("Order submission error:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to place order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handlePlaceOrder} className="space-y-4 pb-6 pt-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Off-Campus Checkout
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Store X Local Instant Grocery Delivery
          </p>
        </div>
        <Link href="/cart" className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
          ← Back to Cart
        </Link>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/60 dark:border-rose-900 dark:text-rose-300 rounded-2xl text-xs font-semibold">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Step 1: Off-Campus Delivery Address */}
      <OffCampusAddressForm initialAddress={address} onChange={setAddress} />

      {/* Step 2: Payment Method Radio Cards */}
      <PaymentMethodSelector selectedMethod={paymentMethod} onChange={setPaymentMethod} />

      {/* Step 3: Order Summary & Bill Breakdown */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
        <h3 className="font-bold text-xs text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
          Order Summary ({itemCount} {itemCount === 1 ? "Item" : "Items"})
        </h3>

        {/* Item thumbnails row */}
        <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/60 p-2 rounded-xl border border-zinc-200/60 dark:border-zinc-800 text-xs shrink-0"
            >
              <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[120px]">
                {product.name}
              </span>
              <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded-md text-[10px]">
                x{quantity}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-2 text-xs">
          <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
            <span>Items Subtotal</span>
            <span>₹{subtotal.toFixed(0)}</span>
          </div>

          <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
            <span>Delivery Fee</span>
            <span>
              {deliveryFee === 0 ? (
                <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
              ) : (
                <span>₹15</span>
              )}
            </span>
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2 flex items-center justify-between font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
            <span>Total Payable</span>
            <span className="text-emerald-600 dark:text-emerald-400 text-base">
              ₹{totalAmount.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* Place Order Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <span>Placing Order...</span>
          ) : (
            <>
              <span>
                Place Order ({paymentMethod === "COD" ? "Cash on Delivery" : "UPI on Delivery"})
              </span>
              <span>• ₹{totalAmount.toFixed(0)} →</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
