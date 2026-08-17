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
    <header className="bg-[#151B24] text-white rounded-2xl p-4 shadow-md border border-[#27313D] space-y-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <RushDLogo size="sm" href="/admin" />
          <div className="border-l border-[#27313D] pl-2.5">
            <h2 className="font-extrabold text-xs leading-tight text-white">
              Admin Hub
            </h2>
            <p className="text-[10px] text-[#A8B0BC] font-medium">
              Fulfillment & Staff Portal
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="text-xs text-[#A8B0BC] hover:text-white transition-colors bg-[#1C2430] px-3 py-1.5 rounded-xl font-bold border border-[#27313D]"
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
                  ? "bg-[#0757D5] text-white shadow-xs"
                  : "bg-[#1C2430] text-[#A8B0BC] hover:bg-[#27313D] hover:text-white"
              }`}
            >
              <span>{link.label}</span>
              {link.badge && (
                <span className="px-1.5 py-0.2 rounded bg-[#FF5A00] text-white text-[10px] font-black">
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
