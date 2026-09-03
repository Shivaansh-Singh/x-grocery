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
    <div className="space-y-4 pt-1 pb-6 text-[#111111]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2.5">
        <div>
          <h1 className="text-xl font-extrabold text-[#111111] tracking-tight">
            Order History
          </h1>
          <p className="text-xs text-[#666666] font-medium">
            RushD Express Delivery Orders
          </p>
        </div>
        <Link
          href="/"
          className="text-xs px-3.5 py-1.5 rounded bg-[#111111] text-white font-extrabold hover:bg-black transition-colors"
        >
          Shop RushD
        </Link>
      </div>

      {isNewOrder && (
        <div className="p-3.5 bg-[#000000] border border-[#111111] text-[#DFFF00] rounded-lg text-xs font-bold flex items-center gap-2">
          <span>✓</span>
          <span>Order placed successfully! RushD partner store has received your order.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex rounded-lg bg-[#F5F5F5] p-1 border border-[#E5E5E5]">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 py-2 rounded text-xs font-black transition-colors ${
            activeTab === "active"
              ? "bg-[#DFFF00] text-[#000000] border border-[#111111]"
              : "text-[#666666] hover:text-[#111111]"
          }`}
        >
          Active Orders ({activeOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`flex-1 py-2 rounded text-xs font-black transition-colors ${
            activeTab === "past"
              ? "bg-[#DFFF00] text-[#000000] border border-[#111111]"
              : "text-[#666666] hover:text-[#111111]"
          }`}
        >
          Past Orders ({pastOrders.length})
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <div className="bg-white rounded-lg p-8 border border-[#E5E5E5] text-center space-y-3">
          <h3 className="font-extrabold text-sm text-[#111111]">
            No {activeTab} orders found
          </h3>
          <p className="text-xs text-[#666666] max-w-xs mx-auto font-medium">
            {activeTab === "active"
              ? "You don't have any active grocery orders in delivery right now."
              : "No completed or historical order receipts found."}
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-[#111111] text-white rounded font-extrabold text-xs hover:bg-black transition-colors"
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
          <div className="h-10 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
          <div className="h-40 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
        </div>
      }
    >
      <OrdersPageContent />
    </Suspense>
  );
}
