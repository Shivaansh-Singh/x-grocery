"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RushDLogo } from "@/components/ui/RushDLogo";
import { useAuth } from "@/components/providers/AuthProvider";

interface AdminHeaderProps {
  pendingOrdersCount?: number;
}

export function AdminHeader({ pendingOrdersCount = 0 }: AdminHeaderProps) {
  const pathname = usePathname();
  const { activeUser, signOut } = useAuth();

  const navLinks = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/products", label: "Catalog & Stock" },
    {
      href: "/admin/orders",
      label: "Orders",
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
    },
    { href: "/admin/delivery-staff", label: "Riders" },
    { href: "/admin/feedback", label: "Customer Feedback" },
  ];

  return (
    <header className="bg-white text-[#111111] rounded-lg p-4 border border-[#111111] space-y-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <RushDLogo size="sm" href="/admin" />
          <div className="border-l border-[#E5E5E5] pl-2.5">
            <h2 className="font-extrabold text-xs leading-tight text-[#111111]">
              Admin Hub
            </h2>
            <p className="text-[10px] text-[#666666] font-medium">
              Store Operations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeUser && (
            <span className="text-[10px] font-black text-[#000000] bg-[#DFFF00] border border-[#111111] px-2 py-1 rounded">
              STORE ADMIN
            </span>
          )}

          <button
            onClick={() => signOut()}
            className="text-xs text-[#D92D3A] hover:bg-[#F5F5F5] transition-colors bg-white px-3 py-1.5 rounded font-bold border border-[#E5E5E5]"
          >
            Sign Out
          </button>
        </div>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded text-xs font-extrabold transition-colors flex items-center gap-1.5 shrink-0 border ${
                isActive
                  ? "bg-[#111111] text-white border-[#111111]"
                  : "bg-[#F5F5F5] text-[#666666] hover:bg-white hover:text-[#111111] border-[#E5E5E5]"
              }`}
            >
              <span>{link.label}</span>
              {link.badge && (
                <span className="px-1.5 py-0.2 rounded bg-[#DFFF00] text-[#000000] text-[10px] font-black border border-[#111111]">
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
