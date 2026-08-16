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
      <div className="bg-[#111315] text-white p-5 rounded-2xl shadow-2xs border border-[#1646C7]/30 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1646C7] text-white">
          Store Partner Dashboard
        </span>
        <h1 className="text-xl font-black leading-tight text-white">
          Fulfillment & Inventory Hub
        </h1>
        <p className="text-xs text-[#666A70] leading-relaxed max-w-sm font-medium">
          Manage product catalog, process incoming orders, track inventory levels, and assign riders for 10-15 minute doorstep delivery.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Today's Revenue */}
        <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#D9D7D2] shadow-2xs space-y-1">
          <div className="text-xs text-[#666A70] font-semibold">
            Today&apos;s Revenue
          </div>
          <div className="text-xl font-black text-[#FF5A1F]">
            {loading ? "..." : `₹${stats.todayRevenue.toFixed(0)}`}
          </div>
          <span className="text-[10px] text-[#666A70] block">Store sales today</span>
        </div>

        {/* Pending Orders */}
        <Link
          href="/admin/orders"
          className={`bg-[#FFFFFF] p-4 rounded-2xl border shadow-2xs space-y-1 transition-all ${
            stats.pendingCount > 0
              ? "border-[#D9822B] ring-2 ring-[#D9822B]/20"
              : "border-[#D9D7D2]"
          }`}
        >
          <div className="text-xs text-[#666A70] font-semibold">
            Pending Orders
          </div>
          <div className="text-xl font-black text-[#D9822B] flex items-center gap-1.5">
            <span>{loading ? "..." : stats.pendingCount}</span>
            {stats.pendingCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 bg-[#D9822B] text-white rounded font-bold">
                ACTION
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#666A70] block">Requires 1-tap approval</span>
        </Link>

        {/* Active Deliveries */}
        <Link
          href="/admin/orders"
          className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#D9D7D2] shadow-2xs space-y-1"
        >
          <div className="text-xs text-[#666A70] font-semibold">
            Riders Out
          </div>
          <div className="text-xl font-black text-[#1646C7]">
            {loading ? "..." : stats.activeCount}
          </div>
          <span className="text-[10px] text-[#666A70] block">Active deliveries en route</span>
        </Link>

        {/* Low Stock Alert */}
        <Link
          href="/admin/products"
          className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#D9D7D2] shadow-2xs space-y-1"
        >
          <div className="text-xs text-[#666A70] font-semibold">
            Low Stock Items
          </div>
          <div className="text-xl font-black text-[#C63D3D]">
            {loading ? "..." : stats.lowStockCount}
          </div>
          <span className="text-[10px] text-[#666A70] block">Items with &le; 5 units left</span>
        </Link>
      </div>

      {/* Quick Action Cards */}
      <div className="space-y-2">
        <h3 className="font-bold text-xs text-[#111315] uppercase tracking-wider">
          Quick Management Tools
        </h3>

        <div className="grid grid-cols-1 gap-2.5">
          <Link
            href="/admin/products"
            className="p-4 bg-[#FFFFFF] rounded-2xl border border-[#D9D7D2] shadow-2xs hover:shadow-xs transition-all flex items-center justify-between"
          >
            <div>
              <h4 className="font-bold text-xs text-[#111315]">
                Catalog & Inventory Manager
              </h4>
              <p className="text-[11px] text-[#666A70] mt-0.5">
                Inline stock steppers, price updates, and new products
              </p>
            </div>
            <span className="text-xs font-bold text-[#FF5A1F]">Manage →</span>
          </Link>

          <Link
            href="/admin/orders"
            className="p-4 bg-[#FFFFFF] rounded-2xl border border-[#D9D7D2] shadow-2xs hover:shadow-xs transition-all flex items-center justify-between"
          >
            <div>
              <h4 className="font-bold text-xs text-[#111315]">
                Incoming Orders Board
              </h4>
              <p className="text-[11px] text-[#666A70] mt-0.5">
                1-tap Accept/Reject, status progression, and rider assignment
              </p>
            </div>
            <span className="text-xs font-bold text-[#FF5A1F]">Open Board →</span>
          </Link>

          <Link
            href="/admin/delivery-staff"
            className="p-4 bg-[#FFFFFF] rounded-2xl border border-[#D9D7D2] shadow-2xs hover:shadow-xs transition-all flex items-center justify-between"
          >
            <div>
              <h4 className="font-bold text-xs text-[#111315]">
                Delivery Staff Roster
              </h4>
              <p className="text-[11px] text-[#666A70] mt-0.5">
                Onboard new riders and view RushD delivery partners
              </p>
            </div>
            <span className="text-xs font-bold text-[#FF5A1F]">View Staff →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
