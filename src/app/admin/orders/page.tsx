"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RejectionReasonModal } from "@/components/admin/RejectionReasonModal";
import type { OrderRecord } from "@/components/orders/OrderCard";

interface DeliveryRider {
  id: string;
  name: string;
  phone?: string | null;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [riders, setRiders] = useState<DeliveryRider[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "active" | "history">("pending");
  const [loading, setLoading] = useState(true);
  const [rejectingOrder, setRejectingOrder] = useState<OrderRecord | null>(null);

  const fetchOrdersAndRiders = async () => {
    try {
      const [ordersRes, ridersRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/admin/delivery-staff"),
      ]);

      const ordersData = await ordersRes.json();
      const ridersData = await ridersRes.json();

      if (ordersData.orders) setOrders(ordersData.orders);
      if (ridersData.riders) setRiders(ridersData.riders);
    } catch (err) {
      console.error("Error loading admin orders board data:", err);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const [ordersRes, ridersRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/admin/delivery-staff"),
        ]);

        const ordersData = await ordersRes.json();
        const ridersData = await ridersRes.json();

        if (!ignore && ordersData.orders) setOrders(ordersData.orders);
        if (!ignore && ridersData.riders) setRiders(ridersData.riders);
      } catch (err) {
        console.error("Error loading admin orders board data:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadData();

    // Auto-refresh incoming orders every 5 seconds
    const interval = setInterval(() => {
      loadData();
    }, 5000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, []);

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: string,
    deliveryPartnerId?: string,
    rejectionReason?: string
  ) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          deliveryPartnerId,
          rejectionReason,
        }),
      });

      if (res.ok) {
        fetchOrdersAndRiders();
      }
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const inProgressOrders = orders.filter(
    (o) =>
      o.status === "ACCEPTED" ||
      o.status === "PREPARING" ||
      o.status === "ASSIGNED" ||
      o.status === "OUT_FOR_DELIVERY"
  );
  const historyOrders = orders.filter(
    (o) => o.status === "DELIVERED" || o.status === "CANCELLED" || o.status === "REJECTED"
  );

  const currentList =
    activeTab === "pending"
      ? pendingOrders
      : activeTab === "active"
      ? inProgressOrders
      : historyOrders;

  return (
    <div className="space-y-4 pt-1 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Incoming Orders Board
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Store X live fulfillment & rider assignment
          </p>
        </div>
        <Link
          href="/admin"
          className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
        >
          ← Admin Hub
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-zinc-200/60 dark:bg-zinc-800/60 p-1">
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all relative ${
            activeTab === "pending"
              ? "bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-xs"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800"
          }`}
        >
          Pending Approval ({pendingOrders.length})
          {pendingOrders.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-amber-500 text-white rounded-full font-extrabold animate-pulse">
              NEW
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "active"
              ? "bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-xs"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800"
          }`}
        >
          In Delivery ({inProgressOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "history"
              ? "bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-xs"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800"
          }`}
        >
          Completed ({historyOrders.length})
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 text-center space-y-2">
          <span className="text-3xl block">📋</span>
          <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
            No {activeTab} orders
          </h3>
          <p className="text-xs text-zinc-500">
            Incoming student orders will appear here automatically in real-time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                      #{order.orderNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {order.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 block mt-0.5">
                    📍 {order.deliveryAddress}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 block">
                    ₹{order.totalAmount.toFixed(0)}
                  </span>
                  <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950">
                    {order.paymentMethod === "COD" ? "Cash on Delivery" : "UPI on Delivery"}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-zinc-50 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800/80 text-xs space-y-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-zinc-800 dark:text-zinc-200 font-medium">
                      {item.productName}
                    </span>
                    <span className="text-zinc-500 font-bold">
                      x{item.quantity} • ₹{item.subtotal.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Rider Selector Dropdown (when PREPARING / ASSIGNED) */}
              {(order.status === "PREPARING" || order.status === "ASSIGNED") && (
                <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950/40 p-2 rounded-xl border border-purple-200 dark:border-purple-900/50">
                  <span className="text-xs font-bold text-purple-800 dark:text-purple-300 shrink-0">
                    🛵 Assign Rider:
                  </span>
                  <select
                    value={order.deliveryPartner?.name ? riders.find(r => r.name === order.deliveryPartner?.name)?.id || "" : ""}
                    onChange={(e) =>
                      handleUpdateStatus(order.id, "ASSIGNED", e.target.value)
                    }
                    className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold"
                  >
                    <option value="">Select Delivery Rider...</option>
                    {riders.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.phone || "No phone"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                {order.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => setRejectingOrder(order)}
                      className="flex-1 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs transition-colors"
                    >
                      Reject Order
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order.id, "ACCEPTED")}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      Accept Order ✓
                    </button>
                  </>
                )}

                {order.status === "ACCEPTED" && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, "PREPARING")}
                    className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    Start Packing Items 📦
                  </button>
                )}

                {order.status === "ASSIGNED" && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, "OUT_FOR_DELIVERY")}
                    className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    Mark Out for Delivery 🛵
                  </button>
                )}

                {order.status === "OUT_FOR_DELIVERY" && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, "DELIVERED")}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    Mark Delivered 🎉
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingOrder && (
        <RejectionReasonModal
          orderNumber={rejectingOrder.orderNumber}
          onClose={() => setRejectingOrder(null)}
          onConfirm={(reason) => {
            handleUpdateStatus(rejectingOrder.id, "REJECTED", undefined, reason);
            setRejectingOrder(null);
          }}
        />
      )}
    </div>
  );
}
