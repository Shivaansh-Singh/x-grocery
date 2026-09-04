"use client";

import type { OrderRecord } from "@/components/orders/OrderCard";

interface DeliveryTaskCardProps {
  order: OrderRecord;
  onStartDelivery?: (orderId: string) => void;
  onOpenPaymentModal?: (order: OrderRecord) => void;
  isMutating?: boolean;
}

export function DeliveryTaskCard({
  order,
  onStartDelivery,
  onOpenPaymentModal,
  isMutating = false,
}: DeliveryTaskCardProps) {
  const isAssigned = order.status === "ASSIGNED";
  const isOutForDelivery = order.status === "OUT_FOR_DELIVERY";
  const isDelivered = order.status === "DELIVERED";

  // Clean phone number for tel: link
  const rawPhone = order.deliveryAddress.split("Phone:")[1]?.trim() || "+91 99999 88888";
  const cleanPhone = rawPhone.replace(/\s+/g, "");

  return (
    <div className="bg-white rounded-lg p-4 border border-[#E5E5E5] space-y-3 text-[#111111]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base text-[#111111]">
              #{order.orderNumber}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                isOutForDelivery
                  ? "bg-[#DFFF00] text-[#000000] border border-[#111111]"
                  : isAssigned
                  ? "bg-[#111111] text-white"
                  : "bg-[#F5F5F5] text-[#666666]"
              }`}
            >
              {order.status === "OUT_FOR_DELIVERY"
                ? "Out for Delivery"
                : order.status === "ASSIGNED"
                ? "Ready for Pickup"
                : "Delivered"}
            </span>
          </div>
          <span className="text-[10px] text-[#666666] font-medium block mt-0.5">
            {new Date(order.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Payment Collection Badge */}
        <div className="text-right">
          <span className="text-sm font-black text-[#111111] block">
            ₹{order.totalAmount.toFixed(0)}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded inline-block mt-0.5 bg-[#F5F5F5] text-[#666666] border border-[#E5E5E5]">
            {order.paymentMethod === "COD" ? "Cash" : "UPI QR"}
          </span>
        </div>
      </div>

      {/* Customer Call Bar & Address */}
      <div className="bg-[#F5F5F5] p-3.5 rounded-lg border border-[#E5E5E5] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-xs text-[#111111]">
            <span>Customer Details</span>
          </div>
          <a
            href={`tel:${cleanPhone}`}
            className="px-3.5 py-1.5 bg-[#111111] hover:bg-black text-white font-black text-xs rounded transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1.11 1.11 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>Call Customer</span>
          </a>
        </div>

        <div className="text-xs text-[#111111] font-medium leading-normal">
          <span className="text-[#666666] block text-[10px] uppercase font-extrabold tracking-wider">
            Delivery Address
          </span>
          <span>{order.deliveryAddress}</span>
        </div>
      </div>

      {/* Item Checklist */}
      <div className="space-y-1 text-xs">
        <span className="text-[10px] font-extrabold text-[#666666] uppercase tracking-wider block">
          Grocery Package Items ({order.items.length})
        </span>
        <div className="space-y-1 max-h-24 overflow-y-auto no-scrollbar">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between bg-[#F5F5F5] px-2.5 py-1 rounded border border-[#E5E5E5]"
            >
              <span className="text-[#111111] font-bold truncate">
                {item.productName}
              </span>
              <span className="font-bold text-[#666666]">x{item.quantity}</span>
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
              disabled={isMutating}
              className="w-full py-3 bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] rounded font-black text-xs transition-colors border border-[#111111] flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isMutating ? "STARTING DELIVERY... 🛵" : "START DELIVERY 🛵"}</span>
              <span>→</span>
            </button>
          )}

          {isOutForDelivery && (
            <button
              onClick={() => onOpenPaymentModal?.(order)}
              disabled={isMutating}
              className="w-full py-3 bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] rounded font-black text-xs transition-colors border border-[#111111] flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isMutating ? "PROCESSING... ⏳" : "MARK DELIVERED 🎉"}</span>
              <span>→</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
