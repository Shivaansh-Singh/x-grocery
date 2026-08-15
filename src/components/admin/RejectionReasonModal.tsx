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
  const [reason, setReason] = useState("One or more items are out of stock at Store X");
  const [submitting, setSubmitting] = useState(false);

  const presets = [
    "One or more items are out of stock at Store X",
    "Store X is currently closed for incoming orders",
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
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <h3 className="font-bold text-base text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <span>⚠️</span>
            <span>Reject Order #{orderNumber}</span>
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold text-xs"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <p className="text-zinc-600 dark:text-zinc-400">
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
                    ? "bg-rose-50 dark:bg-rose-950/50 border-rose-400 text-rose-800 dark:text-rose-300"
                    : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <div>
            <label className="font-semibold text-zinc-500 block mb-1">Reason Details</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              required
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors disabled:opacity-50"
            >
              {submitting ? "Rejecting..." : "Confirm Rejection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
