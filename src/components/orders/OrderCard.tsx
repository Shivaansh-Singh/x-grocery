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
    <div className="bg-[#151B24] rounded-2xl border border-[#27313D] p-4 shadow-md space-y-3 text-white">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-[#FFFFFF]">
              #{order.orderNumber}
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusConfig.badgeClass}`}>
              {statusConfig.label}
            </span>
          </div>
          <span className="text-[11px] text-[#A8B0BC] block mt-0.5">{formattedDate}</span>
        </div>

        <div className="text-right">
          <span className="text-sm font-extrabold text-[#FF5A00] block">
            ₹{order.totalAmount.toFixed(0)}
          </span>
          <span className="text-[10px] font-semibold text-[#A8B0BC] bg-[#1C2430] border border-[#27313D] px-2 py-0.5 rounded-md inline-block mt-0.5">
            {order.paymentMethod === "COD" ? "Cash on Delivery" : "UPI on Delivery"}
          </span>
        </div>
      </div>

      {/* Item Preview */}
      <div className="bg-[#1C2430] p-3 rounded-xl border border-[#27313D] space-y-1.5">
        <span className="text-[10px] font-bold text-[#737D8B] uppercase tracking-wider block">
          Items ({order.items.length})
        </span>
        <div className="space-y-1">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs">
              <span className="text-[#FFFFFF] font-medium truncate max-w-[200px]">
                {item.productName}
              </span>
              <span className="font-semibold text-[#A8B0BC]">
                x{item.quantity} • ₹{item.subtotal.toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Action Button */}
      <div className="flex items-center justify-between pt-1">
        <div className="text-[11px] text-[#737D8B] truncate max-w-[200px]">
          {order.deliveryAddress.split("•")[0]}
        </div>

        <Link
          href={`/orders/${order.id}`}
          className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs shadow-xs transition-colors flex items-center gap-1.5 ${
            isCompleted
              ? "bg-[#1C2430] text-[#A8B0BC] hover:text-[#FFFFFF] border border-[#27313D]"
              : "bg-[#FF5A00] text-white hover:bg-[#FF6A1A]"
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
        badgeClass: "bg-[#1C2430] text-[#A8B0BC] border border-[#27313D]",
      };
    case "ACCEPTED":
      return {
        label: "Order Accepted",
        badgeClass: "bg-[#0757D5]/20 text-[#0757D5] border border-[#0757D5]/40",
      };
    case "PREPARING":
      return {
        label: "Packing Items",
        badgeClass: "bg-[#0757D5]/20 text-[#0757D5] border border-[#0757D5]/40",
      };
    case "ASSIGNED":
      return {
        label: "Rider Assigned",
        badgeClass: "bg-[#FF5A00]/20 text-[#FF5A00] border border-[#FF5A00]/40",
      };
    case "OUT_FOR_DELIVERY":
      return {
        label: "Out for Delivery",
        badgeClass: "bg-[#FF5A00] text-white",
      };
    case "DELIVERED":
      return {
        label: "Delivered",
        badgeClass: "bg-[#19B978] text-white",
      };
    case "CANCELLED":
    case "REJECTED":
      return {
        label: "Cancelled",
        badgeClass: "bg-[#FF4D4D] text-white",
      };
  }
}
