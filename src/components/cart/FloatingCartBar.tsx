"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";

export function FloatingCartBar() {
  const pathname = usePathname();
  const { itemCount, totalAmount, deliveryFee } = useCart();

  // Hide floating cart bar on cart & checkout pages or admin/delivery portals
  if (
    itemCount === 0 ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/delivery")
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 z-30 px-3 pb-1 max-w-md mx-auto pointer-events-none animate-slideUp">
      <div className="bg-emerald-600 dark:bg-emerald-500 text-white rounded-2xl p-3 shadow-xl flex items-center justify-between pointer-events-auto border border-emerald-500/50">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="bg-white text-emerald-700 font-bold text-[11px] px-2 py-0.5 rounded-full">
              {itemCount} {itemCount === 1 ? "Item" : "Items"}
            </span>
            <span className="font-extrabold text-sm">₹{totalAmount.toFixed(0)}</span>
          </div>
          <span className="text-[10px] text-emerald-100 mt-0.5 font-medium">
            {deliveryFee === 0 ? "🎉 FREE Delivery Applied" : "+ ₹15 Delivery Fee"}
          </span>
        </div>

        <Link
          href="/cart"
          className="px-4 py-2 bg-white text-emerald-700 rounded-xl font-bold text-xs hover:bg-emerald-50 transition-colors shadow-xs flex items-center gap-1"
        >
          <span>View Cart</span>
          <span className="text-sm">→</span>
        </Link>
      </div>
    </div>
  );
}
