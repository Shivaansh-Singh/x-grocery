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
    <div className="fixed bottom-16 left-0 right-0 z-30 px-3 pb-1 max-w-md mx-auto pointer-events-none">
      <div className="bg-[#FF5A1F] text-white rounded-2xl p-3 shadow-lg flex items-center justify-between pointer-events-auto border border-[#FF5A1F]/30">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-white font-bold text-[11px] px-2 py-0.5 rounded-md">
              {itemCount} {itemCount === 1 ? "Item" : "Items"}
            </span>
            <span className="font-black text-sm">₹{totalAmount.toFixed(0)}</span>
          </div>
          <span className="text-[10px] text-white/90 mt-0.5 font-medium">
            {deliveryFee === 0 ? "FREE Delivery Applied" : "+ ₹15 Delivery Fee"}
          </span>
        </div>

        <Link
          href="/cart"
          className="px-4 py-2 bg-[#111315] hover:bg-[#1646C7] text-white rounded-xl font-bold text-xs transition-colors shadow-2xs flex items-center gap-1.5"
        >
          <span>View Cart</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
