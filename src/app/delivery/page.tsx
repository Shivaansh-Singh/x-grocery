"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { DeliveryTaskCard } from "@/components/delivery/DeliveryTaskCard";
import { DoorstepPaymentModal } from "@/components/delivery/DoorstepPaymentModal";
import { OrderDetailsModal } from "@/components/admin/OrderDetailsModal";
import type { OrderRecord } from "@/components/orders/OrderCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { RushDLogo } from "@/components/ui/RushDLogo";
import { getLocalOrders, updateLocalOrderStatus, updateRiderStatus } from "@/lib/orderSync";

export default function DeliveryPartnerPage() {
  const { activeUser, signOut } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [loading, setLoading] = useState(true);

  // Modals
  const [paymentModalOrder, setPaymentModalOrder] = useState<OrderRecord | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderRecord | null>(null);

  const fetchRiderOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/delivery/orders");

      if (!res.ok) {
        throw new Error(`API returned HTTP status ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const apiOrders: OrderRecord[] = data.orders || [];

      // Merge with local storage orders if present
      const localOrders = getLocalOrders();
      const orderMap = new Map<string, OrderRecord>();
      [...localOrders, ...apiOrders].forEach((o) => orderMap.set(o.id, o));
      const mergedOrders = Array.from(orderMap.values());

      // Filter for relevant rider orders
      const riderOrders = apiOrders.length > 0 ? apiOrders : mergedOrders;
      setOrders(riderOrders);
    } catch (err) {
      console.error("Error loading rider orders from API:", err);
      // Fallback: load from local storage so orders are not lost if offline
      const localOrders = getLocalOrders();
      if (localOrders.length > 0) {
        setOrders(localOrders);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      if (!ignore) {
        await fetchRiderOrders();
      }
    }
    init();

    const interval = setInterval(() => {
      if (!ignore) {
        fetchRiderOrders();
      }
    }, 4000);

    const handleStorageChange = (e: StorageEvent) => {
      if (!ignore && (e.key === "rushd_orders" || e.key === "x_grocery_orders" || e.key === "rushd_riders")) {
        fetchRiderOrders();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      ignore = true;
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [fetchRiderOrders]);

  const handleStartDelivery = async (orderId: string) => {
    try {
      // Update local status for immediate UI sync
      updateLocalOrderStatus(orderId, { status: "OUT_FOR_DELIVERY" });
      if (activeUser) {
        updateRiderStatus(activeUser.id, "ON_DELIVERY");
      }

      await fetch(`/api/delivery/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "OUT_FOR_DELIVERY" }),
      });

      fetchRiderOrders();
    } catch (err) {
      console.error("Error starting delivery:", err);
    }
  };

  const handleConfirmDelivery = async (
    orderId: string,
    otp: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/delivery/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DELIVERED",
          paymentStatus: "COMPLETED",
          otp,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        return {
          success: false,
          error:
            data.error ||
            "Incorrect OTP. Please ask the customer for the correct delivery OTP.",
        };
      }

      // Update local status for immediate UI sync ONLY after server confirmation
      updateLocalOrderStatus(orderId, { status: "DELIVERED", paymentStatus: "COMPLETED" });
      if (activeUser) {
        updateRiderStatus(activeUser.id, "AVAILABLE");
      }

      setPaymentModalOrder(null);
      fetchRiderOrders();
      return { success: true };
    } catch (err) {
      console.error("Error completing delivery:", err);
      return {
        success: false,
        error: "Unable to verify the OTP. Please try again.",
      };
    }
  };

  const activeDeliveries = orders.filter(
    (o) => o.status === "ASSIGNED" || o.status === "OUT_FOR_DELIVERY"
  );
  const completedToday = orders.filter((o) => o.status === "DELIVERED");

  const currentList = activeTab === "active" ? activeDeliveries : completedToday;

  return (
    <div className="space-y-4 pt-1 pb-8 text-[#111111]">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2.5">
        <div className="flex items-center gap-2">
          <RushDLogo size="sm" href="/delivery" />
          <div className="border-l border-[#E5E5E5] pl-2.5">
            <h1 className="text-sm font-extrabold text-[#111111] tracking-tight">
              Assigned Rider Portal
            </h1>
            <p className="text-[10px] text-[#666666] font-medium">
              Mobile Delivery Operations
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs font-bold text-[#111111] hover:underline"
          >
            Customer App ↗
          </Link>
          <button
            onClick={() => signOut()}
            className="text-xs text-[#D92D3A] hover:bg-[#F5F5F5] transition-colors bg-white px-2.5 py-1 rounded font-bold border border-[#E5E5E5]"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Authenticated Rider Profile Header */}
      <div className="bg-white text-[#111111] p-3.5 rounded-lg border border-[#111111] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded bg-[#111111] text-[#DFFF00] border border-[#111111] font-black flex items-center justify-center text-sm shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-[#666666] uppercase font-black tracking-wider block">
              Authenticated Delivery Partner
            </span>
            <h3 className="font-extrabold text-xs text-[#111111] truncate">
              {activeUser?.name || "Delivery Partner"} {activeUser?.email ? `(${activeUser.email})` : ""}
            </h3>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[10px] font-black px-2.5 py-1 rounded bg-[#DFFF00] text-[#000000] border border-[#111111] uppercase tracking-wider inline-block">
            🟢 ON DUTY
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg bg-[#F5F5F5] p-1 border border-[#E5E5E5]">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 py-2 rounded text-xs font-black transition-colors relative border ${
            activeTab === "active"
              ? "bg-[#DFFF00] text-[#000000] border-[#111111]"
              : "text-[#666666] hover:text-[#111111] border-transparent"
          }`}
        >
          My Assigned Deliveries ({activeDeliveries.length})
          {activeDeliveries.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-[#111111] text-white rounded font-black">
              LIVE
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`flex-1 py-2 rounded text-xs font-black transition-colors border ${
            activeTab === "completed"
              ? "bg-[#DFFF00] text-[#000000] border-[#111111]"
              : "text-[#666666] hover:text-[#111111] border-transparent"
          }`}
        >
          Completed Today ({completedToday.length})
        </button>
      </div>

      {/* Delivery Task Cards List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <div className="bg-white border border-[#E5E5E5] rounded-lg p-8 text-center space-y-2">
          <h3 className="font-extrabold text-sm text-[#111111]">
            No {activeTab} assigned orders
          </h3>
          <p className="text-xs text-[#666666] max-w-xs mx-auto font-medium">
            {activeTab === "active"
              ? "No active orders currently assigned to you by Admin. When Admin assigns an order, it will appear here."
              : "No delivered orders recorded for today's shift yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((order) => (
            <div key={order.id} className="relative">
              <DeliveryTaskCard
                order={order}
                onStartDelivery={handleStartDelivery}
                onOpenPaymentModal={(ord) => setPaymentModalOrder(ord)}
              />
              <button
                onClick={() => setSelectedOrderDetails(order)}
                className="mt-2 text-xs font-bold text-[#111111] hover:underline block text-right w-full pr-2"
              >
                View Full Order Details →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <OrderDetailsModal
          order={selectedOrderDetails}
          onClose={() => setSelectedOrderDetails(null)}
          onUpdateStatus={(orderId, newStatus) => {
            if (newStatus === "OUT_FOR_DELIVERY") handleStartDelivery(orderId);
          }}
          onOpenDeliveryOtpModal={(ord) => {
            setSelectedOrderDetails(null);
            setPaymentModalOrder(ord);
          }}
          isRiderView
        />
      )}

      {/* Doorstep Payment & Delivery Verification Modal */}
      {paymentModalOrder && (
        <DoorstepPaymentModal
          order={paymentModalOrder}
          onClose={() => setPaymentModalOrder(null)}
          onConfirmDelivery={(otp) => handleConfirmDelivery(paymentModalOrder.id, otp)}
        />
      )}
    </div>
  );
}
