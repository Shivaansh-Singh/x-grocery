"use client";

import { useState } from "react";
import type { OrderRecord } from "@/components/orders/OrderCard";

interface DoorstepPaymentModalProps {
  order: OrderRecord;
  onClose: () => void;
  onConfirmDelivery: (otp: string) => Promise<{ success: boolean; error?: string }>;
}

export function DoorstepPaymentModal({
  order,
  onClose,
  onConfirmDelivery,
}: DoorstepPaymentModalProps) {
  const [otp, setOtp] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isCOD = order.paymentMethod === "COD";

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only accept numeric digits, max 6
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(val);
    if (errorMessage) setErrorMessage(null);
  };

  const handleConfirm = async () => {
    setErrorMessage(null);

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMessage("Please enter the 6-digit delivery OTP.");
      return;
    }

    if (!confirmed) {
      setErrorMessage("Please confirm doorstep payment collection.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await onConfirmDelivery(cleanOtp);
      if (!result.success) {
        setErrorMessage(
          result.error ||
            "Incorrect OTP. Please ask the customer for the correct delivery OTP."
        );
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Unable to verify the OTP. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-lg p-5 sm:p-6 max-w-md w-full shadow-2xl border border-[#111111] space-y-4 text-[#111111]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
          <div>
            <span className="text-[10px] font-extrabold text-[#666666] uppercase tracking-wider block">
              VERIFY DELIVERY
            </span>
            <h3 className="font-extrabold text-base text-[#111111]">
              Order #{order.orderNumber}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#666666] font-bold text-xs hover:text-[#111111] border border-[#E5E5E5]"
          >
            ✕
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-[#D92D3A] text-[#D92D3A] text-xs font-bold rounded flex items-start gap-2">
            <span className="text-sm">⚠️</span>
            <span className="leading-tight">{errorMessage}</span>
          </div>
        )}

        {/* OTP Input Section */}
        <div className="space-y-2 p-3.5 bg-[#F5F5F5] rounded-lg border border-[#E5E5E5]">
          <label className="text-xs font-black text-[#111111] block">
            Enter Customer Delivery OTP
          </label>
          <p className="text-[11px] text-[#666666] font-medium leading-tight">
            Ask the customer for the 6-digit OTP displayed on their order screen.
          </p>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={otp}
            onChange={handleOtpChange}
            placeholder="• • • • • •"
            autoFocus
            className="w-full text-center tracking-[0.4em] font-mono text-2xl font-black py-2.5 px-3 rounded border border-[#111111] bg-white text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
          />
          <div className="text-[10px] text-[#666666] text-right font-medium">
            {otp.length} / 6 digits
          </div>
        </div>

        {/* Doorstep Payment Banner */}
        <div className="p-3.5 rounded-lg border border-[#111111] bg-[#000000] text-white text-center space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider block text-[#DFFF00]">
            {isCOD ? "Cash on Delivery Collection" : "Pay via UPI on Delivery (Scan QR)"}
          </span>
          <div className="text-2xl font-black text-white">₹{order.totalAmount.toFixed(0)}</div>
          <p className="text-[10px] text-[#A3A3A3] font-medium">
            {isCOD
              ? "Collect cash payment from the customer before completing delivery."
              : "Ask customer to scan RushD UPI QR Code on your smartphone or receipt."}
          </p>
        </div>

        {/* Checkbox confirmation */}
        <div className="bg-[#F5F5F5] p-3 rounded-lg border border-[#E5E5E5] flex items-start gap-2.5">
          <input
            type="checkbox"
            id="paymentCheck"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="w-4 h-4 accent-[#111111] rounded mt-0.5"
          />
          <label htmlFor="paymentCheck" className="text-xs font-bold text-[#111111] leading-snug cursor-pointer">
            I confirm that ₹{order.totalAmount.toFixed(0)} payment has been collected at doorstep.
          </label>
        </div>

        {/* Modal Actions */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-3 rounded border border-[#E5E5E5] bg-[#F5F5F5] text-[#666666] hover:text-[#111111] font-bold text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={otp.length !== 6 || !confirmed || submitting}
            onClick={handleConfirm}
            className="flex-1 py-3 rounded bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] font-black text-xs transition-colors disabled:opacity-40 border border-[#111111]"
          >
            {submitting ? "Verifying..." : "Verify & Complete Delivery ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}
