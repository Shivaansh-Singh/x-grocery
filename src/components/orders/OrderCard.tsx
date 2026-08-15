"use client";

import Link from "next/link";

export interface OrderItemRecord {
  id: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  status: "PENDING" | "ACCEPTED" | "PREPARING" | "ASSIGNED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "REJECTED";
  paymentMethod: "COD" | "UPI_ON_DELIVERY";
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED";
  totalAmount: number;
  deliveryAddress: string;
  createdAt: string;
  items: OrderItemRecord[];
  deliveryPartner?: {
    name: string;
    phone?: string | null;
  } | null;
}

export function OrderCard({ order }: { order: OrderRecord }) {
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const statusConfig = getStatusBadgeConfig(order.status);
  const isCompleted = order.status === "DELIVERED" || order.status === "CANCELLED" || order.status === "REJECTED";

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-4 shadow-xs hover:shadow-md transition-all space-y-3">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
              #{order.orderNumber}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusConfig.badgeClass}`}>
              {statusConfig.label}
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 block mt-0.5">{formattedDate}</span>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block">
            ₹{order.totalAmount.toFixed(0)}
          </span>
          <span className="text-[10px] text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md inline-block mt-0.5">
            {order.paymentMethod === "COD" ? "Cash on Delivery" : "UPI on Delivery"}
          </span>
        </div>
      </div>

      {/* Item Preview */}
      <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 space-y-1.5">
        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
          Items ({order.items.length})
        </span>
        <div className="space-y-1">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs">
              <span className="text-zinc-700 dark:text-zinc-300 truncate max-w-[200px]">
                {item.productName}
              </span>
              <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                x{item.quantity} • ₹{item.subtotal.toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Action Button */}
      <div className="flex items-center justify-between pt-1">
        <div className="text-[11px] text-zinc-500 truncate max-w-[200px]">
          📍 {order.deliveryAddress.split("•")[0]}
        </div>

        <Link
          href={`/orders/${order.id}`}
          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1 ${
            isCompleted
              ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              : "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500"
          }`}
        >
          <span>{isCompleted ? "View Receipt" : "Track Live"}</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}

function getStatusBadgeConfig(status: OrderRecord["status"]) {
  switch (status) {
    case "PENDING":
      return {
        label: "Order Placed",
        badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
      };
    case "ACCEPTED":
      return {
        label: "Order Accepted",
        badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
      };
    case "PREPARING":
      return {
        label: "Packing Items",
        badgeClass: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
      };
    case "ASSIGNED":
      return {
        label: "Rider Assigned",
        badgeClass: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
      };
    case "OUT_FOR_DELIVERY":
      return {
        label: "Out for Delivery 🛵",
        badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse",
      };
    case "DELIVERED":
      return {
        label: "Delivered ✅",
        badgeClass: "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
      };
    case "CANCELLED":
    case "REJECTED":
      return {
        label: "Cancelled",
        badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
      };
  }
}
