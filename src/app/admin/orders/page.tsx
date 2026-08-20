"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RejectionReasonModal } from "@/components/admin/RejectionReasonModal";
import { OrderDetailsModal } from "@/components/admin/OrderDetailsModal";
import { RiderAssignModal } from "@/components/admin/RiderAssignModal";
import type { OrderRecord } from "@/components/orders/OrderCard";
import { getLocalOrders, updateLocalOrderStatus, getLocalRiders, updateRiderStatus, DeliveryStaffRider } from "@/lib/orderSync";

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as string) || "all";

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [riders, setRiders] = useState<DeliveryStaffRider[]>([]);
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderRecord | null>(null);
  const [assigningOrder, setAssigningOrder] = useState<OrderRecord | null>(null);
  const [rejectingOrder, setRejectingOrder] = useState<OrderRecord | null>(null);

  const loadOrdersAndRiders = async () => {
    try {
      const [ordersRes, ridersRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/admin/delivery-staff"),
      ]);

      const ordersData = await ordersRes.json();
      const ridersData = await ridersRes.json();

      const apiOrders: OrderRecord[] = ordersData.orders || [];
      const localOrders = getLocalOrders();

      const orderMap = new Map<string, OrderRecord>();
      [...localOrders, ...apiOrders].forEach((o) => orderMap.set(o.id, o));
      const mergedOrders = Array.from(orderMap.values());

      setOrders(mergedOrders);

      const apiRiders: DeliveryStaffRider[] = ridersData.riders || [];
      const localRiders = getLocalRiders();
      const riderMap = new Map<string, DeliveryStaffRider>();
      [...localRiders, ...apiRiders].forEach((r) => riderMap.set(r.id, r));
      
      // Deduplicate riders by ID/email
      const uniqueRiders = Array.from(riderMap.values()).filter(
        (rider, index, self) =>
          index === self.findIndex((r) => r.id === rider.id || (r.email && r.email === rider.email))
      );

      setRiders(uniqueRiders);
    } catch (err) {
      console.error("Error loading admin orders:", err);
      setOrders(getLocalOrders());
      setRiders(getLocalRiders());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function init() {
      if (!ignore) {
        await loadOrdersAndRiders();
      }
    }
    init();

    const interval = setInterval(() => {
      loadOrdersAndRiders();
    }, 4000);

    // Cross-tab storage listener for real-time reactivity
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "rushd_orders" || e.key === "x_grocery_orders" || e.key === "rushd_riders") {
        loadOrdersAndRiders();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      ignore = true;
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: string,
    deliveryPartnerId?: string,
    rejectionReason?: string
  ) => {
    try {
      console.log("ADMIN ASSIGNMENT:", {
        orderId,
        selectedRiderId: deliveryPartnerId,
        newStatus,
      });

      // 1. Update local storage immediately for fast client reactivity
      const updates: Partial<OrderRecord> = {
        status: newStatus as OrderRecord["status"],
        assignedRiderId: deliveryPartnerId || undefined,
        deliveryPartnerId: deliveryPartnerId || undefined,
      };

      if (deliveryPartnerId) {
        const matchedRider = riders.find((r) => r.id === deliveryPartnerId);
        if (matchedRider) {
          updates.deliveryPartner = {
            id: matchedRider.id,
            name: matchedRider.name,
            phone: matchedRider.phone || null,
          };
          updateRiderStatus(matchedRider.id, "ASSIGNED");
        }
      }

      if (rejectionReason) {
        updates.notes = `Rejected by Admin: ${rejectionReason}`;
      }

      updateLocalOrderStatus(orderId, updates);

      // 2. Sync to Backend API
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-[#Type]": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          deliveryPartnerId,
          rejectionReason,
        }),
      });

      loadOrdersAndRiders();
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  const handleAssignRider = (orderId: string, riderId: string) => {
    handleUpdateStatus(orderId, "ASSIGNED", riderId);
  };

  // Filter categorizations
  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const acceptedOrders = orders.filter((o) => o.status === "ACCEPTED");
  const preparingOrders = orders.filter((o) => o.status === "PREPARING");
  const readyOrders = orders.filter((o) => o.status === "ASSIGNED");
  const deliveryOrders = orders.filter((o) => o.status === "OUT_FOR_DELIVERY");
  const completedOrders = orders.filter(
    (o) => o.status === "DELIVERED" || o.status === "CANCELLED" || o.status === "REJECTED"
  );

  const getTabOrders = () => {
    switch (activeTab) {
      case "pending":
        return pendingOrders;
      case "accepted":
        return acceptedOrders;
      case "preparing":
        return preparingOrders;
      case "ready":
        return readyOrders;
      case "delivery":
        return deliveryOrders;
      case "completed":
        return completedOrders;
      default:
        return orders;
    }
  };

  const currentOrdersList = getTabOrders();

  return (
    <div className="space-y-4 pt-1 pb-8 text-[#F5F6FA]">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-white/8 pb-2.5">
        <div>
          <h1 className="font-display font-black text-xl text-[#F5F6FA] tracking-tight">
            Incoming Orders Control Board
          </h1>
          <p className="text-xs text-[#8A90A3]">
            Accept orders, control prep, and assign riders
          </p>
        </div>
        <Link
          href="/admin"
          className="text-xs font-bold text-[#FF6B1A] hover:underline"
        >
          ← Admin Hub
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto gap-1.5 p-1.5 rounded-2xl bg-[#141822] border border-white/8 no-scrollbar">
        {[
          { key: "all", label: `All (${orders.length})` },
          { key: "pending", label: `New (${pendingOrders.length})`, badge: pendingOrders.length > 0 },
          { key: "accepted", label: `Accepted (${acceptedOrders.length})` },
          { key: "preparing", label: `Packing (${preparingOrders.length})` },
          { key: "ready", label: `Ready (${readyOrders.length})` },
          { key: "delivery", label: `Out (${deliveryOrders.length})` },
          { key: "completed", label: `Delivered (${completedOrders.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 relative ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] text-white shadow-sm"
                : "text-[#8A90A3] hover:text-[#F5F6FA]"
            }`}
          >
            {tab.label}
            {tab.badge && (
              <span className="ml-1 px-1 py-0.2 text-[9px] bg-[#FF6B1A] text-white rounded font-black">
                NEW
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 glass-card rounded-2xl" />
          ))}
        </div>
      ) : currentOrdersList.length === 0 ? (
        <div className="glass-card rounded-[22px] p-8 text-center space-y-2 my-4 shadow-md">
          <h3 className="font-display font-extrabold text-sm text-[#F5F6FA]">
            No orders in &quot;{activeTab.toUpperCase()}&quot;
          </h3>
          <p className="text-xs text-[#8A90A3] max-w-xs mx-auto">
            Incoming customer orders will appear here automatically in real-time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentOrdersList.map((order) => {
            const isPending = order.status === "PENDING";
            const isAccepted = order.status === "ACCEPTED";
            const isPreparing = order.status === "PREPARING";
            const isReady = order.status === "ASSIGNED";
            const isOutForDelivery = order.status === "OUT_FOR_DELIVERY";

            return (
              <div
                key={order.id}
                className="glass-card p-4 rounded-[22px] shadow-md space-y-3 hover:border-white/20 transition-all"
              >
                {/* Order Top Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-black text-sm text-[#F5F6FA]">
                        #{order.orderNumber}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] text-white">
                        {order.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8A90A3] block mt-0.5 font-medium">
                      {order.deliveryAddress}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-[#FF6B1A] block">
                      ₹{order.totalAmount.toFixed(0)}
                    </span>
                    <span className="text-[10px] font-bold text-[#8A90A3] px-2 py-0.5 rounded bg-[#1A1F2C] border border-white/8 inline-block mt-0.5">
                      {order.paymentMethod === "COD" ? "Cash" : "UPI QR"}
                    </span>
                  </div>
                </div>

                {/* Items Summary Pill */}
                <div className="bg-[#1A1F2C] p-3 rounded-xl border border-white/8 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-[#8A90A3] uppercase tracking-wider block">
                    Items ({order.items.length})
                  </span>
                  <div className="space-y-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-[#F5F6FA]">
                        <span className="font-medium truncate max-w-[220px]">
                          {item.productName}
                        </span>
                        <span className="font-bold text-[#8A90A3]">
                          x{item.quantity} • ₹{item.subtotal.toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assigned Rider Indicator */}
                {order.deliveryPartner && (
                  <div className="flex items-center justify-between bg-[#1A1F2C] px-3 py-2 rounded-xl border border-white/8 text-xs">
                    <span className="text-[10px] font-bold text-[#8A90A3] uppercase">
                      Assigned Rider:
                    </span>
                    <span className="font-bold text-[#2D6CFF]">
                      🛵 {order.deliveryPartner.name}
                    </span>
                  </div>
                )}

                {/* Admin Workflow Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => setSelectedOrderDetails(order)}
                    className="px-3.5 py-2 rounded-xl bg-[#1A1F2C] hover:bg-white/10 text-[#F5F6FA] font-bold text-xs transition-all border border-white/8"
                  >
                    View Details
                  </button>

                  {isPending && (
                    <>
                      <button
                        onClick={() => setRejectingOrder(order)}
                        className="py-2 px-3 rounded-xl bg-[#1A1F2C] hover:bg-[#FF4D4D]/20 text-[#FF4D4D] font-bold text-xs transition-all border border-[#FF4D4D]/30"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, "ACCEPTED")}
                        className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] text-white font-extrabold text-xs shadow-md hover:opacity-90 transition-all"
                      >
                        ACCEPT ORDER ✓
                      </button>
                    </>
                  )}

                  {isAccepted && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, "PREPARING")}
                      className="flex-1 py-2 rounded-xl bg-[#2D6CFF] text-white font-extrabold text-xs shadow-md hover:opacity-90 transition-all"
                    >
                      Start Packing Items 📦
                    </button>
                  )}

                  {isPreparing && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, "ASSIGNED")}
                      className="flex-1 py-2 rounded-xl bg-[#FF6B1A] text-white font-extrabold text-xs shadow-md hover:opacity-90 transition-all"
                    >
                      Mark Ready for Pickup ⚡
                    </button>
                  )}

                  {(isAccepted || isPreparing || isReady) && (
                    <button
                      onClick={() => setAssigningOrder(order)}
                      className="py-2 px-4 rounded-xl bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] text-white font-extrabold text-xs shadow-md hover:opacity-90 transition-all"
                    >
                      {order.deliveryPartner ? "Reassign Rider 🛵" : "Assign Rider 🛵"}
                    </button>
                  )}

                  {isOutForDelivery && (
                    <span className="py-2 px-3 rounded-xl bg-[#2D6CFF]/15 text-[#2D6CFF] font-bold text-xs border border-[#2D6CFF]/30">
                      Rider En Route 🛵
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {selectedOrderDetails && (
        <OrderDetailsModal
          order={selectedOrderDetails}
          onClose={() => setSelectedOrderDetails(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Rider Selection Panel Modal */}
      {assigningOrder && (
        <RiderAssignModal
          order={assigningOrder}
          riders={riders}
          onClose={() => setAssigningOrder(null)}
          onAssignRider={handleAssignRider}
        />
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

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 pt-4 animate-pulse">
          <div className="h-10 glass-card rounded-xl" />
          <div className="h-44 glass-card rounded-2xl" />
        </div>
      }
    >
      <AdminOrdersContent />
    </Suspense>
  );
}
