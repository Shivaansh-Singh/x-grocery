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
  updatedAt?: string;
  deliveryPartnerId?: string | null;
  notes?: string | null;
  items: OrderItemRecord[];
  deliveryPartner?: {
    id?: string;
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
    <div className="bg-[#141822] rounded-2xl border border-white/8 p-4 shadow-md space-y-3 text-[#F5F6FA]">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-[#F5F6FA]">
              #{order.orderNumber}
            </span>
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${statusConfig.badgeClass}`}>
              {statusConfig.label}
            </span>
          </div>
          <span className="text-[11px] text-[#8A90A3] block mt-0.5">{formattedDate}</span>
        </div>

        <div className="text-right">
          <span className="text-sm font-black text-[#FF6B1A] block">
            ₹{order.totalAmount.toFixed(0)}
          </span>
          <span className="text-[10px] font-semibold text-[#8A90A3] bg-[#1A1F2C] border border-white/8 px-2 py-0.5 rounded-md inline-block mt-0.5">
            {order.paymentMethod === "COD" ? "Cash on Delivery" : "UPI on Delivery"}
          </span>
        </div>
      </div>

      {/* Item Preview */}
      <div className="bg-[#1A1F2C] p-3 rounded-xl border border-white/8 space-y-1.5">
        <span className="text-[10px] font-bold text-[#8A90A3] uppercase tracking-wider block">
          Items ({order.items.length})
        </span>
        <div className="space-y-1">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs">
              <span className="text-[#F5F6FA] font-medium truncate max-w-[200px]">
                {item.productName}
              </span>
              <span className="font-semibold text-[#8A90A3]">
                x{item.quantity} • ₹{item.subtotal.toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Action Button */}
      <div className="flex items-center justify-between pt-1">
        <div className="text-[11px] text-[#8A90A3] truncate max-w-[200px]">
          {order.deliveryAddress.split("•")[0]}
        </div>

        <Link
          href={`/orders/${order.id}`}
          className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5 ${
            isCompleted
              ? "bg-[#1A1F2C] text-[#8A90A3] hover:text-[#F5F6FA] border border-white/8"
              : "bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] text-white hover:opacity-90"
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
        badgeClass: "bg-[#1A1F2C] text-[#8A90A3] border border-white/8",
      };
    case "ACCEPTED":
      return {
        label: "Order Accepted",
        badgeClass: "bg-[#2D6CFF]/20 text-[#2D6CFF] border border-[#2D6CFF]/40",
      };
    case "PREPARING":
      return {
        label: "Packing Items",
        badgeClass: "bg-[#2D6CFF]/20 text-[#2D6CFF] border border-[#2D6CFF]/40",
      };
    case "ASSIGNED":
      return {
        label: "Rider Assigned",
        badgeClass: "bg-[#FF6B1A]/20 text-[#FF6B1A] border border-[#FF6B1A]/40",
      };
    case "OUT_FOR_DELIVERY":
      return {
        label: "Out for Delivery",
        badgeClass: "bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] text-white",
      };
    case "DELIVERED":
      return {
        label: "Delivered",
        badgeClass: "bg-[#3DD68C] text-white",
      };
    case "CANCELLED":
    case "REJECTED":
      return {
        label: "Cancelled",
        badgeClass: "bg-[#FF4D4D] text-white",
      };
  }
}
