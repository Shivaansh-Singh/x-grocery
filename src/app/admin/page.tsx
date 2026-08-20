"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import type { OrderRecord } from "@/components/orders/OrderCard";
import { getLocalOrders } from "@/lib/orderSync";

interface DashboardStats {
  totalSales: number;
  newOrdersCount: number;
  acceptedCount: number;
  preparingCount: number;
  readyCount: number;
  outForDeliveryCount: number;
  deliveredCount: number;
  lowStockCount: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    newOrdersCount: 0,
    acceptedCount: 0,
    preparingCount: 0,
    readyCount: 0,
    outForDeliveryCount: 0,
    deliveredCount: 0,
    lowStockCount: 0,
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
          // Merge API orders with local orders backup
          const apiOrders: OrderRecord[] = ordersData.orders || [];
          const localOrders = getLocalOrders();
          const orderMap = new Map<string, OrderRecord>();
          [...localOrders, ...apiOrders].forEach((o) => orderMap.set(o.id, o));
          const orders = Array.from(orderMap.values());

          const products = productsData.products || [];

          const totalSales = orders
            .filter((o) => o.status !== "CANCELLED" && o.status !== "REJECTED")
            .reduce((sum, o) => sum + o.totalAmount, 0);

          const newOrdersCount = orders.filter((o) => o.status === "PENDING").length;
          const acceptedCount = orders.filter((o) => o.status === "ACCEPTED").length;
          const preparingCount = orders.filter((o) => o.status === "PREPARING").length;
          const readyCount = orders.filter((o) => o.status === "ASSIGNED").length;
          const outForDeliveryCount = orders.filter((o) => o.status === "OUT_FOR_DELIVERY").length;
          const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;
          const lowStockCount = products.filter((p: { stock: number }) => p.stock <= 5).length;

