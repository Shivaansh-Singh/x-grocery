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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#151B24] rounded-2xl border border-[#27313D] p-6 max-w-md w-full shadow-2xl space-y-4 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#27313D] pb-3">
          <h3 className="font-extrabold text-base text-[#FFFFFF]">
            Complete Order #{order.orderNumber}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1C2430] flex items-center justify-center text-[#A8B0BC] font-bold text-xs hover:text-[#FFFFFF] border border-[#27313D]"
          >
            ✕
          </button>
        </div>

        {/* Doorstep Payment Banner */}
        <div className="p-4 rounded-xl border border-[#27313D] bg-[#1C2430] text-[#FFFFFF] text-center space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider block text-[#FF5A00]">
            {isCOD ? "Cash on Delivery Collection" : "Pay via UPI on Delivery (Scan QR)"}
          </span>
          <div className="text-3xl font-black text-[#FFFFFF]">₹{order.totalAmount.toFixed(0)}</div>
          <p className="text-[11px] text-[#A8B0BC]">
            {isCOD
              ? "Collect cash payment from the student before completing delivery."
              : "Ask student to scan RushD UPI QR Code on your smartphone or receipt."}
          </p>
        </div>

        {/* Checkbox confirmation */}
        <div className="bg-[#1C2430] p-3.5 rounded-xl border border-[#27313D] flex items-start gap-3">
          <input
            type="checkbox"
            id="paymentCheck"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="w-5 h-5 text-[#19B978] rounded mt-0.5"
          />
          <label htmlFor="paymentCheck" className="text-xs font-semibold text-[#FFFFFF] leading-snug cursor-pointer">
            I confirm that ₹{order.totalAmount.toFixed(0)} payment has been collected from the student at the doorstep.
          </label>
        </div>

        {/* Modal Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-[#27313D] bg-[#1C2430] text-[#A8B0BC] hover:text-[#FFFFFF] font-bold text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!confirmed || submitting}
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-xl bg-[#19B978] hover:bg-[#151B24] text-white font-extrabold text-xs shadow-sm transition-colors disabled:opacity-40"
          >
            {submitting ? "Completing..." : "Confirm Delivery ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}
