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
    <div className="bg-[#FFFFFF] rounded-2xl border border-[#D9D7D2] p-4 shadow-2xs space-y-3">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-sm text-[#111315]">
              #{order.orderNumber}
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusConfig.badgeClass}`}>
              {statusConfig.label}
            </span>
          </div>
          <span className="text-[11px] text-[#666A70] block mt-0.5">{formattedDate}</span>
        </div>

        <div className="text-right">
          <span className="text-sm font-black text-[#FF5A1F] block">
            ₹{order.totalAmount.toFixed(0)}
          </span>
          <span className="text-[10px] font-medium text-[#666A70] bg-[#ECEAE5] px-2 py-0.5 rounded-md inline-block mt-0.5">
            {order.paymentMethod === "COD" ? "Cash on Delivery" : "UPI on Delivery"}
          </span>
        </div>
      </div>

      {/* Item Preview */}
      <div className="bg-[#F5F3EE] p-3 rounded-xl border border-[#D9D7D2] space-y-1.5">
        <span className="text-[10px] font-semibold text-[#666A70] uppercase tracking-wider block">
          Items ({order.items.length})
        </span>
        <div className="space-y-1">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs">
              <span className="text-[#111315] font-medium truncate max-w-[200px]">
                {item.productName}
              </span>
              <span className="font-semibold text-[#666A70]">
                x{item.quantity} • ₹{item.subtotal.toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Action Button */}
      <div className="flex items-center justify-between pt-1">
        <div className="text-[11px] text-[#666A70] truncate max-w-[200px]">
          {order.deliveryAddress.split("•")[0]}
        </div>

        <Link
          href={`/orders/${order.id}`}
          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 ${
            isCompleted
              ? "bg-[#ECEAE5] text-[#111315] hover:bg-[#D9D7D2]"
              : "bg-[#FF5A1F] text-white hover:bg-[#111315]"
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
        badgeClass: "bg-[#ECEAE5] text-[#111315]",
      };
    case "ACCEPTED":
      return {
        label: "Order Accepted",
        badgeClass: "bg-[#1646C7]/10 text-[#1646C7]",
      };
    case "PREPARING":
      return {
        label: "Packing Items",
        badgeClass: "bg-[#1646C7]/10 text-[#1646C7]",
      };
    case "ASSIGNED":
      return {
        label: "Rider Assigned",
        badgeClass: "bg-[#FF5A1F]/10 text-[#FF5A1F]",
      };
    case "OUT_FOR_DELIVERY":
      return {
        label: "Out for Delivery",
        badgeClass: "bg-[#FF5A1F] text-white",
      };
    case "DELIVERED":
      return {
        label: "Delivered",
        badgeClass: "bg-[#168A5B] text-white",
      };
    case "CANCELLED":
    case "REJECTED":
      return {
        label: "Cancelled",
        badgeClass: "bg-[#C63D3D] text-white",
      };
  }
}
