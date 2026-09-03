import type { OrderRecord } from "@/components/orders/OrderCard";

export interface DeliveryStaffRider {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  status?: "AVAILABLE" | "ASSIGNED" | "ON_DELIVERY" | "OFFLINE";
  distanceKm?: number;
}

export function normalizeRiderId(rider: { id?: string; email?: string | null; name?: string | null }): string {
  if (rider.email === "delivery1@x-grocery.com" || rider.name?.includes("Rider 1") || rider.name?.includes("Ramesh")) {
    return "rider-1";
  }
  if (rider.email === "delivery2@x-grocery.com" || rider.name?.includes("Rider 2") || rider.name?.includes("Suresh")) {
    return "rider-2";
  }
  if (rider.email === "delivery3@x-grocery.com" || rider.name?.includes("Rider 3") || rider.name?.includes("Vikas")) {
    return "rider-3";
  }
  return rider.id || "rider-1";
}

export const DEFAULT_RIDERS: DeliveryStaffRider[] = [
  {
    id: "rider-1",
    name: "Ramesh Kumar (Rider 1)",
    phone: "+91 98123 45678",
    email: "delivery1@x-grocery.com",
    status: "AVAILABLE",
    distanceKm: 0.8,
  },
  {
    id: "rider-2",
    name: "Suresh Singh (Rider 2)",
    phone: "+91 98234 56789",
    email: "delivery2@x-grocery.com",
    status: "AVAILABLE",
    distanceKm: 1.2,
  },
  {
    id: "rider-3",
    name: "Vikas Sharma (Rider 3)",
    phone: "+91 98345 67890",
    email: "delivery3@x-grocery.com",
    status: "AVAILABLE",
    distanceKm: 1.5,
  },
];

export function getLocalOrders(): OrderRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("rushd_orders") || localStorage.getItem("x_grocery_orders");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Failed to read local orders", e);
  }
  return [];
}

export function saveLocalOrders(orders: OrderRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("rushd_orders", JSON.stringify(orders));
    localStorage.setItem("x_grocery_orders", JSON.stringify(orders));
  } catch (e) {
    console.error("Failed to save local orders", e);
  }
}

export function addLocalOrder(newOrder: OrderRecord): void {
  const existing = getLocalOrders();
  const filtered = existing.filter((o) => o.id !== newOrder.id && o.orderNumber !== newOrder.orderNumber);
  const updated = [newOrder, ...filtered];
  saveLocalOrders(updated);
  if (typeof window !== "undefined") {
    localStorage.setItem("x_grocery_last_order", JSON.stringify(newOrder));
  }
}

export function updateLocalOrderStatus(
  orderId: string,
  updates: Partial<OrderRecord>
): OrderRecord | null {
  const existing = getLocalOrders();
  let updatedOrder: OrderRecord | null = null;

  const rawRiderId =
    updates.assignedRiderId ||
    updates.deliveryPartnerId ||
    updates.deliveryPartner?.id;

  const canonicalRiderId = rawRiderId
    ? normalizeRiderId({ id: rawRiderId, name: updates.deliveryPartner?.name })
    : undefined;

  const updatedList: OrderRecord[] = existing.map((o) => {
    if (o.id === orderId || o.orderNumber === orderId) {
      const finalRiderId = canonicalRiderId || o.assignedRiderId || o.deliveryPartnerId || o.deliveryPartner?.id || null;
      updatedOrder = {
        ...o,
        ...updates,
        deliveryOtp: updates.deliveryOtp !== undefined ? updates.deliveryOtp : o.deliveryOtp,
        deliveryOtpVerified: updates.deliveryOtpVerified !== undefined ? updates.deliveryOtpVerified : o.deliveryOtpVerified,
        deliveryOtpVerifiedAt: updates.deliveryOtpVerifiedAt !== undefined ? updates.deliveryOtpVerifiedAt : o.deliveryOtpVerifiedAt,
        assignedRiderId: finalRiderId,
        deliveryPartnerId: finalRiderId,
        updatedAt: new Date().toISOString(),
      };
      return updatedOrder;
    }
    return o;
  });
  saveLocalOrders(updatedList);

  if (updatedOrder && typeof window !== "undefined") {
    const lastOrder = localStorage.getItem("x_grocery_last_order");
    if (lastOrder) {
      try {
        const parsed = JSON.parse(lastOrder) as OrderRecord;
        const currentOrder: OrderRecord = updatedOrder;
        if (parsed && (parsed.id === orderId || parsed.orderNumber === orderId)) {
          const mergedLastOrder: OrderRecord = {
            ...parsed,
            ...currentOrder,
            deliveryOtp: currentOrder.deliveryOtp || parsed.deliveryOtp,
          };
          localStorage.setItem("x_grocery_last_order", JSON.stringify(mergedLastOrder));
        }
      } catch {
        // ignore
      }
    }
  }




  return updatedOrder;
}

export function getLocalRiders(): DeliveryStaffRider[] {
  if (typeof window === "undefined") return DEFAULT_RIDERS;
  try {
    const saved = localStorage.getItem("rushd_riders");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const normalized = parsed.map((r) => ({
          ...r,
          id: normalizeRiderId(r),
        }));
        // Deduplicate riders by canonical ID
        const unique = normalized.filter(
          (r, index, self) => index === self.findIndex((x) => x.id === r.id)
        );
        return unique;
      }
    }
  } catch (e) {
    console.error("Failed to read local riders", e);
  }
  return DEFAULT_RIDERS;
}

export function saveLocalRiders(riders: DeliveryStaffRider[]): void {
  if (typeof window === "undefined") return;
  try {
    const normalized = riders.map((r) => ({
      ...r,
      id: normalizeRiderId(r),
    }));
    const unique = normalized.filter(
      (r, index, self) => index === self.findIndex((x) => x.id === r.id)
    );
    localStorage.setItem("rushd_riders", JSON.stringify(unique));
  } catch (e) {
    console.error("Failed to save local riders", e);
  }
}

export function updateRiderStatus(riderId: string, status: DeliveryStaffRider["status"]): void {
  const canonicalId = normalizeRiderId({ id: riderId });
  const riders = getLocalRiders();
  const updated = riders.map((r) => (r.id === canonicalId ? { ...r, status } : r));
  saveLocalRiders(updated);
}
