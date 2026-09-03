"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";

export function BottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  // Hide bottom nav on admin and delivery routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/delivery")) {
    return null;
  }

  const tabs = [
    {
      label: "Home",
      href: "/",
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: "Categories",
      href: "/#categories",
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      label: "Cart",
      href: "/cart",
      badge: itemCount > 0 ? itemCount : null,
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      label: "Account",
      href: "/profile",
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#111111] px-2 py-2">
      <div className="max-w-md md:max-w-2xl mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : tab.href.startsWith("/#")
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center py-1 px-3 transition-colors ${
                isActive
                  ? "text-[#111111] font-extrabold"
                  : "text-[#666666] hover:text-[#111111]"
              }`}
            >
              <div className="relative">
                {tab.svg}
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 rounded-full bg-[#DFFF00] text-[#000000] text-[9px] font-black border border-[#111111]">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 font-bold tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-4 h-0.5 bg-[#DFFF00]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
