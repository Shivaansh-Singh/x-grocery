"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { OrderCard, OrderRecord } from "@/components/orders/OrderCard";

function OrdersPageContent() {
  const searchParams = useSearchParams();
  const isNewOrder = searchParams.get("newOrder") === "true";

  const [activeTab, setActiveTab] = useState<"active" | "past">("active");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadOrders() {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (!ignore && data.orders && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else if (!ignore) {
          const lastOrder = localStorage.getItem("x_grocery_last_order");
          if (lastOrder) {
            setOrders([JSON.parse(lastOrder)]);
          }
        }
      } catch (err) {
        console.error("Error loading orders:", err);
        const lastOrder = localStorage.getItem("x_grocery_last_order");
        if (lastOrder) {
          setOrders([JSON.parse(lastOrder)]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadOrders();

    return () => {
      ignore = true;
    };
  }, []);

  const activeOrders = orders.filter(
    (o) => o.status !== "DELIVERED" && o.status !== "CANCELLED" && o.status !== "REJECTED"
  );
  const pastOrders = orders.filter(
    (o) => o.status === "DELIVERED" || o.status === "CANCELLED" || o.status === "REJECTED"
  );

  const currentList = activeTab === "active" ? activeOrders : pastOrders;

  return (
    <div className="space-y-4 pt-1 pb-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#27313D] pb-2.5">
        <div>
          <h1 className="text-xl font-black text-[#FFFFFF] tracking-tight">
            Order History
          </h1>
          <p className="text-xs text-[#A8B0BC]">
            RushD Express Delivery Orders
          </p>
        </div>
        <Link
          href="/"
          className="text-xs px-3.5 py-1.5 rounded-xl bg-[#FF5A00] text-white font-extrabold hover:bg-[#FF6A1A] transition-colors shadow-sm"
        >
          Shop RushD
        </Link>
      </div>

      {isNewOrder && (
        <div className="p-3.5 bg-[#19B978]/15 border border-[#19B978] text-[#19B978] rounded-2xl text-xs font-bold flex items-center gap-2">
          <span>✓</span>
          <span>Order placed successfully! RushD partner store has received your order.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex rounded-2xl bg-[#151B24] p-1 border border-[#27313D]">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "active"
              ? "bg-[#0757D5] text-white shadow-sm"
              : "text-[#A8B0BC] hover:text-[#FFFFFF]"
          }`}
        >
          Active Orders ({activeOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "past"
              ? "bg-[#0757D5] text-white shadow-sm"
              : "text-[#A8B0BC] hover:text-[#FFFFFF]"
          }`}
        >
          Past Orders ({pastOrders.length})
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-[#151B24] border border-[#27313D] rounded-2xl" />
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <div className="bg-[#151B24] rounded-2xl p-8 border border-[#27313D] text-center space-y-3 shadow-md">
          <h3 className="font-bold text-sm text-[#FFFFFF]">
            No {activeTab} orders found
          </h3>
          <p className="text-xs text-[#A8B0BC] max-w-xs mx-auto">
            {activeTab === "active"
              ? "You don't have any active grocery orders in delivery right now."
              : "No completed or historical order receipts found."}
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-[#FF5A00] text-white rounded-xl font-bold text-xs shadow-sm hover:bg-[#FF6A1A] transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((order) => (
            <OrderCard key={order.id || order.orderNumber} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 pt-4 animate-pulse">
          <div className="h-10 bg-[#151B24] border border-[#27313D] rounded-xl" />
          <div className="h-40 bg-[#151B24] border border-[#27313D] rounded-2xl" />
        </div>
      }
    >
      <OrdersPageContent />
    </Suspense>
  );
}
