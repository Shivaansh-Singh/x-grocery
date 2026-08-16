"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RushDLogo } from "@/components/ui/RushDLogo";

interface AdminHeaderProps {
  pendingOrdersCount?: number;
}

export function AdminHeader({ pendingOrdersCount = 0 }: AdminHeaderProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/products", label: "Catalog & Stock" },
    {
      href: "/admin/orders",
      label: "Orders",
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
    },
    { href: "/admin/delivery-staff", label: "Riders" },
  ];

  return (
    <header className="bg-[#111315] text-white rounded-2xl p-4 shadow-2xs border border-[#1646C7]/30 space-y-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <RushDLogo size="sm" href="/admin" />
          <div className="border-l border-white/20 pl-2.5">
            <h2 className="font-bold text-xs leading-tight text-white">
              Admin Hub
            </h2>
            <p className="text-[10px] text-[#666A70] font-medium">
              Fulfillment & Staff Portal
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="text-xs text-zinc-300 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-xl font-semibold border border-white/10"
        >
          Customer App ↗
        </Link>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? "bg-[#1646C7] text-white shadow-2xs"
                  : "bg-white/10 text-zinc-300 hover:bg-white/20 hover:text-white"
              }`}
            >
              <span>{link.label}</span>
              {link.badge && (
                <span className="px-1.5 py-0.2 rounded bg-[#FF5A1F] text-white text-[10px] font-extrabold">
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
