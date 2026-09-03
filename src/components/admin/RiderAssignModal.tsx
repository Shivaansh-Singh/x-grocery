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

  // Deduplicate riders by ID and email
  const uniqueRiders = riders.filter(
    (rider, index, self) =>
      index === self.findIndex((r) => r.id === rider.id || (r.email && r.email === rider.email))
  );

  const handleConfirm = () => {
    if (!selectedRiderId) return;
    const isValid = uniqueRiders.some((r) => r.id === selectedRiderId);
    if (!isValid) return;
    onAssignRider(order.id, selectedRiderId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
      <div className="bg-white rounded-lg border border-[#111111] p-5 shadow-2xl max-w-md w-full space-y-4 text-[#111111]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
          <div>
            <h2 className="font-extrabold text-base text-[#111111]">
              Assign Delivery Rider
            </h2>
            <p className="text-xs text-[#666666] mt-0.5 font-medium">
              Order #{order.orderNumber} • ₹{order.totalAmount.toFixed(0)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-gray-200 flex items-center justify-center text-[#666666] hover:text-[#111111] font-bold text-sm transition-colors border border-[#E5E5E5]"
          >
            ✕
          </button>
        </div>

        {/* Order Address Summary */}
        <div className="bg-[#F5F5F5] p-3 rounded-lg border border-[#E5E5E5] text-xs space-y-1">
          <span className="text-[10px] font-extrabold text-[#666666] uppercase tracking-wider block">
            Destination
          </span>
          <p className="text-[#111111] font-bold leading-tight">
            {order.deliveryAddress}
          </p>
        </div>

        {/* Available Riders Roster List */}
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold text-[#666666] uppercase tracking-wider block">
            Select Active Rider
          </span>

          <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
            {uniqueRiders.map((rider) => {
              const status = rider.status || "AVAILABLE";
              const isAvailable = status === "AVAILABLE";
              const isSelected = selectedRiderId === rider.id;

              return (
                <div
                  key={rider.id}
                  onClick={() => {
                    if (isAvailable) setSelectedRiderId(rider.id);
                  }}
                  className={`p-3 rounded-lg border transition-colors flex items-center justify-between ${
                    isAvailable
                      ? isSelected
                        ? "bg-[#DFFF00] border-[#111111] text-[#000000] cursor-pointer"
                        : "bg-white border-[#E5E5E5] hover:border-[#111111] cursor-pointer"
                      : "bg-[#F5F5F5] border-[#E5E5E5] opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full shrink-0 ${
                        isAvailable
                          ? "bg-[#168A55]"
                          : status === "ASSIGNED" || status === "ON_DELIVERY"
                          ? "bg-[#111111]"
                          : "bg-[#666666]"
                      }`}
                    />
                    <div>
                      <h4 className="font-extrabold text-xs text-[#111111]">
                        {rider.name}
                      </h4>
                      <p className="text-[10px] text-[#666666] font-medium">
                        {rider.phone || "No contact"} {rider.distanceKm ? `• ${rider.distanceKm} km away` : ""}
                      </p>
                    </div>
                  </div>

                  <div>
                    {isAvailable ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-white text-[#168A55] border border-[#168A55]">
                        🟢 Available
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-[#666666]">
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
        <div className="flex gap-2 pt-2 border-t border-[#E5E5E5]">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-[#F5F5F5] hover:bg-gray-200 text-[#666666] font-bold text-xs rounded transition-colors border border-[#E5E5E5]"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedRiderId}
            className="flex-1 py-2.5 bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] rounded font-black text-xs transition-colors disabled:opacity-40 border border-[#111111]"
          >
            Confirm Assignment 🛵
          </button>
        </div>
      </div>
    </div>
  );
}
