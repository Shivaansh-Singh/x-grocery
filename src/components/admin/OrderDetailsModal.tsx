"use client";

import type { OrderRecord } from "@/components/orders/OrderCard";
import { OrderTrackingTimeline } from "@/components/orders/OrderTrackingTimeline";

interface OrderDetailsModalProps {
  order: OrderRecord;
  onClose: () => void;
  onUpdateStatus: (
    orderId: string,
    newStatus: string,
    deliveryPartnerId?: string,
    rejectionReason?: string
  ) => void;
  isRiderView?: boolean;
}

export function OrderDetailsModal({
  order,
  onClose,
  onUpdateStatus,
  isRiderView = false,
}: OrderDetailsModalProps) {
  const isPending = order.status === "PENDING";
  const isAccepted = order.status === "ACCEPTED";
  const isPreparing = order.status === "PREPARING";
  const isReady = order.status === "ASSIGNED";
  const isOutForDelivery = order.status === "OUT_FOR_DELIVERY";

  const rawPhone = order.deliveryAddress.split("Phone:")[1]?.trim() || "+91 99999 88888";
  const cleanPhone = rawPhone.replace(/\s+/g, "");

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-150">
      <div className="bg-[#141822] rounded-[24px] border border-white/15 p-5 shadow-2xl max-w-lg w-full space-y-4 text-[#F5F6FA] max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-lg text-[#F5F6FA]">
                #{order.orderNumber}
              </h2>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] text-white">
                {order.status}
              </span>
            </div>
            <p className="text-[11px] text-[#8A90A3] mt-0.5">
              Placed at: {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1A1F2C] hover:bg-white/10 flex items-center justify-center text-[#8A90A3] hover:text-white font-bold text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Customer & Address Details */}
        <div className="bg-[#1A1F2C] p-3.5 rounded-[16px] border border-white/8 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#2D6CFF] uppercase tracking-wider block">
                Customer Details
              </span>
              <span className="font-bold text-[#F5F6FA] text-sm">
                Day Scholar Student
              </span>
            </div>
            <a
              href={`tel:${cleanPhone}`}
              className="px-3 py-1.5 bg-[#2D6CFF] text-white rounded-xl font-bold text-xs shadow-xs hover:opacity-90 flex items-center gap-1"
            >
              <span>📞</span>
              <span>Call Student</span>
            </a>
          </div>

          <div className="pt-1 border-t border-white/8">
            <span className="text-[10px] font-bold text-[#8A90A3] uppercase tracking-wider block">
              Off-Campus Delivery Address
            </span>
            <p className="text-xs text-[#F5F6FA] font-medium leading-relaxed mt-0.5">
              {order.deliveryAddress}
            </p>
          </div>
        </div>

        {/* Itemized Receipt Table */}
        <div className="bg-[#1A1F2C] p-3.5 rounded-[16px] border border-white/8 space-y-2.5 text-xs">
          <h3 className="font-display font-extrabold text-xs text-[#F5F6FA] uppercase tracking-wider">
            Order Items ({order.items.length})
          </h3>

          <div className="space-y-1.5 border-t border-white/8 pt-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs">
                <span className="text-[#F5F6FA] font-medium truncate max-w-[200px]">
                  {item.productName}
                </span>
                <span className="text-[#8A90A3] font-bold">
                  x{item.quantity} • ₹{item.subtotal.toFixed(0)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/8 pt-2 space-y-1 text-xs">
            <div className="flex justify-between text-[#8A90A3]">
              <span>Payment Method</span>
              <span className="font-bold text-[#F5F6FA]">
                {order.paymentMethod === "COD" ? "Cash on Delivery" : "UPI on Delivery"}
              </span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-[#F5F6FA] pt-1">
              <span>Total Amount</span>
              <span className="text-[#FF6B1A]">₹{order.totalAmount.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Assigned Rider Info */}
        {order.deliveryPartner && (
          <div className="bg-[#1A1F2C] p-3 rounded-[16px] border border-white/8 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] font-bold text-[#8A90A3] uppercase tracking-wider block">
                Assigned Rider
              </span>
              <span className="font-bold text-[#F5F6FA]">
                {order.deliveryPartner.name}
              </span>
            </div>
            {order.deliveryPartner.phone && (
              <span className="text-xs text-[#2D6CFF] font-bold">
                {order.deliveryPartner.phone}
              </span>
            )}
          </div>
        )}

        {/* Order Status Timeline */}
        <OrderTrackingTimeline status={order.status} />

        {/* Admin or Rider Status Actions */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          {!isRiderView && isPending && (
            <button
              onClick={() => {
                onUpdateStatus(order.id, "ACCEPTED");
                onClose();
              }}
              className="w-full py-3 bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] text-white rounded-xl font-extrabold text-xs shadow-md hover:opacity-90 transition-all"
            >
              ACCEPT ORDER ✓
            </button>
          )}

          {!isRiderView && isAccepted && (
            <button
              onClick={() => {
                onUpdateStatus(order.id, "PREPARING");
                onClose();
              }}
              className="w-full py-3 bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] text-white rounded-xl font-extrabold text-xs shadow-md hover:opacity-90 transition-all"
            >
              START PREPARING / PACKING 📦
            </button>
          )}

          {!isRiderView && isPreparing && (
            <button
              onClick={() => {
                onUpdateStatus(order.id, "ASSIGNED");
                onClose();
              }}
              className="w-full py-3 bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] text-white rounded-xl font-extrabold text-xs shadow-md hover:opacity-90 transition-all"
            >
              MARK READY FOR PICKUP ⚡
            </button>
          )}

          {isRiderView && (isReady || isAccepted) && (
            <button
              onClick={() => {
                onUpdateStatus(order.id, "OUT_FOR_DELIVERY");
                onClose();
              }}
              className="w-full py-3 bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] text-white rounded-xl font-extrabold text-xs shadow-md hover:opacity-90 transition-all"
            >
              MARK PICKED UP / OUT FOR DELIVERY 🛵
            </button>
          )}

          {isRiderView && isOutForDelivery && (
            <button
              onClick={() => {
                onUpdateStatus(order.id, "DELIVERED");
                onClose();
              }}
              className="w-full py-3 bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] text-white rounded-xl font-extrabold text-xs shadow-md hover:opacity-90 transition-all"
            >
              MARK DELIVERED 🎉
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#1A1F2C] hover:bg-white/10 text-[#8A90A3] font-bold text-xs rounded-xl transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
