"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { OffCampusAddressForm, AddressDetails } from "@/components/checkout/OffCampusAddressForm";
import { PaymentMethodSelector, PaymentChoice } from "@/components/checkout/PaymentMethodSelector";
import { addLocalOrder } from "@/lib/orderSync";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, itemCount, subtotal, deliveryFee, totalAmount, clearCart } = useCart();

  const [address, setAddress] = useState<AddressDetails>({
    buildingColony: "Royal City Flats, Block B",
    flatRoomNo: "",
    landmark: "Near Main Gate Area",
    phone: "+91 ",
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentChoice>("COD");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (itemCount === 0) {
    return (
      <div className="space-y-6 pt-6 text-center">
        <div className="glass-card rounded-[24px] p-8 border border-white/8 shadow-xl space-y-4 max-w-md mx-auto text-[#F5F6FA]">
          <h2 className="font-display font-black text-lg text-[#F5F6FA]">
            No items in cart for checkout
          </h2>
          <p className="text-xs text-[#8A90A3] max-w-xs mx-auto">
            Please add grocery items to your cart before proceeding to checkout.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] hover:opacity-90 text-white rounded-xl font-extrabold text-xs shadow-md transition-all"
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

      // Save order to localStorage backup for tracking and immediate Admin/Rider board visibility
      if (data.order) {
        addLocalOrder(data.order);
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
    <form onSubmit={handlePlaceOrder} className="space-y-4 pb-6 pt-1 text-[#F5F6FA]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/8 pb-2.5">
        <div>
          <h1 className="font-display font-black text-xl text-[#F5F6FA] tracking-tight">
            Off-Campus Checkout
          </h1>
          <p className="text-xs text-[#8A90A3]">
            RushD Express Delivery
          </p>
        </div>
        <Link href="/cart" className="text-xs font-bold text-[#FF6B1A] hover:underline">
          ← Back to Cart
        </Link>
      </div>

      {errorMessage && (
        <div className="p-3.5 glass-card border border-[#FF4D4D] text-[#FF4D4D] rounded-2xl text-xs font-bold">
          {errorMessage}
        </div>
      )}

      {/* Step 1: Off-Campus Delivery Address */}
      <OffCampusAddressForm initialAddress={address} onChange={setAddress} />

      {/* Step 2: Payment Method Radio Cards */}
      <PaymentMethodSelector selectedMethod={paymentMethod} onChange={setPaymentMethod} />

      {/* Step 3: Order Summary & Bill Breakdown */}
      <div className="glass-card p-4 rounded-2xl border border-white/8 shadow-md space-y-3">
        <h3 className="font-display font-extrabold text-xs text-[#F5F6FA] uppercase tracking-wider">
          Order Summary ({itemCount} {itemCount === 1 ? "Item" : "Items"})
        </h3>

        {/* Item thumbnails row */}
        <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex items-center gap-2 bg-[#1A1F2C] p-2 rounded-xl border border-white/8 text-xs shrink-0"
            >
              <span className="font-semibold text-[#F5F6FA] truncate max-w-[120px]">
                {product.name}
              </span>
              <span className="bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] text-white font-extrabold px-1.5 py-0.5 rounded text-[10px]">
                x{quantity}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-white/8 pt-3 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[#8A90A3]">
            <span>Items Subtotal</span>
            <span className="font-semibold text-[#F5F6FA]">₹{subtotal.toFixed(0)}</span>
          </div>

          <div className="flex items-center justify-between text-[#8A90A3]">
            <span>Delivery Fee</span>
            <span>
              {deliveryFee === 0 ? (
                <span className="font-bold text-[#2D6CFF]">FREE</span>
              ) : (
                <span>₹15</span>
              )}
            </span>
          </div>

          <div className="border-t border-white/8 pt-2 flex items-center justify-between font-extrabold text-sm text-[#F5F6FA]">
            <span>Total Payable</span>
            <span className="text-[#FF6B1A] text-base">
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
          className="w-full py-3.5 bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] hover:opacity-90 text-white rounded-xl font-extrabold text-xs shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
