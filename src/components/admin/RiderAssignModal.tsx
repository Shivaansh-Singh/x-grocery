"use client";

import { useState } from "react";
import type { DeliveryStaffRider } from "@/lib/orderSync";
import type { OrderRecord } from "@/components/orders/OrderCard";

interface RiderAssignModalProps {
  order: OrderRecord;
  riders: DeliveryStaffRider[];
  onClose: () => void;
  onAssignRider: (orderId: string, riderId: string) => void;
}

export function RiderAssignModal({
  order,
  riders,
  onClose,
  onAssignRider,
}: RiderAssignModalProps) {
  const [selectedRiderId, setSelectedRiderId] = useState<string>("");

  const handleConfirm = () => {
    if (!selectedRiderId) return;
    onAssignRider(order.id, selectedRiderId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-150">
      <div className="bg-[#141822] rounded-[24px] border border-white/15 p-5 shadow-2xl max-w-md w-full space-y-4 text-[#F5F6FA]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h2 className="font-display font-black text-base text-[#F5F6FA]">
              Assign Delivery Rider
            </h2>
            <p className="text-xs text-[#8A90A3] mt-0.5">
              Order #{order.orderNumber} • ₹{order.totalAmount.toFixed(0)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1A1F2C] hover:bg-white/10 flex items-center justify-center text-[#8A90A3] hover:text-white font-bold text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Order Address Summary */}
        <div className="bg-[#1A1F2C] p-3 rounded-xl border border-white/8 text-xs space-y-1">
          <span className="text-[10px] font-bold text-[#FF6B1A] uppercase tracking-wider block">
            Destination
          </span>
          <p className="text-[#F5F6FA] font-medium leading-tight">
            {order.deliveryAddress}
          </p>
        </div>

        {/* Available Riders Roster List */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-[#8A90A3] uppercase tracking-wider block">
            Select Active Rider
          </span>

          <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
            {riders.map((rider) => {
              const status = rider.status || "AVAILABLE";
              const isAvailable = status === "AVAILABLE";
              const isSelected = selectedRiderId === rider.id;

              return (
                <div
                  key={rider.id}
                  onClick={() => {
                    if (isAvailable) setSelectedRiderId(rider.id);
                  }}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isAvailable
                      ? isSelected
                        ? "bg-[#2D6CFF]/20 border-[#2D6CFF] ring-2 ring-[#2D6CFF]/30 cursor-pointer"
                        : "bg-[#1A1F2C] border-white/10 hover:border-white/20 cursor-pointer"
                      : "bg-[#1A1F2C]/50 border-white/5 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full shrink-0 ${
                        isAvailable
                          ? "bg-[#3DD68C] shadow-[0_0_8px_rgba(61,214,140,0.5)]"
                          : status === "ASSIGNED" || status === "ON_DELIVERY"
                          ? "bg-[#FF6B1A]"
                          : "bg-[#8A90A3]"
                      }`}
                    />
                    <div>
                      <h4 className="font-bold text-xs text-[#F5F6FA]">
                        {rider.name}
                      </h4>
                      <p className="text-[10px] text-[#8A90A3]">
                        {rider.phone || "No contact"} {rider.distanceKm ? `• ${rider.distanceKm} km away` : ""}
                      </p>
                    </div>
                  </div>

                  <div>
                    {isAvailable ? (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30">
                        🟢 Available
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-[#8A90A3]">
                        {status === "ON_DELIVERY" ? "🔵 On Delivery" : "🟡 Assigned"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-[#1A1F2C] hover:bg-white/10 text-[#8A90A3] font-bold text-xs rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedRiderId}
            className="flex-1 py-2.5 bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] text-white rounded-xl font-extrabold text-xs shadow-md hover:opacity-90 transition-all disabled:opacity-40"
          >
            Confirm Assignment 🛵
          </button>
        </div>
      </div>
    </div>
  );
}
