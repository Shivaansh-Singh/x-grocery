"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import type { OrderRecord } from "@/components/orders/OrderCard";

interface DashboardStats {
  todayRevenue: number;
  pendingCount: number;
  activeCount: number;
  lowStockCount: number;
  recentOrders: OrderRecord[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    pendingCount: 0,
    activeCount: 0,
    lowStockCount: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadDashboardStats() {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/admin/products"),
        ]);

        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();

        if (!ignore) {
          const orders: OrderRecord[] = ordersData.orders || [];
          const products = productsData.products || [];

          // Revenue sum
          const todayRevenue = orders
            .filter((o) => o.status !== "CANCELLED" && o.status !== "REJECTED")
            .reduce((sum, o) => sum + o.totalAmount, 0);

          const pendingCount = orders.filter((o) => o.status === "PENDING").length;
          const activeCount = orders.filter(
            (o) => o.status === "OUT_FOR_DELIVERY" || o.status === "ASSIGNED"
          ).length;
          const lowStockCount = products.filter((p: { stock: number }) => p.stock <= 5).length;

          setStats({
            todayRevenue,
            pendingCount,
            activeCount,
            lowStockCount,
            recentOrders: orders.slice(0, 3),
          });
        }
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadDashboardStats();

    const interval = setInterval(() => {
      loadDashboardStats();
    }, 5000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-4 pt-1 pb-8">
      {/* Dedicated Admin Header */}
      <AdminHeader pendingOrdersCount={stats.pendingCount} />

      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-zinc-900 text-white p-5 rounded-3xl shadow-md space-y-2 relative overflow-hidden">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-800 text-purple-200">
          Store Owner X Dashboard
        </span>
        <h1 className="text-xl font-black leading-tight">
          VIT Bhopal Off-Campus Grocery Operations
        </h1>
        <p className="text-xs text-purple-200 leading-relaxed max-w-sm">
          Manage product catalog, process incoming orders, track inventory levels, and assign riders for 10-15 minute doorstep delivery.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Today's Revenue */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold">
            <span>Today&apos;s Revenue</span>
            <span>💰</span>
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {loading ? "..." : `₹${stats.todayRevenue.toFixed(0)}`}
          </div>
          <span className="text-[10px] text-zinc-400 block">Store X sales today</span>
        </div>

        {/* Pending Orders */}
        <Link
          href="/admin/orders"
          className={`bg-white dark:bg-zinc-900 p-4 rounded-3xl border shadow-xs space-y-1 transition-all ${
            stats.pendingCount > 0
              ? "border-amber-400 ring-2 ring-amber-100 dark:ring-amber-950"
              : "border-zinc-200/80 dark:border-zinc-800"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold">
            <span>Pending Orders</span>
            <span>⏳</span>
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <span>{loading ? "..." : stats.pendingCount}</span>
            {stats.pendingCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-500 text-white rounded-full font-bold animate-bounce">
                ACTION
              </span>
            )}
          </div>
          <span className="text-[10px] text-zinc-400 block">Requires 1-tap approval</span>
        </Link>

        {/* Active Deliveries */}
        <Link
          href="/admin/orders"
          className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-1"
        >
          <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold">
            <span>Riders Out</span>
            <span>🛵</span>
          </div>
          <div className="text-xl font-black text-teal-600 dark:text-teal-400">
            {loading ? "..." : stats.activeCount}
          </div>
          <span className="text-[10px] text-zinc-400 block">Active deliveries en route</span>
        </Link>

        {/* Low Stock Alert */}
        <Link
          href="/admin/products"
          className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-1"
        >
          <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold">
            <span>Low Stock Items</span>
            <span>⚠️</span>
          </div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400">
            {loading ? "..." : stats.lowStockCount}
          </div>
          <span className="text-[10px] text-zinc-400 block">Items with &le; 5 units left</span>
        </Link>
      </div>

      {/* Quick Action Cards */}
      <div className="space-y-2">
        <h3 className="font-bold text-xs text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
          Quick Management Tools
        </h3>

        <div className="grid grid-cols-1 gap-2.5">
          <Link
            href="/admin/products"
            className="p-4 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center text-lg">
                📦
              </div>
              <div>
                <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                  Catalog & Inventory Manager
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Inline stock steppers, price updates, and new products
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">Manage →</span>
          </Link>

          <Link
            href="/admin/orders"
            className="p-4 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-lg">
                📋
              </div>
              <div>
                <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                  Incoming Orders Board
                </h4>
                <p className="text-[11px] text-zinc-500">
                  1-tap Accept/Reject, status progression, and rider assignment
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Open Board →</span>
          </Link>

          <Link
            href="/admin/delivery-staff"
            className="p-4 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-lg">
                🛵
              </div>
              <div>
                <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                  Delivery Staff Roster
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Onboard new riders and view Store X delivery partners
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">View Staff →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
