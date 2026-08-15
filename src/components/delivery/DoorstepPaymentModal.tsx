"use client";

import { useState } from "react";
import type { OrderRecord } from "@/components/orders/OrderCard";

interface DoorstepPaymentModalProps {
  order: OrderRecord;
  onClose: () => void;
  onConfirmDelivery: () => void;
}

export function DoorstepPaymentModal({
  order,
  onClose,
  onConfirmDelivery,
}: DoorstepPaymentModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isCOD = order.paymentMethod === "COD";

  const handleConfirm = () => {
    if (!confirmed) return;
    setSubmitting(true);
    onConfirmDelivery();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 max-w-md w-full shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <span>🎉</span>
            <span>Complete Order #{order.orderNumber}</span>
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold text-xs"
          >
            ✕
          </button>
        </div>

        {/* Doorstep Payment Banner */}
        <div
          className={`p-4 rounded-2xl border text-center space-y-2 ${
            isCOD
              ? "bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-900 text-amber-900 dark:text-amber-200"
              : "bg-teal-50 dark:bg-teal-950/60 border-teal-300 dark:border-teal-900 text-teal-900 dark:text-teal-200"
          }`}
        >
          <span className="text-3xl block">{isCOD ? "💵" : "📲"}</span>
          <span className="text-xs font-bold uppercase tracking-wider block">
            {isCOD ? "Cash on Delivery Collection" : "Pay via UPI on Delivery (Scan QR)"}
          </span>
          <div className="text-2xl font-black">₹{order.totalAmount.toFixed(0)}</div>
          <p className="text-[11px] opacity-80">
            {isCOD
              ? "Collect cash payment from the student before completing delivery."
              : "Ask student to scan Store X UPI QR Code on your smartphone or receipt."}
          </p>
        </div>

        {/* Checkbox confirmation */}
        <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
          <input
            type="checkbox"
            id="paymentCheck"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="w-5 h-5 text-emerald-600 rounded-md mt-0.5"
          />
          <label htmlFor="paymentCheck" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-snug cursor-pointer">
            I confirm that ₹{order.totalAmount.toFixed(0)} payment has been collected from the student at the doorstep.
          </label>
        </div>

        {/* Modal Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!confirmed || submitting}
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg transition-all disabled:opacity-40"
          >
            {submitting ? "Completing..." : "Confirm Delivery ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}
