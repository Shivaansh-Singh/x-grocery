"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { RejectionReasonModal } from "@/components/admin/RejectionReasonModal";
import { OrderDetailsModal } from "@/components/admin/OrderDetailsModal";
import { RiderAssignModal } from "@/components/admin/RiderAssignModal";
import type { OrderRecord } from "@/components/orders/OrderCard";
import { getCleanRejectionReason } from "@/components/orders/OrderTrackingTimeline";
import { getLocalOrders, updateLocalOrderStatus, getLocalRiders, updateRiderStatus, DeliveryStaffRider } from "@/lib/orderSync";

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as string) || "all";

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [riders, setRiders] = useState<DeliveryStaffRider[]>([]);
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // In-flight fetch guard
  const isFetchingRef = useRef(false);

  // Modals state
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderRecord | null>(null);
  const [assigningOrder, setAssigningOrder] = useState<OrderRecord | null>(null);
  const [rejectingOrder, setRejectingOrder] = useState<OrderRecord | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadOrdersAndRiders = async (isBackground = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (!isBackground) setLoading(true);

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
      setErrorMessage(null);

      const apiRiders: DeliveryStaffRider[] = ridersData.riders || [];
      const localRiders = getLocalRiders();
      const riderMap = new Map<string, DeliveryStaffRider>();
      [...localRiders, ...apiRiders].forEach((r) => riderMap.set(r.id, r));

      const uniqueRiders = Array.from(riderMap.values()).filter(
        (rider, index, self) =>
          index === self.findIndex((r) => r.id === rider.id || (r.email && r.email === rider.email))
      );

      setRiders(uniqueRiders);
    } catch (err) {
      console.error("Error loading admin orders:", err);
      const local = getLocalOrders();
      if (local.length > 0) {
        setOrders(local);
      } else {
        setErrorMessage("Unable to load orders. Please check network connection.");
      }
      setRiders(getLocalRiders());
    } finally {
      isFetchingRef.current = false;
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

    // 12s interval for background updates, skipped when tab is in background
    const interval = setInterval(() => {
      if (ignore) return;
      if (typeof document !== "undefined" && document.hidden) return;
      loadOrdersAndRiders(true);
    }, 12000);

    const handleVisibilityChange = () => {
      if (!document.hidden && !ignore) {
        loadOrdersAndRiders(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const handleStorageChange = (e: StorageEvent) => {
      if (!ignore && (e.key === "rushd_orders" || e.key === "x_grocery_orders" || e.key === "rushd_riders")) {
        loadOrdersAndRiders(true);
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      ignore = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
        updates.notes = `Rejected by Store: ${rejectionReason}`;
      }

      updateLocalOrderStatus(orderId, updates);

      const url = `/api/admin/orders/${orderId}`;
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          deliveryPartnerId,
          rejectionReason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Order could not be updated.");
      } else {
        if (newStatus === "ACCEPTED") showToast("Order accepted.");
        else if (newStatus === "REJECTED") showToast("Order rejected.");
        else if (deliveryPartnerId) showToast("Rider assigned.");
        else showToast(`Order status updated to ${newStatus}.`);
      }

      loadOrdersAndRiders();
    } catch (err) {
      console.error("Error updating order status:", err);
      showToast("Order could not be updated.");
    }
  };

  const handleAssignRider = (orderId: string, riderId: string) => {
    handleUpdateStatus(orderId, "ASSIGNED", riderId);
  };

  // Stat Counter Calculations
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const acceptedCount = orders.filter((o) => o.status === "ACCEPTED").length;
  const preparingCount = orders.filter((o) => o.status === "PREPARING").length;
  const readyCount = orders.filter((o) => o.status === "ASSIGNED").length;
  const outForDeliveryCount = orders.filter((o) => o.status === "OUT_FOR_DELIVERY").length;
  const activeCount = acceptedCount + preparingCount + readyCount + outForDeliveryCount;
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;
  const rejectedCount = orders.filter((o) => o.status === "REJECTED").length;
  const cancelledCount = orders.filter((o) => o.status === "CANCELLED").length;
  const rejectedCancelledCount = rejectedCount + cancelledCount;

  // Filter tabs
  const getTabOrders = () => {
    switch (activeTab) {
      case "pending":
        return orders.filter((o) => o.status === "PENDING");
      case "accepted":
        return orders.filter((o) => o.status === "ACCEPTED");
      case "preparing":
        return orders.filter((o) => o.status === "PREPARING");
      case "ready":
        return orders.filter((o) => o.status === "ASSIGNED");
      case "delivery":
        return orders.filter((o) => o.status === "OUT_FOR_DELIVERY");
      case "delivered":
        return orders.filter((o) => o.status === "DELIVERED");
      case "rejected":
        return orders.filter((o) => o.status === "REJECTED");
      case "cancelled":
        return orders.filter((o) => o.status === "CANCELLED");
      default:
        return orders;
    }
  };

  // Search filtering
  const filteredOrders = getTabOrders().filter((order) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const matchesId = order.orderNumber.toLowerCase().includes(query) || order.id.toLowerCase().includes(query);
    const matchesCustomer = (order.customer?.name || "").toLowerCase().includes(query);
    const matchesPhone = (order.customer?.phone || order.deliveryAddress || "").toLowerCase().includes(query);
    const matchesAddress = order.deliveryAddress.toLowerCase().includes(query);
    return matchesId || matchesCustomer || matchesPhone || matchesAddress;
  });

  return (
    <div className="space-y-4 pt-1 pb-8 text-[#111111]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[100] max-w-sm bg-[#111111] text-[#DFFF00] text-xs font-bold px-4 py-3 rounded-lg border border-[#DFFF00] shadow-2xl animate-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Admin Navigation Header */}
      <AdminHeader pendingOrdersCount={pendingCount} />

      {/* Page Heading & Back to Hub */}
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2.5">
        <div>
          <h1 className="font-extrabold text-xl text-[#111111] tracking-tight">
            Orders Operations Board
          </h1>
          <p className="text-xs text-[#666666] font-medium">
            Manage incoming customer orders, kitchen prep, and rider dispatch
          </p>
        </div>
        <Link
          href="/admin"
          className="text-xs font-bold text-[#666666] hover:text-[#111111] px-3 py-1.5 rounded border border-[#E5E5E5]"
        >
          ← Admin Hub
        </Link>
      </div>

      {/* Summary Stat Counters */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <div className="bg-white p-3 rounded-lg border border-[#E5E5E5] flex flex-col justify-between">
            <span className="text-[10px] font-extrabold text-[#666666] uppercase tracking-wider">
              Total Orders
            </span>
            <span className="text-xl font-black text-[#111111] mt-1">
              {orders.length}
            </span>
          </div>

          <div className={`p-3 rounded-lg border flex flex-col justify-between ${
            pendingCount > 0
              ? "bg-[#DFFF00]/20 border-[#111111]"
              : "bg-white border-[#E5E5E5]"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-[#111111] uppercase tracking-wider">
                Pending
              </span>
              {pendingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#D92D3A] animate-pulse" />
              )}
            </div>
            <span className="text-xl font-black text-[#111111] mt-1">
              {pendingCount}
            </span>
          </div>

          <div className="bg-white p-3 rounded-lg border border-[#E5E5E5] flex flex-col justify-between">
            <span className="text-[10px] font-extrabold text-[#666666] uppercase tracking-wider">
              Active Prep/Transit
            </span>
            <span className="text-xl font-black text-[#111111] mt-1">
              {activeCount}
            </span>
          </div>

          <div className="bg-white p-3 rounded-lg border border-[#E5E5E5] flex flex-col justify-between">
            <span className="text-[10px] font-extrabold text-[#168A55] uppercase tracking-wider">
              Delivered
            </span>
            <span className="text-xl font-black text-[#168A55] mt-1">
              {deliveredCount}
            </span>
          </div>

          <div className="bg-white p-3 rounded-lg border border-[#E5E5E5] flex flex-col justify-between col-span-2 sm:col-span-1">
            <span className="text-[10px] font-extrabold text-[#D92D3A] uppercase tracking-wider">
              Rejected / Cancelled
            </span>
            <span className="text-xl font-black text-[#D92D3A] mt-1">
              {rejectedCancelledCount}
            </span>
          </div>
        </div>
      )}

      {/* Live Search Bar */}
      <div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Order #, Customer Name, Phone, or Address..."
          className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-[#111111] bg-white text-[#111111] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto gap-1.5 p-1.5 rounded-lg bg-[#F5F5F5] border border-[#E5E5E5] no-scrollbar">
        {[
          { key: "all", label: `All (${orders.length})` },
          { key: "pending", label: `Pending (${pendingCount})`, badge: pendingCount > 0 },
          { key: "accepted", label: `Accepted (${acceptedCount})` },
          { key: "preparing", label: `Preparing (${preparingCount})` },
          { key: "ready", label: `Ready for Pickup (${readyCount})` },
          { key: "delivery", label: `Out for Delivery (${outForDeliveryCount})` },
          { key: "delivered", label: `Delivered (${deliveredCount})` },
          { key: "rejected", label: `Rejected (${rejectedCount})` },
          { key: "cancelled", label: `Cancelled (${cancelledCount})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded text-xs font-black transition-colors shrink-0 relative border ${
              activeTab === tab.key
                ? "bg-[#DFFF00] text-[#000000] border-[#111111]"
                : "text-[#666666] hover:text-[#111111] border-transparent"
            }`}
          >
            {tab.label}
            {tab.badge && (
              <span className="ml-1 px-1 py-0.2 text-[9px] bg-[#D92D3A] text-white rounded font-black">
                NEW
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders List / Loading / Empty State */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
          ))}
        </div>
      ) : errorMessage ? (
        <div className="bg-white rounded-lg p-8 border border-[#D92D3A] text-center space-y-3 my-4">
          <h3 className="font-extrabold text-sm text-[#D92D3A]">
            {errorMessage}
          </h3>
          <button
            onClick={() => loadOrdersAndRiders()}
            className="px-4 py-2 bg-[#111111] text-white rounded text-xs font-bold hover:bg-black"
          >
            Retry Loading
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg p-8 border border-[#E5E5E5] text-center space-y-2 my-4">
          <h3 className="font-extrabold text-sm text-[#111111]">
            No orders found in &quot;{activeTab.toUpperCase()}&quot;
          </h3>
          <p className="text-xs text-[#666666] max-w-xs mx-auto font-medium">
            {searchQuery
              ? "No orders match your search query. Try adjusting your filter."
              : "Incoming customer orders will appear here automatically in real-time."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isPending = order.status === "PENDING";
            const isAccepted = order.status === "ACCEPTED";
            const isPreparing = order.status === "PREPARING";
            const isReady = order.status === "ASSIGNED";
            const isOutForDelivery = order.status === "OUT_FOR_DELIVERY";
            const isRejectedOrCancelled = order.status === "REJECTED" || order.status === "CANCELLED";

            const customerName = order.customer?.name || "RushD Customer";
            const rawPhone = order.customer?.phone || order.deliveryAddress.split("Phone:")[1]?.trim() || "+91 99999 88888";
            const rejectionReason = getCleanRejectionReason(order.notes);

            const formattedDate = new Date(order.createdAt).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={order.id}
                className="bg-white p-4 rounded-lg border border-[#E5E5E5] space-y-3 hover:border-[#111111] transition-colors"
              >
                {/* Order Top Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-sm text-[#111111]">
                        #{order.orderNumber}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        order.status === "DELIVERED"
                          ? "bg-[#168A55] text-white"
                          : isRejectedOrCancelled
                          ? "bg-[#D92D3A] text-white"
                          : isOutForDelivery
                          ? "bg-[#DFFF00] text-[#000000] border border-[#111111]"
                          : isPending
                          ? "bg-[#DFFF00] text-[#000000] border border-[#111111]"
                          : "bg-[#111111] text-white"
                      }`}>
                        {order.status}
                      </span>
                      <span className="text-[10px] text-[#666666] font-bold">
                        • {formattedDate}
                      </span>
                    </div>

                    <div className="mt-1 space-y-0.5">
                      <span className="text-xs font-bold text-[#111111] block">
                        👤 {customerName} <span className="text-[#666666] font-normal">({rawPhone})</span>
                      </span>
                      <span className="text-[11px] text-[#666666] block font-medium">
                        📍 {order.deliveryAddress}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-[#111111] block">
                      ₹{order.totalAmount.toFixed(0)}
                    </span>
                    <span className="text-[10px] font-bold text-[#666666] px-2 py-0.5 rounded bg-[#F5F5F5] border border-[#E5E5E5] inline-block mt-0.5">
                      {order.paymentMethod === "COD" ? "Cash on Delivery" : "UPI on Delivery"}
                    </span>
                  </div>
                </div>

                {/* Items Summary Pill */}
                <div className="bg-[#F5F5F5] p-3 rounded-lg border border-[#E5E5E5] text-xs space-y-1">
                  <span className="text-[10px] font-extrabold text-[#666666] uppercase tracking-wider block">
                    Items ({order.items.length})
                  </span>
                  <div className="space-y-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-[#111111]">
                        <span className="font-bold truncate max-w-[240px]">
                          {item.productName}
                        </span>
                        <span className="font-bold text-[#666666]">
                          x{item.quantity} • ₹{item.subtotal.toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rejection Reason Indicator */}
                {isRejectedOrCancelled && (
                  <div className="p-2.5 bg-red-50 border border-[#D92D3A] rounded-lg text-xs">
                    <span className="text-[10px] font-extrabold text-[#D92D3A] uppercase tracking-wider block">
                      {order.status === "REJECTED" ? "Rejection Reason" : "Cancellation Reason"}
                    </span>
                    <span className="font-bold text-[#D92D3A]">
                      &quot;{rejectionReason || "Store is unable to fulfil the order"}&quot;
                    </span>
                  </div>
                )}

                {/* Assigned Rider Indicator */}
                {order.deliveryPartner && (
                  <div className="flex items-center justify-between bg-[#F5F5F5] px-3 py-2 rounded-lg border border-[#111111] text-xs">
                    <span className="text-[10px] font-extrabold text-[#666666] uppercase">
                      Assigned Rider:
                    </span>
                    <span className="font-black text-[#111111]">
                      🛵 {order.deliveryPartner.name} {order.deliveryPartner.phone ? `(${order.deliveryPartner.phone})` : ""}
                    </span>
                  </div>
                )}

                {/* Admin Workflow Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => setSelectedOrderDetails(order)}
                    className="px-3.5 py-2 rounded bg-[#F5F5F5] hover:bg-gray-200 text-[#111111] font-bold text-xs transition-colors border border-[#E5E5E5]"
                  >
                    View Details
                  </button>

                  {isPending && (
                    <>
                      <button
                        onClick={() => setRejectingOrder(order)}
                        className="py-2 px-3.5 rounded bg-white hover:bg-[#FFF0F0] text-[#D92D3A] font-bold text-xs transition-colors border border-[#D92D3A]"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, "ACCEPTED")}
                        className="flex-1 py-2 rounded bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] font-black text-xs transition-colors border border-[#111111]"
                      >
                        ACCEPT ORDER ✓
                      </button>
                    </>
                  )}

                  {isAccepted && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, "PREPARING")}
                      className="flex-1 py-2 rounded bg-[#111111] hover:bg-black text-white font-black text-xs transition-colors border border-[#111111]"
                    >
                      Start Packing Items 📦
                    </button>
                  )}

                  {isPreparing && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, "ASSIGNED")}
                      className="flex-1 py-2 rounded bg-[#111111] hover:bg-black text-[#DFFF00] font-black text-xs transition-colors border border-[#111111]"
                    >
                      Mark Ready for Pickup ⚡
                    </button>
                  )}

                  {(isAccepted || isPreparing || isReady) && (
                    <button
                      onClick={() => setAssigningOrder(order)}
                      className="py-2 px-4 rounded bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] font-black text-xs transition-colors border border-[#111111]"
                    >
                      {order.deliveryPartner ? "Reassign Rider 🛵" : "Assign Rider 🛵"}
                    </button>
                  )}

                  {isOutForDelivery && (
                    <span className="py-2 px-3 rounded bg-[#111111] text-[#DFFF00] font-black text-xs border border-[#111111]">
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
          onOpenReject={(ord) => setRejectingOrder(ord)}
          onOpenAssign={(ord) => setAssigningOrder(ord)}
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
          <div className="h-10 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
          <div className="h-44 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
        </div>
      }
    >
      <AdminOrdersContent />
    </Suspense>
  );
}
