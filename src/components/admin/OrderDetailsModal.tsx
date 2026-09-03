"use client";

import type { OrderRecord } from "@/components/orders/OrderCard";
import { OrderTrackingTimeline, getCleanRejectionReason } from "@/components/orders/OrderTrackingTimeline";

interface OrderDetailsModalProps {
  order: OrderRecord;
  onClose: () => void;
  onUpdateStatus: (
    orderId: string,
    newStatus: string,
    deliveryPartnerId?: string,
    rejectionReason?: string
  ) => void;
  onOpenReject?: (order: OrderRecord) => void;
  onOpenAssign?: (order: OrderRecord) => void;
  onOpenDeliveryOtpModal?: (order: OrderRecord) => void;
  isRiderView?: boolean;
}

export function OrderDetailsModal({
  order,
  onClose,
  onUpdateStatus,
  onOpenReject,
  onOpenAssign,
  onOpenDeliveryOtpModal,
  isRiderView = false,
}: OrderDetailsModalProps) {
  const isPending = order.status === "PENDING";
  const isAccepted = order.status === "ACCEPTED";
  const isPreparing = order.status === "PREPARING";
  const isReady = order.status === "ASSIGNED";
  const isOutForDelivery = order.status === "OUT_FOR_DELIVERY";
  const isRejectedOrCancelled = order.status === "REJECTED" || order.status === "CANCELLED";

  const customerName = order.customer?.name || "RushD Customer";
  const rawPhone = order.customer?.phone || order.deliveryAddress.split("Phone:")[1]?.trim() || "+91 99999 88888";
  const cleanPhone = rawPhone.replace(/\s+/g, "");

  const itemSubtotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);
  const extraFees = Math.max(0, order.totalAmount - itemSubtotal);
  const platformFee = extraFees === 22 || extraFees === 2 || extraFees > 20 ? 2 : 0;
  const deliveryFee = extraFees - platformFee;

  const formattedDate = new Date(order.createdAt).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const rejectionReason = getCleanRejectionReason(order.notes);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
      <div className="bg-white rounded-lg border border-[#111111] p-5 shadow-2xl max-w-lg w-full space-y-4 text-[#111111] max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* 1. ORDER INFORMATION HEADER */}
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-lg text-[#111111]">
                #{order.orderNumber}
              </h2>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                order.status === "DELIVERED"
                  ? "bg-[#168A55] text-white"
                  : order.status === "REJECTED" || order.status === "CANCELLED"
                  ? "bg-[#D92D3A] text-white"
                  : order.status === "OUT_FOR_DELIVERY"
                  ? "bg-[#DFFF00] text-[#000000] border border-[#111111]"
                  : "bg-[#111111] text-white"
              }`}>
                {order.status}
              </span>
            </div>
            <p className="text-[11px] text-[#666666] mt-0.5 font-medium">
              Placed: {formattedDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-gray-200 flex items-center justify-center text-[#666666] hover:text-[#111111] font-bold text-sm transition-colors border border-[#E5E5E5]"
          >
            ✕
          </button>
        </div>

        {/* REJECTION REASON BANNER (IF REJECTED) */}
        {isRejectedOrCancelled && (
          <div className="p-3 bg-red-50 border border-[#D92D3A] rounded-lg text-xs space-y-1">
            <span className="text-[10px] font-extrabold text-[#D92D3A] uppercase tracking-wider block">
              {order.status === "REJECTED" ? "Rejection Reason" : "Cancellation Reason"}
            </span>
            <p className="font-bold text-[#D92D3A]">
              &quot;{rejectionReason || "Store is unable to fulfil the order"}&quot;
            </p>
          </div>
        )}

        {/* 2. CUSTOMER INFORMATION */}
        <div className="bg-[#F5F5F5] p-3.5 rounded-lg border border-[#E5E5E5] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-[#666666] uppercase tracking-wider block">
                Customer Information
              </span>
              <span className="font-extrabold text-[#111111] text-sm block">
                {customerName}
              </span>
              <span className="text-[11px] text-[#666666] font-bold block mt-0.5">
                📞 {rawPhone}
              </span>
            </div>
            <a
              href={`tel:${cleanPhone}`}
              className="px-3 py-1.5 bg-[#111111] text-white rounded font-bold text-xs hover:bg-black flex items-center gap-1 border border-[#111111]"
            >
              <span>📞</span>
              <span>Call</span>
            </a>
          </div>

          {/* 3. DELIVERY INFORMATION */}
          <div className="pt-2 border-t border-[#E5E5E5]">
            <span className="text-[10px] font-extrabold text-[#666666] uppercase tracking-wider block">
              Delivery Destination
            </span>
            <p className="text-xs text-[#111111] font-medium leading-relaxed mt-0.5">
              {order.deliveryAddress}
            </p>
          </div>
        </div>

        {/* 4. ORDER ITEMS (WITH PRICE SNAPSHOTS) */}
        <div className="bg-[#F5F5F5] p-3.5 rounded-lg border border-[#E5E5E5] space-y-2.5 text-xs">
          <h3 className="font-extrabold text-xs text-[#111111] uppercase tracking-wider">
            Items Ordered ({order.items.length})
          </h3>

          <div className="space-y-2 border-t border-[#E5E5E5] pt-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#111111] font-bold block truncate max-w-[240px]">
                    {item.productName}
                  </span>
                  <span className="text-[10px] text-[#666666] font-medium">
                    ₹{item.unitPrice.toFixed(0)} each × {item.quantity}
                  </span>
                </div>
                <span className="font-black text-[#111111]">
                  ₹{item.subtotal.toFixed(0)}
                </span>
              </div>
            ))}
          </div>

          {/* 5. BILLING BREAKDOWN */}
          <div className="border-t border-[#E5E5E5] pt-2 space-y-1 text-xs">
            <div className="flex justify-between text-[#666666] font-medium">
              <span>Items Subtotal</span>
              <span className="font-bold text-[#111111]">₹{itemSubtotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-[#666666] font-medium">
              <span>Delivery Charge</span>
              <span className="font-bold text-[#111111]">
                {deliveryFee === 0 ? "FREE (₹0)" : `₹${deliveryFee.toFixed(0)}`}
              </span>
            </div>
            {platformFee > 0 && (
              <div className="flex justify-between text-[#666666] font-medium">
                <span>Platform &amp; Packaging Fee</span>
                <span className="font-bold text-[#111111]">₹{platformFee.toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#666666] font-medium">
              <span>Payment Method</span>
              <span className="font-bold text-[#111111]">
                {order.paymentMethod === "COD" ? "Cash on Delivery" : "UPI on Delivery"}
              </span>
            </div>
            <div className="flex justify-between text-sm font-black text-[#111111] pt-1.5 border-t border-[#E5E5E5]">
              <span>Final Total</span>
              <span className="text-base text-[#111111]">₹{order.totalAmount.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* 6. RIDER INFORMATION */}
        <div className="bg-[#F5F5F5] p-3 rounded-lg border border-[#111111] flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] font-extrabold text-[#666666] uppercase tracking-wider block">
              Assigned Delivery Partner
            </span>
            <span className="font-black text-[#111111] text-xs">
              {order.deliveryPartner ? `🛵 ${order.deliveryPartner.name}` : "⚠️ No Rider Assigned Yet"}
            </span>
            {order.deliveryPartner?.phone && (
              <span className="text-[11px] text-[#666666] font-medium block">
                {order.deliveryPartner.phone}
              </span>
            )}
          </div>
          {!isRiderView && (isAccepted || isPreparing || isReady) && onOpenAssign && (
            <button
              onClick={() => {
                onClose();
                onOpenAssign(order);
              }}
              className="px-3 py-1.5 bg-[#111111] text-white font-bold text-xs rounded hover:bg-black"
            >
              {order.deliveryPartner ? "Reassign" : "Assign Rider"}
            </button>
          )}
        </div>

        {/* 7. DELIVERY OTP VERIFICATION STATUS */}
        <div className="bg-[#F5F5F5] p-3 rounded-lg border border-[#E5E5E5] flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] font-extrabold text-[#666666] uppercase tracking-wider block">
              Delivery OTP Verification
            </span>
            <span className="font-bold text-xs text-[#111111] flex items-center gap-1.5 mt-0.5">
              {order.status === "DELIVERED" || order.deliveryOtpVerified ? (
                <span className="text-[#168A55] font-black flex items-center gap-1">
                  <span>✓</span>
                  <span>Verified &amp; Delivered</span>
                </span>
              ) : (
                <span className="text-[#666666]">
                  ⏳ Pending Customer Doorstep Verification
                </span>
              )}
            </span>
          </div>
          {order.deliveryOtpVerifiedAt && (
            <span className="text-[10px] text-[#666666] font-medium">
              {new Date(order.deliveryOtpVerifiedAt).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        {/* 8. ORDER TRACKING TIMELINE */}
        <OrderTrackingTimeline status={order.status} notes={order.notes} />

        {/* 8. ACTION BUTTONS & STATUS PROGRESSION */}
        <div className="pt-2 border-t border-[#E5E5E5] space-y-2">
          {/* Admin Pending Action: Accept / Reject */}
          {!isRiderView && isPending && (
            <div className="flex gap-2">
              {onOpenReject && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenReject(order);
                  }}
                  className="flex-1 py-3 bg-[#D92D3A] hover:bg-red-700 text-white rounded font-black text-xs border border-[#111111] transition-colors"
                >
                  REJECT ✕
                </button>
              )}
              <button
                onClick={() => {
                  onUpdateStatus(order.id, "ACCEPTED");
                  onClose();
                }}
                className="flex-1 py-3 bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] rounded font-black text-xs border border-[#111111] transition-colors"
              >
                ACCEPT ORDER ✓
              </button>
            </div>
          )}

          {!isRiderView && isAccepted && (
            <button
              onClick={() => {
                onUpdateStatus(order.id, "PREPARING");
                onClose();
              }}
              className="w-full py-3 bg-[#111111] hover:bg-black text-white rounded font-black text-xs border border-[#111111] transition-colors"
            >
              START PACKING ITEMS 📦
            </button>
          )}

          {!isRiderView && isPreparing && (
            <button
              onClick={() => {
                onUpdateStatus(order.id, "ASSIGNED");
                onClose();
              }}
              className="w-full py-3 bg-[#111111] hover:bg-black text-[#DFFF00] rounded font-black text-xs border border-[#111111] transition-colors"
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
              className="w-full py-3 bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] rounded font-black text-xs border border-[#111111] transition-colors"
            >
              START DELIVERY / OUT FOR DELIVERY 🛵
            </button>
          )}

          {isRiderView && isOutForDelivery && (
            <button
              onClick={() => {
                onClose();
                if (onOpenDeliveryOtpModal) {
                  onOpenDeliveryOtpModal(order);
                } else {
                  onUpdateStatus(order.id, "DELIVERED");
                }
              }}
              className="w-full py-3 bg-[#168A55] hover:bg-emerald-700 text-white rounded font-black text-xs border border-[#111111] transition-colors"
            >
              ENTER OTP &amp; MARK DELIVERED 🔑
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#F5F5F5] hover:bg-gray-200 text-[#666666] font-bold text-xs rounded transition-colors border border-[#E5E5E5]"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

