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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card rounded-[24px] p-6 max-w-md w-full shadow-2xl space-y-4 text-[#F5F6FA]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 pb-3">
          <h3 className="font-display font-extrabold text-base text-[#F5F6FA]">
            Complete Order #{order.orderNumber}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1A1F2C] flex items-center justify-center text-[#8A90A3] font-bold text-xs hover:text-[#F5F6FA] border border-white/8"
          >
            ✕
          </button>
        </div>

        {/* Doorstep Payment Banner */}
        <div className="p-4 rounded-[16px] border border-white/8 bg-[#1A1F2C] text-[#F5F6FA] text-center space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider block text-[#FF6B1A]">
            {isCOD ? "Cash on Delivery Collection" : "Pay via UPI on Delivery (Scan QR)"}
          </span>
          <div className="text-3xl font-black text-[#F5F6FA]">₹{order.totalAmount.toFixed(0)}</div>
          <p className="text-[11px] text-[#8A90A3]">
            {isCOD
              ? "Collect cash payment from the student before completing delivery."
              : "Ask student to scan RushD UPI QR Code on your smartphone or receipt."}
          </p>
        </div>

        {/* Checkbox confirmation */}
        <div className="bg-[#1A1F2C] p-3.5 rounded-[16px] border border-white/8 flex items-start gap-3">
          <input
            type="checkbox"
            id="paymentCheck"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="w-5 h-5 text-[#2D6CFF] rounded mt-0.5"
          />
          <label htmlFor="paymentCheck" className="text-xs font-semibold text-[#F5F6FA] leading-snug cursor-pointer">
            I confirm that ₹{order.totalAmount.toFixed(0)} payment has been collected from the student at the doorstep.
          </label>
        </div>

        {/* Modal Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/8 bg-[#1A1F2C] text-[#8A90A3] hover:text-[#F5F6FA] font-bold text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!confirmed || submitting}
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] hover:opacity-90 text-white font-extrabold text-xs shadow-md transition-all disabled:opacity-40"
          >
            {submitting ? "Completing..." : "Confirm Delivery ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}
