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
        <div className="bg-[#151B24] rounded-2xl p-8 border border-[#27313D] shadow-md space-y-4 max-w-md mx-auto text-white">
          <h2 className="text-lg font-bold text-[#FFFFFF]">
            No items in cart for checkout
          </h2>
          <p className="text-xs text-[#A8B0BC] max-w-xs mx-auto">
            Please add grocery items to your cart before proceeding to checkout.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[#FF5A00] hover:bg-[#FF6A1A] text-white rounded-xl font-bold text-xs shadow-sm transition-colors"
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
    <form onSubmit={handlePlaceOrder} className="space-y-4 pb-6 pt-1 text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#27313D] pb-2.5">
        <div>
          <h1 className="text-xl font-black text-[#FFFFFF] tracking-tight">
            Off-Campus Checkout
          </h1>
          <p className="text-xs text-[#A8B0BC]">
            RushD Express Delivery
          </p>
        </div>
        <Link href="/cart" className="text-xs font-bold text-[#FF5A00] hover:underline">
          ← Back to Cart
        </Link>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-[#151B24] border border-[#FF4D4D] text-[#FF4D4D] rounded-2xl text-xs font-bold">
          {errorMessage}
        </div>
      )}

      {/* Step 1: Off-Campus Delivery Address */}
      <OffCampusAddressForm initialAddress={address} onChange={setAddress} />

      {/* Step 2: Payment Method Radio Cards */}
      <PaymentMethodSelector selectedMethod={paymentMethod} onChange={setPaymentMethod} />

      {/* Step 3: Order Summary & Bill Breakdown */}
      <div className="bg-[#151B24] p-4 rounded-2xl border border-[#27313D] shadow-md space-y-3">
        <h3 className="font-extrabold text-xs text-[#FFFFFF] uppercase tracking-wider">
          Order Summary ({itemCount} {itemCount === 1 ? "Item" : "Items"})
        </h3>

        {/* Item thumbnails row */}
        <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex items-center gap-2 bg-[#1C2430] p-2 rounded-xl border border-[#27313D] text-xs shrink-0"
            >
              <span className="font-semibold text-[#FFFFFF] truncate max-w-[120px]">
                {product.name}
              </span>
              <span className="bg-[#FF5A00] text-white font-extrabold px-1.5 py-0.5 rounded text-[10px]">
                x{quantity}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-[#27313D] pt-3 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[#A8B0BC]">
            <span>Items Subtotal</span>
            <span className="font-semibold text-[#FFFFFF]">₹{subtotal.toFixed(0)}</span>
          </div>

          <div className="flex items-center justify-between text-[#A8B0BC]">
            <span>Delivery Fee</span>
            <span>
              {deliveryFee === 0 ? (
                <span className="font-bold text-[#19B978]">FREE</span>
              ) : (
                <span>₹15</span>
              )}
            </span>
          </div>

          <div className="border-t border-[#27313D] pt-2 flex items-center justify-between font-extrabold text-sm text-[#FFFFFF]">
            <span>Total Payable</span>
            <span className="text-[#FF5A00] text-base">
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
          className="w-full py-3.5 bg-[#FF5A00] hover:bg-[#FF6A1A] text-white rounded-xl font-extrabold text-xs shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
