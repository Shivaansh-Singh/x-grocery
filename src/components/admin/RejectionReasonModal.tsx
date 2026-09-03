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
  const [selectedPreset, setSelectedPreset] = useState("One or more items are out of stock");
  const [customExplanation, setCustomExplanation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    "One or more items are out of stock",
    "Store is unable to fulfil the order",
    "Delivery unavailable",
    "Customer address issue",
    "Payment issue",
    "Other",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let finalReason = selectedPreset;
    if (selectedPreset === "Other") {
      if (!customExplanation.trim()) {
        setError("Please enter a custom rejection explanation.");
        return;
      }
      finalReason = customExplanation.trim();
    } else if (customExplanation.trim()) {
      finalReason = `${selectedPreset} - ${customExplanation.trim()}`;
    }

    if (!finalReason.trim()) {
      setError("Rejection reason is required.");
      return;
    }

    setSubmitting(true);
    onConfirm(finalReason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#D92D3A] p-6 max-w-md w-full shadow-2xl space-y-4 text-[#111111]">
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
          <h3 className="font-extrabold text-base text-[#D92D3A]">
            Reject Order #{orderNumber}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#666666] font-bold text-xs hover:text-[#111111] border border-[#E5E5E5]"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-2.5 bg-red-50 border border-[#D92D3A] text-[#D92D3A] rounded text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <p className="text-[#666666] font-medium">
            Please select the reason for rejecting this customer order:
          </p>

          <div className="space-y-1.5">
            {presets.map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => {
                  setSelectedPreset(preset);
                  setError(null);
                }}
                className={`w-full text-left p-2.5 rounded border text-xs font-bold transition-colors ${
                  selectedPreset === preset
                    ? "bg-[#111111] border-[#111111] text-white"
                    : "bg-white border-[#E5E5E5] text-[#111111] hover:border-[#111111]"
                }`}
              >
                {selectedPreset === preset ? "● " : "○ "}
                {preset}
              </button>
            ))}
          </div>

          <div>
            <label className="font-bold text-[#111111] block mb-1">
              {selectedPreset === "Other" ? "Custom Explanation *" : "Additional Details (Optional)"}
            </label>
            <textarea
              value={customExplanation}
              onChange={(e) => setCustomExplanation(e.target.value)}
              rows={2}
              placeholder={
                selectedPreset === "Other"
                  ? "Describe why the order cannot be fulfilled..."
                  : "Add specific notes for the customer..."
              }
              className="w-full px-3 py-2 rounded border border-[#111111] bg-white text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#D92D3A]"
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-[#E5E5E5]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded border border-[#E5E5E5] text-[#666666] font-bold hover:bg-[#F5F5F5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded bg-[#D92D3A] text-white font-black hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {submitting ? "Rejecting..." : "Confirm Rejection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

