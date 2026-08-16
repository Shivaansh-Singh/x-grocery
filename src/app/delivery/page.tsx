"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { RiderProfileSelector, DeliveryRiderStaff } from "@/components/delivery/RiderProfileSelector";
import { DeliveryTaskCard } from "@/components/delivery/DeliveryTaskCard";
import { DoorstepPaymentModal } from "@/components/delivery/DoorstepPaymentModal";
import type { OrderRecord } from "@/components/orders/OrderCard";
import { RushDLogo } from "@/components/ui/RushDLogo";

export default function DeliveryPartnerPage() {
  const [activeRider, setActiveRider] = useState<DeliveryRiderStaff | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [loading, setLoading] = useState(true);
  const [paymentModalOrder, setPaymentModalOrder] = useState<OrderRecord | null>(null);

  const fetchRiderOrders = useCallback(async (riderId?: string) => {
    try {
      const url = riderId ? `/api/delivery/orders?riderId=${riderId}` : "/api/delivery/orders";
      const res = await fetch(url);
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (err) {
      console.error("Error loading rider orders:", err);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadRiderOrders() {
      try {
        const url = activeRider?.id
          ? `/api/delivery/orders?riderId=${activeRider.id}`
          : "/api/delivery/orders";
        const res = await fetch(url);
        const data = await res.json();
        if (!ignore && data.orders) setOrders(data.orders);
      } catch (err) {
        console.error("Error loading rider orders:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadRiderOrders();

    const interval = setInterval(() => {
      loadRiderOrders();
    }, 4000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [activeRider?.id]);

  const handleStartDelivery = async (orderId: string) => {
    try {
      const res = await fetch(`/api/delivery/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "OUT_FOR_DELIVERY" }),
      });

      if (res.ok) {
        fetchRiderOrders(activeRider?.id);
      }
    } catch (err) {
      console.error("Error starting delivery:", err);
    }
  };

  const handleConfirmDelivery = async (orderId: string) => {
    try {
      const res = await fetch(`/api/delivery/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DELIVERED",
          paymentStatus: "COMPLETED",
        }),
      });

      if (res.ok) {
        setPaymentModalOrder(null);
        fetchRiderOrders(activeRider?.id);
      }
    } catch (err) {
      console.error("Error completing delivery:", err);
    }
  };

  const activeDeliveries = orders.filter(
    (o) => o.status === "ASSIGNED" || o.status === "OUT_FOR_DELIVERY"
  );
  const completedToday = orders.filter((o) => o.status === "DELIVERED");

  const currentList = activeTab === "active" ? activeDeliveries : completedToday;

  return (
    <div className="space-y-4 pt-1 pb-8">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#D9D7D2] pb-2">
        <div className="flex items-center gap-2">
          <RushDLogo size="sm" href="/delivery" />
          <div className="border-l border-[#D9D7D2] pl-2">
            <h1 className="text-sm font-bold text-[#111315]">
              Rider Portal
            </h1>
            <p className="text-[10px] text-[#666A70]">
              Mobile Rider Operations
            </p>
          </div>
        </div>
        <Link
          href="/"
          className="text-xs font-semibold text-[#FF5A1F] hover:underline"
        >
          Customer App ↗
        </Link>
      </div>

      {/* Active Rider Profile Selector */}
      <RiderProfileSelector
        selectedRiderId={activeRider?.id || ""}
        onSelectRider={(rider) => {
          setActiveRider(rider);
          fetchRiderOrders(rider.id);
        }}
      />

      {/* Tabs */}
      <div className="flex rounded-xl bg-[#ECEAE5] p-1">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors relative ${
            activeTab === "active"
              ? "bg-[#111315] text-white shadow-2xs"
              : "text-[#666A70] hover:text-[#111315]"
          }`}
        >
          Active Deliveries ({activeDeliveries.length})
          {activeDeliveries.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-[#FF5A1F] text-white rounded font-extrabold">
              LIVE
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === "completed"
              ? "bg-[#111315] text-white shadow-2xs"
              : "text-[#666A70] hover:text-[#111315]"
          }`}
        >
          Completed Today ({completedToday.length})
        </button>
      </div>

      {/* Delivery Task Cards List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-zinc-200 rounded-2xl" />
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <div className="bg-[#FFFFFF] rounded-2xl p-8 border border-[#D9D7D2] text-center space-y-2 shadow-2xs">
          <h3 className="font-bold text-sm text-[#111315]">
            No {activeTab} delivery tasks
          </h3>
          <p className="text-xs text-[#666A70] max-w-xs mx-auto">
            {activeTab === "active"
              ? "No active deliveries currently assigned to your rider profile."
              : "No delivered orders recorded for today's shift yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((order) => (
            <DeliveryTaskCard
              key={order.id}
              order={order}
              onStartDelivery={handleStartDelivery}
              onOpenPaymentModal={(ord) => setPaymentModalOrder(ord)}
            />
          ))}
        </div>
      )}

      {/* Doorstep Payment Modal */}
      {paymentModalOrder && (
        <DoorstepPaymentModal
          order={paymentModalOrder}
          onClose={() => setPaymentModalOrder(null)}
          onConfirmDelivery={() => handleConfirmDelivery(paymentModalOrder.id)}
        />
      )}
    </div>
  );
}
