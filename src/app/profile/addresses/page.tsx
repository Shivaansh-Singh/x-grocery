"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { validateIndianMobileNumber, validateIndianPincode } from "@/lib/validation";

export interface SavedAddress {
  id: string;
  userId: string;
  label: string;
  buildingColony: string;
  flatRoomNo: string;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

function SavedAddressesContent() {
  const { user, activeUser } = useAuth();
  const userId = activeUser?.id || user?.id || "guest-user-session";

  const userIdRef = useRef(userId);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    label: "Hostel",
    buildingColony: "Royal City Flats, Block B",
    flatRoomNo: "",
    landmark: "Near Main Gate Area",
    city: "Bhopal",
    state: "Madhya Pradesh",
    pincode: "466114",
    phone: "",
    isDefault: false,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const loadAddresses = useCallback(async () => {
    if (!userId) return;
    const fetchUserId = userId;
    try {
      setLoading(true);
      const res = await fetch(`/api/addresses?userId=${encodeURIComponent(fetchUserId)}`);
      if (fetchUserId !== userIdRef.current) return;
      if (res.ok) {
        const data = await res.json();
        if (fetchUserId === userIdRef.current) {
          setAddresses(data.addresses || []);
        }
      }
    } catch (err) {
      console.error("Error loading addresses:", err);
    } finally {
      if (fetchUserId === userIdRef.current) {
        setLoading(false);
      }
    }
  }, [userId]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setFormData({
      label: "Hostel",
      buildingColony: "Royal City Flats, Block B",
      flatRoomNo: "",
      landmark: "Near Main Gate Area",
      city: "Bhopal",
      state: "Madhya Pradesh",
      pincode: "466114",
      phone: activeUser?.email ? "9876543210" : "",
      isDefault: addresses.length === 0,
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (addr: SavedAddress) => {
    setEditingAddress(addr);
    setFormData({
      label: addr.label,
      buildingColony: addr.buildingColony,
      flatRoomNo: addr.flatRoomNo,
      landmark: addr.landmark || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      phone: addr.phone,
      isDefault: addr.isDefault,
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.buildingColony.trim() || !formData.flatRoomNo.trim()) {
      setFormError("Please enter Flat/Room and Building/Colony details.");
      return;
    }

    const cleanPhone = formData.phone.trim();
    if (!validateIndianMobileNumber(cleanPhone)) {
      setFormError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    const cleanPincode = formData.pincode.trim();
    if (!validateIndianPincode(cleanPincode)) {
      setFormError("Please enter a valid 6-digit Indian pincode.");
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingAddress) {
        const res = await fetch(`/api/addresses/${editingAddress.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            label: formData.label,
            buildingColony: formData.buildingColony.trim(),
            flatRoomNo: formData.flatRoomNo.trim(),
            landmark: formData.landmark.trim() || null,
            city: formData.city.trim(),
            state: formData.state.trim(),
            pincode: cleanPincode,
            phone: cleanPhone,
            isDefault: formData.isDefault,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update address.");
        setSuccess("Address updated successfully.");
      } else {
        const res = await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            label: formData.label,
            buildingColony: formData.buildingColony.trim(),
            flatRoomNo: formData.flatRoomNo.trim(),
            landmark: formData.landmark.trim() || null,
            city: formData.city.trim(),
            state: formData.state.trim(),
            pincode: cleanPincode,
            phone: cleanPhone,
            isDefault: formData.isDefault,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to add address.");
        setSuccess("New address added successfully.");
      }

      setShowModal(false);
      await loadAddresses();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save address.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    setDeletingId(addressId);
    try {
      const res = await fetch(`/api/addresses/${addressId}?userId=${encodeURIComponent(userId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSuccess("Address deleted.");
        await loadAddresses();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete address.");
      }
    } catch (err) {
      console.error("Error deleting address:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const res = await fetch(`/api/addresses/${addressId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isDefault: true }),
      });
      if (res.ok) {
        setSuccess("Default address updated.");
        await loadAddresses();
      }
    } catch (err) {
      console.error("Error setting default address:", err);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 pt-2 pb-12 text-[#111111] dark:text-[#F5F5F5]">
      {/* Header & Back Navigation */}
      <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="w-8 h-8 rounded-full bg-[#F5F5F5] dark:bg-[#222222] hover:bg-gray-200 dark:hover:bg-[#2C2C2C] text-[#111111] dark:text-[#F5F5F5] flex items-center justify-center font-bold text-sm transition-colors border border-[#E5E5E5] dark:border-[#333333]"
            aria-label="Back to Account"
          >
            ←
          </Link>
          <div>
            <h1 className="text-lg font-extrabold text-[#111111] dark:text-[#F5F5F5] tracking-tight">
              Saved Addresses
            </h1>
            <p className="text-[11px] text-[#666666] dark:text-[#A3A3A3] font-medium">
              Manage your hostel rooms and delivery locations
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-3 py-1.5 rounded bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] text-xs font-black transition-colors border border-[#111111] cursor-pointer"
        >
          + Add New
        </button>
      </div>

      {success && (
        <div className="p-3 text-xs rounded bg-white dark:bg-[#1A1A1A] text-[#168A55] border border-[#168A55] font-bold">
          ✓ {success}
        </div>
      )}

      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-24 bg-[#F5F5F5] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-lg" />
          <div className="h-24 bg-[#F5F5F5] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-lg" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-lg p-8 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#F5F5F5] dark:bg-[#222222] flex items-center justify-center mx-auto text-xl text-[#666666] dark:text-[#A3A3A3]">
            📍
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#111111] dark:text-[#F5F5F5]">No saved addresses</h3>
            <p className="text-xs text-[#666666] dark:text-[#A3A3A3] mt-0.5">Add your hostel room or flat to checkout in 1-click</p>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] rounded text-xs font-black border border-[#111111]"
          >
            + Add First Address
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-4 rounded-lg bg-white dark:bg-[#141414] border transition-colors ${
                addr.isDefault
                  ? "border-[#111111] dark:border-[#555555] shadow-xs"
                  : "border-[#E5E5E5] dark:border-[#262626]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#111111] dark:bg-[#262626] text-white">
                    {addr.label}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#DFFF00] text-[#000000] border border-[#111111]">
                      Default
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(addr)}
                    className="text-xs font-bold text-[#111111] dark:text-[#F5F5F5] hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAddress(addr.id)}
                    disabled={deletingId === addr.id}
                    className="text-xs font-bold text-[#D92D3A] hover:underline"
                  >
                    {deletingId === addr.id ? "..." : "Delete"}
                  </button>
                </div>
              </div>

              <div className="mt-2 text-xs text-[#111111] dark:text-[#F5F5F5] space-y-0.5">
                <p className="font-bold">{addr.flatRoomNo}, {addr.buildingColony}</p>
                {addr.landmark && <p className="text-[#666666] dark:text-[#A3A3A3]">Landmark: {addr.landmark}</p>}
                <p className="text-[#666666] dark:text-[#A3A3A3]">{addr.city}, {addr.state} - {addr.pincode}</p>
                <p className="text-[#666666] dark:text-[#A3A3A3] font-medium pt-1">📞 {addr.phone}</p>
              </div>

              {!addr.isDefault && (
                <div className="mt-3 pt-2 border-t border-[#E5E5E5] dark:border-[#262626]">
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-[11px] font-bold text-[#666666] dark:text-[#A3A3A3] hover:text-[#111111] dark:hover:text-white transition-colors"
                  >
                    Make this my default delivery address
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#141414] rounded-lg border border-[#111111] dark:border-[#333333] max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto text-[#111111] dark:text-[#F5F5F5] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
              <h2 className="font-extrabold text-sm text-[#111111] dark:text-[#F5F5F5]">
                {editingAddress ? "Edit Address" : "Add Delivery Address"}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-full bg-[#F5F5F5] dark:bg-[#222222] flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 text-xs rounded bg-white dark:bg-[#1A1A1A] text-[#D92D3A] border border-[#D92D3A] font-bold">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#666666] dark:text-[#A3A3A3] block mb-1">Address Label</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {["Hostel", "Home", "Work", "Other"].map((lbl) => (
                    <button
                      type="button"
                      key={lbl}
                      onClick={() => setFormData({ ...formData, label: lbl })}
                      className={`py-1.5 rounded font-extrabold text-xs border transition-colors ${
                        formData.label === lbl
                          ? "bg-[#111111] dark:bg-[#333333] text-white border-[#111111] dark:border-[#555555]"
                          : "bg-[#F5F5F5] dark:bg-[#1E1E1E] text-[#111111] dark:text-[#F5F5F5] border-[#E5E5E5] dark:border-[#262626]"
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#666666] dark:text-[#A3A3A3] block mb-1">Flat / Room No *</label>
                <input
                  type="text"
                  value={formData.flatRoomNo}
                  onChange={(e) => setFormData({ ...formData, flatRoomNo: e.target.value })}
                  placeholder="e.g. Room 302, Block B"
                  required
                  className="w-full px-3 py-2 text-xs rounded border border-[#111111] dark:border-[#333333] bg-white dark:bg-[#1E1E1E] text-[#111111] dark:text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#666666] dark:text-[#A3A3A3] block mb-1">Building / Colony *</label>
                <input
                  type="text"
                  value={formData.buildingColony}
                  onChange={(e) => setFormData({ ...formData, buildingColony: e.target.value })}
                  placeholder="e.g. Royal City Flats"
                  required
                  className="w-full px-3 py-2 text-xs rounded border border-[#111111] dark:border-[#333333] bg-white dark:bg-[#1E1E1E] text-[#111111] dark:text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#666666] dark:text-[#A3A3A3] block mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  placeholder="e.g. Near VIT Main Gate"
                  className="w-full px-3 py-2 text-xs rounded border border-[#111111] dark:border-[#333333] bg-white dark:bg-[#1E1E1E] text-[#111111] dark:text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-[#666666] dark:text-[#A3A3A3] block mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs rounded border border-[#111111] dark:border-[#333333] bg-white dark:bg-[#1E1E1E] text-[#111111] dark:text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#666666] dark:text-[#A3A3A3] block mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs rounded border border-[#111111] dark:border-[#333333] bg-white dark:bg-[#1E1E1E] text-[#111111] dark:text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-[#666666] dark:text-[#A3A3A3] block mb-1">Pincode (6 digits) *</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    maxLength={6}
                    required
                    className="w-full px-3 py-2 text-xs rounded border border-[#111111] dark:border-[#333333] bg-white dark:bg-[#1E1E1E] text-[#111111] dark:text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#666666] dark:text-[#A3A3A3] block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    maxLength={10}
                    placeholder="9876543210"
                    required
                    className="w-full px-3 py-2 text-xs rounded border border-[#111111] dark:border-[#333333] bg-white dark:bg-[#1E1E1E] text-[#111111] dark:text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isDefaultCheckbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded border-[#111111] text-[#111111] focus:ring-[#DFFF00]"
                />
                <label htmlFor="isDefaultCheckbox" className="text-xs font-bold text-[#111111] dark:text-[#F5F5F5] cursor-pointer">
                  Set as default delivery address
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full py-3 bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] rounded text-xs font-black transition-colors disabled:opacity-50 border border-[#111111] cursor-pointer"
                >
                  {formSubmitting ? "Saving..." : editingAddress ? "Update Address" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SavedAddressesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-xl mx-auto space-y-4 pt-6 animate-pulse">
          <div className="h-10 bg-[#F5F5F5] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-lg" />
          <div className="h-48 bg-[#F5F5F5] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-lg" />
        </div>
      }
    >
      <SavedAddressesContent />
    </Suspense>
  );
}
