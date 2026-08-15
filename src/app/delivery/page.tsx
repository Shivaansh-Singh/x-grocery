"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { RiderProfileSelector, DeliveryRiderStaff } from "@/components/delivery/RiderProfileSelector";
import { DeliveryTaskCard } from "@/components/delivery/DeliveryTaskCard";
import { DoorstepPaymentModal } from "@/components/delivery/DoorstepPaymentModal";
import type { OrderRecord } from "@/components/orders/OrderCard";

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Delivery Partner Portal
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Store X Mobile Rider View
          </p>
        </div>
        <Link
          href="/"
          className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium"
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
      <div className="flex rounded-2xl bg-zinc-200/60 dark:bg-zinc-800/60 p-1">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all relative ${
            activeTab === "active"
              ? "bg-white dark:bg-zinc-900 text-teal-600 dark:text-teal-400 shadow-xs"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800"
          }`}
        >
          Active Deliveries ({activeDeliveries.length})
          {activeDeliveries.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-teal-500 text-white rounded-full font-extrabold animate-pulse">
              LIVE
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "completed"
              ? "bg-white dark:bg-zinc-900 text-teal-600 dark:text-teal-400 shadow-xs"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800"
          }`}
        >
          Completed ({completedToday.length})
        </button>
      </div>

      {/* Delivery Task Cards List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 text-center space-y-2 shadow-xs">
          <span className="text-4xl block">🛵</span>
          <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
            No {activeTab} delivery tasks
          </h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
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
