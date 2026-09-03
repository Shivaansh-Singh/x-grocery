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
  assignedRiderId?: string | null;
  notes?: string | null;
  deliveryOtp?: string | null;
  deliveryOtpVerified?: boolean;
  deliveryOtpVerifiedAt?: string | null;
  items: OrderItemRecord[];
  customer?: {
    id?: string;
    name?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
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
    <div className="bg-white rounded-lg border border-[#E5E5E5] p-4 space-y-3 text-[#111111]">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-[#111111]">
              #{order.orderNumber}
            </span>
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${statusConfig.badgeClass}`}>
              {statusConfig.label}
            </span>
          </div>
          <span className="text-[11px] text-[#666666] block mt-0.5 font-medium">{formattedDate}</span>
        </div>

        <div className="text-right">
          <span className="text-sm font-black text-[#111111] block">
            ₹{order.totalAmount.toFixed(0)}
          </span>
          <span className="text-[10px] font-bold text-[#666666] bg-[#F5F5F5] border border-[#E5E5E5] px-2 py-0.5 rounded inline-block mt-0.5">
            {order.paymentMethod === "COD" ? "Cash on Delivery" : "UPI on Delivery"}
          </span>
        </div>
      </div>

      {/* Item Preview */}
      <div className="bg-[#F5F5F5] p-3 rounded-lg border border-[#E5E5E5] space-y-1.5">
        <span className="text-[10px] font-extrabold text-[#666666] uppercase tracking-wider block">
          Items ({order.items.length})
        </span>
        <div className="space-y-1">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs">
              <span className="text-[#111111] font-bold truncate max-w-[200px]">
                {item.productName}
              </span>
              <span className="font-bold text-[#666666]">
                x{item.quantity} • ₹{item.subtotal.toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Action Button */}
      <div className="flex items-center justify-between pt-1">
        <div className="text-[11px] text-[#666666] font-medium truncate max-w-[200px]">
          {order.deliveryAddress.split("•")[0]}
        </div>

        <Link
          href={`/orders/${order.id}`}
          className={`px-3.5 py-1.5 rounded text-xs transition-colors flex items-center gap-1.5 border font-black ${
            isCompleted
              ? "bg-[#F5F5F5] text-[#666666] hover:text-[#111111] border-[#E5E5E5]"
              : "bg-[#DFFF00] text-[#000000] hover:bg-[#C8E600] border-[#111111]"
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
        badgeClass: "bg-[#F5F5F5] text-[#666666] border border-[#E5E5E5]",
      };
    case "ACCEPTED":
      return {
        label: "Order Accepted",
        badgeClass: "bg-[#111111] text-white border border-[#111111]",
      };
    case "PREPARING":
      return {
        label: "Packing Items",
        badgeClass: "bg-[#111111] text-[#DFFF00] border border-[#111111]",
      };
    case "ASSIGNED":
      return {
        label: "Rider Assigned",
        badgeClass: "bg-[#111111] text-[#DFFF00] border border-[#111111]",
      };
    case "OUT_FOR_DELIVERY":
      return {
        label: "Out for Delivery",
        badgeClass: "bg-[#DFFF00] text-[#000000] border border-[#111111]",
      };
    case "DELIVERED":
      return {
        label: "Delivered",
        badgeClass: "bg-[#168A55] text-white",
      };
    case "CANCELLED":
    case "REJECTED":
      return {
        label: "Cancelled",
        badgeClass: "bg-[#D92D3A] text-white",
      };
  }
}
