"use client";

import type { OrderRecord } from "@/components/orders/OrderCard";

interface DeliveryTaskCardProps {
  order: OrderRecord;
  onStartDelivery?: (orderId: string) => void;
  onOpenPaymentModal?: (order: OrderRecord) => void;
}

export function DeliveryTaskCard({
  order,
  onStartDelivery,
  onOpenPaymentModal,
}: DeliveryTaskCardProps) {
  const isAssigned = order.status === "ASSIGNED";
  const isOutForDelivery = order.status === "OUT_FOR_DELIVERY";
  const isDelivered = order.status === "DELIVERED";

  // Clean phone number for tel: link
  const rawPhone = order.deliveryAddress.split("Phone:")[1]?.trim() || "+91 99999 88888";
  const cleanPhone = rawPhone.replace(/\s+/g, "");

  return (
    <div className="bg-[#151B24] rounded-2xl border border-[#27313D] p-4 shadow-md space-y-3 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base text-[#FFFFFF]">
              #{order.orderNumber}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                isOutForDelivery
                  ? "bg-[#FF5A00] text-white"
                  : isAssigned
                  ? "bg-[#0757D5] text-white"
                  : "bg-[#1C2430] text-[#A8B0BC]"
              }`}
            >
              {order.status === "OUT_FOR_DELIVERY"
                ? "Out for Delivery"
                : order.status === "ASSIGNED"
                ? "Ready for Pickup"
                : "Delivered"}
            </span>
          </div>
          <span className="text-[10px] text-[#A8B0BC] font-medium block mt-0.5">
            {new Date(order.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Payment Collection Badge */}
        <div className="text-right">
          <span className="text-sm font-extrabold text-[#FF5A00] block">
            ₹{order.totalAmount.toFixed(0)}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mt-0.5 bg-[#1C2430] text-[#A8B0BC] border border-[#27313D]">
            {order.paymentMethod === "COD" ? "Cash" : "UPI QR"}
          </span>
        </div>
      </div>

      {/* Customer Call Bar & Off-Campus Address */}
      <div className="bg-[#1C2430] p-3.5 rounded-xl border border-[#27313D] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-extrabold text-xs text-[#FFFFFF]">
            <span>Student Customer</span>
          </div>
          <a
            href={`tel:${cleanPhone}`}
            className="px-3.5 py-1.5 bg-[#19B978] hover:bg-[#151B24] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1.11 1.11 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>Call Student</span>
          </a>
        </div>

        <div className="text-xs text-[#FFFFFF] font-medium leading-normal">
          <span className="text-[#737D8B] block text-[10px] uppercase font-bold tracking-wider">
            Off-Campus Address
          </span>
          <span>{order.deliveryAddress}</span>
        </div>
      </div>

      {/* Item Checklist */}
      <div className="space-y-1 text-xs">
        <span className="text-[10px] font-bold text-[#737D8B] uppercase tracking-wider block">
          Grocery Package Items ({order.items.length})
        </span>
        <div className="space-y-1 max-h-24 overflow-y-auto no-scrollbar">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between bg-[#1C2430] px-2.5 py-1 rounded-lg border border-[#27313D]"
            >
              <span className="text-[#FFFFFF] font-medium truncate">
                {item.productName}
              </span>
              <span className="font-bold text-[#A8B0BC]">x{item.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Action Button */}
      {!isDelivered && (
        <div className="pt-1">
          {isAssigned && (
            <button
              onClick={() => onStartDelivery?.(order.id)}
              className="w-full py-3 bg-[#FF5A00] hover:bg-[#FF6A1A] text-white rounded-xl font-extrabold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Start Delivery Trip 🛵</span>
              <span>→</span>
            </button>
          )}

          {isOutForDelivery && (
            <button
              onClick={() => onOpenPaymentModal?.(order)}
              className="w-full py-3 bg-[#19B978] hover:bg-[#151B24] text-white rounded-xl font-extrabold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Mark Order Delivered 🎉</span>
              <span>→</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
