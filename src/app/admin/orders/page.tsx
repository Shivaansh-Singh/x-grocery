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
      <div className="flex items-center justify-between border-b border-[#D9D7D2] pb-2">
        <div>
          <h1 className="text-xl font-bold text-[#111315]">
            Incoming Orders Board
          </h1>
          <p className="text-xs text-[#666A70]">
            Live fulfillment & rider assignment
          </p>
        </div>
        <Link
          href="/admin"
          className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#D9D7D2] text-[#666A70] hover:text-[#111315]"
        >
          ← Admin Hub
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-[#ECEAE5] p-1">
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors relative ${
            activeTab === "pending"
              ? "bg-[#111315] text-white shadow-2xs"
              : "text-[#666A70] hover:text-[#111315]"
          }`}
        >
          Pending ({pendingOrders.length})
          {pendingOrders.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-[#FF5A1F] text-white rounded font-extrabold">
              NEW
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === "active"
              ? "bg-[#111315] text-white shadow-2xs"
              : "text-[#666A70] hover:text-[#111315]"
          }`}
        >
          In Delivery ({inProgressOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === "history"
              ? "bg-[#111315] text-white shadow-2xs"
              : "text-[#666A70] hover:text-[#111315]"
          }`}
        >
          Completed ({historyOrders.length})
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-zinc-200 rounded-2xl" />
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <div className="bg-[#FFFFFF] rounded-2xl p-8 border border-[#D9D7D2] text-center space-y-2">
          <h3 className="font-bold text-sm text-[#111315]">
            No {activeTab} orders
          </h3>
          <p className="text-xs text-[#666A70]">
            Incoming student orders will appear here automatically in real-time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((order) => (
            <div
              key={order.id}
              className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#D9D7D2] shadow-2xs space-y-3"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-[#111315]">
                      #{order.orderNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#ECEAE5] text-[#111315]">
                      {order.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#666A70] block mt-0.5">
                    {order.deliveryAddress}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-[#FF5A1F] block">
                    ₹{order.totalAmount.toFixed(0)}
                  </span>
                  <span className="text-[10px] font-semibold text-[#1646C7] px-2 py-0.5 rounded bg-[#F5F3EE]">
                    {order.paymentMethod === "COD" ? "Cash on Delivery" : "UPI on Delivery"}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-[#F5F3EE] p-2.5 rounded-xl border border-[#D9D7D2] text-xs space-y-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-[#111315] font-medium">
                      {item.productName}
                    </span>
                    <span className="text-[#666A70] font-bold">
                      x{item.quantity} • ₹{item.subtotal.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Rider Selector Dropdown (when PREPARING / ASSIGNED) */}
              {(order.status === "PREPARING" || order.status === "ASSIGNED") && (
                <div className="flex items-center gap-2 bg-[#F5F3EE] p-2 rounded-xl border border-[#D9D7D2]">
                  <span className="text-xs font-bold text-[#111315] shrink-0">
                    Assign Rider:
                  </span>
                  <select
                    value={order.deliveryPartner?.name ? riders.find(r => r.name === order.deliveryPartner?.name)?.id || "" : ""}
                    onChange={(e) =>
                      handleUpdateStatus(order.id, "ASSIGNED", e.target.value)
                    }
                    className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-[#D9D7D2] bg-[#FFFFFF] text-[#111315] font-semibold focus:outline-none focus:border-[#FF5A1F]"
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
                      className="flex-1 py-2 rounded-xl bg-[#ECEAE5] hover:bg-[#C63D3D] hover:text-white text-[#C63D3D] font-bold text-xs transition-colors"
                    >
                      Reject Order
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order.id, "ACCEPTED")}
                      className="flex-1 py-2 rounded-xl bg-[#168A5B] hover:bg-[#111315] text-white font-bold text-xs shadow-2xs transition-colors"
                    >
                      Accept Order ✓
                    </button>
                  </>
                )}

                {order.status === "ACCEPTED" && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, "PREPARING")}
                    className="w-full py-2 rounded-xl bg-[#1646C7] hover:bg-[#111315] text-white font-bold text-xs shadow-2xs transition-colors"
                  >
                    Start Packing Items
                  </button>
                )}

                {order.status === "ASSIGNED" && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, "OUT_FOR_DELIVERY")}
                    className="w-full py-2 rounded-xl bg-[#FF5A1F] hover:bg-[#111315] text-white font-bold text-xs shadow-2xs transition-colors"
                  >
                    Mark Out for Delivery
                  </button>
                )}

                {order.status === "OUT_FOR_DELIVERY" && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, "DELIVERED")}
                    className="w-full py-2 rounded-xl bg-[#168A5B] hover:bg-[#111315] text-white font-bold text-xs shadow-2xs transition-colors"
                  >
                    Mark Delivered ✓
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
