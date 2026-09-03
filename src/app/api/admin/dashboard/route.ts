import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    // 1. Authorization Guard
    const roleCookie = request.cookies.get("rushd_user_role")?.value;
    const authHeader = request.headers.get("x-user-role");
    const userRole = roleCookie || authHeader;

    if (userRole && userRole === "CUSTOMER") {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d"; // today, 7d, 30d, 90d, all
    const topLimit = parseInt(searchParams.get("topLimit") || "10", 10);

    const now = new Date();
    let startDate: Date | null = null;

    if (range === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === "7d") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === "30d") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (range === "90d") {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else if (range === "all") {
      startDate = null;
    }

    const dateFilter = startDate ? { createdAt: { gte: startDate } } : {};

    // 2. Fetch all orders (with date filter for range, and all-time for lifetime totals)
    const [
      allOrders,
      rangeOrders,
      products,
      categories,
      customers,
      deliveryPartners,
    ] = await Promise.all([
      prisma.order.findMany({
        include: {
          items: true,
          customer: {
            select: { id: true, name: true, phone: true, email: true },
          },
          deliveryPartner: {
            select: { id: true, name: true, phone: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.findMany({
        where: dateFilter,
        include: {
          items: true,
          customer: {
            select: { id: true, name: true, phone: true, email: true },
          },
          deliveryPartner: {
            select: { id: true, name: true, phone: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany({
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { stock: "asc" },
      }),
      prisma.category.findMany(),
      prisma.user.findMany({
        where: { role: "CUSTOMER" },
        select: { id: true, name: true, phone: true, email: true, createdAt: true },
      }),
      prisma.user.findMany({
        where: { role: "DELIVERY_PARTNER" },
        select: { id: true, name: true, phone: true, email: true },
      }),
    ]);

    // 3. Top Summary Metrics (Scoped to selected date range)
    const totalOrders = rangeOrders.length;
    const pendingOrders = rangeOrders.filter((o) => o.status === OrderStatus.PENDING).length;
    const acceptedOrders = rangeOrders.filter((o) => o.status === OrderStatus.ACCEPTED).length;
    const preparingOrders = rangeOrders.filter((o) => o.status === OrderStatus.PREPARING).length;
    const assignedOrders = rangeOrders.filter((o) => o.status === OrderStatus.ASSIGNED).length;
    const outForDeliveryOrders = rangeOrders.filter((o) => o.status === OrderStatus.OUT_FOR_DELIVERY).length;
    const activeDeliveries = acceptedOrders + preparingOrders + assignedOrders + outForDeliveryOrders;
    const deliveredOrders = rangeOrders.filter((o) => o.status === OrderStatus.DELIVERED).length;
    const rejectedOrders = rangeOrders.filter((o) => o.status === OrderStatus.REJECTED).length;
    const cancelledOrders = rangeOrders.filter((o) => o.status === OrderStatus.CANCELLED).length;
    const cancelledRejectedOrders = rejectedOrders + cancelledOrders;

    // Revenue calculation: ONLY delivered orders count towards fulfilled revenue
    const deliveredRangeOrders = rangeOrders.filter((o) => o.status === OrderStatus.DELIVERED);
    const rangeRevenue = deliveredRangeOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Lifetime / Global Revenue Metrics
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const deliveredAllOrders = allOrders.filter((o) => o.status === OrderStatus.DELIVERED);
    const totalRevenueAllTime = deliveredAllOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const todayRevenue = deliveredAllOrders
      .filter((o) => new Date(o.createdAt) >= todayStart)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const last7DaysRevenue = deliveredAllOrders
      .filter((o) => new Date(o.createdAt) >= sevenDaysAgo)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const last30DaysRevenue = deliveredAllOrders
      .filter((o) => new Date(o.createdAt) >= thirtyDaysAgo)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    // 4. Revenue & Order Trends Daily Chart Data
    // Group delivered revenue and total order count by date string YYYY-MM-DD
    const trendMap = new Map<string, { date: string; label: string; revenue: number; orderCount: number }>();
    
    // Determine days to display in chart
    const daysToShow = range === "today" ? 1 : range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 30;
    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      trendMap.set(dateKey, { date: dateKey, label, revenue: 0, orderCount: 0 });
    }

    rangeOrders.forEach((order) => {
      const dateKey = new Date(order.createdAt).toISOString().split("T")[0];
      if (trendMap.has(dateKey)) {
        const entry = trendMap.get(dateKey)!;
        entry.orderCount += 1;
        if (order.status === OrderStatus.DELIVERED) {
          entry.revenue += order.totalAmount;
        }
      }
    });

    const revenueChartData = Array.from(trendMap.values());

    // 5. Order Status Breakdown
    const orderStatusBreakdown = {
      PENDING: pendingOrders,
      ACCEPTED: acceptedOrders,
      PREPARING: preparingOrders,
      ASSIGNED: assignedOrders,
      OUT_FOR_DELIVERY: outForDeliveryOrders,
      DELIVERED: deliveredOrders,
      REJECTED: rejectedOrders,
      CANCELLED: cancelledOrders,
    };

    // 6. Delivery Performance
    const resolvedDeliveries = deliveredOrders + cancelledOrders;
    const completionRate = resolvedDeliveries > 0 ? (deliveredOrders / resolvedDeliveries) * 100 : 100;

    const deliveryPerformance = {
      totalDeliveries: rangeOrders.filter((o) => o.status !== OrderStatus.PENDING && o.status !== OrderStatus.REJECTED).length,
      activeDeliveries,
      completedDeliveries: deliveredOrders,
      cancelledDeliveries: cancelledOrders,
      completionRate: Math.round(completionRate),
      activeRidersCount: deliveryPartners.length,
    };

    // 7. Product & Inventory Analytics
    const totalProducts = products.length;
    const activeProductsCount = products.filter((p) => p.isActive).length;
    const inactiveProductsCount = products.filter((p) => !p.isActive).length;
    const lowStockProductsList = products
      .filter((p) => p.stock > 0 && p.stock <= 5)
      .map((p) => ({
        id: p.id,
        name: p.name,
        categoryName: p.category.name,
        stock: p.stock,
        price: p.price,
        unitDisplay: p.unitDisplay,
        isActive: p.isActive,
      }));
    const outOfStockProductsList = products
      .filter((p) => p.stock <= 0)
      .map((p) => ({
        id: p.id,
        name: p.name,
        categoryName: p.category.name,
        stock: p.stock,
        price: p.price,
        unitDisplay: p.unitDisplay,
        isActive: p.isActive,
      }));
    const totalInventoryQuantity = products.reduce((sum, p) => sum + p.stock, 0);

    // 8. Top Selling Products (Aggregated from OrderItem snapshots)
    const productSalesMap = new Map<string, { productId: string; productName: string; unitsSold: number; revenueGenerated: number }>();

    rangeOrders
      .filter((o) => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.REJECTED)
      .forEach((order) => {
        order.items.forEach((item) => {
          const current = productSalesMap.get(item.productId) || {
            productId: item.productId,
            productName: item.productName,
            unitsSold: 0,
            revenueGenerated: 0,
          };
          current.unitsSold += item.quantity;
          current.revenueGenerated += item.subtotal;
          productSalesMap.set(item.productId, current);
        });
      });

    const topSellingProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, topLimit);

    // 9. Customer Analytics
    const totalCustomers = customers.length;
    const customerOrderMap = new Map<string, { customerId: string; name: string; phone: string; orderCount: number; totalSpent: number; lastOrderDate: string }>();

    allOrders.forEach((order) => {
      const custId = order.customerId;
      const custName = order.customer?.name || "RushD Customer";
      const custPhone = order.customer?.phone || order.deliveryAddress.split("Phone:")[1]?.trim() || "—";
      
      const current = customerOrderMap.get(custId) || {
        customerId: custId,
        name: custName,
        phone: custPhone,
        orderCount: 0,
        totalSpent: 0,
        lastOrderDate: order.createdAt.toISOString(),
      };

      current.orderCount += 1;
      if (order.status === OrderStatus.DELIVERED) {
        current.totalSpent += order.totalAmount;
      }
      if (new Date(order.createdAt) > new Date(current.lastOrderDate)) {
        current.lastOrderDate = order.createdAt.toISOString();
      }
      customerOrderMap.set(custId, current);
    });

    const customersWithOrders = customerOrderMap.size;
    const averageOrderValue = deliveredOrders > 0 ? rangeRevenue / deliveredOrders : totalOrders > 0 ? allOrders.reduce((s, o) => s + o.totalAmount, 0) / allOrders.length : 0;
    const ordersPerCustomer = totalCustomers > 0 ? (totalOrders / totalCustomers).toFixed(1) : "0";

    const topCustomers = Array.from(customerOrderMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    // 10. Recent Orders (Latest 15)
    const recentOrders = allOrders.slice(0, 15).map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customer?.name || "RushD Customer",
      customerPhone: order.customer?.phone || order.deliveryAddress.split("Phone:")[1]?.trim() || "—",
      deliveryAddress: order.deliveryAddress,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      itemCount: order.items.length,
      createdAt: order.createdAt.toISOString(),
      items: order.items,
      deliveryPartner: order.deliveryPartner,
      notes: order.notes,
    }));

    return NextResponse.json({
      summary: {
        totalOrders,
        pendingOrders,
        activeDeliveries,
        deliveredOrders,
        cancelledRejectedOrders,
        rangeRevenue,
        totalRevenueAllTime,
        todayRevenue,
        last7DaysRevenue,
        last30DaysRevenue,
        totalProducts,
        activeProductsCount,
        inactiveProductsCount,
        lowStockCount: lowStockProductsList.length,
        outOfStockCount: outOfStockProductsList.length,
        totalInventoryQuantity,
        totalCustomers,
        customersWithOrders,
        averageOrderValue: Math.round(averageOrderValue),
        ordersPerCustomer,
      },
      revenueChartData,
      orderStatusBreakdown,
      deliveryPerformance,
      inventory: {
        lowStockProducts: lowStockProductsList,
        outOfStockProducts: outOfStockProductsList,
      },
      topSellingProducts,
      customerAnalytics: {
        totalCustomers,
        customersWithOrders,
        averageOrderValue: Math.round(averageOrderValue),
        ordersPerCustomer,
        topCustomers,
      },
      recentOrders,
    });
  } catch (error) {
    console.error("GET /api/admin/dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard analytics" },
      { status: 500 }
    );
  }
}
