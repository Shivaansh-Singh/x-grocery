"use client";

import { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import { OrderTrackingTimeline } from "@/components/orders/OrderTrackingTimeline";
import { RiderContactCard } from "@/components/orders/RiderContactCard";
import type { OrderRecord } from "@/components/orders/OrderCard";

function OrderTrackingContent({ id }: { id: string }) {
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
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
          setOrder(data.order);
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
      loadOrder();
    }, 4000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4 pt-4 animate-pulse">
        <div className="h-10 bg-[#141822] border border-white/8 rounded-xl" />
        <div className="h-64 bg-[#141822] border border-white/8 rounded-2xl" />
        <div className="h-32 bg-[#141822] border border-white/8 rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6 pt-6 text-center">
        <div className="bg-[#141822] rounded-2xl p-8 border border-white/8 shadow-md space-y-4 max-w-md mx-auto text-[#F5F6FA]">
          <h2 className="text-lg font-bold text-[#F5F6FA]">
            Order Not Found
          </h2>
          <p className="text-xs text-[#8A90A3] max-w-xs mx-auto">
            We couldn&apos;t find order details for #{id}.
          </p>
          <Link
            href="/orders"
            className="inline-block px-5 py-2.5 bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] text-white rounded-xl font-bold text-xs shadow-sm hover:opacity-90 transition-all"
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
    <div className="space-y-4 pt-1 pb-8 text-[#F5F6FA]">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-white/8 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-[#F5F6FA] tracking-tight">
              #{order.orderNumber}
            </h1>
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="text-xs text-[#FF6B1A] font-bold hover:underline"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          <p className="text-xs text-[#8A90A3]">
            RushD Instant Delivery Tracking
          </p>
        </div>
        <Link
          href="/orders"
          className="text-xs text-[#8A90A3] hover:text-[#F5F6FA] font-semibold"
        >
          ← All Orders
        </Link>
      </div>

      {/* 6-Step Vertical Progress Timeline */}
      <OrderTrackingTimeline status={order.status} />

      {/* Rider Contact Card */}
      {showRiderCard && (
        <RiderContactCard
          riderName={order.deliveryPartner?.name}
          riderPhone={order.deliveryPartner?.phone}
        />
      )}

      {/* Delivery Address Summary */}
      <div className="bg-[#141822] p-4 rounded-2xl border border-white/8 shadow-md space-y-2">
        <h3 className="font-extrabold text-xs text-[#F5F6FA] uppercase tracking-wider">
          Delivery Address
        </h3>
        <div className="text-xs text-[#8A90A3] font-medium leading-relaxed">
          {order.deliveryAddress}
        </div>
      </div>

      {/* Itemized Order Receipt */}
      <div className="bg-[#141822] p-4 rounded-2xl border border-white/8 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-white/8 pb-2">
          <h3 className="font-extrabold text-xs text-[#F5F6FA] uppercase tracking-wider">
            Order Items ({order.items?.length || 0})
          </h3>
          <span className="text-xs font-bold text-[#FF6B1A]">
            {order.paymentMethod === "COD" ? "Cash on Delivery" : "UPI on Delivery"}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <span className="text-[#F5F6FA] font-medium truncate max-w-[220px]">
                {item.productName}
              </span>
              <span className="text-[#8A90A3] font-bold">
                x{item.quantity} • ₹{item.subtotal.toFixed(0)}
              </span>
            </div>
          ))}

          <div className="border-t border-white/8 pt-2.5 flex items-center justify-between font-extrabold text-sm text-[#F5F6FA]">
            <span>Total Amount</span>
            <span className="text-[#FF6B1A] text-base">
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
          <div className="h-10 bg-[#141822] border border-white/8 rounded-xl" />
          <div className="h-64 bg-[#141822] border border-white/8 rounded-2xl" />
        </div>
      }
    >
      <OrderTrackingContent id={resolvedParams.id} />
    </Suspense>
  );
}
