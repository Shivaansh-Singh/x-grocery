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
          // Check localStorage backup
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
    <div className="space-y-4 pt-1 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Order History
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Store X local instant delivery orders
          </p>
        </div>
        <Link
          href="/"
          className="text-xs px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold"
        >
          Shop Store X
        </Link>
      </div>

      {isNewOrder && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span>🎉</span>
          <span>Order placed successfully! Store Owner X has received your order.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex rounded-2xl bg-zinc-200/60 dark:bg-zinc-800/60 p-1">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "active"
              ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800"
          }`}
        >
          Active Orders ({activeOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "past"
              ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800"
          }`}
        >
          Past Orders ({pastOrders.length})
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
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 text-center space-y-3 shadow-xs">
          <span className="text-4xl block">📜</span>
          <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
            No {activeTab} orders found
          </h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            {activeTab === "active"
              ? "You don't have any active grocery orders in delivery."
              : "No completed or historical order receipts found."}
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-2xl font-bold text-xs shadow-xs hover:bg-emerald-700 transition-colors"
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
          <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          <div className="h-44 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
        </div>
      }
    >
      <OrdersPageContent />
    </Suspense>
  );
}
