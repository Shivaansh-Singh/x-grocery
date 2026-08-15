"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminHeaderProps {
  pendingOrdersCount?: number;
}

export function AdminHeader({ pendingOrdersCount = 0 }: AdminHeaderProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/products", label: "Catalog & Stock", icon: "📦" },
    {
      href: "/admin/orders",
      label: "Orders",
      icon: "📋",
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
    },
    { href: "/admin/delivery-staff", label: "Riders", icon: "🛵" },
  ];

  return (
    <header className="bg-zinc-900 text-white rounded-3xl p-4 shadow-lg border border-zinc-800 space-y-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-sm">
            X
          </div>
          <div>
            <h2 className="font-extrabold text-sm leading-tight text-zinc-100">
              Store Owner X Portal
            </h2>
            <p className="text-[10px] text-purple-400 font-medium">
              VIT Bhopal Off-Campus Fulfillment Hub
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="text-xs text-zinc-400 hover:text-white transition-colors bg-zinc-800 px-3 py-1.5 rounded-xl font-medium"
        >
          Customer View ↗
        </Link>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
              {link.badge && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-extrabold animate-pulse">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
