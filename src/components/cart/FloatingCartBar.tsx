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
    <div className="fixed bottom-16 left-0 right-0 z-30 px-3 pb-1 max-w-xl mx-auto pointer-events-none">
      <div className="bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] text-white rounded-2xl p-3.5 shadow-xl flex items-center justify-between pointer-events-auto border border-white/20">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-lg">
              {itemCount} {itemCount === 1 ? "Item" : "Items"}
            </span>
            <span className="font-black text-base">₹{totalAmount.toFixed(0)}</span>
          </div>
          <span className="text-[10px] text-white/95 mt-0.5 font-semibold">
            {deliveryFee === 0 ? "⚡ FREE Delivery Unlocked" : "+ ₹15 Delivery Fee"}
          </span>
        </div>

        <Link
          href="/cart"
          className="px-4 py-2 bg-[#0B0E14] hover:bg-[#141822] text-white rounded-xl font-extrabold text-xs transition-colors shadow-md flex items-center gap-1.5 border border-white/10"
        >
          <span>View Cart</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
