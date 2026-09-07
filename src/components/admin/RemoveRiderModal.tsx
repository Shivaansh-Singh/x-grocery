"use client";

import { useState } from "react";

export interface RiderStaff {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  createdAt?: string;
}

interface RemoveRiderModalProps {
  rider: RiderStaff;
  onClose: () => void;
  onSuccess: (removedRiderId: string, riderName: string) => void;
}

export function RemoveRiderModal({
  rider,
  onClose,
  onSuccess,
}: RemoveRiderModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/delivery-staff/${rider.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to remove delivery partner.");
      }

      onSuccess(rider.id, rider.name || rider.email);
    } catch (err: unknown) {
      console.error("Error removing delivery staff:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to remove delivery partner.";
      setError(errorMessage);
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-lg border border-[#111111] p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 text-[#111111]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded bg-red-100 text-red-600 flex items-center justify-center text-sm font-black border border-red-200">
              ⚠️
            </span>
            <h3 className="font-extrabold text-base text-[#111111]">
              Remove Delivery Partner
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#666666] font-bold text-xs hover:text-[#111111] border border-[#E5E5E5] disabled:opacity-50 cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Rider Summary Box */}
        <div className="bg-[#F5F5F5] p-3.5 rounded-lg border border-[#E5E5E5] space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-[#111111] text-sm">
              {rider.name}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#111111] text-[#DFFF00]">
              DELIVERY PARTNER
            </span>
          </div>
          <p className="text-[#666666] font-medium">
            {rider.phone || "No phone"} • {rider.email}
          </p>
        </div>

        {/* Informational Details */}
        <div className="text-xs space-y-2 text-[#444444] bg-[#FFFBEB] p-3.5 rounded-lg border border-[#FDE68A]">
          <p className="font-bold text-[#92400E]">
            What happens when you remove this rider?
          </p>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-[#78350F]">
            <li>Rider permissions will be revoked immediately.</li>
            <li>The account will become a standard <strong>CUSTOMER</strong> account.</li>
            <li>Any active assigned orders will return to the store queue.</li>
            <li>Historical delivery records and customer data are preserved.</li>
            <li>The login account is <strong>not</strong> deleted.</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded border border-[#E5E5E5] text-[#666666] font-bold hover:bg-[#F5F5F5] text-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded bg-[#DC2626] hover:bg-[#B91C1C] text-white font-black border border-[#B91C1C] text-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? "Removing... ⏳" : "Confirm Removal"}
          </button>
        </div>
      </div>
    </div>
  );
}
