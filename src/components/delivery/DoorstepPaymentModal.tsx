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
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#D9D7D2] p-6 max-w-md w-full shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D9D7D2] pb-3">
          <h3 className="font-bold text-base text-[#111315]">
            Complete Order #{order.orderNumber}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#ECEAE5] flex items-center justify-center text-[#666A70] font-bold text-xs"
          >
            ✕
          </button>
        </div>

        {/* Doorstep Payment Banner */}
        <div className="p-4 rounded-xl border border-[#D9D7D2] bg-[#F5F3EE] text-[#111315] text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider block text-[#FF5A1F]">
            {isCOD ? "Cash on Delivery Collection" : "Pay via UPI on Delivery (Scan QR)"}
          </span>
          <div className="text-3xl font-black text-[#111315]">₹{order.totalAmount.toFixed(0)}</div>
          <p className="text-[11px] text-[#666A70]">
            {isCOD
              ? "Collect cash payment from the student before completing delivery."
              : "Ask student to scan RushD UPI QR Code on your smartphone or receipt."}
          </p>
        </div>

        {/* Checkbox confirmation */}
        <div className="bg-[#F5F3EE] p-3 rounded-xl border border-[#D9D7D2] flex items-start gap-3">
          <input
            type="checkbox"
            id="paymentCheck"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="w-5 h-5 text-[#168A5B] rounded mt-0.5"
          />
          <label htmlFor="paymentCheck" className="text-xs font-semibold text-[#111315] leading-snug cursor-pointer">
            I confirm that ₹{order.totalAmount.toFixed(0)} payment has been collected from the student at the doorstep.
          </label>
        </div>

        {/* Modal Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-[#D9D7D2] bg-[#FFFFFF] text-[#111315] font-bold text-xs hover:bg-[#ECEAE5]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!confirmed || submitting}
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-xl bg-[#168A5B] hover:bg-[#111315] text-white font-bold text-xs shadow-2xs transition-colors disabled:opacity-40"
          >
            {submitting ? "Completing..." : "Confirm Delivery ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}
