"use client";

import { useState } from "react";

interface RejectionReasonModalProps {
  orderNumber: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function RejectionReasonModal({
  orderNumber,
  onClose,
  onConfirm,
}: RejectionReasonModalProps) {
  const [reason, setReason] = useState("One or more items are out of stock");
  const [submitting, setSubmitting] = useState(false);

  const presets = [
    "One or more items are out of stock",
    "Store is currently closed for incoming orders",
    "Delivery address is outside supported off-campus service area",
    "Custom reason...",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitting(true);
    onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#D9D7D2] p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#D9D7D2] pb-3">
          <h3 className="font-bold text-base text-[#C63D3D]">
            Reject Order #{orderNumber}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#ECEAE5] flex items-center justify-center text-[#666A70] font-bold text-xs"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <p className="text-[#666A70]">
            Please provide a clear reason for cancelling this student order:
          </p>

          <div className="space-y-1.5">
            {presets.map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => setReason(preset)}
                className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  reason === preset
                    ? "bg-[#F5F3EE] border-[#C63D3D] text-[#C63D3D]"
                    : "bg-[#FFFFFF] border-[#D9D7D2] text-[#111315] hover:border-[#111315]"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <div>
            <label className="font-semibold text-[#111315] block mb-1">Reason Details</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              required
              className="w-full px-3 py-2 rounded-xl border border-[#D9D7D2] bg-[#FFFFFF] text-[#111315] focus:outline-none focus:border-[#C63D3D]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#D9D7D2] text-[#111315] font-bold hover:bg-[#ECEAE5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-[#C63D3D] text-white font-bold hover:bg-[#111315] transition-colors disabled:opacity-50"
            >
              {submitting ? "Rejecting..." : "Confirm Rejection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
