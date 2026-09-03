"use client";

import { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { OrderTrackingTimeline } from "@/components/orders/OrderTrackingTimeline";
import { RiderContactCard } from "@/components/orders/RiderContactCard";
import type { OrderRecord } from "@/components/orders/OrderCard";

function OrderTrackingContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const isNewOrder = searchParams.get("newOrder") === "true";
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data.order) {
        setOrder((prev) => {
          const next = data.order;
          if (prev && !next.deliveryOtp && prev.deliveryOtp && !next.deliveryOtpVerified) {
            return { ...next, deliveryOtp: prev.deliveryOtp };
          }
          return next;
        });
      }
    } catch (err) {
      console.error("Error refreshing order:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`);
        const data = await res.json();
        if (!ignore && data.order) {
          setOrder((prev) => {
            const next = data.order;
            if (prev && !next.deliveryOtp && prev.deliveryOtp && !next.deliveryOtpVerified) {
              return { ...next, deliveryOtp: prev.deliveryOtp };
            }
            return next;
          });
        } else if (!ignore) {
          const lastOrder = localStorage.getItem("x_grocery_last_order");
          if (lastOrder) {
            const parsed = JSON.parse(lastOrder);
            if (parsed.id === id || parsed.orderNumber === id) {
              setOrder(parsed);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching order tracking:", err);
        if (!ignore) {
          const lastOrder = localStorage.getItem("x_grocery_last_order");
          if (lastOrder) {
            setOrder(JSON.parse(lastOrder));
          }
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadOrder();

    // Auto-polling interval every 4 seconds
    const interval = setInterval(() => {
      if (!ignore) {
        loadOrder();
      }
    }, 4000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4 pt-4 animate-pulse">
        <div className="h-10 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
        <div className="h-64 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
        <div className="h-32 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6 pt-6 text-center text-[#111111]">
        <div className="bg-white rounded-lg p-8 border border-[#E5E5E5] space-y-4 max-w-md mx-auto">
          <h2 className="text-lg font-extrabold text-[#111111]">
            Order Not Found
          </h2>
          <p className="text-xs text-[#666666] max-w-xs mx-auto font-medium">
            We couldn&apos;t find order details for #{id}.
          </p>
          <Link
            href="/orders"
            className="inline-block px-5 py-2.5 bg-[#111111] text-white rounded font-extrabold text-xs hover:bg-black transition-colors"
          >
            View Order History
          </Link>
        </div>
      </div>
    );
  }

  const showRiderCard =
    order.status === "ASSIGNED" || order.status === "OUT_FOR_DELIVERY";

  return (
    <div className="space-y-4 pt-1 pb-8 text-[#111111]">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-[#111111] tracking-tight">
              #{order.orderNumber}
            </h1>
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="text-xs text-[#111111] font-bold hover:underline"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          <p className="text-xs text-[#666666] font-medium">
            RushD Instant Delivery Tracking
          </p>
        </div>
        <Link
          href="/orders"
          className="text-xs text-[#666666] hover:text-[#111111] font-bold"
        >
          ← All Orders
        </Link>
      </div>

      {/* New Order Instant Banner */}
      {isNewOrder && (
        <div className="bg-[#DFFF00] text-[#000000] p-4 rounded-lg border border-[#111111] shadow-xs space-y-1 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider">
              ORDER PLACED ✓
            </span>
            <span className="text-xs font-black">
              #{order.orderNumber}
            </span>
          </div>
          <p className="text-xs font-bold leading-snug">
            Your order has been received! Keep your delivery OTP private and share it with the rider only when your order is being delivered.
          </p>
        </div>
      )}

      {/* Delivery Verification OTP Card */}
      {order.status !== "CANCELLED" && order.status !== "REJECTED" && (
        <div className="bg-white rounded-lg border border-[#111111] p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2.5">
            <div>
              <span className="text-[10px] font-extrabold text-[#666666] uppercase tracking-wider block">
                DELIVERY VERIFICATION
              </span>
              <h2 className="font-black text-sm text-[#111111] mt-0.5">
                Your Delivery OTP
              </h2>
            </div>
            {order.status === "DELIVERED" || order.deliveryOtpVerified ? (
              <span className="px-2.5 py-1 rounded bg-[#168A55] text-white text-[11px] font-black flex items-center gap-1">
                <span>✓</span>
                <span>Verified &amp; Delivered</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-[#DFFF00] text-[#000000] border border-[#111111] text-[10px] font-black">
                AWAITING DELIVERY
              </span>
            )}
          </div>

          {order.status === "DELIVERED" || order.deliveryOtpVerified ? (
            <div className="p-3 bg-emerald-50 rounded border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-2">
              <span className="text-base">✓</span>
              <div>
                <span>Delivery successfully verified with OTP.</span>
                {order.deliveryOtpVerifiedAt && (
                  <span className="block text-[10px] text-emerald-700 font-medium mt-0.5">
                    Verified at {new Date(order.deliveryOtpVerifiedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
            </div>
          ) : order.deliveryOtp ? (
            <div className="space-y-3">
              {/* Big OTP Display */}
              <div className="bg-[#000000] text-[#DFFF00] rounded-lg p-4 border border-[#111111] text-center space-y-1">
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#A3A3A3]">
                  CONFIDENTIAL DELIVERY OTP
                </div>
                <div className="text-3xl sm:text-4xl font-black tracking-widest font-mono">
                  {order.deliveryOtp}
                </div>
              </div>

              <p className="text-xs text-[#111111] font-bold leading-relaxed">
                Share this OTP with the rider when your order is being delivered.
              </p>
              <p className="text-[11px] text-[#666666] font-medium leading-relaxed bg-[#F5F5F5] p-2.5 rounded border border-[#E5E5E5]">
                🔒 <strong className="text-[#111111]">Keep it private:</strong> Share this OTP with the rider only when your order is being delivered. Do not share it beforehand.
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* 6-Step Vertical Progress Timeline */}
      <OrderTrackingTimeline status={order.status} notes={order.notes} />

      {/* Rider Contact Card */}
      {showRiderCard && (
        <RiderContactCard
          riderName={order.deliveryPartner?.name}
          riderPhone={order.deliveryPartner?.phone}
        />
      )}

      {/* Delivery Address Summary */}
      <div className="bg-white p-4 rounded-lg border border-[#E5E5E5] space-y-2">
        <h3 className="font-extrabold text-xs text-[#111111] uppercase tracking-wider">
          Delivery Address
        </h3>
        <div className="text-xs text-[#666666] font-medium leading-relaxed">
          {order.deliveryAddress}
        </div>
      </div>

      {/* Itemized Order Receipt */}
      <div className="bg-white p-4 rounded-lg border border-[#E5E5E5] space-y-3">
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2">
          <h3 className="font-extrabold text-xs text-[#111111] uppercase tracking-wider">
            Order Items ({order.items?.length || 0})
          </h3>
          <span className="text-xs font-black text-[#000000] bg-[#DFFF00] px-2 py-0.5 rounded border border-[#111111]">
            {order.paymentMethod === "COD" ? "Cash on Delivery" : "UPI on Delivery"}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <span className="text-[#111111] font-bold truncate max-w-[220px]">
                {item.productName}
              </span>
              <span className="text-[#666666] font-bold">
                x{item.quantity} • ₹{item.subtotal.toFixed(0)}
              </span>
            </div>
          ))}

          <div className="border-t border-[#E5E5E5] pt-2.5 flex items-center justify-between font-extrabold text-sm text-[#111111]">
            <span>Total Amount</span>
            <span className="text-[#111111] text-base font-black">
              ₹{order.totalAmount.toFixed(0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <Suspense
      fallback={
        <div className="space-y-4 pt-4 animate-pulse">
          <div className="h-10 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
          <div className="h-64 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
        </div>
      }
    >
      <OrderTrackingContent id={resolvedParams.id} />
    </Suspense>
  );
}
