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
    <div className="space-y-4 pt-1 pb-6 text-[#F5F6FA]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/8 pb-2.5">
        <div>
          <h1 className="text-xl font-black text-[#F5F6FA] tracking-tight">
            Order History
          </h1>
          <p className="text-xs text-[#8A90A3]">
            RushD Express Delivery Orders
          </p>
        </div>
        <Link
          href="/"
          className="text-xs px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] text-white font-extrabold hover:opacity-90 transition-all shadow-sm"
        >
          Shop RushD
        </Link>
      </div>

      {isNewOrder && (
        <div className="p-3.5 bg-[#3DD68C]/15 border border-[#3DD68C] text-[#3DD68C] rounded-2xl text-xs font-bold flex items-center gap-2">
          <span>✓</span>
          <span>Order placed successfully! RushD partner store has received your order.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex rounded-2xl bg-[#141822] p-1 border border-white/8">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "active"
              ? "bg-[#2D6CFF] text-white shadow-sm"
              : "text-[#8A90A3] hover:text-[#F5F6FA]"
          }`}
        >
          Active Orders ({activeOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "past"
              ? "bg-[#2D6CFF] text-white shadow-sm"
              : "text-[#8A90A3] hover:text-[#F5F6FA]"
          }`}
        >
          Past Orders ({pastOrders.length})
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-[#141822] border border-white/8 rounded-2xl" />
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <div className="bg-[#141822] rounded-2xl p-8 border border-white/8 text-center space-y-3 shadow-md">
          <h3 className="font-bold text-sm text-[#F5F6FA]">
            No {activeTab} orders found
          </h3>
          <p className="text-xs text-[#8A90A3] max-w-xs mx-auto">
            {activeTab === "active"
              ? "You don't have any active grocery orders in delivery right now."
              : "No completed or historical order receipts found."}
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] text-white rounded-xl font-bold text-xs shadow-sm hover:opacity-90 transition-all"
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
          <div className="h-10 bg-[#141822] border border-white/8 rounded-xl" />
          <div className="h-40 bg-[#141822] border border-white/8 rounded-2xl" />
        </div>
      }
    >
      <OrdersPageContent />
    </Suspense>
  );
}
