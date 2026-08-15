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
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-4 shadow-xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-base text-zinc-900 dark:text-zinc-100">
              #{order.orderNumber}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isOutForDelivery
                  ? "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 animate-pulse"
                  : isAssigned
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                  : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {order.status === "OUT_FOR_DELIVERY"
                ? "Out for Delivery 🛵"
                : order.status === "ASSIGNED"
                ? "Ready for Pickup"
                : "Delivered ✅"}
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 block mt-0.5">
            {new Date(order.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Payment Collection Badge */}
        <div className="text-right">
          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 block">
            ₹{order.totalAmount.toFixed(0)}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mt-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            {order.paymentMethod === "COD" ? "💵 Collect Cash" : "📲 Scan UPI QR"}
          </span>
        </div>
      </div>

      {/* Customer Call Bar & Off-Campus Address */}
      <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-xs text-zinc-900 dark:text-zinc-100">
            <span>👤 Student Customer</span>
          </div>
          <a
            href={`tel:${cleanPhone}`}
            className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
          >
            <span>📞 Call Student</span>
          </a>
        </div>

        <div className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
          <span className="text-zinc-400 block text-[10px] uppercase font-semibold">
            Off-Campus Address
          </span>
          <span>📍 {order.deliveryAddress}</span>
        </div>
      </div>

      {/* Item Checklist */}
      <div className="space-y-1 text-xs">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
          Grocery Package Items ({order.items.length})
        </span>
        <div className="space-y-1 max-h-24 overflow-y-auto no-scrollbar">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between bg-zinc-50 dark:bg-zinc-800/30 px-2 py-1 rounded-lg border border-zinc-100 dark:border-zinc-800/60"
            >
              <span className="text-zinc-800 dark:text-zinc-200 font-medium truncate">
                {item.productName}
              </span>
              <span className="font-bold text-zinc-500">x{item.quantity}</span>
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
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>🛵 Start Delivery Trip</span>
              <span>→</span>
            </button>
          )}

          {isOutForDelivery && (
            <button
              onClick={() => onOpenPaymentModal?.(order)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>🎉 Mark Order Delivered</span>
              <span>→</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
