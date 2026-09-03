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
      <div className="bg-[#000000] border border-[#111111] text-white rounded-lg p-3.5 shadow-2xl flex items-center justify-between pointer-events-auto">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="bg-[#DFFF00] text-[#000000] font-black text-[11px] px-2.5 py-0.5 rounded border border-[#111111]">
              {itemCount} {itemCount === 1 ? "Item" : "Items"}
            </span>
            <span className="font-extrabold text-base text-white">₹{totalAmount.toFixed(0)}</span>
          </div>
          <span className="text-[10px] text-[#A3A3A3] mt-0.5 font-medium">
            {deliveryFee === 0 ? "FREE Delivery Unlocked" : "+ ₹20 Delivery Fee"}
          </span>
        </div>

        <Link
          href="/cart"
          className="px-4 py-2 bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] rounded font-black text-xs transition-colors border border-[#111111] flex items-center gap-1.5"
        >
          <span>View Cart</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
