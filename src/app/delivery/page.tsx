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
    <div className="space-y-4 pt-1 pb-8 text-white">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#27313D] pb-2.5">
        <div className="flex items-center gap-2">
          <RushDLogo size="sm" href="/delivery" />
          <div className="border-l border-[#27313D] pl-2.5">
            <h1 className="text-sm font-black text-[#FFFFFF] tracking-tight">
              Rider Portal
            </h1>
            <p className="text-[10px] text-[#A8B0BC]">
              Mobile Rider Operations
            </p>
          </div>
        </div>
        <Link
          href="/"
          className="text-xs font-bold text-[#FF5A00] hover:underline"
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
      <div className="flex rounded-2xl bg-[#151B24] p-1 border border-[#27313D]">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all relative ${
            activeTab === "active"
              ? "bg-[#0757D5] text-white shadow-sm"
              : "text-[#A8B0BC] hover:text-[#FFFFFF]"
          }`}
        >
          Active Deliveries ({activeDeliveries.length})
          {activeDeliveries.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-[#FF5A00] text-white rounded font-black">
              LIVE
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === "completed"
              ? "bg-[#0757D5] text-white shadow-sm"
              : "text-[#A8B0BC] hover:text-[#FFFFFF]"
          }`}
        >
          Completed Today ({completedToday.length})
        </button>
      </div>

      {/* Delivery Task Cards List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-[#151B24] border border-[#27313D] rounded-2xl" />
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <div className="bg-[#151B24] rounded-2xl p-8 border border-[#27313D] text-center space-y-2 shadow-md">
          <h3 className="font-bold text-sm text-[#FFFFFF]">
            No {activeTab} delivery tasks
          </h3>
          <p className="text-xs text-[#A8B0BC] max-w-xs mx-auto">
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