          setStats({
            totalSales,
            newOrdersCount,
            acceptedCount,
            preparingCount,
            readyCount,
            outForDeliveryCount,
            deliveredCount,
            lowStockCount,
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
    }, 4000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-4 pt-1 pb-8 text-[#F5F6FA]">
      {/* Dedicated Admin Header */}
      <AdminHeader pendingOrdersCount={stats.newOrdersCount} />

      {/* Overview Banner - Electric Dusk Theme */}
      <div className="glass-card rounded-[22px] p-5 shadow-xl relative overflow-hidden rushd-speed-slash">
        <div className="absolute -top-12 -left-12 w-56 h-56 rounded-full bg-gradient-to-br from-[#FF6B1A]/15 to-[#2D6CFF]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] text-white shadow-xs">
            Shop Owner / Admin Control Center
          </span>
          <h1 className="font-display font-black text-xl text-[#F5F6FA]">
            RushD Store Operations Dashboard
          </h1>
          <p className="text-xs text-[#8A90A3] leading-relaxed max-w-md font-medium">
            Manage incoming student orders, accept orders, control preparation workflow, and assign active delivery riders.
          </p>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* New Orders */}
        <Link
          href="/admin/orders?tab=pending"
          className={`glass-card p-4 rounded-[20px] shadow-sm transition-all block ${
            stats.newOrdersCount > 0
              ? "border-[#FF6B1A]/60 shadow-[0_0_16px_rgba(255,107,26,0.2)]"
              : ""
          }`}
        >
          <div className="text-[10px] font-bold text-[#8A90A3] uppercase tracking-wider">
            New Orders
          </div>
          <div className="text-2xl font-black text-[#FF6B1A] mt-1 flex items-center justify-between">
            <span>{loading ? "..." : stats.newOrdersCount}</span>
            {stats.newOrdersCount > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 bg-[#FF6B1A] text-white rounded-md font-black">
                ACTION
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#8A90A3] block mt-1">Requires approval</span>
        </Link>

        {/* Accepted & Preparing */}
        <Link
          href="/admin/orders?tab=accepted"
          className="glass-card p-4 rounded-[20px] shadow-sm block hover:border-white/20 transition-all"
        >
          <div className="text-[10px] font-bold text-[#8A90A3] uppercase tracking-wider">
            Accepted / Preparing
          </div>
          <div className="text-2xl font-black text-[#2D6CFF] mt-1">
            {loading ? "..." : stats.acceptedCount + stats.preparingCount}
          </div>
          <span className="text-[10px] text-[#8A90A3] block mt-1">In packing workflow</span>
        </Link>

        {/* Ready / Assigned */}
        <Link
          href="/admin/orders?tab=ready"
          className="glass-card p-4 rounded-[20px] shadow-sm block hover:border-white/20 transition-all"
        >
          <div className="text-[10px] font-bold text-[#8A90A3] uppercase tracking-wider">
            Ready / Assigned
          </div>
          <div className="text-2xl font-black text-[#F5F6FA] mt-1">
            {loading ? "..." : stats.readyCount}
          </div>
          <span className="text-[10px] text-[#8A90A3] block mt-1">Awaiting rider pickup</span>
        </Link>

        {/* Out for Delivery */}
        <Link
          href="/admin/orders?tab=delivery"
          className="glass-card p-4 rounded-[20px] shadow-sm block hover:border-white/20 transition-all"
        >
          <div className="text-[10px] font-bold text-[#8A90A3] uppercase tracking-wider">
            Out for Delivery
          </div>
          <div className="text-2xl font-black text-[#2D6CFF] mt-1">
            {loading ? "..." : stats.outForDeliveryCount}
          </div>
          <span className="text-[10px] text-[#8A90A3] block mt-1">En route to student</span>
        </Link>
      </div>

      {/* Secondary Metrics Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3.5 rounded-[18px]">
          <span className="text-[10px] font-bold text-[#8A90A3] uppercase tracking-wider block">
            Delivered
          </span>
          <span className="text-lg font-black text-[#F5F6FA] mt-0.5 block">
            {loading ? "..." : stats.deliveredCount}
          </span>
        </div>

        <div className="glass-card p-3.5 rounded-[18px]">
          <span className="text-[10px] font-bold text-[#8A90A3] uppercase tracking-wider block">
            Total Sales
          </span>
          <span className="text-lg font-black text-[#FF6B1A] mt-0.5 block">
            {loading ? "..." : `₹${stats.totalSales.toFixed(0)}`}
          </span>
        </div>

        <Link href="/admin/products" className="glass-card p-3.5 rounded-[18px] block hover:border-white/20">
          <span className="text-[10px] font-bold text-[#8A90A3] uppercase tracking-wider block">
            Low Stock (&le;5)
          </span>
          <span className="text-lg font-black text-[#FF4D4D] mt-0.5 block">
            {loading ? "..." : stats.lowStockCount}
          </span>
        </Link>
      </div>

      {/* Quick Management Tools */}
      <div className="space-y-2 pt-2">
        <h3 className="font-display font-black text-xs text-[#F5F6FA] uppercase tracking-wider">
          Admin Management Hub
        </h3>

        <div className="grid grid-cols-1 gap-2.5">
          <Link
            href="/admin/orders"
            className="glass-card p-4 rounded-[20px] shadow-sm hover:border-[#FF6B1A]/40 transition-all flex items-center justify-between"
          >
            <div>
              <h4 className="font-display font-black text-sm text-[#F5F6FA]">
                Incoming Orders & Rider Assignment Board
              </h4>
              <p className="text-xs text-[#8A90A3] mt-0.5 font-medium">
                Accept new orders, start packing, and assign riders
              </p>
            </div>
            <span className="text-xs font-black text-[#FF6B1A]">Open Board →</span>
          </Link>

          <Link
            href="/admin/products"
            className="glass-card p-4 rounded-[20px] shadow-sm hover:border-[#2D6CFF]/40 transition-all flex items-center justify-between"
          >
            <div>
              <h4 className="font-display font-black text-sm text-[#F5F6FA]">
                Catalog & Inventory Manager
              </h4>
              <p className="text-xs text-[#8A90A3] mt-0.5 font-medium">
                Update stock levels, edit prices, and manage products
              </p>
            </div>
            <span className="text-xs font-black text-[#2D6CFF]">Manage Products →</span>
          </Link>

          <Link
            href="/admin/delivery-staff"
            className="glass-card p-4 rounded-[20px] shadow-sm hover:border-white/20 transition-all flex items-center justify-between"
          >
            <div>
              <h4 className="font-display font-black text-sm text-[#F5F6FA]">
                Delivery Staff Roster
              </h4>
              <p className="text-xs text-[#8A90A3] mt-0.5 font-medium">
                View active rider status and onboard new delivery partners
              </p>
            </div>
            <span className="text-xs font-black text-[#8A90A3]">View Roster →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
