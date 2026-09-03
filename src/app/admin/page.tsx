"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { OrderDetailsModal } from "@/components/admin/OrderDetailsModal";
import type { OrderRecord } from "@/components/orders/OrderCard";

interface DashboardData {
  summary: {
    totalOrders: number;
    pendingOrders: number;
    activeDeliveries: number;
    deliveredOrders: number;
    cancelledRejectedOrders: number;
    rangeRevenue: number;
    totalRevenueAllTime: number;
    todayRevenue: number;
    last7DaysRevenue: number;
    last30DaysRevenue: number;
    totalProducts: number;
    activeProductsCount: number;
    inactiveProductsCount: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalInventoryQuantity: number;
    totalCustomers: number;
    customersWithOrders: number;
    averageOrderValue: number;
    ordersPerCustomer: string;
  };
  revenueChartData: Array<{
    date: string;
    label: string;
    revenue: number;
    orderCount: number;
  }>;
  orderStatusBreakdown: {
    PENDING: number;
    ACCEPTED: number;
    PREPARING: number;
    ASSIGNED: number;
    OUT_FOR_DELIVERY: number;
    DELIVERED: number;
    REJECTED: number;
    CANCELLED: number;
  };
  deliveryPerformance: {
    totalDeliveries: number;
    activeDeliveries: number;
    completedDeliveries: number;
    cancelledDeliveries: number;
    completionRate: number;
    activeRidersCount: number;
  };
  inventory: {
    lowStockProducts: Array<{
      id: string;
      name: string;
      categoryName: string;
      stock: number;
      price: number;
      unitDisplay: string;
      isActive: boolean;
    }>;
    outOfStockProducts: Array<{
      id: string;
      name: string;
      categoryName: string;
      stock: number;
      price: number;
      unitDisplay: string;
      isActive: boolean;
    }>;
  };
  topSellingProducts: Array<{
    productId: string;
    productName: string;
    unitsSold: number;
    revenueGenerated: number;
  }>;
  customerAnalytics: {
    totalCustomers: number;
    customersWithOrders: number;
    averageOrderValue: number;
    ordersPerCustomer: string;
    topCustomers: Array<{
      customerId: string;
      name: string;
      phone: string;
      orderCount: number;
      totalSpent: number;
      lastOrderDate: string;
    }>;
  };
  recentOrders: OrderRecord[];
}

function AdminDashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [topProductsLimit, setTopProductsLimit] = useState<number>(5);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderRecord | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const fetchDashboardData = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch(`/api/admin/dashboard?range=${timeRange}&topLimit=${topProductsLimit}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch analytics");
      }

      setData(json);
      setError(null);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError((prev) => prev || (err instanceof Error ? err.message : "Unable to load dashboard data. Please retry."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeRange, topProductsLimit]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!ignore) {
        await fetchDashboardData();
      }
    }
    load();

    const interval = setInterval(() => {
      if (!ignore) {
        fetchDashboardData(true);
      }
    }, 5000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [fetchDashboardData]);

  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: string,
    deliveryPartnerId?: string,
    rejectionReason?: string
  ) => {
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          deliveryPartnerId,
          rejectionReason,
        }),
      });
      fetchDashboardData(true);
    } catch (err) {
      console.error("Error updating order status from modal:", err);
    }
  };

  const summary = data?.summary;
  const chartData = data?.revenueChartData || [];
  const maxRevenueInChart = Math.max(...chartData.map((d) => d.revenue), 100);

  return (
    <div className="space-y-5 pt-1 pb-12 text-[#111111]">
      {/* 1. Dedicated Admin Header */}
      <AdminHeader pendingOrdersCount={summary?.pendingOrders || 0} />

      {/* 2. Control Bar: Title + Date Range Selector + Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5E5] pb-3">
        <div>
          <h1 className="font-extrabold text-xl text-[#111111] tracking-tight">
            Store Operations & Analytics
          </h1>
          <p className="text-xs text-[#666666] font-medium">
            Real-time business performance, fulfillment status, and inventory intelligence
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Time Range Filter */}
          <div className="flex bg-[#F5F5F5] p-1 rounded-lg border border-[#E5E5E5] gap-1 text-xs font-black">
            {[
              { key: "today", label: "Today" },
              { key: "7d", label: "7 Days" },
              { key: "30d", label: "30 Days" },
              { key: "90d", label: "90 Days" },
              { key: "all", label: "All Time" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTimeRange(t.key)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  timeRange === t.key
                    ? "bg-[#111111] text-[#DFFF00]"
                    : "text-[#666666] hover:text-[#111111]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchDashboardData(false)}
            disabled={loading || refreshing}
            className="px-3 py-1.5 rounded-lg border border-[#E5E5E5] bg-white text-xs font-bold text-[#111111] hover:bg-[#F5F5F5] transition-colors flex items-center gap-1.5"
          >
            <span className={refreshing ? "animate-spin" : ""}>↻</span>
            <span>{refreshing ? "Updating..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && !data ? (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-24 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
            ))}
          </div>
          <div className="h-64 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
        </div>
      ) : error && !data ? (
        <div className="p-8 bg-white rounded-lg border border-[#D92D3A] text-center space-y-3">
          <h3 className="font-extrabold text-sm text-[#D92D3A]">{error}</h3>
          <button
            onClick={() => fetchDashboardData(false)}
            className="px-4 py-2 bg-[#111111] text-white rounded text-xs font-bold hover:bg-black"
          >
            Retry Loading
          </button>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* 3. TOP SUMMARY CARDS (8 Real Metrics) */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Total Orders */}
            <Link
              href="/admin/orders?tab=all"
              className="bg-white p-4 rounded-lg border border-[#E5E5E5] hover:border-[#111111] transition-colors flex flex-col justify-between"
            >
              <div className="text-[10px] font-extrabold text-[#666666] uppercase tracking-wider">
                Total Orders
              </div>
              <div className="text-2xl font-black text-[#111111] mt-1.5">
                {summary?.totalOrders || 0}
              </div>
              <span className="text-[10px] text-[#666666] font-medium mt-1">In selected range</span>
            </Link>

            {/* Pending Orders */}
            <Link
              href="/admin/orders?tab=pending"
              className={`p-4 rounded-lg border transition-all flex flex-col justify-between ${
                (summary?.pendingOrders || 0) > 0
                  ? "bg-[#DFFF00] border-[#111111] text-[#000000]"
                  : "bg-white border-[#E5E5E5] hover:border-[#111111]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-wider ${
                  (summary?.pendingOrders || 0) > 0 ? "text-[#000000]" : "text-[#666666]"
                }`}>
                  Pending Orders
                </span>
                {(summary?.pendingOrders || 0) > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[#D92D3A] animate-pulse" />
                )}
              </div>
              <div className="text-2xl font-black mt-1.5">
                {summary?.pendingOrders || 0}
              </div>
              <span className={`text-[10px] font-bold mt-1 ${
                (summary?.pendingOrders || 0) > 0 ? "text-[#000000]" : "text-[#666666]"
              }`}>
                {(summary?.pendingOrders || 0) > 0 ? "Requires Immediate Action" : "All caught up"}
              </span>
            </Link>

            {/* Active Deliveries */}
            <Link
              href="/admin/orders?tab=delivery"
              className="bg-white p-4 rounded-lg border border-[#E5E5E5] hover:border-[#111111] transition-colors flex flex-col justify-between"
            >
              <div className="text-[10px] font-extrabold text-[#666666] uppercase tracking-wider">
                Active In Transit / Prep
              </div>
              <div className="text-2xl font-black text-[#111111] mt-1.5">
                {summary?.activeDeliveries || 0}
              </div>
              <span className="text-[10px] text-[#666666] font-medium mt-1">Packing & En Route</span>
            </Link>

            {/* Delivered Orders */}
            <Link
              href="/admin/orders?tab=delivered"
              className="bg-white p-4 rounded-lg border border-[#E5E5E5] hover:border-[#111111] transition-colors flex flex-col justify-between"
            >
              <div className="text-[10px] font-extrabold text-[#168A55] uppercase tracking-wider">
                Delivered Orders
              </div>
              <div className="text-2xl font-black text-[#168A55] mt-1.5">
                {summary?.deliveredOrders || 0}
              </div>
              <span className="text-[10px] text-[#666666] font-medium mt-1">Fulfilled successfully</span>
            </Link>

            {/* Total Revenue */}
            <div className="bg-[#111111] text-white p-4 rounded-lg border border-[#111111] flex flex-col justify-between">
              <div className="text-[10px] font-black text-[#DFFF00] uppercase tracking-wider">
                Delivered Revenue
              </div>
              <div className="text-2xl font-black text-white mt-1.5">
                ₹{(summary?.rangeRevenue || 0).toLocaleString("en-IN")}
              </div>
              <span className="text-[10px] text-[#A3A3A3] font-medium mt-1">
                Lifetime: ₹{(summary?.totalRevenueAllTime || 0).toLocaleString("en-IN")}
              </span>
            </div>

            {/* Cancelled / Rejected */}
            <Link
              href="/admin/orders?tab=rejected"
              className="bg-white p-4 rounded-lg border border-[#E5E5E5] hover:border-[#111111] transition-colors flex flex-col justify-between"
            >
              <div className="text-[10px] font-extrabold text-[#D92D3A] uppercase tracking-wider">
                Rejected / Cancelled
              </div>
              <div className="text-2xl font-black text-[#D92D3A] mt-1.5">
                {summary?.cancelledRejectedOrders || 0}
              </div>
              <span className="text-[10px] text-[#666666] font-medium mt-1">Excluded from revenue</span>
            </Link>

            {/* Total Catalog Products */}
            <Link
              href="/admin/products"
              className="bg-white p-4 rounded-lg border border-[#E5E5E5] hover:border-[#111111] transition-colors flex flex-col justify-between"
            >
              <div className="text-[10px] font-extrabold text-[#666666] uppercase tracking-wider">
                Catalog Products
              </div>
              <div className="text-2xl font-black text-[#111111] mt-1.5">
                {summary?.totalProducts || 0}
              </div>
              <span className="text-[10px] text-[#666666] font-medium mt-1">
                {summary?.activeProductsCount || 0} Active • {summary?.inactiveProductsCount || 0} Inactive
              </span>
            </Link>

            {/* Low & Out of Stock */}
            <Link
              href="/admin/products"
              className={`p-4 rounded-lg border transition-colors flex flex-col justify-between ${
                (summary?.outOfStockCount || 0) > 0
                  ? "bg-red-50 border-[#D92D3A]"
                  : (summary?.lowStockCount || 0) > 0
                  ? "bg-amber-50 border-[#111111]"
                  : "bg-white border-[#E5E5E5]"
              }`}
            >
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#D92D3A]">
                Stock Alerts
              </div>
              <div className="text-2xl font-black text-[#111111] mt-1.5">
                {summary?.lowStockCount || 0} <span className="text-xs font-extrabold text-[#666666]">Low</span> / {summary?.outOfStockCount || 0} <span className="text-xs font-extrabold text-[#D92D3A]">Out</span>
              </div>
              <span className="text-[10px] text-[#666666] font-medium mt-1">Total Stock: {summary?.totalInventoryQuantity || 0} units</span>
            </Link>
          </div>

          {/* ========================================================================= */}
          {/* 4. LIVE OPERATIONS SNAPSHOT */}
          {/* ========================================================================= */}
          <div className="bg-white p-4 rounded-lg border border-[#111111] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DFFF00] border border-[#111111] animate-pulse" />
                <h3 className="font-extrabold text-xs text-[#111111] uppercase tracking-wider">
                  Live Operations Workflow
                </h3>
              </div>
              <Link href="/admin/orders" className="text-xs font-black text-[#111111] hover:underline">
                Open Orders Board →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <Link
                href="/admin/orders?tab=pending"
                className="p-3 bg-[#F5F5F5] hover:bg-white rounded-lg border border-[#E5E5E5] hover:border-[#111111] transition-all"
              >
                <span className="text-[10px] font-extrabold text-[#666666] uppercase block">
                  1. Incoming New
                </span>
                <span className="text-lg font-black text-[#111111] block mt-0.5">
                  {data?.orderStatusBreakdown.PENDING || 0} Orders
                </span>
              </Link>

              <Link
                href="/admin/orders?tab=preparing"
                className="p-3 bg-[#F5F5F5] hover:bg-white rounded-lg border border-[#E5E5E5] hover:border-[#111111] transition-all"
              >
                <span className="text-[10px] font-extrabold text-[#666666] uppercase block">
                  2. In Packing
                </span>
                <span className="text-lg font-black text-[#111111] block mt-0.5">
                  {(data?.orderStatusBreakdown.ACCEPTED || 0) + (data?.orderStatusBreakdown.PREPARING || 0)} Orders
                </span>
              </Link>

              <Link
                href="/admin/orders?tab=ready"
                className="p-3 bg-[#F5F5F5] hover:bg-white rounded-lg border border-[#E5E5E5] hover:border-[#111111] transition-all"
              >
                <span className="text-[10px] font-extrabold text-[#666666] uppercase block">
                  3. Ready / Assigned
                </span>
                <span className="text-lg font-black text-[#111111] block mt-0.5">
                  {data?.orderStatusBreakdown.ASSIGNED || 0} Orders
                </span>
              </Link>

              <Link
                href="/admin/orders?tab=delivery"
                className="p-3 bg-[#F5F5F5] hover:bg-white rounded-lg border border-[#E5E5E5] hover:border-[#111111] transition-all"
              >
                <span className="text-[10px] font-extrabold text-[#666666] uppercase block">
                  4. En Route
                </span>
                <span className="text-lg font-black text-[#111111] block mt-0.5">
                  {data?.orderStatusBreakdown.OUT_FOR_DELIVERY || 0} Orders
                </span>
              </Link>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 5. REVENUE & ORDER VOLUME TRENDS (Daily Chart) */}
          {/* ========================================================================= */}
          <div className="bg-white p-5 rounded-lg border border-[#E5E5E5] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E5E5] pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-[#111111]">
                  Revenue & Order Volume Trends
                </h3>
                <p className="text-xs text-[#666666] font-medium">
                  Fulfilled order revenue over time (delivered orders only)
                </p>
              </div>

              {/* Revenue Period Breakdown Chips */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <div className="px-2.5 py-1 bg-[#F5F5F5] rounded border border-[#E5E5E5]">
                  <span className="text-[#666666] font-medium">Today: </span>
                  <span className="font-black text-[#111111]">₹{(summary?.todayRevenue || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="px-2.5 py-1 bg-[#F5F5F5] rounded border border-[#E5E5E5]">
                  <span className="text-[#666666] font-medium">Last 7d: </span>
                  <span className="font-black text-[#111111]">₹{(summary?.last7DaysRevenue || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="px-2.5 py-1 bg-[#F5F5F5] rounded border border-[#E5E5E5]">
                  <span className="text-[#666666] font-medium">Last 30d: </span>
                  <span className="font-black text-[#111111]">₹{(summary?.last30DaysRevenue || 0).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Custom Responsive SVG / HTML Bar Chart */}
            {chartData.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#666666] font-medium">
                No revenue recorded in this time range.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="h-44 flex items-end gap-1.5 pt-6 pb-2 px-1 border-b border-[#E5E5E5] overflow-x-auto no-scrollbar">
                  {chartData.map((d, index) => {
                    const heightPercent = Math.max(8, Math.round((d.revenue / maxRevenueInChart) * 100));
                    const isHovered = hoveredBarIndex === index;

                    return (
                      <div
                        key={d.date}
                        onMouseEnter={() => setHoveredBarIndex(index)}
                        onMouseLeave={() => setHoveredBarIndex(null)}
                        className="flex-1 min-w-[20px] h-full flex flex-col justify-end items-center group relative cursor-pointer"
                      >
                        {/* Tooltip */}
                        {isHovered && (
                          <div className="absolute -top-10 z-20 bg-[#111111] text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap border border-[#DFFF00]">
                            <p className="font-black text-[#DFFF00]">₹{d.revenue.toFixed(0)}</p>
                            <p className="text-[9px] text-[#A3A3A3]">{d.orderCount} orders • {d.label}</p>
                          </div>
                        )}

                        {/* Bar */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full max-w-[28px] rounded-t transition-all ${
                            d.revenue > 0
                              ? isHovered
                                ? "bg-[#DFFF00] border border-[#111111]"
                                : "bg-[#111111]"
                              : "bg-[#E5E5E5]"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* X-axis labels */}
                <div className="flex justify-between text-[9px] font-bold text-[#666666] px-1">
                  <span>{chartData[0]?.label}</span>
                  {chartData.length > 2 && (
                    <span>{chartData[Math.floor(chartData.length / 2)]?.label}</span>
                  )}
                  <span>{chartData[chartData.length - 1]?.label}</span>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 6. ORDER STATUS BREAKDOWN & DELIVERY PERFORMANCE */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Order Lifecycle Distribution */}
            <div className="bg-white p-4 rounded-lg border border-[#E5E5E5] space-y-3">
              <h3 className="font-extrabold text-xs text-[#111111] uppercase tracking-wider">
                Order Status Distribution
              </h3>

              {/* Progress Bar Visualization */}
              <div className="h-3 rounded-full bg-[#F5F5F5] overflow-hidden flex border border-[#E5E5E5]">
                {data?.orderStatusBreakdown && (
                  <>
                    <div
                      style={{ width: `${((data.orderStatusBreakdown.PENDING || 0) / (summary?.totalOrders || 1)) * 100}%` }}
                      className="bg-[#DFFF00]"
                      title="Pending"
                    />
                    <div
                      style={{ width: `${(((data.orderStatusBreakdown.ACCEPTED || 0) + (data.orderStatusBreakdown.PREPARING || 0)) / (summary?.totalOrders || 1)) * 100}%` }}
                      className="bg-[#111111]"
                      title="Preparing"
                    />
                    <div
                      style={{ width: `${((data.orderStatusBreakdown.OUT_FOR_DELIVERY || 0) / (summary?.totalOrders || 1)) * 100}%` }}
                      className="bg-[#22C55E]"
                      title="Out for Delivery"
                    />
                    <div
                      style={{ width: `${((data.orderStatusBreakdown.DELIVERED || 0) / (summary?.totalOrders || 1)) * 100}%` }}
                      className="bg-[#168A55]"
                      title="Delivered"
                    />
                    <div
                      style={{ width: `${(((data.orderStatusBreakdown.REJECTED || 0) + (data.orderStatusBreakdown.CANCELLED || 0)) / (summary?.totalOrders || 1)) * 100}%` }}
                      className="bg-[#D92D3A]"
                      title="Cancelled/Rejected"
                    />
                  </>
                )}
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="flex items-center justify-between p-2 rounded bg-[#F5F5F5] border border-[#E5E5E5]">
                  <span className="font-medium text-[#666666]">Pending</span>
                  <span className="font-black text-[#111111]">{data?.orderStatusBreakdown.PENDING || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#F5F5F5] border border-[#E5E5E5]">
                  <span className="font-medium text-[#666666]">Accepted</span>
                  <span className="font-black text-[#111111]">{data?.orderStatusBreakdown.ACCEPTED || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#F5F5F5] border border-[#E5E5E5]">
                  <span className="font-medium text-[#666666]">Packing</span>
                  <span className="font-black text-[#111111]">{data?.orderStatusBreakdown.PREPARING || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#F5F5F5] border border-[#E5E5E5]">
                  <span className="font-medium text-[#666666]">Assigned</span>
                  <span className="font-black text-[#111111]">{data?.orderStatusBreakdown.ASSIGNED || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#F5F5F5] border border-[#E5E5E5]">
                  <span className="font-medium text-[#666666]">Out for Delivery</span>
                  <span className="font-black text-[#111111]">{data?.orderStatusBreakdown.OUT_FOR_DELIVERY || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#F5F5F5] border border-[#E5E5E5]">
                  <span className="font-medium text-[#168A55]">Delivered</span>
                  <span className="font-black text-[#168A55]">{data?.orderStatusBreakdown.DELIVERED || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#F5F5F5] border border-[#E5E5E5]">
                  <span className="font-medium text-[#D92D3A]">Rejected</span>
                  <span className="font-black text-[#D92D3A]">{data?.orderStatusBreakdown.REJECTED || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#F5F5F5] border border-[#E5E5E5]">
                  <span className="font-medium text-[#D92D3A]">Cancelled</span>
                  <span className="font-black text-[#D92D3A]">{data?.orderStatusBreakdown.CANCELLED || 0}</span>
                </div>
              </div>
            </div>

            {/* Delivery Performance */}
            <div className="bg-white p-4 rounded-lg border border-[#E5E5E5] space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-xs text-[#111111] uppercase tracking-wider">
                    Delivery Performance
                  </h3>
                  <Link href="/admin/delivery-staff" className="text-[11px] font-bold text-[#111111] hover:underline">
                    Manage Riders →
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-2.5 mt-3 text-xs">
                  <div className="p-3 bg-[#F5F5F5] rounded-lg border border-[#E5E5E5]">
                    <span className="text-[10px] text-[#666666] font-bold uppercase block">
                      Fulfillment Rate
                    </span>
                    <span className="text-xl font-black text-[#168A55] block mt-0.5">
                      {data?.deliveryPerformance.completionRate || 100}%
                    </span>
                  </div>

                  <div className="p-3 bg-[#F5F5F5] rounded-lg border border-[#E5E5E5]">
                    <span className="text-[10px] text-[#666666] font-bold uppercase block">
                      Active Riders
                    </span>
                    <span className="text-xl font-black text-[#111111] block mt-0.5">
                      {data?.deliveryPerformance.activeRidersCount || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#111111] text-white rounded-lg text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#A3A3A3]">Total Dispatches:</span>
                  <span className="font-black">{data?.deliveryPerformance.totalDeliveries || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A3A3A3]">Completed Deliveries:</span>
                  <span className="font-black text-[#DFFF00]">{data?.deliveryPerformance.completedDeliveries || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A3A3A3]">Cancelled in Transit:</span>
                  <span className="font-black text-[#D92D3A]">{data?.deliveryPerformance.cancelledDeliveries || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 7. TOP SELLING PRODUCTS & CUSTOMER INTELLIGENCE */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Selling Products */}
            <div className="bg-white p-4 rounded-lg border border-[#E5E5E5] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-xs text-[#111111] uppercase tracking-wider">
                  Top Selling Products
                </h3>
                <div className="flex gap-1 text-[10px] font-black">
                  {[5, 10, 20].map((lim) => (
                    <button
                      key={lim}
                      onClick={() => setTopProductsLimit(lim)}
                      className={`px-2 py-0.5 rounded border ${
                        topProductsLimit === lim
                          ? "bg-[#111111] text-white border-[#111111]"
                          : "bg-white text-[#666666] border-[#E5E5E5]"
                      }`}
                    >
                      Top {lim}
                    </button>
                  ))}
                </div>
              </div>

              {!data?.topSellingProducts || data.topSellingProducts.length === 0 ? (
                <p className="text-xs text-[#666666] py-6 text-center">No product sales in this period.</p>
              ) : (
                <div className="space-y-2">
                  {data.topSellingProducts.map((p, idx) => (
                    <div
                      key={p.productId}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-[#F5F5F5] border border-[#E5E5E5] text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-[#111111] text-[#DFFF00] flex items-center justify-center font-black text-[10px] shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-[#111111] truncate max-w-[200px]">
                          {p.productName}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-black text-[#111111] block">
                          {p.unitsSold} units
                        </span>
                        <span className="text-[10px] text-[#666666] font-medium block">
                          ₹{p.revenueGenerated.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Analytics */}
            <div className="bg-white p-4 rounded-lg border border-[#E5E5E5] space-y-3">
              <h3 className="font-extrabold text-xs text-[#111111] uppercase tracking-wider">
                Customer Analytics & High-Value Shoppers
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-[#F5F5F5] rounded-lg border border-[#E5E5E5]">
                  <span className="text-[10px] text-[#666666] font-bold uppercase block">
                    Average Order Value
                  </span>
                  <span className="text-lg font-black text-[#111111] block mt-0.5">
                    ₹{summary?.averageOrderValue || 0}
                  </span>
                </div>

                <div className="p-2.5 bg-[#F5F5F5] rounded-lg border border-[#E5E5E5]">
                  <span className="text-[10px] text-[#666666] font-bold uppercase block">
                    Active Customers
                  </span>
                  <span className="text-lg font-black text-[#111111] block mt-0.5">
                    {summary?.customersWithOrders || 0} / {summary?.totalCustomers || 0}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-extrabold text-[#666666] uppercase tracking-wider block">
                  Top Spenders
                </span>
                {data?.customerAnalytics.topCustomers.slice(0, 4).map((c) => (
                  <div
                    key={c.customerId}
                    className="flex items-center justify-between p-2 rounded bg-[#F5F5F5] border border-[#E5E5E5] text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#111111] block">{c.name}</span>
                      <span className="text-[10px] text-[#666666]">{c.orderCount} orders</span>
                    </div>
                    <span className="font-black text-[#111111]">
                      ₹{c.totalSpent.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 8. INVENTORY ALERTS TABLE (Low & Out of Stock) */}
          {/* ========================================================================= */}
          <div className="bg-white p-5 rounded-lg border border-[#E5E5E5] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-[#111111]">
                  Inventory Alerts & Stock Management
                </h3>
                <p className="text-xs text-[#666666] font-medium">
                  Products requiring restock or attention
                </p>
              </div>
              <Link
                href="/admin/products"
                className="text-xs font-black text-[#111111] px-3 py-1.5 rounded border border-[#111111] bg-[#DFFF00] hover:bg-[#C8E600] transition-colors"
              >
                + Restock Products
              </Link>
            </div>

            {(!data?.inventory.lowStockProducts || data.inventory.lowStockProducts.length === 0) &&
            (!data?.inventory.outOfStockProducts || data.inventory.outOfStockProducts.length === 0) ? (
              <div className="p-6 bg-[#F5F5F5] rounded-lg border border-[#E5E5E5] text-center text-xs text-[#168A55] font-bold">
                ✓ All catalog products have healthy inventory levels (&gt;5 items).
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E5E5] text-[10px] font-black uppercase tracking-wider text-[#666666]">
                      <th className="pb-2">Product</th>
                      <th className="pb-2">Category</th>
                      <th className="pb-2">Current Stock</th>
                      <th className="pb-2">Price</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {[
                      ...(data?.inventory.outOfStockProducts || []),
                      ...(data?.inventory.lowStockProducts || []),
                    ].map((item) => (
                      <tr key={item.id} className="hover:bg-[#F5F5F5] transition-colors">
                        <td className="py-2.5 font-bold text-[#111111]">{item.name}</td>
                        <td className="py-2.5 text-[#666666]">{item.categoryName}</td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              item.stock === 0
                                ? "bg-[#D92D3A] text-white"
                                : "bg-[#DFFF00] text-[#000000] border border-[#111111]"
                            }`}
                          >
                            {item.stock === 0 ? "0 (Out of Stock)" : `${item.stock} left`}
                          </span>
                        </td>
                        <td className="py-2.5 font-bold text-[#111111]">₹{item.price}</td>
                        <td className="py-2.5">
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                            item.isActive ? "text-[#168A55] bg-emerald-50" : "text-[#999999] bg-gray-100"
                          }`}>
                            {item.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <Link
                            href="/admin/products"
                            className="px-2.5 py-1 bg-[#111111] text-white rounded text-[10px] font-bold hover:bg-black"
                          >
                            Update
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 9. RECENT ORDERS (Latest 15) */}
          {/* ========================================================================= */}
          <div className="bg-white p-5 rounded-lg border border-[#E5E5E5] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-[#111111]">
                  Recent Customer Orders
                </h3>
                <p className="text-xs text-[#666666] font-medium">
                  Latest placed orders across all statuses
                </p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-black text-[#111111] hover:underline"
              >
                View All Orders ({summary?.totalOrders || 0}) →
              </Link>
            </div>

            {!data?.recentOrders || data.recentOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#666666]">
                No orders recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E5E5] text-[10px] font-black uppercase tracking-wider text-[#666666]">
                      <th className="pb-2">Order #</th>
                      <th className="pb-2">Customer</th>
                      <th className="pb-2">Items</th>
                      <th className="pb-2">Total</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Payment</th>
                      <th className="pb-2">Time</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {data.recentOrders.map((order) => {
                      const isPending = order.status === "PENDING";
                      const isDelivered = order.status === "DELIVERED";
                      const isRejected = order.status === "REJECTED" || order.status === "CANCELLED";

                      const formattedTime = new Date(order.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <tr key={order.id} className="hover:bg-[#F5F5F5] transition-colors">
                          <td className="py-2.5 font-extrabold text-[#111111]">
                            #{order.orderNumber}
                          </td>
                          <td className="py-2.5">
                            <span className="font-bold text-[#111111] block">{order.customer?.name || "Customer"}</span>
                            <span className="text-[10px] text-[#666666]">{order.customer?.phone || "—"}</span>
                          </td>
                          <td className="py-2.5 text-[#666666]">
                            {order.items.length} items
                          </td>
                          <td className="py-2.5 font-black text-[#111111]">
                            ₹{order.totalAmount.toFixed(0)}
                          </td>
                          <td className="py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                isDelivered
                                  ? "bg-[#168A55] text-white"
                                  : isRejected
                                  ? "bg-[#D92D3A] text-white"
                                  : isPending
                                  ? "bg-[#DFFF00] text-[#000000] border border-[#111111]"
                                  : "bg-[#111111] text-white"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-[10px] font-bold text-[#666666]">
                            {order.paymentMethod === "COD" ? "Cash" : "UPI"}
                          </td>
                          <td className="py-2.5 text-[10px] text-[#666666]">
                            {formattedTime}
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => setSelectedOrderDetails(order)}
                              className="px-2.5 py-1 bg-white hover:bg-[#111111] hover:text-white text-[#111111] rounded text-[10px] font-bold border border-[#E5E5E5] transition-colors"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Reusable Order Details Modal */}
      {selectedOrderDetails && (
        <OrderDetailsModal
          order={selectedOrderDetails}
          onClose={() => setSelectedOrderDetails(null)}
          onUpdateStatus={handleUpdateOrderStatus}
        />
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 pt-4 animate-pulse">
          <div className="h-10 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
          <div className="h-64 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
