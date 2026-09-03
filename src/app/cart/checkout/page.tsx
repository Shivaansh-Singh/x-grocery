"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { PaymentMethodSelector, PaymentChoice } from "@/components/checkout/PaymentMethodSelector";
import { addLocalOrder } from "@/lib/orderSync";
import { validateIndianMobileNumber, validateIndianPincode } from "@/lib/validation";
import type { SavedAddress } from "@/app/profile/page";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, activeUser } = useAuth();
  const userId = activeUser?.id || user?.id || "guest-user-session";
  const { items, itemCount, subtotal, deliveryFee, platformPackagingFee, totalAmount, clearCart } = useCart();

  const userIdRef = useRef(userId);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  // Address Book state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Add Address Inline state
  const [showAddInline, setShowAddInline] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: "Hostel",
    buildingColony: "Royal City Flats, Block B",
    flatRoomNo: "",
    landmark: "Near Main Gate Area",
    city: "Bhopal",
    state: "Madhya Pradesh",
    pincode: "466114",
    phone: activeUser?.email ? "9876543210" : "",
    isDefault: false,
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentChoice>("COD");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load saved addresses with stale response guard
  const loadSavedAddresses = useCallback(async () => {
    if (!userId) return;
    const fetchUserId = userId;

    try {
      setLoadingAddresses(true);
      const res = await fetch(`/api/addresses?userId=${encodeURIComponent(fetchUserId)}`);
      if (fetchUserId !== userIdRef.current) return;

      if (res.ok) {
        const data = await res.json();
        const list: SavedAddress[] = data.addresses || [];
        if (fetchUserId === userIdRef.current) {
          setSavedAddresses(list);

          // Auto-select default address if available
          if (list.length > 0) {
            const defaultAddr = list.find((a) => a.isDefault) || list[0];
            setSelectedAddressId(defaultAddr.id);
          } else {
            setShowAddInline(true);
          }
        }
      }
    } catch (err) {
      console.error("Error loading saved addresses at checkout:", err);
    } finally {
      if (fetchUserId === userIdRef.current) {
        setLoadingAddresses(false);
      }
    }
  }, [userId]);

  useEffect(() => {
    loadSavedAddresses();
  }, [loadSavedAddresses]);

  if (itemCount === 0) {
    return (
      <div className="space-y-6 pt-6 text-center text-[#111111]">
        <div className="bg-white border border-[#E5E5E5] rounded-lg p-8 space-y-4 max-w-md mx-auto">
          <h2 className="font-extrabold text-lg text-[#111111]">
            No items in cart for checkout
          </h2>
          <p className="text-xs text-[#666666] max-w-xs mx-auto font-medium">
            Please add grocery items to your cart before proceeding to checkout.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] rounded font-black text-xs transition-colors border border-[#111111]"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // Save new address inline during checkout
  const handleSaveInlineAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!newAddr.flatRoomNo.trim()) {
      setErrorMessage("Please enter Flat or Room Number");
      return;
    }
    if (!newAddr.buildingColony.trim()) {
      setErrorMessage("Please enter Building or Colony name");
      return;
    }

    const cleanPhone = newAddr.phone.replace(/[^\d]/g, "").trim();
    if (!validateIndianMobileNumber(cleanPhone)) {
      setErrorMessage("Enter a valid 10-digit mobile number.");
      return;
    }

    const cleanPincode = newAddr.pincode.trim();
    if (!validateIndianPincode(cleanPincode)) {
      setErrorMessage("Enter a valid 6-digit Indian pincode.");
      return;
    }

    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          label: newAddr.label,
          buildingColony: newAddr.buildingColony.trim(),
          flatRoomNo: newAddr.flatRoomNo.trim(),
          landmark: newAddr.landmark.trim(),
          city: newAddr.city.trim(),
          state: newAddr.state.trim(),
          pincode: cleanPincode,
          phone: cleanPhone,
          isDefault: savedAddresses.length === 0 ? true : newAddr.isDefault,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to save address");
      }

      setShowAddInline(false);
      await loadSavedAddresses();
      if (data.address) {
        setSelectedAddressId(data.address.id);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save address");
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setErrorMessage(null);

    if (itemCount === 0 || items.length === 0) {
      setErrorMessage("Your cart is empty. Please add grocery items before placing an order.");
      return;
    }

    let finalFormattedAddress = "";
    let finalPhone = "";

    // Case 1: Using selected saved address
    if (selectedAddressId && !showAddInline) {
      const selected = savedAddresses.find((a) => a.id === selectedAddressId);
      if (!selected) {
        setErrorMessage("Please select a valid delivery address.");
        return;
      }

      if (!validateIndianMobileNumber(selected.phone)) {
        setErrorMessage("Enter a valid 10-digit mobile number.");
        return;
      }

      finalPhone = selected.phone;
      finalFormattedAddress = `${selected.flatRoomNo}, ${selected.buildingColony}, ${selected.city}, ${selected.state} - ${selected.pincode}${
        selected.landmark ? ` (Landmark: ${selected.landmark})` : ""
      } • Phone: ${finalPhone}`;
    } else {
      // Case 2: Using inline address form
      if (!newAddr.flatRoomNo.trim()) {
        setErrorMessage("Please enter your Flat or Room Number");
        return;
      }

      const cleanPhone = newAddr.phone.replace(/[^\d]/g, "").trim();
      if (!validateIndianMobileNumber(cleanPhone)) {
        setErrorMessage("Enter a valid 10-digit mobile number.");
        return;
      }

      const cleanPincode = newAddr.pincode.trim();
      if (!validateIndianPincode(cleanPincode)) {
        setErrorMessage("Enter a valid 6-digit Indian pincode.");
        return;
      }

      finalPhone = cleanPhone;
      finalFormattedAddress = `${newAddr.flatRoomNo.trim()}, ${newAddr.buildingColony.trim()}, ${newAddr.city.trim()}, ${newAddr.state.trim()} - ${cleanPincode}${
        newAddr.landmark ? ` (Landmark: ${newAddr.landmark.trim()})` : ""
      } • Phone: ${finalPhone}`;

      // Save to address book automatically if user has no saved addresses
      try {
        await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            label: newAddr.label,
            buildingColony: newAddr.buildingColony.trim(),
            flatRoomNo: newAddr.flatRoomNo.trim(),
            landmark: newAddr.landmark.trim(),
            city: newAddr.city.trim(),
            state: newAddr.state.trim(),
            pincode: cleanPincode,
            phone: cleanPhone,
            isDefault: savedAddresses.length === 0,
          }),
        });
      } catch {
        // Continue with order placement even if saving address fails
      }
    }

    setSubmitting(true);

    try {
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
          customerId: userId,
          deliveryAddress: finalFormattedAddress,
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

      // Clear cart & navigate to live tracking ONLY AFTER SUCCESS
      clearCart();
      const targetOrderId = data.order?.id || "latest";
      router.push(`/orders/${targetOrderId}?newOrder=true`);
    } catch (err) {
      console.error("Order submission error:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to place order. Please try again."
      );
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handlePlaceOrder} className="space-y-4 pb-6 pt-1 text-[#111111]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2.5">
        <div>
          <h1 className="font-extrabold text-xl text-[#111111] tracking-tight">
            Off-Campus Checkout
          </h1>
          <p className="text-xs text-[#666666] font-medium">
            RushD Express Delivery
          </p>
        </div>
        <Link href="/cart" className="text-xs font-bold text-[#111111] hover:underline">
          ← Back to Cart
        </Link>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-white border border-[#D92D3A] text-[#D92D3A] rounded-lg text-xs font-bold">
          {errorMessage}
        </div>
      )}

      {/* Step 1: Saved Addresses or Add New Address */}
      <div className="bg-white p-4 rounded-lg border border-[#E5E5E5] space-y-3">
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2.5">
          <div>
            <h3 className="font-extrabold text-xs text-[#111111] uppercase tracking-wider">
              1. Delivery Address
            </h3>
            <p className="text-[11px] text-[#666666] font-medium mt-0.5">
              Select a saved address or add a new one
            </p>
          </div>

          {savedAddresses.length > 0 && !showAddInline && (
            <button
              type="button"
              onClick={() => setShowAddInline(true)}
              className="text-xs font-extrabold text-[#111111] bg-[#DFFF00] hover:bg-[#C8E600] px-3 py-1 rounded border border-[#111111] transition-colors"
            >
              + Add New Address
            </button>
          )}
        </div>

        {loadingAddresses ? (
          <div className="h-20 bg-[#F5F5F5] rounded border border-[#E5E5E5] animate-pulse" />
        ) : savedAddresses.length > 0 && !showAddInline ? (
          <div className="space-y-2.5">
            <div className="grid grid-cols-1 gap-2">
              {savedAddresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#F5F5F5] border-[#111111] ring-2 ring-[#111111]"
                        : "bg-white border-[#E5E5E5] hover:border-[#111111]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={isSelected}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="w-4 h-4 text-[#111111] accent-[#111111]"
                        />
                        <span className="font-black text-xs uppercase px-2 py-0.5 bg-[#111111] text-white rounded">
                          {addr.label || "Home"}
                        </span>
                        {addr.isDefault && (
                          <span className="font-extrabold text-[10px] bg-[#DFFF00] text-[#000000] px-1.5 py-0.2 rounded border border-[#111111]">
                            ⭐ DEFAULT
                          </span>
                        )}
                      </div>
                      <Link
                        href="/profile"
                        className="text-[11px] font-bold text-[#666666] hover:text-[#111111] hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Manage →
                      </Link>
                    </div>

                    <p className="font-extrabold text-xs text-[#111111] pl-6">
                      {addr.flatRoomNo}, {addr.buildingColony}
                    </p>
                    <p className="text-[#666666] font-medium text-[11px] pl-6">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="font-bold text-[#111111] text-[11px] pl-6 pt-0.5">
                      📞 Contact: {addr.phone}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-1 text-xs">
            {savedAddresses.length > 0 && (
              <div className="flex justify-between items-center bg-[#F5F5F5] p-2.5 rounded border border-[#E5E5E5]">
                <span className="font-bold text-xs">Adding New Delivery Location</span>
                <button
                  type="button"
                  onClick={() => setShowAddInline(false)}
                  className="text-xs font-bold text-[#111111] hover:underline"
                >
                  ← Select Saved Address
                </button>
              </div>
            )}

            <div>
              <label className="font-bold text-[#111111] block mb-1">
                Address Label
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {["Hostel", "Home", "Work", "Other"].map((lbl) => (
                  <button
                    type="button"
                    key={lbl}
                    onClick={() => setNewAddr({ ...newAddr, label: lbl })}
                    className={`py-1.5 rounded font-extrabold text-xs border transition-colors ${
                      newAddr.label === lbl
                        ? "bg-[#111111] text-white border-[#111111]"
                        : "bg-[#F5F5F5] text-[#111111] border-[#E5E5E5] hover:border-[#111111]"
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-bold text-[#111111] block mb-1">
                Flat / Room / Hostel No *
              </label>
              <input
                type="text"
                value={newAddr.flatRoomNo}
                onChange={(e) => setNewAddr({ ...newAddr, flatRoomNo: e.target.value })}
                placeholder="e.g. Room 302, Block B"
                required
                className="w-full px-3 py-2 rounded border border-[#111111] bg-white text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
              />
            </div>

            <div>
              <label className="font-bold text-[#111111] block mb-1">
                Building / Colony / Area *
              </label>
              <input
                type="text"
                value={newAddr.buildingColony}
                onChange={(e) => setNewAddr({ ...newAddr, buildingColony: e.target.value })}
                placeholder="e.g. Royal City Flats"
                required
                className="w-full px-3 py-2 rounded border border-[#111111] bg-white text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
              />
            </div>

            <div>
              <label className="font-bold text-[#111111] block mb-1">
                Landmark (Optional)
              </label>
              <input
                type="text"
                value={newAddr.landmark}
                onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })}
                placeholder="e.g. Near VIT Main Gate Road"
                className="w-full px-3 py-2 rounded border border-[#111111] bg-white text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-[#111111] block mb-1">City</label>
                <input
                  type="text"
                  value={newAddr.city}
                  onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded border border-[#111111] bg-white text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
                />
              </div>
              <div>
                <label className="font-bold text-[#111111] block mb-1">State</label>
                <input
                  type="text"
                  value={newAddr.state}
                  onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded border border-[#111111] bg-white text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-[#111111] block mb-1">Pincode (6 digits)</label>
                <input
                  type="text"
                  value={newAddr.pincode}
                  onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                  maxLength={6}
                  required
                  className="w-full px-3 py-2 rounded border border-[#111111] bg-white text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
                />
              </div>
              <div>
                <label className="font-bold text-[#111111] block mb-1">Contact Phone (10 digits) *</label>
                <input
                  type="text"
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  maxLength={10}
                  placeholder="9876543210"
                  required
                  className="w-full px-3 py-2 rounded border border-[#111111] bg-white text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
                />
              </div>
            </div>

            {savedAddresses.length > 0 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveInlineAddress}
                  className="w-full py-2 bg-[#F5F5F5] hover:bg-gray-200 text-[#111111] font-bold text-xs rounded border border-[#E5E5E5] transition-colors"
                >
                  Save to Address Book for Future Orders
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 2: Payment Method Radio Cards */}
      <PaymentMethodSelector selectedMethod={paymentMethod} onChange={setPaymentMethod} />

      {/* Step 3: Order Summary & Bill Breakdown */}
      <div className="bg-white p-4 rounded-lg border border-[#E5E5E5] space-y-3">
        <h3 className="font-extrabold text-xs text-[#111111] uppercase tracking-wider">
          Order Summary ({itemCount} {itemCount === 1 ? "Item" : "Items"})
        </h3>

        {/* Item thumbnails row */}
        <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex items-center gap-2 bg-[#F5F5F5] p-2 rounded border border-[#E5E5E5] text-xs shrink-0"
            >
              <span className="font-bold text-[#111111] truncate max-w-[120px]">
                {product.name}
              </span>
              <span className="bg-[#111111] text-[#DFFF00] font-black px-1.5 py-0.5 rounded text-[10px]">
                x{quantity}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-[#E5E5E5] pt-3 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[#666666] font-medium">
            <span>Subtotal</span>
            <span className="font-bold text-[#111111]">₹{subtotal.toFixed(0)}</span>
          </div>

          <div className="flex items-center justify-between text-[#666666] font-medium">
            <span>Delivery Charge</span>
            <span>
              {deliveryFee === 0 ? (
                <span className="font-black text-[#168A55]">FREE (₹0)</span>
              ) : (
                <span className="font-bold text-[#111111]">₹{deliveryFee.toFixed(0)}</span>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between text-[#666666] font-medium">
            <span>Platform & Packaging Fee</span>
            <span className="font-bold text-[#111111]">₹{platformPackagingFee.toFixed(0)}</span>
          </div>

          <div className="border-t border-[#E5E5E5] pt-2 flex items-center justify-between font-extrabold text-sm text-[#111111]">
            <span>Total</span>
            <span className="text-[#111111] text-base font-black">
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
          className="w-full py-3.5 bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] rounded font-black text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 border border-[#111111]"
        >
          {submitting ? (
            <span>Placing Order...</span>
          ) : (
            <>
              <span>
                PLACE ORDER ({paymentMethod === "COD" ? "Cash on Delivery" : "UPI on Delivery"})
              </span>
              <span>• ₹{totalAmount.toFixed(0)} →</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
